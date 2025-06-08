/**
 * Este archivo maneja el servicio de favoritos
 * - Servicios
 * - Favoritos
 * - API
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';


export const loadFavorites = async (userId, targetType) => {
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  try {
    console.log('Cargando favoritos para usuario:', userId, 'tipo:', targetType);
    
    if (targetType === 'event') {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const favoritesJson = await AsyncStorage.getItem('favoriteEvents');
        
        if (favoritesJson) {
          const favorites = JSON.parse(favoritesJson);
          console.log('Favoritos cargados desde AsyncStorage:', favorites.length);
          
          const validFavorites = await Promise.all(
            favorites.map(async (event) => {
              try {
                const response = await axios.get(`${BACKEND_URL}/api/events/${event.id}`);
                
                return response.data ? event : null;
              } catch (error) {
                if (error.response && error.response.status === 404) {
                  console.log(`Evento favorito ${event.id} ya no existe, eliminando de favoritos`);
                  return null;
                }
                return event;
              }
            })
          );
          
          const filteredFavorites = validFavorites.filter(event => event !== null);
          
          if (filteredFavorites.length < favorites.length) {
            console.log(`Se eliminaron ${favorites.length - filteredFavorites.length} eventos favoritos que ya no existen`);
            await AsyncStorage.setItem('favoriteEvents', JSON.stringify(filteredFavorites));
          }
          
          const formattedFavorites = filteredFavorites.map(event => ({
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
          
          return formattedFavorites;
        }
      } catch (storageError) {
        console.error('Error al cargar favoritos desde AsyncStorage:', storageError);
      }
    }

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
    if (targetType === 'event') {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const favoritesJson = await AsyncStorage.getItem('favoriteEvents');
        
        if (favoritesJson) {
          const favorites = JSON.parse(favoritesJson);
          console.log('Favoritos cargados desde AsyncStorage (fallback):', favorites.length);
          
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


export const removeFavorite = async (userId, targetType, targetId) => {
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  console.log(`Eliminando favorito: userId=${userId}, targetType=${targetType}, targetId=${targetId}`);
  
  if (targetType === 'event') {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const favoritesJson = await AsyncStorage.getItem('favoriteEvents');
      
      if (favoritesJson) {
        const favorites = JSON.parse(favoritesJson);
        console.log(`Favoritos antes de eliminar: ${favorites.length}`);
        
        const newFavorites = favorites.filter(event => String(event.id) !== String(targetId));
        console.log(`Favoritos después de eliminar: ${newFavorites.length}`);
        
        await AsyncStorage.setItem('favoriteEvents', JSON.stringify(newFavorites));
        console.log('Favorito eliminado de AsyncStorage correctamente');
      }
    } catch (storageError) {
      console.error('Error al eliminar favorito de AsyncStorage:', storageError);
    }
  }

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
    if (apiError.response && apiError.response.status === 404) {
      console.log('Favorito no encontrado en la API (404), pero se eliminó localmente');
      return;
    }
    
    console.error('Error al eliminar favorito de la API:', apiError);
    if (targetType !== 'event') {
      throw apiError;
    }
  }
};
