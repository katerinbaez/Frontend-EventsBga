/**
 * Este archivo maneja el servicio de ubicación
 * - Servicios
 * - Ubicación
 * - API
 */

import * as Location from 'expo-location';

export const getLocationOnly = async () => {
  try {
    console.log('Obteniendo ubicación del usuario en segundo plano...');
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('Estado de permiso de ubicación:', status);
    
    if (status !== 'granted') {
      console.log('Permiso de ubicación no disponible. El usuario tendrá que buscar manualmente.');
      return null;
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });
    
    console.log('Ubicación obtenida en segundo plano:', location.coords.latitude, location.coords.longitude);
    return location.coords;
  } catch (error) {
    console.log('Error al obtener ubicación en segundo plano:', error.message);
    return null;
  }
};


export const refreshUserLocation = async () => {
  try {
    console.log('Actualizando ubicación del usuario...');
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('Estado de permiso de ubicación:', status);
    
    if (status !== 'granted') {
      console.error('Permiso de ubicación denegado');
      return {
        error: 'Necesitamos permisos de ubicación para mostrar lugares cercanos.',
        coords: null
      };
    }
    
    console.log('Obteniendo ubicación actual...');
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      timeout: 15000
    });
    
    const { latitude, longitude } = location.coords;
    console.log('Coordenadas obtenidas:', latitude, longitude);
    
    console.log(`Ubicación actualizada: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    
    return {
      coords: { latitude, longitude },
      error: null
    };
  } catch (error) {
    console.error('Error obteniendo la ubicación:', error);
    return {
      coords: null,
      error: `Error de ubicación: ${error.message}. Por favor intenta de nuevo.`
    };
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&limit=1`;
    
    console.log('Realizando geocodificación inversa:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EventsBga-App/1.0',
        'Accept-Language': 'es',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const responseText = await response.text();
    
    try {
      const data = JSON.parse(responseText);
      
      if (data && data.display_name) {
        console.log('Ubicación actual:', data.display_name);
        return data;
      }
      return null;
    } catch (jsonError) {
      console.error('Error al parsear JSON:', jsonError);
      console.log('Respuesta recibida:', responseText.substring(0, 200) + '...');
      return null;
    }
  } catch (err) {
    console.error('Error en geocodificación inversa:', err);
    return null;
  }
};
