/**
 * Este archivo maneja el servicio de búsqueda
 * - Servicios
 * - Búsqueda
 * - Lugares
 */
import * as Location from 'expo-location';

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

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


export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; 
  
  return distance;
};

export const searchNominatim = async (text, userLocation) => {
  try {
    let searchUrl;
    const searchTypes = getSearchType(text);
    
    if (searchTypes.isCulturalSearch) {
      return await searchCulturalSpaces(text, userLocation);
    }
    
    const viewbox = '73.0,-7.2,73.2,-7.0'; 
    const countryCode = 'co'; 
    
    searchUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(text)}&countrycodes=${countryCode}&addressdetails=1&limit=15`;
    
    if (userLocation) {
      searchUrl += `&lat=${userLocation.latitude}&lon=${userLocation.longitude}`;
    }
    
    console.log('URL de búsqueda:', searchUrl);
    
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
    
    let results = data.map(item => {
      let distance = null;
      if (userLocation && item.lat && item.lon) {
        distance = calculateDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          parseFloat(item.lat), 
          parseFloat(item.lon)
        );
      }
      
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

export const searchCulturalSpaces = async (text, userLocation) => {
  const cacheKey = 'culturalSearchCache';
  const cacheKeyTimestamp = 'culturalSearchCacheTimestamp';
  
  let cachedResults;
  let cacheTimestamp;
  
  try {
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
  
  const now = Date.now();
  const cacheValid = cacheTimestamp && (now - cacheTimestamp < 24 * 60 * 60 * 1000);
  
  if (cachedResults && cacheValid) {
    console.log('Usando resultados en caché para espacios culturales');
    return processCulturalResults(cachedResults, text, userLocation);
  }
  
  try {
    console.log('Realizando búsqueda combinada para espacios culturales');
    
    const culturalQueries = [
      'museo bucaramanga',
      'galeria arte bucaramanga',
      'centro cultural bucaramanga',
      'teatro bucaramanga',
      'biblioteca bucaramanga'
    ];
    
    const searchPromises = culturalQueries.map(query => 
      fetch(`${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&addressdetails=1&limit=5`, {
        headers: {
          'User-Agent': 'EventsBga-App/1.0',
          'Accept-Language': 'es',
          'Accept': 'application/json'
        }
      }).then(response => response.json())
    );
    
    const results = await Promise.all(searchPromises);
    
    let combinedResults = [];
    results.forEach(resultSet => {
      combinedResults = [...combinedResults, ...resultSet];
    });
    
    const uniqueResults = combinedResults.filter((item, index, self) =>
      index === self.findIndex(t => t.place_id === item.place_id)
    );
    
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
    
    return searchNominatim(text, userLocation);
  }
};

const processCulturalResults = (results, text, userLocation) => {
  const filteredResults = results.filter(item => {
    const lowerName = item.display_name.toLowerCase();
    const lowerText = text.toLowerCase();
    
    if (lowerText.length > 3 && !lowerText.includes('cultural') && !lowerText.includes('museo')) {
      return lowerName.includes(lowerText);
    }
    
    return true;
  });
  
  let processedResults = filteredResults.map(item => {
    let distance = null;
    if (userLocation && item.lat && item.lon) {
      distance = calculateDistance(
        userLocation.latitude, 
        userLocation.longitude, 
        parseFloat(item.lat), 
        parseFloat(item.lon)
      );
    }
    
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
