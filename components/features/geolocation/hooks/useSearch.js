import { useState } from 'react';
import * as SearchService from '../services/SearchService';
import * as Location from 'expo-location';

/**
 * Hook personalizado para gestionar la búsqueda de lugares
 * @param {Object} userLocation - Ubicación del usuario
 * @returns {Object} Estados y funciones relacionadas con la búsqueda
 */
const useSearch = (userLocation) => {
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Función para buscar lugares con OpenStreetMap Nominatim
  const searchPlaces = (text) => {
    setSearchText(text);

    if (text.length < 3) {
      setPredictions([]);
      return;
    }
    
    // Limpiar el timeout anterior si existe
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Establecer un nuevo timeout para retrasar la búsqueda hasta que el usuario deje de escribir
    const timeout = setTimeout(() => {
      performSearch(text);
    }, 300); // 300ms de retraso
    
    setSearchTimeout(timeout);
  };
  
  // Función que realiza la búsqueda real
  const performSearch = async (text) => {
    setLoading(true);
    setError(null);

    try {
      // Verificar si tenemos la ubicación del usuario
      let currentLocation = userLocation;
      
      if (!currentLocation) {
        console.log('No se ha obtenido la ubicación del usuario. Intentando obtenerla...');
        try {
          // Intentar obtener la ubicación actual
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000
          });
          
          const { latitude, longitude } = location.coords;
          console.log('Ubicación obtenida para búsqueda:', latitude, longitude);
          currentLocation = { latitude, longitude };
        } catch (locationError) {
          console.warn('No se pudo obtener la ubicación para la búsqueda:', locationError.message);
          // Continuar con la búsqueda usando el centro de Bucaramanga
        }
      }
      
      // Determinar el tipo de búsqueda
      const searchTypes = SearchService.getSearchType(text);
      
      // Realizar la búsqueda según el tipo
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
  
  // Función para limpiar la búsqueda
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
