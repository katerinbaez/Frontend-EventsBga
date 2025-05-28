import * as Location from 'expo-location';

/**
 * Obtiene solo la ubicación del usuario sin buscar lugares
 * @returns {Promise<Object|null>} Coordenadas del usuario o null si hay error
 */
export const getLocationOnly = async () => {
  try {
    // No activamos el indicador de carga para no molestar al usuario
    console.log('Obteniendo ubicación del usuario en segundo plano...');
    
    // Verificar si el dispositivo tiene permisos de ubicación
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('Estado de permiso de ubicación:', status);
    
    if (status !== 'granted') {
      // Solo registrar en consola, sin mostrar error al usuario
      console.log('Permiso de ubicación no disponible. El usuario tendrá que buscar manualmente.');
      return null;
    }
    
    // Obtener la ubicación actual
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

/**
 * Obtiene la ubicación actual del usuario con alta precisión
 * @returns {Promise<Object>} Objeto con la ubicación o error
 */
export const refreshUserLocation = async () => {
  try {
    console.log('Actualizando ubicación del usuario...');
    
    // Verificar si el dispositivo tiene permisos de ubicación
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('Estado de permiso de ubicación:', status);
    
    if (status !== 'granted') {
      // Mostrar error discreto sin alerta
      console.error('Permiso de ubicación denegado');
      return {
        error: 'Necesitamos permisos de ubicación para mostrar lugares cercanos.',
        coords: null
      };
    }
    
    console.log('Obteniendo ubicación actual...');
    
    // Obtener la ubicación actual con máxima precisión
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      timeout: 15000
    });
    
    const { latitude, longitude } = location.coords;
    console.log('Coordenadas obtenidas:', latitude, longitude);
    
    // Mostrar mensaje discreto en la consola
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

/**
 * Realiza geocodificación inversa (coordenadas a dirección)
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {Promise<Object|null>} Información de la dirección o null si hay error
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    // URL correcta para geocodificación inversa
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&limit=1`;
    
    console.log('Realizando geocodificación inversa:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EventsBga-App/1.0',
        'Accept-Language': 'es',
        'Accept': 'application/json'
      }
    });
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    // Obtener el texto de la respuesta primero para depurar
    const responseText = await response.text();
    
    try {
      // Intentar parsear el texto como JSON
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
