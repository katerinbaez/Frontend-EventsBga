import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

/**
 * Carga los espacios culturales desde la API
 * @returns {Promise<Array>} Lista de espacios culturales
 */
export const loadSpaces = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/managers/managers`);
    if (response.data.success) {
      const spaces = response.data.data.map(space => {
        // Asegurarse de que las coordenadas sean números válidos
        const latitud = parseFloat(space.latitud);
        const longitud = parseFloat(space.longitud);
        
        return {
          ...space,
          latitud: !isNaN(latitud) ? latitud : null,
          longitud: !isNaN(longitud) ? longitud : null,
        };
      });
      
      return spaces;
    }
    return [];
  } catch (error) {
    console.error('Error al cargar espacios:', error);
    return [];
  }
};

/**
 * Filtra espacios culturales por término de búsqueda
 * @param {Array} spaces - Lista de espacios culturales
 * @param {string} query - Término de búsqueda
 * @returns {Array} Lista filtrada de espacios culturales
 */
export const filterSpacesByQuery = (spaces, query) => {
  if (!query || query.trim() === '') {
    return spaces;
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  return spaces.filter(space => {
    const nombre = (space.nombreEspacio || '').toLowerCase();
    const direccion = (space.direccion || '').toLowerCase();
    const categoria = (space.categoria || '').toLowerCase();
    const descripcion = (space.descripcion || '').toLowerCase();
    
    return (
      nombre.includes(searchTerm) ||
      direccion.includes(searchTerm) ||
      categoria.includes(searchTerm) ||
      descripcion.includes(searchTerm)
    );
  });
};

/**
 * Encuentra espacios culturales cercanos a una ubicación
 * @param {Array} spaces - Lista de espacios culturales
 * @param {number} latitude - Latitud de la ubicación
 * @param {number} longitude - Longitud de la ubicación
 * @param {number} maxDistance - Distancia máxima en kilómetros (opcional)
 * @param {Function} calculateDistance - Función para calcular la distancia
 * @returns {Array} Lista de espacios cercanos ordenados por distancia
 */
export const findNearbySpaces = (spaces, latitude, longitude, maxDistance, calculateDistance) => {
  if (!latitude || !longitude) {
    return spaces;
  }
  
  // Filtrar espacios que tienen coordenadas válidas
  const spacesWithCoordinates = spaces.filter(space => {
    return space.latitud && space.longitud;
  });
  
  // Calcular distancia para cada espacio
  const spacesWithDistance = spacesWithCoordinates.map(space => {
    const distance = calculateDistance(
      latitude,
      longitude,
      parseFloat(space.latitud),
      parseFloat(space.longitud)
    );
    
    return {
      ...space,
      distance
    };
  });
  
  // Filtrar por distancia máxima si se especifica
  let filteredSpaces = spacesWithDistance;
  if (maxDistance) {
    filteredSpaces = spacesWithDistance.filter(space => space.distance <= maxDistance);
  }
  
  // Ordenar por distancia
  return filteredSpaces.sort((a, b) => a.distance - b.distance);
};

export default {
  loadSpaces,
  filterSpacesByQuery,
  findNearbySpaces
};
