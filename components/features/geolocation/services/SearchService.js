import * as Location from 'expo-location';

// API de OpenStreetMap Nominatim para búsqueda de lugares (gratuita y sin clave API)
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

/**
 * Verifica si la búsqueda es de una categoría específica
 * @param {string} text - Texto de búsqueda
 * @returns {Object} Objeto con flags para diferentes tipos de búsqueda
 */
export const getSearchType = (text) => {
  const lowerText = text.toLowerCase();
  
  return {
    isCategorySearch: lowerText.includes('restaurante') || 
                     lowerText.includes('hotel') || 
                     lowerText.includes('café') || 
                     lowerText.includes('museo') || 
                     lowerText.includes('parque') || 
                     lowerText.includes('bar') || 
                     lowerText.includes('tienda') || 
                     lowerText.includes('cultural') || 
                     lowerText.includes('galeria') || 
                     lowerText.includes('biblioteca') || 
                     lowerText.includes('cine') || 
                     lowerText.includes('teatro'),
                     
    isCulturalSearch: lowerText.includes('cultural') || 
                     lowerText.includes('museo') || 
                     lowerText.includes('teatro') || 
                     lowerText.includes('galeria') || 
                     lowerText.includes('biblioteca') ||
                     lowerText.includes('or') ||
                     lowerText.includes('arte') ||
                     lowerText.includes('cultura') ||
                     lowerText.includes('exposicion') ||
                     lowerText.includes('exhibicion') ||
                     lowerText.includes('espacio cultural') ||
                     lowerText.includes('centro cultural'),
                     
    isMuseumSearch: lowerText.includes('museo') || 
                   lowerText.includes('museum') || 
                   lowerText.includes('museos') || 
                   lowerText === 'museo',
                   
    isBarSearch: false, // Desactivado según el código original
    
    isShopSearch: lowerText.includes('tienda') ||
                 lowerText.includes('centro comercial') ||
                 lowerText.includes('mall') ||
                 lowerText.includes('compras') ||
                 lowerText === 'tiendas',
                 
    isCafeSearch: lowerText.includes('cafe') || 
                 lowerText.includes('café') || 
                 lowerText.includes('cafeteria') ||  
                 lowerText.includes('cafetería') ||
                 lowerText.includes('coffee') ||
                 lowerText.includes('cappuccino') ||
                 lowerText.includes('espresso') ||
                 lowerText === 'cafes' ||
                 lowerText === 'cafés',
                 
    isProximitySearch: lowerText.includes('cerca')
  };
};

/**
 * Calcula la distancia entre dos puntos geográficos
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distancia en km
  
  return distance;
};

/**
 * Busca lugares usando la API de Nominatim
 * @param {string} text - Texto de búsqueda
 * @param {Object} userLocation - Ubicación del usuario
 * @returns {Promise<Array>} Lista de lugares encontrados
 */
