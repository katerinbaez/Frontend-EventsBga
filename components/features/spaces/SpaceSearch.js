import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, TextInput, Modal, Image, ScrollView, Linking, Platform, Alert, Dimensions } from 'react-native';
import OpenStreetMapSearch from '../geolocation/OpenStreetMapSearch';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL, GOOGLE_MAPS_API_KEY } from '../../../constants/config';
import EventRequestForm from '../requests/EventRequestForm';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';

const SpaceSearch = ({ onClose }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const mapRef = useRef(null);
  // Estados para manejar los espacios culturales y la búsqueda
  const [spaces, setSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [nearbySpaces, setNearbySpaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // Estado para manejar la ubicación seleccionada
  const [modalVisible, setModalVisible] = useState(false);
  const [requestFormVisible, setRequestFormVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Función para manejar la selección de ubicación desde GooglePlacesInput
  const handleLocationSelect = (location) => {
    console.log('Ubicación seleccionada:', location);
    
    // Verificar que la ubicación tenga las propiedades necesarias
    if (!location || !location.latitude || !location.longitude) {
      console.error('Error: La ubicación seleccionada no tiene coordenadas válidas', location);
      return;
    }
    
    // Guardar la ubicación seleccionada
    setSelectedPlace(location);
    console.log('Estado selectedPlace actualizado:', location);
    
    // Centrar el mapa en la ubicación seleccionada
    if (mapRef.current && location) {
      const region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      console.log('Centrando mapa en:', region);
      
      mapRef.current.animateToRegion(region, 1000);
      
      // También podríamos buscar espacios culturales cercanos a esta ubicación
      // si queremos implementar esa funcionalidad en el futuro
    } else {
      console.warn('No se pudo centrar el mapa. mapRef.current:', mapRef.current);
    }
  };
  const [locationPermission, setLocationPermission] = useState(false);
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

  // Solicitar permisos de ubicación
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        // Ya no llamamos a getUserLocation() automáticamente
        // Solo cuando el usuario presione el botón
      } else {
        setLocationPermission(false);
        Alert.alert(
          'Permiso denegado',
          'Necesitamos permisos de ubicación para mostrarte los espacios culturales cercanos.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error al solicitar permisos de ubicación:', error);
      Alert.alert(
        'Error',
        'No se pudieron solicitar los permisos de ubicación.',
        [{ text: 'OK' }]
      );
    }
  };

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
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
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
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      Alert.alert(
        'Error de ubicación',
        'No se pudo obtener tu ubicación actual.',
        [{ text: 'OK' }]
      );
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
      console.log('Espacios cargados desde managers:', response.data);
      
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
              console.log(`Datos del perfil del gestor ${managerId}:`, detailsResponse.data);
              
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
                  console.log(`Datos del espacio cultural para el gestor ${managerId}:`, culturalSpaceResponse.data);
                  
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
                  console.log('No se pudieron obtener datos del espacio cultural:', culturalSpaceError);
                  
                  // Si falla, intentar con la ruta alternativa para obtener espacios culturales
                  try {
                    const spacesResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/manager/${managerId}`);
                    console.log('Espacios culturales del gestor:', spacesResponse.data);
                    
                    if (spacesResponse.data.success && spacesResponse.data.spaces && spacesResponse.data.spaces.length > 0) {
                      // Tomar el primer espacio cultural asociado al gestor
                      const matchingSpace = spacesResponse.data.spaces[0];
                      
                      console.log('Espacio cultural coincidente encontrado:', matchingSpace);
                      
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
                    console.log('No se pudieron obtener espacios culturales del gestor:', allSpacesError);
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
        
        console.log('Espacios con datos completos:', spacesWithFullData);
        setSpaces(spacesWithFullData || []);
        setFilteredSpaces(spacesWithFullData || []);
      } else {
        console.log('Error al cargar espacios:', response.data);
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
    // Como ya tenemos todos los datos completos, solo necesitamos mostrar el modal
    // Procesar las imágenes para asegurarnos de que se muestren correctamente
    let processedSpace = {...space};
    
    console.log('Procesando espacio para modal:', {
      nombre: processedSpace.nombreEspacio,
      imagesOriginal: processedSpace.images,
      imagenesOriginal: processedSpace.imagenes
    });
    
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
    
    console.log('Espacio procesado para modal:', processedSpace);
    console.log('Imágenes disponibles después del procesamiento:', {
      images: processedSpace.images,
      imagenes: processedSpace.imagenes
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
              <View style={{width: '100%', height: '100%', borderRadius: 0, overflow: 'hidden'}}>
                <iframe
                  src={`https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${userLocation?.latitude || 7.119349},${userLocation?.longitude || -73.1227416}&zoom=16&maptype=roadmap`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </View>
            ) : (
              <MapView
                ref={mapRef}
                style={styles.fullScreenMap}
                provider={PROVIDER_GOOGLE}
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
                {/* Marcador para la ubicación seleccionada con Google Places */}
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
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="#FF3A5E" />
            </TouchableOpacity>
            <Text style={styles.title}>Buscar Espacios Culturales</Text>
            <TouchableOpacity onPress={getUserLocation} style={styles.locationButton}>
              <Ionicons name="locate-outline" size={24} color="#FF3A5E" />
            </TouchableOpacity>
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
                
                {/* Log para depuración */}
                {console.log('Datos de imagen:', {
                  images: selectedSpace.images,
                  imagenes: selectedSpace.imagenes,
                  nombreEspacio: selectedSpace.nombreEspacio
                })}
                
                {/* Nombre y dirección */}
                <Text style={styles.modalSpaceName}>{selectedSpace.nombreEspacio || 'Espacio Cultural'}</Text>
                <Text style={styles.modalSpaceAddress}>{selectedSpace.direccion || 'Dirección no disponible'}</Text>

                {/* Información de contacto */}
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color="#FF3A5E" />
                  <Text style={styles.infoText}>
                    {selectedSpace.contacto?.email || selectedSpace.email || 'No disponible'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#FF3A5E" />
                  <Text style={styles.infoText}>
                    {selectedSpace.contacto?.telefono || selectedSpace.telefono || 'No disponible'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="people-outline" size={20} color="#FF3A5E" />
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
                            <Ionicons name="logo-facebook" size={14} color="#FF3A5E" /> Facebook
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
                            <Ionicons name="logo-instagram" size={14} color="#FF3A5E" /> Instagram
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
                            <Ionicons name="logo-twitter" size={14} color="#FF3A5E" /> Twitter
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
                
                {/* Depuración de redes sociales */}
                {__DEV__ && console.log('Redes sociales disponibles:', selectedSpace.redesSociales)}

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
                
                {/* Depuración de instalaciones */}
                {__DEV__ && console.log('Instalaciones disponibles:', selectedSpace.instalaciones)}

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
                        // En dispositivos móviles, abrir directamente en Google Maps
                        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                        Linking.openURL(url);
                      }
                    }}
                  >
                    <Ionicons name="location-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.viewLocationButtonText}>
                      {Platform.OS === 'web' ? 'Ver Ubicación' : 'Abrir en Google Maps'}
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
                // Solución para web usando iframe de Google Maps interactivo
                <View style={{width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden'}}>
                  {/* Usamos un iframe con modo place para mostrar los espacios culturales */}
                  {selectedSpace && selectedSpace.latitud && selectedSpace.longitud ? (
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${selectedSpace.nombreEspacio || 'Espacio Cultural'}&center=${selectedSpace.latitud},${selectedSpace.longitud}&zoom=17`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  ) : nearbySpaces.length > 0 ? (
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_API_KEY}&q=espacios+culturales+en+bucaramanga&center=${userLocation?.latitude || 7.119349},${userLocation?.longitude || -73.1227416}&zoom=14`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  ) : (
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${userLocation?.latitude || 7.119349},${userLocation?.longitude || -73.1227416}&zoom=15&maptype=roadmap`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  )}
                </View>
              ) : (
                // Para dispositivos móviles, mostrar opciones de Google Maps
                <View style={styles.mapPlaceholder}>
                  <Ionicons name="map-outline" size={50} color="#FF3A5E" />
                  <Text style={styles.mapPlaceholderText}>Opciones de Google Maps</Text>
                  
                  {/* Botón para ver mi ubicación */}
                  <TouchableOpacity 
                    style={styles.openMapsButton}
                    onPress={() => {
                      // Abrir Google Maps en la ubicación actual
                      const url = `https://www.google.com/maps/@${userLocation?.latitude || 7.119349},${userLocation?.longitude || -73.1227416},15z`;
                      Linking.openURL(url);
                    }}
                  >
                    <Ionicons name="locate-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
                    <Text style={styles.openMapsButtonText}>Mi Ubicación</Text>
                  </TouchableOpacity>
                  
                  {/* Botón para buscar espacios culturales */}
                  <TouchableOpacity 
                    style={[styles.openMapsButton, {marginTop: 10}]}
                    onPress={() => {
                      // Buscar espacios culturales en Google Maps
                      const url = `https://www.google.com/maps/search/?api=1&query=espacios+culturales+bucaramanga&center=${userLocation?.latitude || 7.119349},${userLocation?.longitude || -73.1227416}`;
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
                        // Obtener indicaciones al espacio cultural seleccionado
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSpace.latitud},${selectedSpace.longitud}&destination_place_id=${selectedSpace.nombreEspacio || 'Espacio Cultural'}&travelmode=driving`;
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  mapAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF3A5E',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  mapAccessButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  fullScreenSearchContainer: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
    zIndex: 10,
  },
  fullScreenSearchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    padding: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 5,
  },
  fullScreenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  fullScreenMapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenMap: {
    width: '100%',
    height: '100%',
  },
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },
  calloutDistance: {
    fontSize: 12,
    color: '#FF3A5E',
    marginBottom: 5,
  },
  calloutAction: {
    fontSize: 12,
    color: '#4285F4',
    fontStyle: 'italic',
  },
  mapContainerMain: {
    width: '100%',
    height: 350,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#FF3A5E',
  },
  loadingWebView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
  },
  loadingWebViewText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  mapControlsMain: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
    paddingHorizontal: 15,
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  locationButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    margin: 15,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContent: {
    padding: 15,
  },
  spaceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  spaceContent: {
    flex: 1,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  spaceAddress: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 5,
  },
  spaceCapacity: {
    fontSize: 14,
    color: '#FF3A5E',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    position: 'relative',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 15,
    padding: 5,
  },
  spacePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    marginTop: 30,
    backgroundColor: '#1E1E1E',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  spaceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageScrollView: {
    width: '100%',
    height: '100%',
  },
  imageScrollContent: {
    alignItems: 'center',
  },
  imageItem: {
    width: 220,
    height: '100%',
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3A5E',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  modalSpaceName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'left',
  },
  modalSpaceAddress: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 15,
    textAlign: 'left',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
  },
  infoSection: {
    marginTop: 15,
    marginBottom: 10,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 10,
    marginTop: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tagItem: {
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.3)',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  horariosContainer: {
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    marginBottom: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.2)',
  },
  horarioItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 2,
  },
  horarioDia: {
    color: '#FF3A5E',
    fontWeight: 'bold',
    width: 95,
    fontSize: 14,
  },
  horarioHoras: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
    paddingLeft: 5,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginTop: 15,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.2)',
  },
  requestButton: {
    backgroundColor: '#FF3A5E',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapModalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    position: 'relative',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    marginTop: 30,
    textAlign: 'center',
  },
  mapControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  mapControlButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    flexDirection: 'row',
  },
  mapControlButtonActive: {
    backgroundColor: '#3A3A3A',
    borderLeftWidth: 2,
    borderLeftColor: '#FF3A5E',
  },
  mapControlText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 5,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  openMapsButton: {
    backgroundColor: '#FF3A5E',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  openMapsButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    marginTop: 10,
  },
  nearbyList: {
    maxHeight: 200,
  },
  nearbyListContent: {
    paddingBottom: 10,
  },
  nearbyItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  nearbyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  nearbyAddress: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 5,
  },
  nearbyDistance: {
    fontSize: 14,
    color: '#FF3A5E',
  },
  emptyNearby: {
    padding: 20,
    alignItems: 'center',
  },
  emptyNearbyText: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
  },
  viewLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3A5E',
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
    marginBottom: 10,
  },
  viewLocationButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default SpaceSearch;
 