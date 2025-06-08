/**
 * Este archivo maneja el servicio de favoritos
 * - Servicios
 * - Espacios
 * - Favoritos
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

const getFavorites = async (userId) => {
  try {
    if (!userId) return [];
    
    const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
      params: { 
        userId: userId,
        targetType: 'space'
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(fav => String(fav.targetId));
    }
    return [];
  } catch (error) {
    console.error('Error al cargar favoritos:', error);
    throw error;
  }
};

const addFavorite = async (userId, spaceId) => {
  try {
    await axios.post(`${BACKEND_URL}/api/favorites`, {
      userId: userId,
      targetId: spaceId,
      targetType: 'space'
    });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    throw error;
  }
};

const removeFavorite = async (userId, spaceId) => {
  try {
    await axios.delete(`${BACKEND_URL}/api/favorites`, {
      data: {
        userId: userId,
        targetId: spaceId,
        targetType: 'space'
      }
    });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    throw error;
  }
};

export {
  getFavorites,
  addFavorite,
  removeFavorite
};
