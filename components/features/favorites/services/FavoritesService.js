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

    const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
      params: {
        userId: userId,
        targetType: targetType
      }
    });

    console.log('Respuesta de favoritos:', JSON.stringify(response.data, null, 2));

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Formato de respuesta inesperado:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error al cargar favoritos:', error);
    throw error;
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

  try {
    await axios.delete(`${BACKEND_URL}/api/favorites`, {
      data: {
        userId: userId,
        targetType: targetType,
        targetId: targetId
      }
    });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    throw error;
  }
};
