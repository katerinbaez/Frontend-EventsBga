/**
 * Este archivo maneja el hook personalizado para favoritos
 * - Estado
 * - Carga
 * - Gestión
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

const useFavorites = (user) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userId = user.id || user.sub || user._id;
        
        const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
          params: {
            userId: userId,
            targetType: 'event'
          }
        });
        
        if (Array.isArray(response.data)) {
          const favoriteIds = response.data.map(fav => fav.targetId);
          console.log('Eventos favoritos cargados:', favoriteIds);
          setFavorites(favoriteIds);
        }
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, [user]);
  
  const toggleFavorite = useCallback(async (eventId) => {
    try {
      if (!user) {
        console.log('No hay usuario autenticado, no se puede alternar favorito');
        return;
      }
      
      console.log('Toggle favorite para evento ID:', eventId);
      console.log('Estado actual de favoritos:', favorites);
      
      const userId = user.id || user.sub || user._id;
      const isFavorite = Array.isArray(favorites) && favorites.includes(eventId);
      
      console.log('¿Es favorito actualmente?', isFavorite);
      
      if (isFavorite) {
        console.log('Eliminando de favoritos localmente');
        setFavorites(prevFavorites => prevFavorites.filter(id => id !== eventId));
      } else {
        console.log('Agregando a favoritos localmente');
        setFavorites(prevFavorites => [...prevFavorites, eventId]);
      }
      
      try {
        if (isFavorite) {
          await axios.delete(`${BACKEND_URL}/api/favorites`, {
            data: { 
              userId: userId,
              targetType: 'event',
              targetId: eventId 
            }
          });
        } else {
          await axios.post(`${BACKEND_URL}/api/favorites`, {
            userId: userId,
            targetType: 'event',
            targetId: eventId
          });
        }
      } catch (serverError) {
        console.error('Error en el servidor:', serverError);
        
        if (isFavorite) {
          setFavorites(prevFavorites => [...prevFavorites, eventId]);
        } else {
          setFavorites(prevFavorites => prevFavorites.filter(id => id !== eventId));
        }
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
    }
  }, [user, favorites]);
  
  return {
    favorites,
    loading,
    toggleFavorite
  };
};

export default useFavorites;
