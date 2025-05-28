import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

/**
 * Carga los favoritos del usuario según el tipo seleccionado
 * @param {string} userId - ID del usuario
 * @param {string} targetType - Tipo de favorito (event, artist, space)
 * @returns {Promise<Array>} - Lista de favoritos
 */
export const loadFavorites = async (userId, targetType) => {
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  try {
    console.log('Cargando favoritos para usuario:', userId, 'tipo:', targetType);
    
    // Para eventos, intentar cargar desde AsyncStorage primero
    if (targetType === 'event') {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const favoritesJson = await AsyncStorage.getItem('favoriteEvents');
        
        if (favoritesJson) {
          const favorites = JSON.parse(favoritesJson);
          console.log('Favoritos cargados desde AsyncStorage:', favorites.length);
          
          // Verificar si los eventos existen antes de mostrarlos
          const validFavorites = await Promise.all(
            favorites.map(async (event) => {
              try {
                // Intentar obtener el evento desde la API
                const response = await axios.get(`${BACKEND_URL}/api/events/${event.id}`);
                // Si la respuesta es exitosa, el evento existe
                return response.data ? event : null;
              } catch (error) {
                // Si hay un error 404, el evento no existe
                if (error.response && error.response.status === 404) {
                  console.log(`Evento favorito ${event.id} ya no existe, eliminando de favoritos`);
                  return null;
                }
                // Para otros errores, asumimos que el evento existe para no perder favoritos
                // por problemas temporales de conexión
                return event;
              }
            })
          );
          
          // Filtrar eventos nulos (eliminados)
          const filteredFavorites = validFavorites.filter(event => event !== null);
          
          // Si se eliminaron eventos, actualizar AsyncStorage
          if (filteredFavorites.length < favorites.length) {
            console.log(`Se eliminaron ${favorites.length - filteredFavorites.length} eventos favoritos que ya no existen`);
            await AsyncStorage.setItem('favoriteEvents', JSON.stringify(filteredFavorites));
          }
          
          // Transformar al formato esperado por la UI
          const formattedFavorites = filteredFavorites.map(event => ({
            targetId: String(event.id),
            targetType: 'event',
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Datos adicionales del evento para mostrar en la UI
            titulo: event.titulo,
            descripcion: event.descripcion,
            fechaProgramada: event.fechaProgramada,
            categoria: event.categoria,
            ubicacion: event.ubicacion
          }));
          
          return formattedFavorites;
        }
      } catch (storageError) {
        console.error('Error al cargar favoritos desde AsyncStorage:', storageError);
        // Continuar con la carga desde la API si falla AsyncStorage
      }
    }

    // Cargar desde la API para todos los tipos
    const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
      params: {
        userId: userId,
        targetType: targetType
      }
    });

    console.log('Respuesta de favoritos desde API:', JSON.stringify(response.data, null, 2));

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Formato de respuesta inesperado:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error al cargar favoritos:', error);
    // En caso de error, intentar cargar desde AsyncStorage como fallback para eventos
    if (targetType === 'event') {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const favoritesJson = await AsyncStorage.getItem('favoriteEvents');
        
        if (favoritesJson) {
          const favorites = JSON.parse(favoritesJson);
          console.log('Favoritos cargados desde AsyncStorage (fallback):', favorites.length);
          
          // Transformar al formato esperado por la UI
          return favorites.map(event => ({
            targetId: String(event.id),
            targetType: 'event',
            userId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            titulo: event.titulo,
            descripcion: event.descripcion,
            fechaProgramada: event.fechaProgramada,
            categoria: event.categoria,
            ubicacion: event.ubicacion
          }));
        }
      } catch (storageError) {
        console.error('Error en fallback de AsyncStorage:', storageError);
      }
    }
    return [];
  }
};

/**
 * Carga los detalles de un artista por su ID
 * @param {string} artistId - ID del artista
 * @returns {Promise<Object>} - Detalles del artista
 */
export const loadArtistDetails = async (artistId) => {
  try {
    const artistResponse = await axios.get(`${BACKEND_URL}/api/artists/profile-by-id/${artistId}`);
    if (artistResponse.data && artistResponse.data.success) {
      return artistResponse.data.artist;
    }
    return null;
  } catch (error) {
    console.log('Error al cargar detalles del artista:', artistId);
    return null;
  }
};

/**
 * Elimina un favorito del usuario
 * @param {string} userId - ID del usuario
 * @param {string} targetType - Tipo de favorito (event, artist, space)
 * @param {string} targetId - ID del elemento favorito
 * @returns {Promise<void>}
 */
export const removeFavorite = async (userId, targetType, targetId) => {
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  console.log(`Eliminando favorito: userId=${userId}, targetType=${targetType}, targetId=${targetId}`);
  
  // Para eventos, eliminar de AsyncStorage primero
  if (targetType === 'event') {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const favoritesJson = await AsyncStorage.getItem('favoriteEvents');
      
      if (favoritesJson) {
        const favorites = JSON.parse(favoritesJson);
        console.log(`Favoritos antes de eliminar: ${favorites.length}`);
        
        // Filtrar el evento a eliminar
        const newFavorites = favorites.filter(event => String(event.id) !== String(targetId));
        console.log(`Favoritos después de eliminar: ${newFavorites.length}`);
        
        // Guardar los favoritos actualizados
        await AsyncStorage.setItem('favoriteEvents', JSON.stringify(newFavorites));
        console.log('Favorito eliminado de AsyncStorage correctamente');
      }
    } catch (storageError) {
      console.error('Error al eliminar favorito de AsyncStorage:', storageError);
      // Continuar con el intento de API
    }
  }

  // Intentar eliminar de la API también
  try {
    await axios.delete(`${BACKEND_URL}/api/favorites`, {
      data: {
        userId: userId,
        targetType: targetType,
        targetId: targetId
      }
    });
    console.log('Favorito eliminado de la API correctamente');
  } catch (apiError) {
    // Si es un error 404, podría ser que el favorito no exista en la API
    // No propagamos este error ya que ya eliminamos de AsyncStorage
    if (apiError.response && apiError.response.status === 404) {
      console.log('Favorito no encontrado en la API (404), pero se eliminó localmente');
      return; // Retornar sin error ya que se eliminó de AsyncStorage
    }
    
    console.error('Error al eliminar favorito de la API:', apiError);
    // No lanzar error si ya se eliminó de AsyncStorage
    if (targetType !== 'event') {
      throw apiError;
    }
  }
};
