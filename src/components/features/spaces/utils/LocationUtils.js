/**
 * Este archivo maneja las utilidades de ubicación
 * - UI
 * - Espacios
 * - Ubicación
 * - Utilidades
 * - Permisos
 */

import * as Location from 'expo-location';

export const getUserLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permiso de ubicación denegado');
      return null;
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error al obtener la ubicación:', error);
    return null;
  }
};


export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
  }
  
  const R = 6371;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

export const sortSpacesByDistance = (spaces, location) => {
  if (!location || !location.latitude || !location.longitude) {
    return spaces;
  }
  
  const spacesCopy = [...spaces];
  
  spacesCopy.forEach(space => {
    if (space.latitud && space.longitud) {
      space.distance = calculateDistance(
        location.latitude,
        location.longitude,
        parseFloat(space.latitud),
        parseFloat(space.longitud)
      );
    } else {
      space.distance = Infinity;
    }
  });
  
  return spacesCopy.sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });
};

export default {
  getUserLocation,
  calculateDistance,
  sortSpacesByDistance
};
