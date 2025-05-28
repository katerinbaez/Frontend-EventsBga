import { useState, useEffect } from 'react';
import * as LocationService from '../services/LocationService';

/**
 * Hook personalizado para gestionar la geolocalización
 * @returns {Object} Estados y funciones relacionadas con la ubicación
 */
const useGeolocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener solo la ubicación del usuario al cargar el componente
  useEffect(() => {
    getLocationOnly();
  }, []);

  // Función para obtener SOLO la ubicación del usuario sin buscar lugares
  const getLocationOnly = async () => {
    const coords = await LocationService.getLocationOnly();
    if (coords) {
      setUserLocation(coords);
    }
  };

  // Función para obtener la ubicación actual del usuario y buscar lugares cercanos
  const refreshUserLocation = async () => {
    setLoading(true);
    setError(null);
    
    const result = await LocationService.refreshUserLocation();
    
    if (result.coords) {
      setUserLocation(result.coords);
      
      // Hacer una búsqueda inversa para obtener la dirección
      LocationService.reverseGeocode(result.coords.latitude, result.coords.longitude);
    }
    
    if (result.error) {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  return {
    userLocation,
    loading,
    error,
    getLocationOnly,
    refreshUserLocation,
    setUserLocation
  };
};

export default useGeolocation;
