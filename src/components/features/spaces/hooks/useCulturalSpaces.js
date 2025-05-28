import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import * as SpacesService from '../services/CulturalSpacesService';
import * as FavoritesService from '../services/FavoritesService';

const useCulturalSpaces = (initialSelectedSpaceId) => {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);
  const [selectedSpaceDetails, setSelectedSpaceDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Cargar espacios culturales cuando se monta el componente
  useEffect(() => {
    loadSpaces();
    loadFavorites();
    
    // Si hay un ID inicial, cargar sus detalles
    if (initialSelectedSpaceId) {
      setSelectedSpaceId(initialSelectedSpaceId);
      handleViewSpaceDetails({ id: initialSelectedSpaceId });
    }
  }, [initialSelectedSpaceId]);

  // Recargar favoritos cuando el componente recibe el foco
  useFocusEffect(
    React.useCallback(() => {
      console.log('CulturalSpacesModal recibió el foco - recargando favoritos');
      loadFavorites();
      return () => {};
    }, [])
  );

  // Cargar espacios culturales desde el servidor
  const loadSpaces = async () => {
    try {
      setLoading(true);
      const spacesData = await SpacesService.getSpaces();
      setSpaces(spacesData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los espacios culturales.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar favoritos desde el servidor
  const loadFavorites = async () => {
    try {
      if (!user) return;
      
      const userId = user.id || user.sub || user._id;
      console.log('Cargando favoritos para el usuario:', userId);
      
      const favoriteIds = await FavoritesService.getFavorites(userId);
      console.log('Favoritos cargados desde servidor:', favoriteIds);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  };

  const toggleFavorite = async (space) => {
    try {
      if (!user) {
        Alert.alert(
          'Iniciar sesión requerido',
          'Debes iniciar sesión para guardar favoritos.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Asegurarse de que tenemos un ID de usuario válido
      const userId = user.id || user.sub || user._id;
      if (!userId) {
        console.error('ID de usuario no válido:', user);
        Alert.alert('Error', 'No se pudo identificar tu usuario. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      // Asegurarse de que tenemos un ID de espacio válido
      if (!space || !space.id) {
        console.error('ID de espacio no válido:', space);
        Alert.alert('Error', 'No se pudo identificar el espacio cultural.');
        return;
      }
      
      // Convertir a string para asegurar consistencia
      const spaceId = String(space.id);
      
      // Verificar si ya es favorito
      const isFavorite = favorites.includes(spaceId);
      console.log(`Actualizando favorito: ${space.nombre} (${spaceId}), Usuario: ${userId}, Es favorito actualmente: ${isFavorite}`);
      
      // Actualizar el estado de favoritos inmediatamente para una respuesta UI más rápida
      let newFavorites;
      if (isFavorite) {
        // Eliminar de favoritos localmente primero
        newFavorites = favorites.filter(id => id !== spaceId);
      } else {
        // Agregar a favoritos localmente primero
        newFavorites = [...favorites, spaceId];
      }
      
      // Actualizar estado inmediatamente
      setFavorites(newFavorites);
      
      // Sincronizar con el servidor
      try {
        if (isFavorite) {
          await FavoritesService.removeFavorite(userId, spaceId);
          console.log('Favorito eliminado correctamente en el servidor');
        } else {
          await FavoritesService.addFavorite(userId, spaceId);
          console.log('Favorito agregado correctamente en el servidor');
        }
      } catch (serverError) {
        console.error('Error al sincronizar favoritos con el servidor:', serverError);
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
    }
  };

  const handleViewSpaceDetails = async (space) => {
    try {
      setSelectedSpaceId(space.id);
      setLoadingDetails(true);
      
      const spaceDetails = await SpacesService.getSpaceDetails(space.id);
      
      console.log('Detalles del espacio:', JSON.stringify(spaceDetails, null, 2));
      console.log('Imágenes originales:', spaceDetails.images);
      
      setSelectedSpaceDetails(spaceDetails);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los detalles del espacio cultural.');
      setSelectedSpaceId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetails = () => {
    setSelectedSpaceId(null);
    setSelectedSpaceDetails(null);
  };

  return {
    spaces,
    loading,
    favorites,
    selectedSpaceId,
    selectedSpaceDetails,
    loadingDetails,
    loadSpaces,
    loadFavorites,
    toggleFavorite,
    handleViewSpaceDetails,
    closeDetails
  };
};

export default useCulturalSpaces;
