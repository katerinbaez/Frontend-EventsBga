import * as Location from 'expo-location';

/**
 * Solicita permisos de ubicación y obtiene la ubicación actual del usuario
 * @returns {Promise<Object|null>} Objeto con las coordenadas de la ubicación o null si hay error
 */
export const getUserLocation = async () => {
  try {
    // Solicitar permisos de ubicación
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permiso de ubicación denegado');
      return null;
    }
    
    // Obtener la ubicación actual
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

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
  }
  
  // Radio de la Tierra en kilómetros
  const R = 6371;
  
  // Convertir grados a radianes
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  // Fórmula de Haversine
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convierte grados a radianes
 * @param {number} degrees - Ángulo en grados
 * @returns {number} Ángulo en radianes
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Ordena una lista de espacios por distancia a una ubicación
 * @param {Array} spaces - Lista de espacios
 * @param {Object} location - Ubicación de referencia {latitude, longitude}
 * @returns {Array} Lista ordenada por distancia
 */
export const sortSpacesByDistance = (spaces, location) => {
  if (!location || !location.latitude || !location.longitude) {
    return spaces;
  }
  
  // Crear copia para no modificar el original
  const spacesCopy = [...spaces];
  
  // Calcular distancia para cada espacio
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
  
  // Ordenar por distancia
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
