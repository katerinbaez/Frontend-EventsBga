/**
 * Este archivo maneja el hook de geolocalización
 * - Hooks
 * - Geolocalización
 * - Estado
 */

import { useState, useEffect } from 'react';
import * as LocationService from '../services/LocationService';


const useGeolocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLocationOnly();
  }, []);

  const getLocationOnly = async () => {
    const coords = await LocationService.getLocationOnly();
    if (coords) {
      setUserLocation(coords);
    }
  };

  const refreshUserLocation = async () => {
    setLoading(true);
    setError(null);
    
    const result = await LocationService.refreshUserLocation();
    
    if (result.coords) {
      setUserLocation(result.coords);
      
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
