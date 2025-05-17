import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

/**
 * Hook personalizado para gestionar los favoritos
 */
const useFavorites = (user) => {
  // Estados
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Cargar favoritos al montar el componente
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
          // Extraer los IDs de los eventos favoritos
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
  
  // Función para alternar favorito
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
      
      // Actualizar el estado de favoritos inmediatamente para una respuesta UI más rápida
      if (isFavorite) {
        // Eliminar de favoritos localmente primero
        console.log('Eliminando de favoritos localmente');
        setFavorites(prevFavorites => prevFavorites.filter(id => id !== eventId));
      } else {
        // Agregar a favoritos localmente primero
        console.log('Agregando a favoritos localmente');
        setFavorites(prevFavorites => [...prevFavorites, eventId]);
      }
      
      try {
        if (isFavorite) {
          // Eliminar de favoritos en el servidor
          await axios.delete(`${BACKEND_URL}/api/favorites`, {
            data: { 
              userId: userId,
              targetType: 'event',
              targetId: eventId 
            }
          });
        } else {
          // Agregar a favoritos en el servidor
          await axios.post(`${BACKEND_URL}/api/favorites`, {
            userId: userId,
            targetType: 'event',
            targetId: eventId
          });
        }
      } catch (serverError) {
        // Si hay un error en el servidor, revertir el cambio local
        console.error('Error en el servidor:', serverError);
        
        if (isFavorite) {
          // Restaurar como favorito si falló al eliminar
          setFavorites(prevFavorites => [...prevFavorites, eventId]);
        } else {
          // Quitar de favoritos si falló al agregar
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
