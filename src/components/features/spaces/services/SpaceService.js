/**
 * Este archivo maneja el servicio de espacios
 * - Servicios
 * - Espacios
 * - CRUD
 * - Gestión
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';


export const loadSpaces = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/managers/managers`);
    if (response.data.success) {
      const spaces = response.data.data.map(space => {
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

export const findNearbySpaces = (spaces, latitude, longitude, maxDistance, calculateDistance) => {
  if (!latitude || !longitude) {
    return spaces;
  }
  
  const spacesWithCoordinates = spaces.filter(space => {
    return space.latitud && space.longitud;
  });
  
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
  
  let filteredSpaces = spacesWithDistance;
  if (maxDistance) {
    filteredSpaces = spacesWithDistance.filter(space => space.distance <= maxDistance);
  }
  
  return filteredSpaces.sort((a, b) => a.distance - b.distance);
};

export default {
  loadSpaces,
  filterSpacesByQuery,
  findNearbySpaces
};
