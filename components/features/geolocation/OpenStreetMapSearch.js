import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// API de OpenStreetMap Nominatim para búsqueda de lugares (gratuita y sin clave API)
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

const OpenStreetMapSearch = ({ onLocationSelect }) => {
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  // Estados para la vista detallada
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  
  // Variable para almacenar la función de búsqueda de respaldo
  let searchBackupFunction = null;

  // Obtener solo la ubicación del usuario al cargar el componente, sin buscar lugares
  useEffect(() => {
    // Solo obtenemos la ubicación, sin mostrar resultados automáticamente
    getLocationOnly();
  }, []);

  // Función para obtener SOLO la ubicación del usuario sin buscar lugares
  const getLocationOnly = async () => {
    try {
      // No activamos el indicador de carga para no molestar al usuario
      console.log('Obteniendo ubicación del usuario en segundo plano...');
      
      // Verificar si el dispositivo tiene permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Estado de permiso de ubicación:', status);
      
      if (status !== 'granted') {
        // Solo registrar en consola, sin mostrar error al usuario
        console.log('Permiso de ubicación no disponible. El usuario tendrá que buscar manualmente.');
        return;
      }
      
      // Obtener la ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      // Guardar la ubicación para usarla cuando el usuario decida buscar
      setUserLocation(location.coords);
      console.log('Ubicación obtenida en segundo plano:', location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.log('Error al obtener ubicación en segundo plano:', error.message);
      // No mostramos error al usuario
    }
  };
  
  // Función para obtener la ubicación actual del usuario y buscar lugares cercanos
  const refreshUserLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Actualizando ubicación del usuario...');
      
      // Verificar si el dispositivo tiene permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Estado de permiso de ubicación:', status);
      
      if (status !== 'granted') {
        // Mostrar error discreto sin alerta
        console.error('Permiso de ubicación denegado');
        setError('Necesitamos permisos de ubicación para mostrar lugares cercanos.');
        setLoading(false);
        return;
      }
      
      console.log('Obteniendo ubicación actual...');
      
      // Obtener la ubicación actual con máxima precisión
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        timeout: 15000
      });
      
      const { latitude, longitude } = location.coords;
      console.log('Coordenadas obtenidas:', latitude, longitude);
      
      // Guardar la ubicación en el estado
      setUserLocation({ latitude, longitude });
      
      // Mostrar mensaje discreto en la consola
      console.log(`Ubicación actualizada: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      
      // Si hay texto en el campo de búsqueda, actualizar los resultados
      if (searchText.trim()) {
        console.log('Actualizando resultados con la nueva ubicación...');
        searchPlaces(searchText);
      } else {
        // Si no hay búsqueda activa, mostrar lugares cercanos de interés
        searchPlaces('lugares cerca');
      }
      
      // Hacer una búsqueda inversa para obtener la dirección
      reverseGeocode(latitude, longitude);
      
      // Solo mostrar mensaje en consola (sin alerta)
      console.log(`Ubicación actualizada: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      
      // NO realizar búsqueda automática
      // Limpiar los resultados actuales para que el usuario pueda hacer una nueva búsqueda
      setPredictions([]);
      
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
      // Mostrar error discreto sin alerta
      setError(`Error de ubicación: ${error.message}. Por favor intenta de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  // Función para hacer geocodificación inversa (coordenadas a dirección)
  const reverseGeocode = async (latitude, longitude) => {
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
        }
      } catch (jsonError) {
        console.error('Error al parsear JSON:', jsonError);
        console.log('Respuesta recibida:', responseText.substring(0, 200) + '...');
      }
    } catch (err) {
      console.error('Error en geocodificación inversa:', err);
    }
  };

  // Debounce para evitar demasiadas solicitudes mientras se escribe
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
      if (!userLocation) {
        console.log('No se ha obtenido la ubicación del usuario. Intentando obtenerla...');
        try {
          // Intentar obtener la ubicación actual
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000
          });
          
          const { latitude, longitude } = location.coords;
          console.log('Ubicación obtenida para búsqueda:', latitude, longitude);
          setUserLocation({ latitude, longitude });
        } catch (locationError) {
          console.warn('No se pudo obtener la ubicación para la búsqueda:', locationError.message);
          // Continuar con la búsqueda usando el centro de Bucaramanga
        }
      }
      
      // Determinar si es una búsqueda de categoría específica o de lugares cercanos
      const isCategorySearch = text.includes('restaurante') || 
                               text.includes('hotel') || 
                               text.includes('café') || 
                               text.includes('museo') || 
                               text.includes('parque') || 
                               text.includes('bar') || 
                               text.includes('tienda') || 
                               text.includes('cultural') || 
                               text.includes('galeria') || 
                               text.includes('biblioteca') || 
                               text.includes('cine') || 
                               text.includes('teatro');
      
      // Verificar si es una búsqueda de espacios culturales
      const isCulturalSearch = text.includes('cultural') || 
                               text.includes('museo') || 
                               text.includes('teatro') || 
                               text.includes('galeria') || 
                               text.includes('biblioteca') ||
                               text.toLowerCase().includes('or') ||
                               text.toLowerCase().includes('arte') ||
                               text.toLowerCase().includes('cultura') ||
                               text.toLowerCase().includes('exposicion') ||
                               text.toLowerCase().includes('exhibicion') ||
                               text.toLowerCase().includes('espacio cultural') ||
                               text.toLowerCase().includes('centro cultural');
      
      // Verificar si es una búsqueda de museos
      const isMuseumSearch = text.toLowerCase().includes('museo') || 
                           text.toLowerCase().includes('museum') || 
                           text.toLowerCase().includes('museos') || 
                           text.toLowerCase() === 'museo';
      
      // Verificar si es una búsqueda de bares (desactivado)
      const isBarSearch = false;
      
      // Verificar si es una búsqueda de tiendas
      const isShopSearch = text.toLowerCase().includes('tienda') ||
                           text.toLowerCase().includes('centro comercial') ||
                           text.toLowerCase().includes('mall') ||
                           text.toLowerCase().includes('compras') ||
                           text.toLowerCase() === 'tiendas';
      
      // Verificar si es una búsqueda de cafés
      const isCafeSearch = text.toLowerCase().includes('cafe') || 
                          text.toLowerCase().includes('café') || 
                          text.toLowerCase().includes('cafeteria') ||  
                          text.toLowerCase().includes('cafetería') ||
                          text.toLowerCase().includes('coffee') ||
                          text.toLowerCase().includes('cappuccino') ||
                          text.toLowerCase().includes('espresso') ||
                          text.toLowerCase() === 'cafes' ||
                          text.toLowerCase() === 'cafés';
      
      const isProximitySearch = text.includes('cerca');
      
      // Construir la URL de búsqueda
      let searchUrl;
      
      // Procesamiento especial para búsquedas culturales (optimizado para máxima velocidad)
      if (isCulturalSearch) {
        // Sistema de caché para espacios culturales
        const cacheKey = 'culturalSearchCache';
        const cacheKeyTimestamp = 'culturalSearchCacheTimestamp';
        
        // Definimos una función optimizada para realizar búsquedas de espacios culturales
        const performMultiSearch = async () => {
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
            console.warn('Error al acceder a caché cultural:', e);
          }
          
          // Verificar si la caché es válida (30 minutos)
          if (cachedResults && cacheTimestamp && (Date.now() - cacheTimestamp < 1800000)) {
            console.log('Usando resultados en caché para espacios culturales');
            return cachedResults;
          }
          
          // Lista de consultas prioritarias (se cargan primero)
          const primaryQueries = [
            'centro cultural Bucaramanga',
            'museo Bucaramanga',
            'teatro Bucaramanga'
          ];
          
          // Consultas secundarias (se cargarán después)
          const secondaryQueries = [
            'biblioteca Bucaramanga',
            'galeria arte Bucaramanga',
            'casa cultura Bucaramanga',
            'espacio cultural Bucaramanga'
          ];
          
          // Si el usuario busca algo específico, añadirlo a las consultas prioritarias
          if (text.length > 3 && 
              text.toLowerCase() !== 'cultural' && 
              text.toLowerCase() !== 'cultura' && 
              !text.toLowerCase().includes('bucaramanga')) {
            primaryQueries.unshift(`${text} Bucaramanga`);
          }
          
          // Resultados combinados
          let allResults = [];
          const processedIds = new Set(); // Para evitar duplicados
          
          // Función para guardar en caché
          const saveToCache = (data) => {
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(cacheKeyTimestamp, Date.now().toString());
              }
              
              global[cacheKey] = data;
              global[cacheKeyTimestamp] = Date.now();
            } catch (e) {
              console.warn('Error al guardar en caché cultural:', e);
            }
          };
          
          // Función para procesar resultados y eliminar duplicados
          const processResults = (data) => {
            for (const item of data) {
              if (!processedIds.has(item.place_id)) {
                processedIds.add(item.place_id);
                allResults.push(item);
              }
            }
          };
          
          // Realizar búsquedas primarias en paralelo
          console.log('Iniciando búsquedas prioritarias de espacios culturales...');
          const primaryPromises = primaryQueries.map(async (query) => {
            try {
              const queryUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&limit=10&addressdetails=1`;
              
              const response = await fetch(queryUrl, {
                headers: {
                  'User-Agent': 'EventsBga-App/1.0',
                  'Accept-Language': 'es',
                  'Accept': 'application/json'
                }
              });
              
              if (!response.ok) return [];
              
              const data = await response.json();
              console.log(`Búsqueda rápida de "${query}": ${data.length} resultados`);
              return data;
            } catch (error) {
              console.error(`Error en búsqueda de "${query}":`, error);
              return [];
            }
          });
          
          // Esperar a que terminen las búsquedas primarias
          const primaryResults = await Promise.all(primaryPromises);
          
          // Procesar resultados primarios inmediatamente
          for (const results of primaryResults) {
            processResults(results);
          }
          
          // Guardar resultados primarios en caché para respuesta inmediata
          if (allResults.length > 0) {
            saveToCache(allResults);
            console.log(`Guardados ${allResults.length} resultados primarios culturales en caché`);
          }
          
          // Iniciar búsquedas secundarias en segundo plano
          if (secondaryQueries.length > 0) {
            // No esperamos a que terminen estas búsquedas
            setTimeout(async () => {
              try {
                console.log('Iniciando búsquedas secundarias culturales en segundo plano...');
                const secondaryPromises = secondaryQueries.map(async (query) => {
                  try {
                    const queryUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&limit=5&addressdetails=1`;
                    
                    const response = await fetch(queryUrl, {
                      headers: {
                        'User-Agent': 'EventsBga-App/1.0',
                        'Accept-Language': 'es',
                        'Accept': 'application/json'
                      }
                    });
                    
                    if (!response.ok) return [];
                    
                    const data = await response.json();
                    return data;
                  } catch (error) {
                    return [];
                  }
                });
                
                const secondaryResults = await Promise.all(secondaryPromises);
                let newResults = false;
                
                // Procesar resultados secundarios
                for (const results of secondaryResults) {
                  const prevSize = allResults.length;
                  processResults(results);
                  if (allResults.length > prevSize) newResults = true;
                }
                
                // Actualizar caché si hay nuevos resultados
                if (newResults) {
                  saveToCache(allResults);
                  console.log(`Caché cultural actualizada con ${allResults.length} resultados totales`);
                }
              } catch (e) {
                console.warn('Error en búsquedas secundarias culturales:', e);
              }
            }, 100);
          }
          
          console.log(`Búsqueda rápida encontró ${allResults.length} espacios culturales`);
          return allResults;
        };
        
        // Guardar la función de búsqueda múltiple para usarla después
        searchBackupFunction = performMultiSearch;
        
        // Para la búsqueda principal, usar una consulta optimizada
        searchUrl = `${NOMINATIM_API_URL}/search?format=json&q=centro+cultural+Bucaramanga&countrycodes=co&limit=15&addressdetails=1`;
        console.log('Iniciando búsqueda cultural optimizada...');
      }
      // Procesamiento especial para búsquedas de cafés
      else if (isCafeSearch) {
        // Crear una función que realiza búsquedas optimizadas para cafés
        const getCafeResults = async () => {
          // Lista de consultas para encontrar diferentes tipos de cafés
          const cafeQueries = [
            'cafe Bucaramanga',
            'cafeteria Bucaramanga',
            'coffee shop Bucaramanga',
            'pasteleria Bucaramanga'
          ];
          
          // Resultados combinados
          let allCafeResults = [];
          const processedCafeIds = new Set(); // Para evitar duplicados
          
          // Realizar las búsquedas en paralelo para mayor velocidad
          const searchPromises = cafeQueries.map(async (query) => {
            try {
              const queryUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&limit=10&addressdetails=1`;
              console.log(`Realizando búsqueda de cafés para: ${query}`);
              
              const response = await fetch(queryUrl, {
                headers: {
                  'User-Agent': 'EventsBga-App/1.0',
                  'Accept-Language': 'es',
                  'Accept': 'application/json'
                }
              });
              
              if (!response.ok) {
                console.warn(`Error HTTP ${response.status} en búsqueda de "${query}", continuando...`);
                return [];
              }
              
              const data = await response.json();
              console.log(`Búsqueda de "${query}" encontró ${data.length} resultados`);
              return data;
            } catch (error) {
              console.error(`Error en búsqueda de "${query}":`, error);
              return [];
            }
          });
          
          // Esperar a que todas las búsquedas terminen
          const resultsArrays = await Promise.all(searchPromises);
          
          // Combinar resultados y eliminar duplicados
          for (const results of resultsArrays) {
            for (const item of results) {
              if (!processedCafeIds.has(item.place_id)) {
                processedCafeIds.add(item.place_id);
                allCafeResults.push(item);
              }
            }
          }
          
          console.log(`Búsqueda combinada encontró ${allCafeResults.length} cafés en total`);
          return allCafeResults;
        };
        
        // Guardar la función para usarla después
        searchBackupFunction = getCafeResults;
        
        // Para la búsqueda principal, usar una consulta más amplia con mayor límite
        searchUrl = `${NOMINATIM_API_URL}/search?format=json&q=cafe+cafeteria+Bucaramanga&countrycodes=co&limit=30&addressdetails=1`;
        console.log('Iniciando búsqueda de cafés...');
      }
      // Procesamiento especial para búsquedas de tiendas (optimizado para máxima velocidad)
      else if (isShopSearch) {
        // Crear una función que realiza búsquedas optimizadas con carga progresiva
        const getShopResults = async () => {
          // Lista de consultas para encontrar diferentes tipos de tiendas (priorizada y reducida)
          const primaryQueries = [
            'centro comercial Bucaramanga', // Prioridad máxima - resultados más relevantes
            'tienda Bucaramanga',
            'mall Bucaramanga'
          ];
          
          const secondaryQueries = [
            'almacen Bucaramanga',
            'supermercado Bucaramanga',
            'boutique Bucaramanga'
          ];
          
          // Resultados combinados
          let allShopResults = [];
          const processedShopIds = new Set(); // Para evitar duplicados
          
          // Sistema de caché mejorado con múltiples niveles
          const cacheKey = 'shopSearchCache';
          const cacheKeyTimestamp = 'shopSearchCacheTimestamp';
          
          // Intentar obtener resultados de localStorage para persistencia entre sesiones
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
            console.warn('Error al acceder a caché:', e);
          }
          
          // Verificar si la caché es válida (10 minutos)
          if (cachedResults && cacheTimestamp && (Date.now() - cacheTimestamp < 600000)) {
            console.log('Usando resultados en caché para tiendas');
            return cachedResults;
          }
          
          // Función para guardar en caché
          const saveToCache = (data) => {
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(cacheKeyTimestamp, Date.now().toString());
              }
              
              global[cacheKey] = data;
              global[cacheKeyTimestamp] = Date.now();
            } catch (e) {
              console.warn('Error al guardar en caché:', e);
            }
          };
          
          // Función para procesar resultados y eliminar duplicados
          const processResults = (data) => {
            for (const item of data) {
              if (!processedShopIds.has(item.place_id)) {
                processedShopIds.add(item.place_id);
                allShopResults.push(item);
              }
            }
          };
          
          // Realizar búsquedas primarias (las más importantes) en paralelo
          console.log('Iniciando búsquedas primarias de tiendas...');
          const primaryPromises = primaryQueries.map(async (query) => {
            try {
              const queryUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&limit=8&addressdetails=1`;
              
              const response = await fetch(queryUrl, {
                headers: {
                  'User-Agent': 'EventsBga-App/1.0',
                  'Accept-Language': 'es',
                  'Accept': 'application/json'
                }
              });
              
              if (!response.ok) return [];
              
              const data = await response.json();
              console.log(`Búsqueda rápida de "${query}": ${data.length} resultados`);
              return data;
            } catch (error) {
              console.error(`Error en búsqueda de "${query}":`, error);
              return [];
            }
          });
          
          // Esperar a que terminen las búsquedas primarias
          const primaryResults = await Promise.all(primaryPromises);
          
          // Procesar resultados primarios inmediatamente
          for (const results of primaryResults) {
            processResults(results);
          }
          
          // Guardar resultados primarios en caché para respuesta inmediata
          if (allShopResults.length > 0) {
            saveToCache(allShopResults);
            console.log(`Guardados ${allShopResults.length} resultados primarios en caché`);
          }
          
          // Iniciar búsquedas secundarias en segundo plano
          if (secondaryQueries.length > 0) {
            // No esperamos a que terminen estas búsquedas
            setTimeout(async () => {
              try {
                console.log('Iniciando búsquedas secundarias en segundo plano...');
                const secondaryPromises = secondaryQueries.map(async (query) => {
                  try {
                    const queryUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&limit=5&addressdetails=1`;
                    
                    const response = await fetch(queryUrl, {
                      headers: {
                        'User-Agent': 'EventsBga-App/1.0',
                        'Accept-Language': 'es',
                        'Accept': 'application/json'
                      }
                    });
                    
                    if (!response.ok) return [];
                    
                    const data = await response.json();
                    return data;
                  } catch (error) {
                    return [];
                  }
                });
                
                const secondaryResults = await Promise.all(secondaryPromises);
                let newResults = false;
                
                // Procesar resultados secundarios
                for (const results of secondaryResults) {
                  const prevSize = allShopResults.length;
                  processResults(results);
                  if (allShopResults.length > prevSize) newResults = true;
                }
                
                // Actualizar caché si hay nuevos resultados
                if (newResults) {
                  saveToCache(allShopResults);
                  console.log(`Caché actualizada con ${allShopResults.length} resultados totales`);
                }
              } catch (e) {
                console.warn('Error en búsquedas secundarias:', e);
              }
            }, 100); // Comenzar casi inmediatamente después de devolver los resultados primarios
          }
          
          console.log(`Búsqueda rápida encontró ${allShopResults.length} tiendas`);
          return allShopResults;
        };
        
        // Guardar la función para usarla después
        searchBackupFunction = getShopResults;
        
        // Para la búsqueda principal, usar una consulta más amplia con mayor límite
        searchUrl = `${NOMINATIM_API_URL}/search?format=json&q=tienda+centro+comercial+Bucaramanga&countrycodes=co&limit=30&addressdetails=1`;
        console.log('Iniciando búsqueda de tiendas...');
      }
      // Procesamiento especial para búsquedas de cafés
      else if (isCafeSearch) {
        // Crear una función que realiza múltiples búsquedas para obtener más resultados
        const getCafeResults = async () => {
          // Lista de consultas para encontrar diferentes tipos de cafés
          const cafeQueries = [
            'cafe Bucaramanga',
            'cafeteria Bucaramanga',
            'coffee shop Bucaramanga',
            'juan valdez Bucaramanga',
            'starbucks Bucaramanga',
            'cafe especialidad Bucaramanga',
            'cafe oma Bucaramanga',
            'cafe gourmet Bucaramanga'
          ];
          
          // Resultados combinados
          let allCafeResults = [];
          const processedCafeIds = new Set(); // Para evitar duplicados
          
          // Realizar las búsquedas secuencialmente
          for (const query of cafeQueries) {
            try {
              const queryUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&limit=15&addressdetails=1`;
              console.log(`Realizando búsqueda de cafés para: ${query}`);
              
              const response = await fetch(queryUrl, {
                headers: {
                  'User-Agent': 'EventsBga-App/1.0',
                  'Accept-Language': 'es',
                  'Accept': 'application/json'
                }
              });
              
              if (!response.ok) {
                console.warn(`Error HTTP ${response.status} en búsqueda de "${query}", continuando con otras consultas...`);
                continue;
              }
              
              const data = await response.json();
              console.log(`Búsqueda de "${query}" encontró ${data.length} resultados`);
              
              // Añadir resultados únicos (evitar duplicados)
              for (const item of data) {
                if (!processedCafeIds.has(item.place_id)) {
                  processedCafeIds.add(item.place_id);
                  allCafeResults.push(item);
                }
              }
            } catch (error) {
              console.error(`Error en búsqueda de "${query}":`, error);
              // Continuar con la siguiente consulta aunque haya error
            }
            
            // Esperar un breve momento entre consultas para no sobrecargar la API
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          console.log(`Búsqueda combinada encontró ${allCafeResults.length} cafés en total`);
          return allCafeResults;
        };
        
        // Guardar la función para usarla después
        searchBackupFunction = getCafeResults;
        
        // Para la búsqueda principal, usar una consulta más amplia con mayor límite
        searchUrl = `${NOMINATIM_API_URL}/search?format=json&q=cafe+cafeteria+Bucaramanga&countrycodes=co&limit=30&addressdetails=1`;
        console.log('Iniciando búsqueda de cafés...');
      }
      // Procesamiento especial para búsquedas de museos (optimizado para máxima velocidad)
      else if (isMuseumSearch) {
        // Crear una función que realiza búsquedas optimizadas para museos con caché
        const getMuseumResults = async () => {
          // Sistema de caché para museos
          const cacheKey = 'museumSearchCache';
          const cacheKeyTimestamp = 'museumSearchCacheTimestamp';
          
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
            console.warn('Error al acceder a caché de museos:', e);
          }
          
          // Verificar si la caché es válida (30 minutos)
          if (cachedResults && cacheTimestamp && (Date.now() - cacheTimestamp < 1800000)) {
            console.log('Usando resultados en caché para museos');
            return cachedResults;
          }
          
          // Lista de consultas prioritarias para museos
          const primaryQueries = [
            'museo Bucaramanga',
            'museo arte Bucaramanga'
          ];
          
          // Consultas secundarias (se cargarán después)
          const secondaryQueries = [
            'museo historia Bucaramanga',
            'museo arqueologia Bucaramanga'
          ];
          
          // Resultados combinados
          let allMuseumResults = [];
          const processedMuseumIds = new Set(); // Para evitar duplicados
          
          // Función para guardar en caché
          const saveToCache = (data) => {
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(cacheKeyTimestamp, Date.now().toString());
              }
              
              global[cacheKey] = data;
              global[cacheKeyTimestamp] = Date.now();
            } catch (e) {
              console.warn('Error al guardar en caché de museos:', e);
            }
          };
          
          // Función para procesar resultados y eliminar duplicados
          const processResults = (data) => {
            for (const item of data) {
              if (!processedMuseumIds.has(item.place_id)) {
                processedMuseumIds.add(item.place_id);
                allMuseumResults.push(item);
              }
            }
          };
          
          // Realizar búsquedas primarias en paralelo
          console.log('Iniciando búsquedas prioritarias de museos...');
          const primaryPromises = primaryQueries.map(async (query) => {
            try {
              const queryUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&limit=10&addressdetails=1`;
              
              const response = await fetch(queryUrl, {
                headers: {
                  'User-Agent': 'EventsBga-App/1.0',
                  'Accept-Language': 'es',
                  'Accept': 'application/json'
                }
              });
              
              if (!response.ok) return [];
              
              const data = await response.json();
              console.log(`Búsqueda rápida de "${query}": ${data.length} resultados`);
              return data;
            } catch (error) {
              console.error(`Error en búsqueda de "${query}":`, error);
              return [];
            }
          });
          
          // Esperar a que terminen las búsquedas primarias
          const primaryResults = await Promise.all(primaryPromises);
          
          // Procesar resultados primarios inmediatamente
          for (const results of primaryResults) {
            processResults(results);
          }
          
          // Guardar resultados primarios en caché para respuesta inmediata
          if (allMuseumResults.length > 0) {
            saveToCache(allMuseumResults);
            console.log(`Guardados ${allMuseumResults.length} resultados primarios de museos en caché`);
          }
          
          // Iniciar búsquedas secundarias en segundo plano
          if (secondaryQueries.length > 0) {
            // No esperamos a que terminen estas búsquedas
            setTimeout(async () => {
              try {
                console.log('Iniciando búsquedas secundarias de museos en segundo plano...');
                const secondaryPromises = secondaryQueries.map(async (query) => {
                  try {
                    const queryUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=co&limit=5&addressdetails=1`;
                    
                    const response = await fetch(queryUrl, {
                      headers: {
                        'User-Agent': 'EventsBga-App/1.0',
                        'Accept-Language': 'es',
                        'Accept': 'application/json'
                      }
                    });
                    
                    if (!response.ok) return [];
                    
                    const data = await response.json();
                    return data;
                  } catch (error) {
                    return [];
                  }
                });
                
                const secondaryResults = await Promise.all(secondaryPromises);
                let newResults = false;
                
                // Procesar resultados secundarios
                for (const results of secondaryResults) {
                  const prevSize = allMuseumResults.length;
                  processResults(results);
                  if (allMuseumResults.length > prevSize) newResults = true;
                }
                
                // Actualizar caché si hay nuevos resultados
                if (newResults) {
                  saveToCache(allMuseumResults);
                  console.log(`Caché de museos actualizada con ${allMuseumResults.length} resultados totales`);
                }
              } catch (e) {
                console.warn('Error en búsquedas secundarias de museos:', e);
              }
            }, 100);
          }
          
          console.log(`Búsqueda rápida encontró ${allMuseumResults.length} museos`);
          return allMuseumResults;
        };
        
        // Guardar la función para usarla después
        searchBackupFunction = getMuseumResults;
        
        // Para la búsqueda principal, usar una consulta directa con mayor prioridad
        searchUrl = `${NOMINATIM_API_URL}/search?format=json&q=museo+Bucaramanga&countrycodes=co&limit=15&addressdetails=1`;
        console.log('Iniciando búsqueda optimizada de museos...');
      }
      else if (isProximitySearch) {
        // Para búsquedas de lugares cercanos, extraer la categoría
        const category = text.replace(' cerca', '').trim();
        
        // Construir URL para búsqueda de lugares cercanos
        if (userLocation) {
          // Solución radical: buscar SOLO lugares extremadamente cercanos a la ubicación actual
          searchUrl = `${NOMINATIM_API_URL}/search?format=json`;
          
          // Añadir parámetro de búsqueda con la categoría
          searchUrl += `&q=${encodeURIComponent(category)}`;
          
          // Añadir ubicación del usuario como punto central con alta prioridad
          searchUrl += `&lat=${userLocation.latitude}&lon=${userLocation.longitude}`;
          
          // Limitar el número de resultados pero mantener suficientes para tener variedad
          searchUrl += '&limit=50';
          
          // Especificar un radio de búsqueda EXTREMADAMENTE pequeño
          // El radio se especifica en km - reducido a 1km para forzar resultados cercanos
          searchUrl += '&radius=1';
          
          // Crear un viewbox muy pequeño (aproximadamente 1km alrededor)
          // Esto fuerza a la API a buscar lugares muy cercanos
          const delta = 0.009; // Aproximadamente 1km
          const viewbox = [
            userLocation.longitude - delta, // min_lon
            userLocation.latitude - delta,  // min_lat
            userLocation.longitude + delta, // max_lon
            userLocation.latitude + delta   // max_lat
          ].join(',');
          
          // Añadir el viewbox a la URL
          searchUrl += `&viewbox=${viewbox}`;
          
          // Especificar que queremos ordenar por distancia (crucial para proximidad)
          searchUrl += '&sort=distance';
          
          // Añadir un parámetro para indicar que estamos buscando lugares cercanos
          searchUrl += '&nearby=1';
          
          // Añadir parámetro para LIMITAR resultados al viewbox (crucial)
          searchUrl += '&bounded=1';
          
          console.log('Búsqueda de lugares cercanos:', searchUrl);
        } else {
          // Usar el centro de Bucaramanga si no hay ubicación del usuario
          searchUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(category)}`;
          searchUrl += '&lat=7.1196&lon=-73.1227';
          searchUrl += '&limit=25'; // Reducido a 25 para evitar errores
          
          // Añadir viewbox centrado en Bucaramanga
          // Formato correcto: min_lon,min_lat,max_lon,max_lat
          const viewbox = '-73.1727,7.0696,-73.0727,7.1696';
          searchUrl += `&viewbox=${viewbox}`;
          console.log('Búsqueda cercana con ubicación predeterminada:', searchUrl);
        }
      } else {
        // Búsqueda normal mejorada
        searchUrl = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(text)}&limit=25`;
        
        // Si tenemos ubicación del usuario, añadir parámetros para encontrar lugares cercanos
        if (userLocation) {
          // Añadir ubicación para ordenar resultados
          searchUrl += `&lat=${userLocation.latitude}&lon=${userLocation.longitude}`;
          
          // Añadir viewbox para priorizar resultados cercanos (5km alrededor)
          // Reducido para evitar errores HTTP 400
          const delta = 0.045; // Aproximadamente 5km
          const viewbox = [
            userLocation.longitude - delta, // min_lon
            userLocation.latitude - delta,  // min_lat
            userLocation.longitude + delta, // max_lon
            userLocation.latitude + delta   // max_lat
          ].join(',');
          
          searchUrl += `&viewbox=${viewbox}`;
          
          // No limitar a Colombia si tenemos ubicación (para encontrar lugares cercanos en fronteras)
          if (!isCategorySearch && text.toLowerCase().includes('colombia')) {
            searchUrl += '&countrycodes=co';
          }
        } else {
          // Sin ubicación, limitar a Colombia y usar centro de Bucaramanga
          if (!isCategorySearch) {
            searchUrl += '&countrycodes=co';
          }
          searchUrl += `&lat=7.1196&lon=-73.1227`;
        }
      }
      
      // Añadir parámetros adicionales para mejorar los resultados
      searchUrl += '&addressdetails=1&extratags=1&namedetails=1';
      
      console.log('Realizando búsqueda:', searchUrl);
      
      // Realizar la búsqueda
      const response = await fetch(
        searchUrl,
        {
          headers: {
            'User-Agent': 'EventsBga-App/1.0',
            'Accept-Language': 'es',
            'Accept': 'application/json'
          }
        }
      );
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      // Procesar los resultados con manejo de errores
      let data;
      try {
        // Obtener el texto de la respuesta primero para depurar
        const responseText = await response.text();
        
        try {
          // Intentar parsear el texto como JSON
          data = JSON.parse(responseText);
          
          // Si es una búsqueda cultural, de bares o tiendas y tenemos una función de búsqueda múltiple, usarla siempre
          if ((isCulturalSearch || isBarSearch || isShopSearch) && searchBackupFunction) {
            const category = isCulturalSearch ? 'espacios culturales' : isBarSearch ? 'bares' : 'tiendas';
            console.log(`Usando búsqueda múltiple para ${category}...`);
            
            // Para bares, usar directamente la función de búsqueda múltiple sin importar los resultados iniciales
            if (isBarSearch) {
              console.log('Forzando búsqueda múltiple para bares...');
              data = await searchBackupFunction();
              
              // Si aún no hay resultados, usar datos predefinidos para bares
              if (!data || data.length === 0) {
                console.log('No se encontraron bares en la búsqueda en línea, usando datos predefinidos');
                data = [
                  {
                    place_id: 'bar1',
                    display_name: 'La Cerveceria - Bar & Restaurante, Bucaramanga',
                    lat: '7.1196',
                    lon: '-73.1227',
                    address: {
                      road: 'Carrera 36',
                      city: 'Bucaramanga',
                      state: 'Santander',
                      country: 'Colombia'
                    }
                  },
                  {
                    place_id: 'bar2',
                    display_name: 'Bar El Corral, Cabecera, Bucaramanga',
                    lat: '7.1250',
                    lon: '-73.1150',
                    address: {
                      road: 'Carrera 33',
                      city: 'Bucaramanga',
                      state: 'Santander',
                      country: 'Colombia'
                    }
                  },
                  {
                    place_id: 'bar3',
                    display_name: 'La Barra - Pub & Discoteca, Bucaramanga',
                    lat: '7.1180',
                    lon: '-73.1210',
                    address: {
                      road: 'Calle 45',
                      city: 'Bucaramanga',
                      state: 'Santander',
                      country: 'Colombia'
                    }
                  }
                ];
              }
            } else {
              data = await searchBackupFunction();
            }
          }
        } catch (jsonError) {
          console.error('Error al parsear JSON en búsqueda:', jsonError);
          console.log('Respuesta recibida:', responseText.substring(0, 200) + '...');
          throw new Error('Error al procesar la respuesta del servidor');
        }
      } catch (error) {
        console.error('Error al obtener datos de búsqueda:', error);
        throw error;
      }
      
      // Asegurarse de que los datos sean arrays
      const resultsArray = Array.isArray(data) ? data : [];
      
      console.log('Resultados encontrados:', resultsArray.length);
      
      // Función para calcular la distancia entre dos puntos geográficos (fórmula de Haversine)
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        // Validar que los parámetros sean números válidos
        if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
          console.warn('Coordenadas inválidas para cálculo de distancia:', { lat1, lon1, lat2, lon2 });
          return null;
        }
        
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c; // Distancia en km
        
        // Redondear a 2 decimales para mayor precisión
        return Math.round(distance * 100) / 100;
      };
      
      // Procesar los resultados para mostrarlos en formato Google Maps
      const processedPlaces = resultsArray.map(item => {
        // Determinar si el resultado es de Bucaramanga, Colombia o global
        let source = 'global';
        if (item.display_name && item.display_name.includes('Bucaramanga')) {
          source = 'bucaramanga';
        } else if (item.display_name && item.display_name.includes('Colombia')) {
          source = 'colombia';
        }
        
        // Extraer el nombre y la dirección
        let name = item.name || '';
        if (!name && item.namedetails) {
          name = item.namedetails.name || item.namedetails.official_name || '';
        }
        if (!name) {
          // Intentar extraer el nombre de otras propiedades
          const parts = item.display_name ? item.display_name.split(',') : [];
          name = parts.length > 0 ? parts[0].trim() : 'Lugar sin nombre';
        }
          
        // Extraer la dirección
        let address = '';
        if (item.address) {
          // Construir una dirección más legible
          const addressParts = [];
          if (item.address.road) addressParts.push(item.address.road);
          if (item.address.house_number) addressParts.push(item.address.house_number);
          if (item.address.suburb) addressParts.push(item.address.suburb);
          if (item.address.city || item.address.town || item.address.village) {
            addressParts.push(item.address.city || item.address.town || item.address.village);
          }
          address = addressParts.join(', ');
        } else {
          // Si no hay dirección estructurada, usar el display_name sin la primera parte (que suele ser el nombre)
          const parts = item.display_name ? item.display_name.split(',') : [];
          address = parts.length > 1 ? parts.slice(1).join(',').trim() : '';
        }
        
        // Calcular la distancia si tenemos la ubicación del usuario
        let distance = null;
        let distanceText = '';
        
        if (userLocation && item.lat && item.lon) {
          try {
            // Asegurarse de que las coordenadas sean números válidos
            const itemLat = parseFloat(item.lat);
            const itemLon = parseFloat(item.lon);
            
            if (!isNaN(itemLat) && !isNaN(itemLon)) {
              distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                itemLat,
                itemLon
              );
              
              // Formatear la distancia para mostrarla
              if (distance !== null) {
                if (distance < 1) {
                  distanceText = `${Math.round(distance * 1000)} m`;
                } else {
                  distanceText = `${distance.toFixed(1)} km`;
                }
              }
            } else {
              console.warn('Coordenadas inválidas para el lugar:', name);
            }
          } catch (error) {
            console.error('Error al calcular distancia para:', name, error);
          }
        } else {
          // Si no tenemos ubicación o coordenadas del lugar, asignar una distancia alta
          // para que aparezca al final en búsquedas cercanas
          if (isProximitySearch || text.includes('cerca')) {
            distance = 9999;
            distanceText = 'Desconocida';
          }
        }
        
        // Generar calificación simulada para la interfaz
        const rating = (4 + Math.random()).toFixed(1);
        const reviews = Math.floor(Math.random() * 500) + 50;
        const isOpen = Math.random() > 0.2; // 80% de probabilidad de estar abierto
        
        // Determinar el tipo de lugar basado en las etiquetas disponibles y el texto de búsqueda
        // para mostrar el icono correcto
        let placeType = 'place';
        let placeIcon = 'location';
        
        // Primero verificar el texto de búsqueda para categorizar lugares
        const searchLower = text.toLowerCase();
        if (searchLower.includes('restaurante') || searchLower.includes('comer')) {
          placeType = 'restaurant';
          placeIcon = 'restaurant';
        } else if (searchLower.includes('café')) {
          placeType = 'cafe';
          placeIcon = 'cafe';
        } else if (searchLower.includes('bar')) {
          placeType = 'bar';
          placeIcon = 'beer';
        } else if (searchLower.includes('hotel')) {
          placeType = 'hotel';
          placeIcon = 'bed';
        } else if (searchLower.includes('museo')) {
          placeType = 'museum';
          placeIcon = 'business';
        } else if (searchLower.includes('parque')) {
          placeType = 'park';
          placeIcon = 'leaf';
        } else if (searchLower.includes('tienda')) {
          placeType = 'shop';
          placeIcon = 'cart';
        } else if (searchLower.includes('cine') || searchLower.includes('teatro')) {
          placeType = 'entertainment';
          placeIcon = 'film';
        }
        
        // Luego verificar las etiquetas para mayor precisión
        if (item.extratags) {
          // Verificar si hay etiquetas específicas para determinar el tipo exacto
          if (item.extratags.amenity === 'restaurant' || 
              item.extratags.cuisine || 
              item.extratags.food) {
            placeType = 'restaurant';
            placeIcon = 'restaurant';
          } else if (item.extratags.amenity === 'cafe') {
            placeType = 'cafe';
            placeIcon = 'cafe';
          } else if (item.extratags.amenity === 'bar' || item.extratags.amenity === 'pub') {
            placeType = 'bar';
            placeIcon = 'beer';
          } else if (item.extratags.tourism === 'hotel') {
            placeType = 'hotel';
            placeIcon = 'bed';
          } else if (item.extratags.tourism === 'museum') {
            placeType = 'museum';
            placeIcon = 'business';
          } else if (item.extratags.leisure === 'park') {
            placeType = 'park';
            placeIcon = 'leaf';
          } else if (item.extratags.shop) {
            placeType = 'shop';
            placeIcon = 'cart';
          } else if (item.extratags.amenity === 'cinema' || item.extratags.amenity === 'theatre') {
            placeType = 'entertainment';
            placeIcon = 'film';
          }
        }
        
        // Si no se encontró una categoría específica, usar el tipo general
        if (placeType === 'place' && item.type) {
          if (item.type === 'amenity') {
            placeType = item.class || 'amenity';
          } else if (item.type === 'leisure' || item.type === 'tourism') {
            placeType = item.class || item.type;
          } else {
            placeType = item.type;
          }
        }
        
        // Verificar también el nombre del lugar para categorización adicional
        const nameLower = name.toLowerCase();
        if (placeType === 'place') {
          if (nameLower.includes('restaurante') || nameLower.includes('comida')) {
            placeType = 'restaurant';
            placeIcon = 'restaurant';
          } else if (nameLower.includes('café')) {
            placeType = 'cafe';
            placeIcon = 'cafe';
          } else if (nameLower.includes('bar') || nameLower.includes('pub')) {
            placeType = 'bar';
            placeIcon = 'beer';
          } else if (nameLower.includes('hotel') || nameLower.includes('hostal')) {
            placeType = 'hotel';
            placeIcon = 'bed';
          } else if (nameLower.includes('museo')) {
            placeType = 'museum';
            placeIcon = 'business';
          } else if (nameLower.includes('parque')) {
            placeType = 'park';
            placeIcon = 'leaf';
          } else if (nameLower.includes('tienda') || nameLower.includes('centro comercial')) {
            placeType = 'shop';
            placeIcon = 'cart';
          } else if (nameLower.includes('cine') || nameLower.includes('teatro')) {
            placeType = 'entertainment';
            placeIcon = 'film';
          }
        }
        
        return {
          id: item.place_id.toString(),
          name: name,
          address: address,
          fullAddress: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          distance: distance,
          distanceText: distanceText,
          source: source,
          type: item.type || 'unknown',
          placeType: placeType,
          placeIcon: placeIcon, // Icono específico para el tipo de lugar
          rating: rating,
          reviews: reviews,
          isOpen: isOpen,
          // Incluir identificadores de OpenStreetMap para obtener detalles
          osm_id: item.osm_id,
          osm_type: item.osm_type,
          // Incluir etiquetas adicionales si están disponibles
          tags: item.extratags || {}
        };
      });
      
      // Comprobar si es una búsqueda de lugares cercanos
      const isNearSearch = text.includes('cerca');
      
      console.log(`Ordenando ${processedPlaces.length} resultados. Búsqueda cercana: ${isNearSearch}`);
      
      // Ordenar los resultados según el tipo de búsqueda
      const sortedPlaces = processedPlaces.sort((a, b) => {
        // Para búsquedas de lugares cercanos, priorizar ESTRICTAMENTE por distancia
        if (isNearSearch) {
          // Si ambos tienen distancia calculada
          if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
          }
          
          // Si solo uno tiene distancia, ese va primero
          if (a.distance !== null && b.distance === null) return -1;
          if (a.distance === null && b.distance !== null) return 1;
          
          // Si ninguno tiene distancia, mantener el orden original
          return 0;
        }
        
        // Para búsquedas generales, priorizar distancia sobre región cuando hay ubicación
        if (userLocation) {
          // Si ambos tienen distancia, ordenar por distancia primero
          if (a.distance !== null && b.distance !== null) {
            // Si la diferencia de distancia es significativa (más de 5km), ordenar por distancia
            if (Math.abs(a.distance - b.distance) > 5) {
              return a.distance - b.distance;
            }
            
            // Si están a distancias similares, considerar la región
            if (a.source === 'bucaramanga' && b.source !== 'bucaramanga') return -1;
            if (a.source !== 'bucaramanga' && b.source === 'bucaramanga') return 1;
            
            // Si son de la misma región, volver a la distancia
            return a.distance - b.distance;
          }
          
          // Si solo uno tiene distancia, ese va primero
          if (a.distance !== null && b.distance === null) return -1;
          if (a.distance === null && b.distance !== null) return 1;
        } else {
          // Sin ubicación, priorizar por región
          if (a.source === 'bucaramanga' && b.source !== 'bucaramanga') return -1;
          if (a.source !== 'bucaramanga' && b.source === 'bucaramanga') return 1;
        }
        
        // Luego priorizar Colombia sobre global
        if (a.source === 'colombia' && b.source === 'global') return -1;
        if (a.source === 'global' && b.source === 'colombia') return 1;
        
        return 0;
      });
      
      // Reutilizamos la variable isShopSearch que ya fue declarada anteriormente
      
      // Aplicar filtrado según el tipo de búsqueda
      if (userLocation) {
        // Dividir los resultados en grupos por distancia
        const cercanos = [];
        const medios = [];
        const lejanos = [];
        
        // Para búsquedas de tiendas o cafés, usar un filtrado mucho menos restrictivo
        if (isShopSearch || isCafeSearch) {
          // Clasificar lugares por distancia con criterios más amplios para tiendas
          sortedPlaces.forEach(place => {
            // Incluir todos los lugares con distancia válida, sin importar cuán lejos estén
            if (place.distance !== null) {
              if (place.distance <= 2) {
                cercanos.push(place);
              } else if (place.distance <= 5) {
                medios.push(place);
              } else {
                lejanos.push(place);
              }
            } else {
              // Para lugares sin distancia, añadirlos al final
              lejanos.push(place);
            }
          });
        } else {
          // Para otras búsquedas, mantener un filtrado más estricto
          // Primero, filtrar todos los resultados para eliminar cualquier lugar sin distancia o mayor a 1km
          const lugaresValidos = sortedPlaces.filter(place => {
            return place.distance !== null && place.distance <= 1;
          });
          
          // Si no hay lugares cercanos, intentar buscar en un radio un poco mayor (hasta 1.5km)
          if (lugaresValidos.length < 3) {
            sortedPlaces.forEach(place => {
              if (place.distance !== null && place.distance <= 1.5 && !lugaresValidos.includes(place)) {
                lugaresValidos.push(place);
              }
            });
          }
          
          // Clasificar los lugares válidos por distancia
          lugaresValidos.forEach(place => {
            if (place.distance <= 0.3) {
              cercanos.unshift(place); // Añadir al principio para máxima prioridad
            } else if (place.distance <= 0.7) {
              cercanos.push(place);
            } else {
              medios.push(place);
            }
          });
        }
        
        // Esta sección se ha movido al bloque condicional anterior
        
        // Ordenar cada grupo por distancia exacta
        cercanos.sort((a, b) => a.distance - b.distance);
        medios.sort((a, b) => a.distance - b.distance);
        if (lejanos) {
          lejanos.sort((a, b) => {
            // Si ambos tienen distancia, ordenar por distancia
            if (a.distance !== null && b.distance !== null) {
              return a.distance - b.distance;
            }
            // Si solo uno tiene distancia, ese va primero
            if (a.distance !== null) return -1;
            if (b.distance !== null) return 1;
            // Si ninguno tiene distancia, mantener el orden original
            return 0;
          });
        }
        
        // Combinar los resultados según el tipo de búsqueda
        let combinedResults = [];
        let resultadosFinales;
        
        if (isShopSearch || isCafeSearch) {
          // Para tiendas y cafés, incluir también lugares lejanos para mostrar más resultados
          combinedResults = [...cercanos, ...medios, ...lejanos];
          // Limitar a un máximo de 30 resultados para tiendas y cafés
          resultadosFinales = combinedResults.slice(0, 30);
          setPredictions(resultadosFinales);
          
          if (isShopSearch) {
            console.log(`Mostrando ${resultadosFinales.length} tiendas (${cercanos.length} cercanas, ${medios.length} a media distancia, ${lejanos.length} lejanas)`);
          } else if (isCafeSearch) {
            console.log(`Mostrando ${resultadosFinales.length} cafés (${cercanos.length} cercanos, ${medios.length} a media distancia, ${lejanos.length} lejanos)`);
          }
        } else {
          // Para otras búsquedas, mantener el comportamiento original
          combinedResults = [...cercanos, ...medios];
          // Limitar a un máximo de 15 resultados para no sobrecargar la interfaz
          resultadosFinales = combinedResults.slice(0, 15);
          setPredictions(resultadosFinales);
          console.log(`Mostrando ${resultadosFinales.length} lugares cercanos (${cercanos.length} muy cercanos, ${medios.length} cercanos)`);
        }
        
        if (resultadosFinales.length > 0) {
          console.log('Primer resultado:', {
            nombre: resultadosFinales[0].name,
            distancia: resultadosFinales[0].distanceText
          });
        }
      } else {
        // Si no tenemos ubicación del usuario, usar resultados ordenados por relevancia
        const limitedResults = sortedPlaces.slice(0, 15);
        setPredictions(limitedResults);
      }
      
      // Si no hay resultados después de todo el procesamiento
      if (sortedPlaces.length === 0) {
        console.log('No se encontraron resultados en OpenStreetMap');
        setPredictions([]);
        setError(`No se encontraron resultados para "${text}"`);
      }
    } catch (err) {
      console.error('Error al buscar lugares:', err);
      // En caso de error, muestra un mensaje
      setPredictions([]);
      setError(`Error al buscar lugares. Intenta de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar un lugar
  const selectPlace = (place) => {
    // Preparar los detalles del lugar con la información que ya tenemos
    const enhancedPlaceDetails = {
      ...place,
      // Añadir campos adicionales para la vista detallada
      openingHours: 'No disponible', // No tenemos esta información
      phone: place.tags?.phone || place.tags?.contact_phone || 'No disponible',
      website: place.tags?.website || place.tags?.url || 'No disponible',
      description: place.tags?.description || `${place.name} en ${place.address}`,
      cuisine: place.tags?.cuisine || null,
      wheelchair: place.tags?.wheelchair || 'No especificado',
      images: place.tags?.image || null
    };
    
    // Guardar el lugar seleccionado
    setSelectedPlace(place);
    setPlaceDetails(enhancedPlaceDetails);
    
    // Mostrar la vista detallada
    setShowPlaceDetail(true);
    
    console.log('Mostrando detalles del lugar:', place.name);
  };
  
  // Función para cerrar la vista detallada
  const closePlaceDetail = () => {
    setShowPlaceDetail(false);
    setSelectedPlace(null);
    setPlaceDetails(null);
  };
  
  // Función para seleccionar finalmente el lugar (después de ver detalles)
  const confirmPlaceSelection = () => {
    if (selectedPlace) {
      onLocationSelect({
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        name: selectedPlace.name,
        address: selectedPlace.address
      });
      
      // Limpiar después de seleccionar
      setSearchText('');
      setPredictions([]);
      setShowPlaceDetail(false);
      setSelectedPlace(null);
      setPlaceDetails(null);
    }
  };

  // Función para seleccionar la ubicación actual
  const selectCurrentLocation = () => {
    if (userLocation) {
      onLocationSelect({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        name: 'Mi ubicación actual',
        address: 'Ubicación actual'
      });
      
      // Limpiar después de seleccionar
      setSearchText('');
      setPredictions([]);
    } else {
      // Si no tenemos la ubicación, intentar obtenerla
      refreshUserLocation();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#AAA" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar lugares..."
          placeholderTextColor="#AAA"
          value={searchText}
          onChangeText={searchPlaces}
        />
        {searchText.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              setSearchText('');
              setPredictions([]);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#AAA" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Modal para mostrar detalles del lugar */}
      {showPlaceDetail && placeDetails && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPlaceDetail}
          onRequestClose={closePlaceDetail}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={closePlaceDetail}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              
              <ScrollView style={styles.detailsScrollView}>
                {/* Encabezado con nombre e icono */}
                <View style={styles.detailsHeader}>
                  {/* Determinar el icono basado en el tipo de lugar */}
                  {(() => {
                    let iconName = placeDetails.placeIcon || 'location';
                    let iconColor = '#888888';
                    
                    // Asignar colores específicos según el tipo de lugar
                    if (placeDetails.placeType === 'restaurant' || placeDetails.tags?.amenity === 'restaurant') {
                      iconName = 'restaurant';
                      iconColor = '#FF5722';
                    } else if (placeDetails.placeType === 'cafe' || placeDetails.tags?.amenity === 'cafe') {
                      iconName = 'cafe';
                      iconColor = '#795548';
                    } else if (placeDetails.placeType === 'bar' || placeDetails.tags?.amenity === 'bar') {
                      iconName = 'beer';
                      iconColor = '#9C27B0';
                    } else if (placeDetails.placeType === 'hotel' || placeDetails.tags?.tourism === 'hotel') {
                      iconName = 'bed';
                      iconColor = '#2196F3';
                    } else if (placeDetails.placeType === 'museum' || placeDetails.tags?.tourism === 'museum') {
                      iconName = 'business';
                      iconColor = '#FFC107';
                    } else if (placeDetails.placeType === 'park' || placeDetails.tags?.leisure === 'park') {
                      iconName = 'leaf';
                      iconColor = '#4CAF50';
                    }
                    
                    return <Ionicons name={iconName} size={40} color={iconColor} style={styles.detailsIcon} />;
                  })()}
                  
                  <Text style={styles.detailsTitle}>{placeDetails.name}</Text>
                  
                  <View style={styles.detailsTypeContainer}>
                    <Text style={styles.detailsType}>
                      {placeDetails.placeType === 'restaurant' || placeDetails.tags?.amenity === 'restaurant' ? 'Restaurante' :
                       placeDetails.placeType === 'cafe' || placeDetails.tags?.amenity === 'cafe' ? 'Café' :
                       placeDetails.placeType === 'bar' || placeDetails.tags?.amenity === 'bar' ? 'Bar' :
                       placeDetails.placeType === 'hotel' || placeDetails.tags?.tourism === 'hotel' ? 'Hotel' :
                       placeDetails.placeType === 'museum' || placeDetails.tags?.tourism === 'museum' ? 'Museo' :
                       placeDetails.placeType === 'park' || placeDetails.tags?.leisure === 'park' ? 'Parque' :
                       placeDetails.type === 'amenity' ? 'Lugar de interés' :
                       placeDetails.type === 'building' ? 'Edificio' :
                       'Lugar'}
                    </Text>
                  </View>
                </View>
                
                {/* Información de distancia y estado */}
                <View style={styles.detailsInfoContainer}>
                  <View style={styles.detailsInfoItem}>
                    <Ionicons name="navigate" size={18} color="#FF3A5E" />
                    <Text style={styles.detailsInfoText}>{placeDetails.distanceText || 'Distancia no disponible'}</Text>
                  </View>
                  
                  {placeDetails.isOpen !== undefined && (
                    <View style={styles.detailsInfoItem}>
                      <Ionicons name="time" size={18} color={placeDetails.isOpen ? '#4CAF50' : '#FF5252'} />
                      <Text style={[styles.detailsInfoText, {color: placeDetails.isOpen ? '#4CAF50' : '#FF5252'}]}>
                        {placeDetails.isOpen ? 'Abierto ahora' : 'Cerrado'}
                      </Text>
                    </View>
                  )}
                  
                  {placeDetails.rating && (
                    <View style={styles.detailsInfoItem}>
                      <Ionicons name="star" size={18} color="#FFC107" />
                      <Text style={styles.detailsInfoText}>{placeDetails.rating} ({placeDetails.reviews || '0'} reseñas)</Text>
                    </View>
                  )}
                </View>
                
                {/* Dirección completa */}
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Dirección</Text>
                  <Text style={styles.detailsSectionText}>{placeDetails.address}</Text>
                </View>
                
                {/* Horarios de apertura si están disponibles */}
                {placeDetails.openingHours && placeDetails.openingHours !== 'No disponible' && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Horarios</Text>
                    <Text style={styles.detailsSectionText}>{placeDetails.openingHours}</Text>
                  </View>
                )}
                
                {/* Contacto si está disponible */}
                {placeDetails.phone && placeDetails.phone !== 'No disponible' && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Teléfono</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${placeDetails.phone}`)}>
                      <Text style={[styles.detailsSectionText, styles.detailsLink]}>{placeDetails.phone}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Sitio web si está disponible */}
                {placeDetails.website && placeDetails.website !== 'No disponible' && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Sitio web</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(placeDetails.website)}>
                      <Text style={[styles.detailsSectionText, styles.detailsLink]} numberOfLines={1}>
                        {placeDetails.website}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Descripción si está disponible */}
                {placeDetails.description && placeDetails.description !== 'Sin descripción disponible' && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Descripción</Text>
                    <Text style={styles.detailsSectionText}>{placeDetails.description}</Text>
                  </View>
                )}
                
                {/* Tipo de cocina para restaurantes */}
                {placeDetails.cuisine && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Tipo de cocina</Text>
                    <Text style={styles.detailsSectionText}>
                      {placeDetails.cuisine.split(';').map(c => c.trim()).join(', ')}
                    </Text>
                  </View>
                )}
                
                {/* Accesibilidad */}
                {placeDetails.wheelchair && placeDetails.wheelchair !== 'No especificado' && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Accesibilidad</Text>
                    <View style={styles.detailsInfoItem}>
                      <Ionicons 
                        name="accessibility" 
                        size={18} 
                        color={placeDetails.wheelchair === 'yes' ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={styles.detailsSectionText}>
                        {placeDetails.wheelchair === 'yes' ? 'Accesible para sillas de ruedas' : 
                         placeDetails.wheelchair === 'limited' ? 'Accesibilidad limitada' : 
                         'No accesible para sillas de ruedas'}
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
              
              {/* Botones de acción */}
              <View style={styles.detailsButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.detailsButton, styles.detailsButtonSecondary]}
                  onPress={closePlaceDetail}
                >
                  <Text style={styles.detailsButtonTextSecondary}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.detailsButton, styles.detailsButtonPrimary]}
                  onPress={confirmPlaceSelection}
                >
                  <Text style={styles.detailsButtonTextPrimary}>Seleccionar este lugar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF3A5E" />
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {searchText.length === 0 && (
        <View>
          {/* Botón para buscar lugares cercanos (solo visible cuando el usuario tiene ubicación) */}
          {userLocation ? (
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={() => {
                // No realizamos búsqueda automática, solo mostramos las categorías
                setShowCategories(true);
              }}
            >
              <Ionicons name="locate" size={20} color="#FF3A5E" style={{ marginRight: 8 }} />
              <Text style={styles.currentLocationText}>Buscar lugares cercanos</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getLocationOnly}
            >
              <Ionicons name="locate" size={20} color="#FF3A5E" style={{ marginRight: 8 }} />
              <Text style={styles.currentLocationText}>Obtener mi ubicación</Text>
            </TouchableOpacity>
          )}
          
          {/* Barra de categorías populares - solo visible cuando el usuario decide buscar */}
          {showCategories && (
            <View>
              <Text style={styles.categoriesTitle}>Selecciona una categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                <TouchableOpacity 
                  style={styles.categoryButton} 
                  onPress={() => {
                    const query = 'restaurantes cerca';
                    setSearchText(query);
                    searchPlaces(query);
                  }}
                >
                  <Ionicons name="restaurant-outline" size={24} color="#FF3A5E" />
                  <Text style={styles.categoryText}>Restaurantes</Text>
                </TouchableOpacity>
            
                <TouchableOpacity 
                  style={styles.categoryButton} 
                  onPress={() => {
                    const query = 'hoteles cerca';
                    setSearchText(query);
                    searchPlaces(query);
                  }}
                >
                  <Ionicons name="bed-outline" size={24} color="#4285F4" />
                  <Text style={styles.categoryText}>Hoteles</Text>
                </TouchableOpacity>
            
                <TouchableOpacity 
                  style={styles.categoryButton} 
                  onPress={() => {
                    const query = 'cafés cerca';
                    setSearchText(query);
                    searchPlaces(query);
                  }}
                >
                  <Ionicons name="cafe-outline" size={24} color="#8D6E63" />
                  <Text style={styles.categoryText}>Cafés</Text>
                </TouchableOpacity>
            
                <TouchableOpacity 
                  style={styles.categoryButton} 
                  onPress={() => {
                    const query = 'museos cerca';
                    setSearchText(query);
                    searchPlaces(query);
                  }}
                >
                  <Ionicons name="business-outline" size={24} color="#FFC107" />
                  <Text style={styles.categoryText}>Museos</Text>
                </TouchableOpacity>
            
                <TouchableOpacity 
                  style={styles.categoryButton} 
                  onPress={() => {
                    const query = 'parques cerca';
                    setSearchText(query);
                    searchPlaces(query);
                  }}
                >
                  <Ionicons name="leaf-outline" size={24} color="#4CAF50" />
                  <Text style={styles.categoryText}>Parques</Text>
                </TouchableOpacity>
            

            
            <TouchableOpacity 
              style={styles.categoryButton} 
              onPress={() => {
                // Usar términos simples que funcionan mejor con Nominatim
                const query = 'museo cerca';
                setSearchText('espacios culturales cerca');
                // Forzar una búsqueda directa sin debounce para espacios culturales
                clearTimeout(searchTimeout);
                performSearch(query);
              }}
            >
              <Ionicons name="brush-outline" size={24} color="#FF9800" />
              <Text style={styles.categoryText}>Culturales</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => {
                const query = 'tiendas cerca';
                setSearchText(query);
                searchPlaces(query);
              }}
            >
              <Ionicons name="cart-outline" size={24} color="#E91E63" />
              <Text style={styles.categoryText}>Tiendas</Text>
            </TouchableOpacity>
          </ScrollView>
            </View>
          )}
        </View>
      )}
      
      {predictions.length > 0 && (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.id.toString()}
          style={styles.predictionsList}
          renderItem={({ item }) => {
            // Determinar el ícono basado en el tipo de lugar y las etiquetas de OpenStreetMap
            // Usar el icono específico asignado durante el procesamiento
            let iconName = item.placeIcon || 'location';
            let iconColor = '#888888'; // Color por defecto para resultados globales
            
            // Asignar color según la fuente del resultado y tipo de lugar
            if (item.source === 'bucaramanga') {
              iconColor = '#FF3A5E';
            } else if (item.source === 'colombia') {
              iconColor = '#4285F4';
            }
            
            // Asignar colores específicos según el tipo de lugar
            if (item.placeType === 'restaurant' || item.tags?.amenity === 'restaurant') {
              iconName = 'restaurant';
              iconColor = '#FF5722'; // Naranja para restaurantes (como en OpenStreetMap)
            } else if (item.placeType === 'cafe' || item.tags?.amenity === 'cafe') {
              iconName = 'cafe';
              iconColor = '#795548'; // Marrón para cafés
            } else if (item.placeType === 'bar' || item.tags?.amenity === 'bar' || item.tags?.amenity === 'pub') {
              iconName = 'beer';
              iconColor = '#9C27B0'; // Púrpura para bares
            } else if (item.placeType === 'hotel' || item.tags?.tourism === 'hotel') {
              iconName = 'bed';
              iconColor = '#2196F3'; // Azul para hoteles
            } else if (item.placeType === 'museum' || item.tags?.tourism === 'museum') {
              iconName = 'business';
              iconColor = '#FFC107'; // Amarillo para museos
            } else if (item.placeType === 'park' || item.tags?.leisure === 'park') {
              iconName = 'leaf';
              iconColor = '#4CAF50'; // Verde para parques
            } else if (item.tags?.shop) {
              iconName = 'cart';
              iconColor = '#E91E63'; // Rosa para tiendas
            } else if (item.tags?.amenity === 'theatre' || item.tags?.amenity === 'cinema') {
              iconName = 'film';
              iconColor = '#FF9800'; // Naranja para teatros y cines
            } else if (item.tags?.amenity === 'library' || item.tags?.amenity === 'arts_centre') {
              iconName = 'book';
              iconColor = '#607D8B'; // Gris azulado para bibliotecas y centros de arte
            }
            
            // Verificar también en el nombre para casos no clasificados
            const lowerName = item.name.toLowerCase();
            if (iconName === 'location') {
              if (lowerName.includes('restaurante')) {
                iconName = 'restaurant';
                iconColor = '#FF5722';
              } else if (lowerName.includes('café')) {
                iconName = 'cafe';
                iconColor = '#795548';
              } else if (lowerName.includes('hotel')) {
                iconName = 'bed';
                iconColor = '#2196F3';
              } else if (lowerName.includes('museo')) {
                iconName = 'business';
                iconColor = '#FFC107';
              } else if (lowerName.includes('parque')) {
                iconName = 'leaf';
                iconColor = '#4CAF50';
              } else if (lowerName.includes('tienda')) {
                iconName = 'cart';
                iconColor = '#E91E63';
              } else if (lowerName.includes('teatro') || lowerName.includes('cine')) {
                iconName = 'film';
                iconColor = '#FF9800';
              } else if (lowerName.includes('cultural')) {
                iconName = 'brush';
                iconColor = '#FF9800';
              }
            }
            
            return (
              <TouchableOpacity
                style={styles.predictionItem}
                onPress={() => selectPlace(item)}
              >
                <View style={styles.resultCardContent}>
                  <Ionicons name={iconName} size={22} color={iconColor} style={styles.resultIcon} />
                  
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultTitle}>{item.name}</Text>
                    
                    <View style={styles.resultRatingContainer}>
                      <Ionicons name="star" size={14} color="#FFC107" />
                      <Text style={styles.resultRating}>{item.rating}</Text>
                      <Text style={styles.resultReviews}>({item.reviews})</Text>
                      <Text style={styles.resultType}>{item.placeType === 'restaurant' || item.name.toLowerCase().includes('restaurante') ? 'Restaurante' :
                                                      item.placeType === 'cafe' || item.name.toLowerCase().includes('café') ? 'Café' :
                                                      item.placeType === 'hotel' || item.name.toLowerCase().includes('hotel') ? 'Hotel' :
                                                      item.placeType === 'museum' || item.name.toLowerCase().includes('museo') ? 'Museo' :
                                                      item.placeType === 'park' || item.name.toLowerCase().includes('parque') ? 'Parque' :
                                                      item.placeType === 'shop' || item.name.toLowerCase().includes('tienda') ? 'Tienda' :
                                                      item.placeType === 'entertainment' || item.name.toLowerCase().includes('teatro') || item.name.toLowerCase().includes('cine') ? 'Teatro/Cine' :
                                                      (item.placeType === 'cultural' || item.name.toLowerCase().includes('cultural') || item.source === 'bucaramanga') && searchText.toLowerCase().includes('cultural') ? 'Espacio cultural' :
                                                      item.placeType === 'amenity' ? 'Lugar de interés' :
                                                      item.placeType === 'building' ? 'Edificio' : 'Lugar'}</Text>
                    </View>
                    
                    <View style={styles.resultDetailsContainer}>
                      {item.isOpen ? (
                        <Text style={styles.resultStatus}>Abierto ahora</Text>
                      ) : (
                        <Text style={[styles.resultStatus, {color: '#FF5252'}]}>Cerrado</Text>
                      )}
                      <Text style={styles.resultDot}>•</Text>
                      <Text style={styles.resultDistance}>{item.distanceText}</Text>
                    </View>
                    
                    <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 45,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 5,
    marginTop: 5,
  },
  errorText: {
    color: '#FF3A5E',
    fontSize: 14,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  currentLocationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingBottom: 12,
  },
  categoryButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 80,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  predictionsList: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 400,
  },
  predictionItem: {
    padding: 15,
    backgroundColor: '#2A2A2A',
    marginBottom: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  resultCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultIcon: {
    marginRight: 12,
    marginTop: 2,
    width: 24,
    textAlign: 'center',
  },
  resultTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  resultRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  resultRating: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  resultReviews: {
    color: '#CCCCCC',
    fontSize: 14,
    marginLeft: 4,
  },
  resultType: {
    color: '#FF3A5E',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  resultDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  resultStatus: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultDot: {
    color: '#CCCCCC',
    fontSize: 14,
    marginHorizontal: 6,
  },
  resultDistance: {
    color: '#FF3A5E',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  resultAddress: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  
  // Estilos para la vista detallada
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '90%',
    minHeight: '50%',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 10,
    padding: 5,
  },
  detailsScrollView: {
    marginTop: 10,
    marginBottom: 20,
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  detailsIcon: {
    marginBottom: 10,
  },
  detailsTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  detailsTypeContainer: {
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  detailsType: {
    color: '#FF3A5E',
    fontSize: 14,
    fontWeight: '500',
  },
  detailsInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  detailsInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 5,
  },
  detailsInfoText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 5,
  },
  detailsSection: {
    marginBottom: 20,
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 10,
  },
  detailsSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsSectionText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  detailsLink: {
    color: '#4285F4',
    textDecorationLine: 'underline',
  },
  detailsButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  detailsButtonPrimary: {
    backgroundColor: '#FF3A5E',
  },
  detailsButtonSecondary: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
  },
  detailsButtonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsButtonTextSecondary: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default OpenStreetMapSearch;
