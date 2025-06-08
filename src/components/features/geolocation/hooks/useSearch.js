/**
 * Este archivo maneja el hook de búsqueda
 * - Hooks
 * - Búsqueda
 * - Lugares
 */

import { useState } from 'react';
import * as SearchService from '../services/SearchService';
import * as Location from 'expo-location';


const useSearch = (userLocation) => {
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const searchPlaces = (text) => {
    setSearchText(text);

    if (text.length < 3) {
      setPredictions([]);
      return;
    }
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      performSearch(text);
    }, 300); 
    
    setSearchTimeout(timeout);
  };
  
  const performSearch = async (text) => {
    setLoading(true);
    setError(null);

    try {
      let currentLocation = userLocation;
      
      if (!currentLocation) {
        console.log('No se ha obtenido la ubicación del usuario. Intentando obtenerla...');
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000
          });
          
          const { latitude, longitude } = location.coords;
          console.log('Ubicación obtenida para búsqueda:', latitude, longitude);
          currentLocation = { latitude, longitude };
        } catch (locationError) {
          console.warn('No se pudo obtener la ubicación para la búsqueda:', locationError.message);
        }
      }
      
      const searchTypes = SearchService.getSearchType(text);
      
      let results;
      if (searchTypes.isCulturalSearch) {
        results = await SearchService.searchCulturalSpaces(text, currentLocation);
      } else {
        results = await SearchService.searchNominatim(text, currentLocation);
      }
      
      setPredictions(results);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setError('Error en la búsqueda. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  const clearSearch = () => {
    setSearchText('');
    setPredictions([]);
  };

  return {
    searchText,
    predictions,
    loading,
    error,
    searchPlaces,
    performSearch,
    clearSearch,
    setError
  };
};

export default useSearch;
