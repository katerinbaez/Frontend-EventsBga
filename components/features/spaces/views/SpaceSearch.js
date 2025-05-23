import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, TextInput, Modal, Image, ScrollView, Linking, Platform, Alert, Dimensions } from 'react-native';
import OpenStreetMapSearch from '../../geolocation/views/OpenStreetMapSearch';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import EventRequestForm from '../../requests/views/EventRequestForm';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { styles } from '../../../../styles/SpaceSearchStyles';

const SpaceSearch = ({ onClose }) => {
  const mapRef = useRef(null);
  // Estados para manejar los espacios culturales y la búsqueda
  const [spaces, setSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [nearbySpaces, setNearbySpaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [requestFormVisible, setRequestFormVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Función para manejar la selección de ubicación desde OpenStreetMapSearch
  const handleLocationSelect = (location) => {
    // Verificar que la ubicación tenga las propiedades necesarias
    if (!location || !location.latitude || !location.longitude) {
      return;
    }
    
    // Guardar la ubicación seleccionada
    setSelectedPlace(location);
    
    // Centrar el mapa en la ubicación seleccionada
    if (mapRef.current && location) {
      const region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [fullScreenMap, setFullScreenMap] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 7.119349, // Coordenadas por defecto (Bucaramanga)
    longitude: -73.1227416,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadSpaces();
    // Ya no solicitamos permisos de ubicación automáticamente
    // Solo solicitaremos cuando el usuario presione el botón de ubicación
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSpaces(spaces);
    } else {
      const filtered = spaces.filter(space => 
        (space.nombreEspacio && space.nombreEspacio.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (space.direccion && space.direccion.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (space.descripcion && space.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredSpaces(filtered);
    }
  }, [searchQuery, spaces]);



  // Obtener la ubicación actual del usuario
  const getUserLocation = async () => {
    try {
      // Primero solicitamos permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos permisos de ubicación para mostrarte los espacios culturales cercanos.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Activar el modo de pantalla completa para el mapa solo si el usuario lo solicitó explícitamente
      setFullScreenMap(true);
      
      // Verificar si los servicios de ubicación están habilitados
      const providerStatus = await Location.getProviderStatusAsync();
      if (!providerStatus.locationServicesEnabled) {
        console.warn('Los servicios de ubicación están desactivados');
        // No mostrar alerta, solo registrar en consola
        return;
      }
      
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 15000 // Timeout de 15 segundos
        });
        
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        
        // Actualizar la región del mapa
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        
        // Buscar espacios cercanos
        findNearbySpaces(latitude, longitude);
      } catch (locationError) {
        // Intentar con menor precisión si falla el primer intento
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
            timeout: 10000 // Menor timeout para el segundo intento
          });
          
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });
          
          // Actualizar la región del mapa
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          
          // Buscar espacios cercanos
          findNearbySpaces(latitude, longitude);
        } catch (secondError) {
          // Solo registrar en consola, no mostrar alerta
          console.warn('Error al obtener la ubicación con precisión baja:', secondError);
          // Si hay error, desactivar el modo de pantalla completa
          setFullScreenMap(false);
        }
      }
    } catch (error) {
      // Solo registrar en consola, no mostrar alerta
      console.warn('Error al solicitar permisos de ubicación:', error);
      // Si hay error, desactivar el modo de pantalla completa
      setFullScreenMap(false);
    }
  };
  
  // Función para volver a la vista de lista
  const returnToList = () => {
    setFullScreenMap(false);
  };

  // Calcular distancia entre dos puntos (fórmula de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distancia en km
    return d;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  // Encontrar espacios cercanos a la ubicación del usuario
  const findNearbySpaces = (latitude, longitude) => {
    if (!spaces || spaces.length === 0) return;
    
    // Filtrar espacios que tienen coordenadas válidas
    const spacesWithCoordinates = spaces.filter(space => {
      return space.latitud && space.longitud && 
             !isNaN(parseFloat(space.latitud)) && 
             !isNaN(parseFloat(space.longitud));
    });
    
    // Calcular distancia para cada espacio
    const spacesWithDistance = spacesWithCoordinates.map(space => {
      const lat = parseFloat(space.latitud);
      const lng = parseFloat(space.longitud);
      const distance = calculateDistance(latitude, longitude, lat, lng);
      return { ...space, distance };
    });
    
    // Ordenar por distancia y tomar los más cercanos
    const closest = spacesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Tomar los 10 más cercanos
    
    setNearbySpaces(closest);
    
    // Si estamos en modo de búsqueda por cercanía, actualizar los espacios filtrados
    if (searchQuery === '' && userLocation) {
      setFilteredSpaces(closest);
    }
  };

  // Función para mostrar espacios cercanos
  const showNearbySpaces = () => {
    if (userLocation) {
      // Si ya tenemos la ubicación, mostrar espacios cercanos
      findNearbySpaces(userLocation.latitude, userLocation.longitude);
      setMapModalVisible(true);
    } else {
      // Si no tenemos la ubicación, intentar obtenerla
      getUserLocation();
    }
  };

  const loadSpaces = async () => {
    try {
      setLoading(true);
      // Primero, obtener todos los espacios culturales registrados desde el perfil del gestor
      const response = await axios.get(`${BACKEND_URL}/api/managers/managers`);
      
      if (response.data.success) {
        // Crear un array para almacenar los espacios con datos completos
        let spacesWithFullData = [];
        
        // Para cada espacio, obtener sus datos completos
        for (const space of response.data.managers) {
          try {
            // Obtener los datos básicos del perfil del gestor
            const managerId = space.userId || space.id;
            if (managerId) {
              // 1. Obtener datos del perfil del gestor
              const detailsResponse = await axios.get(`${BACKEND_URL}/api/managers/profile/${managerId}`);
              
              let fullSpaceData = {};
              
              if (detailsResponse.data.success && detailsResponse.data.manager) {
                // Datos básicos del perfil del gestor
                fullSpaceData = {
                  ...space,
                  ...detailsResponse.data.manager,
                  // Preservar explícitamente los horarios y descripción
                  horarios: detailsResponse.data.manager.horarios || space.horarios,
                  descripcion: detailsResponse.data.manager.descripcion || space.descripcion
                };
                
                // 2. Intentar obtener datos adicionales del modelo CulturalSpace usando las rutas correctas
                try {
                  // Usar la ruta correcta para obtener datos del espacio cultural por ID de manager
                  const culturalSpaceResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/space/manager/${managerId}`);
                  
                  if (culturalSpaceResponse.data.success && culturalSpaceResponse.data.space) {
                    const spaceData = culturalSpaceResponse.data.space;
                    
                    // Combinar datos, priorizando los que vienen del modelo CulturalSpace
                    fullSpaceData = {
                      ...fullSpaceData,
                      // Datos que queremos obtener del modelo CulturalSpace si existen
                      images: spaceData.images || fullSpaceData.images || [],
                      imagenes: spaceData.images || fullSpaceData.imagenes || [],
                      instalaciones: spaceData.instalaciones || fullSpaceData.instalaciones || [],
                      redesSociales: spaceData.redesSociales || fullSpaceData.redesSociales || {
                        facebook: '',
                        instagram: '',
                        twitter: ''
                      },
                      // Preservar los datos básicos del perfil del gestor
                      nombreEspacio: fullSpaceData.nombreEspacio || spaceData.nombre || 'Espacio Cultural',
                      direccion: fullSpaceData.direccion || spaceData.direccion || '',
                      capacidad: fullSpaceData.capacidad || spaceData.capacidad || '',
                      contacto: fullSpaceData.contacto || spaceData.contacto || {
                        email: fullSpaceData.email || '',
                        telefono: fullSpaceData.telefono || ''
                      },
                      // Mantener los horarios y descripción ya procesados
                      horarios: fullSpaceData.horarios,
                      descripcion: fullSpaceData.descripcion || spaceData.descripcion || '',
                      // Capturar coordenadas para geolocalización
                      latitud: spaceData.latitud || fullSpaceData.latitud || null,
                      longitud: spaceData.longitud || fullSpaceData.longitud || null
                    };
                  }
                } catch (culturalSpaceError) {
                  
                  // Si falla, intentar con la ruta alternativa para obtener espacios culturales
                  try {
                    const spacesResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/manager/${managerId}`);
                    
                    if (spacesResponse.data.success && spacesResponse.data.spaces && spacesResponse.data.spaces.length > 0) {
                      // Tomar el primer espacio cultural asociado al gestor
                      const matchingSpace = spacesResponse.data.spaces[0];
                      
                      // Combinar datos
                      fullSpaceData = {
                        ...fullSpaceData,
                        images: matchingSpace.images || fullSpaceData.images || [],
                        imagenes: matchingSpace.images || fullSpaceData.imagenes || [],
                        instalaciones: matchingSpace.instalaciones || fullSpaceData.instalaciones || [],
                        redesSociales: matchingSpace.redesSociales || fullSpaceData.redesSociales || {
                          facebook: '',
                          instagram: '',
                          twitter: ''
                        },
                        // Mantener los datos básicos del perfil del gestor
                        nombreEspacio: fullSpaceData.nombreEspacio || matchingSpace.nombre || 'Espacio Cultural',
                        descripcion: fullSpaceData.descripcion || matchingSpace.descripcion || '',
                        // Capturar coordenadas para geolocalización
                        latitud: matchingSpace.latitud || fullSpaceData.latitud || null,
                        longitud: matchingSpace.longitud || fullSpaceData.longitud || null
                      };
                    }
                  } catch (allSpacesError) {
                  }
                }
                
                // Formatear los horarios para asegurar consistencia
                let horariosFormateados = {
                  lunes: '',
                  martes: '',
                  miercoles: '',
                  jueves: '',
                  viernes: '',
                  sabado: '',
                  domingo: ''
                };
                
                // Si horarios es un array de objetos con la estructura { dayOfWeek, isOpen, timeSlots }
                if (Array.isArray(fullSpaceData.horarios)) {
                  fullSpaceData.horarios.forEach(dia => {
                    // Convertir el formato de array a objeto con días como claves
                    if (dia && dia.dayOfWeek && dia.timeSlots && Array.isArray(dia.timeSlots)) {
                      let nombreDia = dia.dayOfWeek.toLowerCase();
                      
                      // Normalizar nombres de días (quitar acentos y estandarizar)
                      if (nombreDia.includes('miércoles') || nombreDia.includes('miercoles')) {
                        nombreDia = 'miercoles';
                      } else if (nombreDia.includes('sábado') || nombreDia.includes('sabado')) {
                        nombreDia = 'sabado';
                      }
                      
                      // Convertir timeSlots a string (ej: "09:00-18:00")
                      const horasString = dia.timeSlots.map(slot => 
                        `${slot.start}-${slot.end}`
                      ).join(', ');
                      
                      horariosFormateados[nombreDia] = dia.isOpen ? horasString : 'Cerrado';
                    }
                  });
                } else if (typeof fullSpaceData.horarios === 'object' && !Array.isArray(fullSpaceData.horarios)) {
                  // Si ya es un objeto, asegurarse de que tenga todos los días
                  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
                  dias.forEach(dia => {
                    horariosFormateados[dia] = fullSpaceData.horarios[dia] || '';
                  });
                }
                
                // Agregar el espacio con datos completos al array
                spacesWithFullData.push({
                  ...fullSpaceData,
                  horarios: horariosFormateados
                });
              } else {
                // Si no se pudieron obtener los detalles, usar los datos básicos
                spacesWithFullData.push(space);
              }
            } else {
              // Si no hay ID de manager, usar los datos básicos
              spacesWithFullData.push(space);
            }
          } catch (detailsError) {
            console.error('Error al obtener detalles del espacio:', detailsError);
            // Si hay error, usar los datos básicos
            spacesWithFullData.push(space);
          }
        }
        

        setSpaces(spacesWithFullData || []);
        setFilteredSpaces(spacesWithFullData || []);
      } else {
        setSpaces([]);
        setFilteredSpaces([]);
      }
    } catch (error) {
      console.error('Error al cargar espacios:', error);
      setSpaces([]);
      setFilteredSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpacePress = (space) => {
    // Procesar las imágenes para asegurarnos de que se muestren correctamente
    let processedSpace = {...space};
    
    // Procesar imágenes desde 'images'
    if (processedSpace.images) {
      if (typeof processedSpace.images === 'string') {
        processedSpace.images = [processedSpace.images];
      } else if (!Array.isArray(processedSpace.images)) {
        processedSpace.images = [];
      }
      
      // Filtrar imágenes vacías o inválidas
      processedSpace.images = processedSpace.images.filter(img => img && img.trim() !== '');
    } else {
      processedSpace.images = [];
    }
    
    // Procesar imágenes alternativas desde 'imagenes'
    if (processedSpace.imagenes) {
      if (typeof processedSpace.imagenes === 'string') {
        processedSpace.imagenes = [processedSpace.imagenes];
      } else if (!Array.isArray(processedSpace.imagenes)) {
        processedSpace.imagenes = [];
      }
      
      // Filtrar imágenes vacías o inválidas
      processedSpace.imagenes = processedSpace.imagenes.filter(img => img && img.trim() !== '');
    } else {
      processedSpace.imagenes = [];
    }
    
    // Verificar si hay rutas de archivo locales y procesarlas
    processedSpace.images = processedSpace.images.map(img => {
      // Si la ruta es relativa y no comienza con http o file://, construir la ruta completa
      if (img && !img.startsWith('http') && !img.startsWith('file://')) {
        // Eliminar la barra inicial si existe para evitar doble barra
        const cleanPath = img.startsWith('/') ? img.substring(1) : img;
        return `${BACKEND_URL}/${cleanPath}`;
      }
      return img;
    });
    
    processedSpace.imagenes = processedSpace.imagenes.map(img => {
      // Si la ruta es relativa y no comienza con http o file://, construir la ruta completa
      if (img && !img.startsWith('http') && !img.startsWith('file://')) {
        // Eliminar la barra inicial si existe para evitar doble barra
        const cleanPath = img.startsWith('/') ? img.substring(1) : img;
        return `${BACKEND_URL}/${cleanPath}`;
      }
      return img;
    });
    

    
    setSelectedSpace(processedSpace);
    setModalVisible(true);
  };

  const renderSpaceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.spaceItem}
      onPress={() => handleSpacePress(item)}
    >
      <View style={styles.spaceContent}>
        <Text style={styles.spaceName}>{item.nombreEspacio || 'Espacio sin nombre'}</Text>
        <Text style={styles.spaceAddress}>{item.direccion || 'Dirección no disponible'}</Text>
        <Text style={styles.spaceCapacity}>Capacidad: {item.capacidad || 'No especificada'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#FF3A5E" />
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={50} color="#DDD" />
      <Text style={styles.emptyText}>No se encontraron espacios</Text>
      <Text style={styles.emptySubText}>Intenta con otra búsqueda</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {fullScreenMap ? (
        // Vista de mapa en pantalla completa
        <View style={styles.fullScreenContainer}>
          {/* Header para pantalla completa */}
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity onPress={returnToList} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FF3A5E" />
              <Text style={styles.backButtonText}>Volver a la lista</Text>
            </TouchableOpacity>
            <Text style={styles.fullScreenTitle}>Mi Ubicación</Text>
          </View>
          
          {/* Campo de búsqueda en pantalla completa con OpenStreetMap (sin API key) */}
          <View style={styles.fullScreenSearchContainer}>
            <OpenStreetMapSearch onLocationSelect={handleLocationSelect} />
          </View>
          
          {/* Mapa en pantalla completa usando react-native-maps */}
          <View style={styles.fullScreenMapContainer}>
                {Platform.OS === 'web' ? (
                  <View style={styles.webMapContainer}>
                    <Text style={styles.webMapMessage}>
                      <Ionicons name="map-outline" size={24} color="#FF3A5E" /> 
                      Usa el buscador de OpenStreetMap para encontrar ubicaciones
                    </Text>
                  </View>
            ) : (
              <MapView
                ref={mapRef}
                style={styles.fullScreenMap}

                initialRegion={{
                  latitude: userLocation?.latitude || 7.119349,
                  longitude: userLocation?.longitude || -73.1227416,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
                showsTraffic={false}
                showsBuildings={true}
                showsIndoors={true}
                loadingEnabled={true}
                loadingIndicatorColor="#FF3A5E"
                loadingBackgroundColor="#1E1E1E"
              >
                {/* Marcador para la ubicación del usuario */}
                {userLocation && (
                  <Marker
                    coordinate={{
                      latitude: userLocation.latitude,
                      longitude: userLocation.longitude
                    }}
                    title="Mi ubicación"
                    description="Estás aquí"
                    pinColor="#FF3A5E"
                  />
                )}
                
                {/* Marcadores para espacios culturales - mostrar filtrados si hay búsqueda, sino mostrar cercanos */}
                {(searchQuery.trim() !== '' ? filteredSpaces : nearbySpaces).map((space, index) => {
                  // Convertir coordenadas a números
                  const lat = parseFloat(space.latitud);
                  const lng = parseFloat(space.longitud);
                  
                  if (isNaN(lat) || isNaN(lng)) return null;
                  
                  return (
                    <Marker
                      key={`marker-${index}`}
                      coordinate={{
                        latitude: lat,
                        longitude: lng
                      }}
                      title={space.nombreEspacio || 'Espacio Cultural'}
                      description={space.direccion || 'Sin dirección'}
                      pinColor="#4285F4"
                    >
                      <Callout onPress={() => {
                        setSelectedSpace(space);
                        setModalVisible(true);
                      }}>
                        <View style={styles.calloutContainer}>
                          <Text style={styles.calloutTitle}>{space.nombreEspacio || 'Espacio Cultural'}</Text>
                          <Text style={styles.calloutSubtitle}>{space.direccion || 'Sin dirección'}</Text>
                          <Text style={styles.calloutAction}>Toca para ver detalles</Text>
                        </View>
                      </Callout>
                    </Marker>
                  );
                })}
                {/* Marcador para la ubicación seleccionada con OpenStreetMap */}
{selectedPlace && (
  <Marker
    key="selected-place"
    coordinate={{
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude
    }}
    title={selectedPlace.name || 'Ubicación seleccionada'}
    description={selectedPlace.address || ''}
    pinColor="#FF3A5E"
  >
    <Callout>
      <View style={styles.calloutContainer}>
        <Text style={styles.calloutTitle}>{selectedPlace.name || 'Ubicación seleccionada'}</Text>
        <Text style={styles.calloutSubtitle}>{selectedPlace.address || ''}</Text>
      </View>
    </Callout>
  </Marker>
)}
              </MapView>
            )}
          </View>
        </View>
      ) : (
        // Vista normal con lista y mapa
        <>
          <View style={styles.header}>
            <View style={{position: 'absolute', left: 15, top: 20, zIndex: 10, backgroundColor: 'transparent'}}>
              <TouchableOpacity onPress={onClose} style={{padding: 5, backgroundColor: 'transparent'}}>
                <Ionicons name="close-outline" size={30} color="#FF3A5E" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.title, {width: '100%', textAlign: 'center', fontSize: 15,}]}>Buscar Espacios Culturales</Text>
            <View style={{position: 'absolute', right: 15, top: 15, zIndex: 10, backgroundColor: 'transparent'}}>
              <TouchableOpacity onPress={getUserLocation} style={{padding: 5, backgroundColor: 'transparent'}}>
                <Ionicons name="locate-outline" size={28} color="#FF3A5E" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón grande para acceder al mapa */}
          <TouchableOpacity 
            style={styles.mapAccessButton}
            onPress={getUserLocation}
          >
            <Ionicons name="map-outline" size={28} color="#FFFFFF" />
            <Text style={styles.mapAccessButtonText}>Explorar Mapa</Text>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#AAA" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, dirección o descripción"
              placeholderTextColor="#AAA"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF3A5E" />
              <Text style={styles.loadingText}>Cargando espacios culturales...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSpaces}
              keyExtractor={(item) => item.id?.toString() || item.userId?.toString() || Math.random().toString()}
              renderItem={renderSpaceItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyList}
            />
          )}
        </>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-outline" size={24} color="#FF3A5E" />
            </TouchableOpacity>

            {selectedSpace && (
              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Imagen o placeholder con fondo de color */}
                <View style={styles.spacePlaceholder}>
                  <View style={styles.imageContainer}>
                    {(selectedSpace.images?.length > 0 || selectedSpace.imagenes?.length > 0) ? (
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageScrollView}
                        contentContainerStyle={styles.imageScrollContent}
                      >
                        {/* Primero intentar con images */}
                        {selectedSpace.images?.map((imagePath, index) => {
                          console.log(`Intentando cargar imagen ${index} desde images:`, imagePath);
                          // Determinar si es una ruta local o una URL
                          const isLocalPath = imagePath && (
                            imagePath.startsWith('file://') || 
                            imagePath.startsWith('/') || 
                            (Platform.OS === 'win32' && /^[a-zA-Z]:\\/.test(imagePath))
                          );
                          
                          // Formatear la ruta según sea necesario
                          let imageSource;
                          if (isLocalPath) {
                            // Para rutas locales, usar require o uri según el formato
                            imageSource = { uri: imagePath };
                            console.log('Usando ruta local:', imageSource);
                          } else if (imagePath && imagePath.startsWith('http')) {
                            // Para URLs remotas
                            imageSource = { uri: imagePath };
                            console.log('Usando URL remota:', imageSource);
                          } else if (imagePath) {
                            // Para otras rutas, intentar construir una URL completa
                            imageSource = { uri: imagePath };
                            console.log('Usando ruta construida:', imageSource);
                          }
                          
                          return imageSource ? (
                            <View key={`image-${index}`} style={styles.imageItem}>
                              <Image
                                source={imageSource}
                                style={styles.spaceImage}
                                onError={(e) => {
                                  console.log('Error al cargar imagen:', e.nativeEvent.error);
                                }}
                                defaultSource={{ uri: 'https://picsum.photos/200/300' }}
                              />
                            </View>
                          ) : null;
                        })}
                        
                        {/* Luego intentar con imagenes si no hay images o si images está vacío */}
                        {selectedSpace.imagenes?.map((imagePath, index) => {
                          // Solo mostrar imagenes si no hay images válidas
                          if (selectedSpace.images?.length > 0) return null;
                          
                          console.log(`Intentando cargar imagen ${index} desde imagenes:`, imagePath);
                          // Determinar si es una ruta local o una URL
                          const isLocalPath = imagePath && (
                            imagePath.startsWith('file://') || 
                            imagePath.startsWith('/') || 
                            (Platform.OS === 'win32' && /^[a-zA-Z]:\\/.test(imagePath))
                          );
                          
                          // Formatear la ruta según sea necesario
                          let imageSource;
                          if (isLocalPath) {
                            // Para rutas locales, usar require o uri según el formato
                            imageSource = { uri: imagePath };
                            console.log('Usando ruta local:', imageSource);
                          } else if (imagePath && imagePath.startsWith('http')) {
                            // Para URLs remotas
                            imageSource = { uri: imagePath };
                            console.log('Usando URL remota:', imageSource);
                          } else if (imagePath) {
                            // Para otras rutas, intentar construir una URL completa
                            imageSource = { uri: imagePath };
                            console.log('Usando ruta construida:', imageSource);
                          }
                          
                          return imageSource ? (
                            <View key={`imagen-${index}`} style={styles.imageItem}>
                              <Image
                                source={imageSource}
                                style={styles.spaceImage}
                                onError={(e) => {
                                  console.log('Error al cargar imagen:', e.nativeEvent.error);
                                }}
                                defaultSource={{ uri: 'https://picsum.photos/200/300' }}
                              />
                            </View>
                          ) : null;
                        })}
                      </ScrollView>
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <Ionicons name="business-outline" size={50} color="#FFFFFF" />
                        <Text style={styles.placeholderText}>
                          {selectedSpace.nombreEspacio || 'Espacio Cultural'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                

                
                {/* Nombre y dirección */}
                <Text style={styles.modalSpaceName}>{selectedSpace.nombreEspacio || 'Espacio Cultural'}</Text>
                <Text style={styles.modalSpaceAddress}>{selectedSpace.direccion || 'Dirección no disponible'}</Text>

                {/* Información de contacto */}
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.infoText}>
                    {selectedSpace.contacto?.email || selectedSpace.email || 'No disponible'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.infoText}>
                    {selectedSpace.contacto?.telefono || selectedSpace.telefono || 'No disponible'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="people-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.infoText}>
                    Capacidad: {selectedSpace.capacidad || 'No especificada'}
                  </Text>
                </View>

                {/* Redes sociales - Mejorado para mostrar desde ambas fuentes */}
                {(selectedSpace.redesSociales && Object.values(selectedSpace.redesSociales).some(red => red)) && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Redes Sociales</Text>
                    <View style={styles.tagsContainer}>
                      {selectedSpace.redesSociales.facebook && (
                        <TouchableOpacity 
                          style={styles.tagItem}
                          onPress={() => {
                            const url = selectedSpace.redesSociales.facebook;
                            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                            Linking.openURL(fullUrl);
                          }}
                        >
                          <Text style={styles.tagText}>
                            <Ionicons name="logo-facebook" size={14} color="#FFFFFF" /> Facebook
                          </Text>
                        </TouchableOpacity>
                      )}
                      {selectedSpace.redesSociales.instagram && (
                        <TouchableOpacity 
                          style={styles.tagItem}
                          onPress={() => {
                            const url = selectedSpace.redesSociales.instagram;
                            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                            Linking.openURL(fullUrl);
                          }}
                        >
                          <Text style={styles.tagText}>
                            <Ionicons name="logo-instagram" size={14} color="#FFFFFF" /> Instagram
                          </Text>
                        </TouchableOpacity>
                      )}
                      {selectedSpace.redesSociales.twitter && (
                        <TouchableOpacity 
                          style={styles.tagItem}
                          onPress={() => {
                            const url = selectedSpace.redesSociales.twitter;
                            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                            Linking.openURL(fullUrl);
                          }}
                        >
                          <Text style={styles.tagText}>
                            <Ionicons name="logo-twitter" size={14} color="#FFFFFF" /> Twitter
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
                


                {/* Instalaciones - Mejorado para mostrar desde ambas fuentes */}
                {selectedSpace.instalaciones && selectedSpace.instalaciones.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Instalaciones</Text>
                    <View style={styles.tagsContainer}>
                      {selectedSpace.instalaciones.map((instalacion, index) => (
                        <View key={index} style={styles.tagItem}>
                          <Text style={styles.tagText}>{instalacion}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
                


                {/* Horarios */}
                <Text style={styles.sectionTitle}>Horarios</Text>
                <View style={styles.horariosContainer}>
                  {selectedSpace.horarios && Object.entries(selectedSpace.horarios).map(([dia, horario]) => (
                    <View key={dia} style={styles.horarioItem}>
                      <Text style={styles.horarioDia}>
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </Text>
                      <Text style={styles.horarioHoras}>
                        {horario || 'Cerrado'}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Descripción */}
                {selectedSpace.descripcion && (
                  <>
                    <Text style={styles.descriptionTitle}>Descripción</Text>
                    <Text style={styles.descriptionText}>{selectedSpace.descripcion}</Text>
                  </>
                )}
                
                {/* Botón para ver ubicación en mapa si hay coordenadas disponibles */}
                {selectedSpace.latitud && selectedSpace.longitud && (
                  <TouchableOpacity 
                    style={styles.viewLocationButton}
                    onPress={() => {
                      const lat = parseFloat(selectedSpace.latitud);
                      const lng = parseFloat(selectedSpace.longitud);
                      
                      if (isNaN(lat) || isNaN(lng)) {
                        Alert.alert('Error', 'Coordenadas no válidas');
                        return;
                      }
                      
                      if (Platform.OS === 'web') {
                        // Cerrar modal actual y abrir mapa en web
                        setModalVisible(false);
                        
                        // Actualizar región del mapa para centrarse en el espacio seleccionado
                        setMapRegion({
                          latitude: lat,
                          longitude: lng,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        });
                        
                        // Abrir modal del mapa
                        setTimeout(() => {
                          setMapModalVisible(true);
                        }, 300);
                      } else {
                        // En dispositivos móviles, abrir directamente en OpenStreetMap
                        const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`;
                        Linking.openURL(url);
                      }
                    }}
                  >
                    <Ionicons name="location-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.viewLocationButtonText}>
                      {Platform.OS === 'web' ? 'Ver Ubicación' : 'Abrir en OpenStreetMap'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Botón de solicitar espacio */}
                <TouchableOpacity 
                  style={styles.requestButton}
                  onPress={() => {
                    setModalVisible(false);
                    setRequestFormVisible(true);
                  }}
                >
                  <Text style={styles.requestButtonText}>Solicitar Espacio</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal del mapa con espacios culturales cercanos */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.mapModalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setMapModalVisible(false)}
            >
              <Ionicons name="close-outline" size={24} color="#FF3A5E" />
            </TouchableOpacity>
            
            <Text style={styles.mapTitle}>Mapa de Espacios Culturales</Text>
            
            {/* Controles del mapa (similar a Google Maps) */}
            <View style={styles.mapControls}>
              <TouchableOpacity 
                style={[styles.mapControlButton, userLocation ? styles.mapControlButtonActive : null]}
                onPress={getUserLocation}
              >
                <Ionicons name="locate-outline" size={22} color={userLocation ? "#FF3A5E" : "#FFFFFF"} />
                <Text style={styles.mapControlText}>Mi ubicación</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mapControlButton}
                onPress={() => {
                  // Mostrar todos los espacios culturales
                  setFilteredSpaces(spaces);
                  setNearbySpaces([]);
                }}
              >
                <Ionicons name="list-outline" size={22} color="#FFFFFF" />
                <Text style={styles.mapControlText}>Todos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mapControlButton, nearbySpaces.length > 0 ? styles.mapControlButtonActive : null]}
                onPress={() => {
                  if (userLocation) {
                    findNearbySpaces(userLocation.latitude, userLocation.longitude);
                  } else {
                    getUserLocation();
                  }
                }}
              >
                <Ionicons name="location-outline" size={22} color={nearbySpaces.length > 0 ? "#FF3A5E" : "#FFFFFF"} />
                <Text style={styles.mapControlText}>Cercanos</Text>
              </TouchableOpacity>
            </View>
            
            {/* Mapa con espacios culturales cercanos */}
            <View style={styles.mapContainer}>
              {Platform.OS === 'web' ? (
                // Solución para web usando OpenStreetMap
                <View style={styles.webMapContainer}>
                  <Text style={styles.webMapMessage}>
                    <Ionicons name="map-outline" size={24} color="#FF3A5E" /> 
                    Usa el buscador de OpenStreetMap para encontrar ubicaciones
                  </Text>
                  <OpenStreetMapSearch onLocationSelect={handleLocationSelect} />
                </View>
              ) : (
                // Para dispositivos móviles, mostrar opciones de OpenStreetMap
                <View style={styles.mapPlaceholder}>
                  <Ionicons name="map-outline" size={50} color="#FF3A5E" />
                  <Text style={styles.mapPlaceholderText}>Opciones de Mapa</Text>
                  
                  {/* Botón para ver mi ubicación */}
                  <TouchableOpacity 
                    style={styles.openMapsButton}
                    onPress={getUserLocation}
                  >
                    <Ionicons name="locate-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
                    <Text style={styles.openMapsButtonText}>Mi Ubicación</Text>
                  </TouchableOpacity>
                  
                  {/* Botón para buscar espacios culturales */}
                  <TouchableOpacity 
                    style={[styles.openMapsButton, {marginTop: 10}]}
                    onPress={() => {
                      // Abrir el buscador de OpenStreetMap
                      const url = `https://www.openstreetmap.org/search?query=espacios+culturales+bucaramanga`;
                      Linking.openURL(url);
                    }}
                  >
                    <Ionicons name="search-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
                    <Text style={styles.openMapsButtonText}>Buscar Espacios Culturales</Text>
                  </TouchableOpacity>
                  
                  {/* Botón para obtener indicaciones */}
                  {selectedSpace && selectedSpace.latitud && selectedSpace.longitud && (
                    <TouchableOpacity 
                      style={[styles.openMapsButton, {marginTop: 10}]}
                      onPress={() => {
                        // Obtener indicaciones usando OpenStreetMap
                        const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation?.latitude || 7.119349},${userLocation?.longitude || -73.1227416};${selectedSpace.latitud},${selectedSpace.longitud}`;
                        Linking.openURL(url);
                      }}
                    >
                      <Ionicons name="navigate-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
                      <Text style={styles.openMapsButtonText}>Cómo Llegar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            
            {/* Lista de espacios cercanos */}
            {nearbySpaces.length > 0 ? (
              <>
                <Text style={styles.nearbyTitle}>Espacios cercanos a ti:</Text>
                <FlatList
                  data={nearbySpaces}
                  keyExtractor={(item, index) => `nearby-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.nearbyItem}
                      onPress={() => {
                        setSelectedSpace(item);
                        setMapModalVisible(false);
                        setModalVisible(true);
                      }}
                    >
                      <Text style={styles.nearbyName}>{item.nombreEspacio || 'Espacio sin nombre'}</Text>
                      <Text style={styles.nearbyAddress}>{item.direccion || 'Dirección no disponible'}</Text>
                      {item.distance && (
                        <Text style={styles.nearbyDistance}>
                          <Ionicons name="location-outline" size={14} color="#FF3A5E" /> 
                          {item.distance.toFixed(2)} km
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                  style={styles.nearbyList}
                  contentContainerStyle={styles.nearbyListContent}
                />
              </>
            ) : (
              <View style={styles.emptyNearby}>
                <Text style={styles.emptyNearbyText}>
                  No se encontraron espacios con coordenadas válidas
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de formulario de solicitud de evento */}
      <EventRequestForm 
        visible={requestFormVisible}
        onClose={() => {
          setRequestFormVisible(false);
          // Si el usuario cerró el formulario, volver a mostrar el modal de detalles
          if (selectedSpace) {
            setModalVisible(true);
          }
        }}
        spaceId={selectedSpace?.id || selectedSpace?.userId}
        spaceName={selectedSpace?.nombreEspacio}
        managerId={selectedSpace?.managerId || selectedSpace?.userId}
      />
    </View>
  );
};

const { width, height } = Dimensions.get('window');


export default SpaceSearch;
 