export const searchNominatim = async (text, userLocation) => {
  try {
    // Construir la URL de búsqueda
    let searchUrl;
    const searchTypes = getSearchType(text);
    
    // Procesamiento especial para búsquedas culturales
    if (searchTypes.isCulturalSearch) {
      return await searchCulturalSpaces(text, userLocation);
    }
    
    // Priorizar resultados en Bucaramanga y Colombia
    const viewbox = '73.0,-7.2,73.2,-7.0'; // Aproximadamente el área de Bucaramanga
    const countryCode = 'co'; // Colombia
    
    // Construir la URL base
    searchUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(text)}&countrycodes=${countryCode}&addressdetails=1&limit=15`;
    
    // Si tenemos la ubicación del usuario, añadir parámetros para ordenar por cercanía
    if (userLocation) {
      searchUrl += `&lat=${userLocation.latitude}&lon=${userLocation.longitude}`;
    }
    
    console.log('URL de búsqueda:', searchUrl);
    
    // Realizar la solicitud HTTP
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'EventsBga-App/1.0',
        'Accept-Language': 'es',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Procesar los resultados
    let results = data.map(item => {
      // Calcular la distancia si tenemos la ubicación del usuario
      let distance = null;
      if (userLocation && item.lat && item.lon) {
        distance = calculateDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          parseFloat(item.lat), 
          parseFloat(item.lon)
        );
      }
      
      // Determinar el tipo de lugar basado en las categorías de OSM
      let type = 'Lugar';
      if (item.class === 'amenity') {
        if (item.type === 'restaurant') type = 'Restaurante';
        else if (item.type === 'cafe') type = 'Café';
        else if (item.type === 'bar') type = 'Bar';
        else if (item.type === 'museum') type = 'Museo';
        else if (item.type === 'library') type = 'Biblioteca';
        else if (item.type === 'theatre') type = 'Teatro';
        else if (item.type === 'cinema') type = 'Cine';
        else if (item.type === 'arts_centre') type = 'Centro Cultural';
        else type = 'Lugar de Interés';
      } else if (item.class === 'tourism') {
        if (item.type === 'museum') type = 'Museo';
        else if (item.type === 'gallery') type = 'Galería';
        else if (item.type === 'hotel') type = 'Hotel';
        else type = 'Lugar Turístico';
      } else if (item.class === 'shop') {
        type = 'Tienda';
      } else if (item.class === 'building') {
        type = 'Edificio';
      } else if (item.class === 'leisure') {
        type = 'Ocio';
      }
      
      // Extraer la dirección formateada
      let address = item.display_name;
      
      return {
        id: item.place_id,
        name: item.display_name.split(',')[0],
        address: address,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        distance: distance,
        type: type,
        originalData: item
      };
    });
    
    // Ordenar por distancia si está disponible
    if (userLocation) {
      results.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    throw error;
  }
};

/**
 * Busca espacios culturales combinando múltiples fuentes
 * @param {string} text - Texto de búsqueda
 * @param {Object} userLocation - Ubicación del usuario
 * @returns {Promise<Array>} Lista de espacios culturales
 */
export const searchCulturalSpaces = async (text, userLocation) => {
  // Sistema de caché para espacios culturales
  const cacheKey = 'culturalSearchCache';
  const cacheKeyTimestamp = 'culturalSearchCacheTimestamp';
  
  // Intentar obtener resultados de caché
  let cachedResults;
  let cacheTimestamp;
  
  try {
    // Usar global para React Native y localStorage para web si está disponible
    if (typeof localStorage !== 'undefined') {
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheKeyTimestamp);
      
      if (cachedData && cachedTime) {
        cachedResults = JSON.parse(cachedData);
        cacheTimestamp = parseInt(cachedTime);
      }
    } else if (global[cacheKey]) {
      cachedResults = global[cacheKey];
      cacheTimestamp = global[cacheKeyTimestamp];
    }
  } catch (e) {
    console.error('Error al acceder a la caché:', e);
  }
  
  // Verificar si la caché es válida (menos de 24 horas)
  const now = Date.now();
  const cacheValid = cacheTimestamp && (now - cacheTimestamp < 24 * 60 * 60 * 1000);
  
  if (cachedResults && cacheValid) {
    console.log('Usando resultados en caché para espacios culturales');
    return processCulturalResults(cachedResults, text, userLocation);
  }
  
  // Si no hay caché válida, realizar búsqueda combinada
  try {
    console.log('Realizando búsqueda combinada para espacios culturales');
    
    // Búsqueda en Nominatim para museos, galerías, etc.
    const culturalQueries = [
      'museo bucaramanga',
      'galeria arte bucaramanga',
      'centro cultural bucaramanga',
      'teatro bucaramanga',
      'biblioteca bucaramanga'
    ];
    
    // Realizar todas las búsquedas en paralelo
    const searchPromises = culturalQueries.map(query => 
      fetch(`${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&addressdetails=1&limit=5`, {
        headers: {
          'User-Agent': 'EventsBga-App/1.0',
          'Accept-Language': 'es',
          'Accept': 'application/json'
        }
      }).then(response => response.json())
    );
    
    // Esperar a que todas las búsquedas terminen
    const results = await Promise.all(searchPromises);
    
    // Combinar y eliminar duplicados
    let combinedResults = [];
    results.forEach(resultSet => {
      combinedResults = [...combinedResults, ...resultSet];
    });
    
    // Eliminar duplicados por place_id
    const uniqueResults = combinedResults.filter((item, index, self) =>
      index === self.findIndex(t => t.place_id === item.place_id)
    );
    
    // Guardar en caché
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(uniqueResults));
        localStorage.setItem(cacheKeyTimestamp, now.toString());
      } else {
        global[cacheKey] = uniqueResults;
        global[cacheKeyTimestamp] = now;
      }
    } catch (e) {
      console.error('Error al guardar en caché:', e);
    }
    
    return processCulturalResults(uniqueResults, text, userLocation);
  } catch (error) {
    console.error('Error en búsqueda cultural:', error);
    
    // Si falla, intentar con búsqueda normal
    return searchNominatim(text, userLocation);
  }
};

/**
 * Procesa los resultados de espacios culturales
 * @param {Array} results - Resultados sin procesar
 * @param {string} text - Texto de búsqueda original
 * @param {Object} userLocation - Ubicación del usuario
 * @returns {Array} Resultados procesados
 */
const processCulturalResults = (results, text, userLocation) => {
  // Filtrar por relevancia con el texto de búsqueda
  const filteredResults = results.filter(item => {
    const lowerName = item.display_name.toLowerCase();
    const lowerText = text.toLowerCase();
    
    // Si es una búsqueda específica, filtrar más estrictamente
    if (lowerText.length > 3 && !lowerText.includes('cultural') && !lowerText.includes('museo')) {
      return lowerName.includes(lowerText);
    }
    
    return true;
  });
  
  // Procesar los resultados
  let processedResults = filteredResults.map(item => {
    // Calcular la distancia si tenemos la ubicación del usuario
    let distance = null;
    if (userLocation && item.lat && item.lon) {
      distance = calculateDistance(
        userLocation.latitude, 
        userLocation.longitude, 
        parseFloat(item.lat), 
        parseFloat(item.lon)
      );
    }
    
    // Determinar el tipo de lugar
    let type = 'Espacio Cultural';
    if (item.type === 'museum' || item.display_name.toLowerCase().includes('museo')) {
      type = 'Museo';
    } else if (item.type === 'gallery' || item.display_name.toLowerCase().includes('galeria')) {
      type = 'Galería';
    } else if (item.type === 'theatre' || item.display_name.toLowerCase().includes('teatro')) {
      type = 'Teatro';
    } else if (item.type === 'library' || item.display_name.toLowerCase().includes('biblioteca')) {
      type = 'Biblioteca';
    }
    
    return {
      id: item.place_id,
      name: item.display_name.split(',')[0],
      address: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      distance: distance,
      type: type,
      originalData: item
    };
  });
  
  // Ordenar por distancia si está disponible
  if (userLocation) {
    processedResults.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }
  
  return processedResults;
};
