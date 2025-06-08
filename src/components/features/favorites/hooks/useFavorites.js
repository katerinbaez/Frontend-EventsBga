/**
 * Este archivo maneja el hook de favoritos
 * - Hooks
 * - Favoritos
 * - Estado
 */

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as FavoritesService from '../services/FavoritesService';


const useFavorites = (user, initialActiveTab = 'event') => {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [activeTab, user]);

  const loadFavorites = async () => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = user.id || user.sub || user._id;
      
      const favoritesData = await FavoritesService.loadFavorites(userId, activeTab);
      
      if (favoritesData.length === 0) {
        setError('No tienes favoritos guardados');
      }
      
      if (activeTab === 'artist' && favoritesData.length > 0) {
        const artistsWithDetails = await Promise.all(favoritesData.map(async (favorite) => {
          const artistDetails = await FavoritesService.loadArtistDetails(favorite.targetId);
          if (artistDetails) {
            return {
              ...favorite,
              nombreArtistico: artistDetails.nombreArtistico,
              biografia: artistDetails.biografia,
              fotoPerfil: artistDetails.fotoPerfil,
              habilidades: artistDetails.habilidades
            };
          }
          return favorite;
        }));
        setFavorites(artistsWithDetails);
      } else {
        setFavorites(favoritesData);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setError('No se pudieron cargar tus favoritos');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (itemId) => {
    if (!user) return;

    try {
      const userId = user.id || user.sub || user._id;
      await FavoritesService.removeFavorite(userId, activeTab, itemId);
      setFavorites(prev => prev.filter(fav => fav.targetId !== itemId));
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      Alert.alert('Error', 'No se pudo eliminar el favorito');
    }
  };

  return {
    favorites,
    activeTab,
    setActiveTab,
    loading,
    error,
    loadFavorites,
    removeFavorite
  };
};

export default useFavorites;
