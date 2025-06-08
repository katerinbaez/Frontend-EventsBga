/**
 * Este archivo maneja la búsqueda de espacios
 * - UI
 * - Espacios
 * - Búsqueda
 * - Mapa
 * - Lista
 */

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
  
  const handleLocationSelect = (location) => {
    if (!location || !location.latitude || !location.longitude) {
      return;
    }
    
    setSelectedPlace(location);
    
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
    latitude: 7.119349, 
    longitude: -73.1227416,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadSpaces();
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



  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos permisos de ubicación para mostrarte los espacios culturales cercanos.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setFullScreenMap(true);
      
      const providerStatus = await Location.getProviderStatusAsync();
      if (!providerStatus.locationServicesEnabled) {
        console.warn('Los servicios de ubicación están desactivados');
        return;
      }
      
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 15000 
        });
        
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        
        findNearbySpaces(latitude, longitude);
      } catch (locationError) {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
            timeout: 10000 
          });
          
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });
          
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          
          findNearbySpaces(latitude, longitude);
        } catch (secondError) {
          console.warn('Error al obtener la ubicación con precisión baja:', secondError);
          setFullScreenMap(false);
        }
      }
    } catch (error) {
      console.warn('Error al solicitar permisos de ubicación:', error);
      setFullScreenMap(false);
    }
  };
  
  const returnToList = () => {
    setFullScreenMap(false);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; 
    return d;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const findNearbySpaces = (latitude, longitude) => {
    if (!spaces || spaces.length === 0) return;
    
    const spacesWithCoordinates = spaces.filter(space => {
      return space.latitud && space.longitud && 
             !isNaN(parseFloat(space.latitud)) && 
             !isNaN(parseFloat(space.longitud));
    });
    
    const spacesWithDistance = spacesWithCoordinates.map(space => {
      const lat = parseFloat(space.latitud);
      const lng = parseFloat(space.longitud);
      const distance = calculateDistance(latitude, longitude, lat, lng);
      return { ...space, distance };
    });
    
    const closest = spacesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); 
    
    setNearbySpaces(closest);
    
    if (searchQuery === '' && userLocation) {
      setFilteredSpaces(closest);
    }
  };

  const showNearbySpaces = () => {
    if (userLocation) {
      findNearbySpaces(userLocation.latitude, userLocation.longitude);
      setMapModalVisible(true);
    } else {
      getUserLocation();
    }
  };

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/managers/managers`);
      
      if (response.data.success) {
        let spacesWithFullData = [];
        
        for (const space of response.data.managers) {
          try {
            const managerId = space.userId || space.id;
            if (managerId) {
              const detailsResponse = await axios.get(`${BACKEND_URL}/api/managers/profile/${managerId}`);
              
              let fullSpaceData = {};
              
              if (detailsResponse.data.success && detailsResponse.data.manager) {
                fullSpaceData = {
                  ...space,
                  ...detailsResponse.data.manager,
                  horarios: detailsResponse.data.manager.horarios || space.horarios,
                  descripcion: detailsResponse.data.manager.descripcion || space.descripcion
                };
                
                try {
                  const culturalSpaceResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/space/manager/${managerId}`);
                  
                  if (culturalSpaceResponse.data.success && culturalSpaceResponse.data.space) {
                    const spaceData = culturalSpaceResponse.data.space;
                    
                    fullSpaceData = {
                       ...fullSpaceData,
                      images: spaceData.images || fullSpaceData.images || [],
                      imagenes: spaceData.images || fullSpaceData.imagenes || [],
                      instalaciones: spaceData.instalaciones || fullSpaceData.instalaciones || [],
                      redesSociales: spaceData.redesSociales || fullSpaceData.redesSociales || {
                        facebook: '',
                        instagram: '',
                        twitter: ''
                      },
                      nombreEspacio: fullSpaceData.nombreEspacio || spaceData.nombre || 'Espacio Cultural',
                      direccion: fullSpaceData.direccion || spaceData.direccion || '',
                      capacidad: fullSpaceData.capacidad || spaceData.capacidad || '',
                      contacto: fullSpaceData.contacto || spaceData.contacto || {
                        email: fullSpaceData.email || '',
                        telefono: fullSpaceData.telefono || ''
                      },
                      horarios: fullSpaceData.horarios,
                      descripcion: fullSpaceData.descripcion || spaceData.descripcion || '',
                      latitud: spaceData.latitud || fullSpaceData.latitud || null,
                      longitud: spaceData.longitud || fullSpaceData.longitud || null
                    };
                  }
                } catch (culturalSpaceError) {
                  
                  try {
                    const spacesResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/manager/${managerId}`);
                    
                    if (spacesResponse.data.success && spacesResponse.data.spaces && spacesResponse.data.spaces.length > 0) {
                      const matchingSpace = spacesResponse.data.spaces[0];
                      
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
                        nombreEspacio: fullSpaceData.nombreEspacio || matchingSpace.nombre || 'Espacio Cultural',
                        descripcion: fullSpaceData.descripcion || matchingSpace.descripcion || '',
                        latitud: matchingSpace.latitud || fullSpaceData.latitud || null,
                        longitud: matchingSpace.longitud || fullSpaceData.longitud || null
                      };
                    }
                  } catch (allSpacesError) {
                  }
                }
                
                let horariosFormateados = {
                  lunes: '',
                  martes: '',
                  miercoles: '',
                  jueves: '',
                  viernes: '',
                  sabado: '',
                  domingo: ''
                };
                
                if (Array.isArray(fullSpaceData.horarios)) {
                  fullSpaceData.horarios.forEach(dia => {
                    if (dia && dia.dayOfWeek && dia.timeSlots && Array.isArray(dia.timeSlots)) {
                      let nombreDia = dia.dayOfWeek.toLowerCase();
                      
                      if (nombreDia.includes('miércoles') || nombreDia.includes('miercoles')) {
                        nombreDia = 'miercoles';
                      } else if (nombreDia.includes('sábado') || nombreDia.includes('sabado')) {
                        nombreDia = 'sabado';
                      }
                      
                      const horasString = dia.timeSlots.map(slot => 
                        `${slot.start}-${slot.end}`
                      ).join(', ');
                      
                      horariosFormateados[nombreDia] = dia.isOpen ? horasString : 'Cerrado';
                    }
                  });
                } else if (typeof fullSpaceData.horarios === 'object' && !Array.isArray(fullSpaceData.horarios)) {
                  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
                  dias.forEach(dia => {
                    horariosFormateados[dia] = fullSpaceData.horarios[dia] || '';
                  });
                }
                
                spacesWithFullData.push({
                  ...fullSpaceData,
                  horarios: horariosFormateados
                });
              } else {
                spacesWithFullData.push(space);
              }
            } else {
              spacesWithFullData.push(space);
            }
          } catch (detailsError) {
            console.error('Error al obtener detalles del espacio:', detailsError);
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
    let processedSpace = {...space};
    
    if (processedSpace.images) {
      if (typeof processedSpace.images === 'string') {
        processedSpace.images = [processedSpace.images];
      } else if (!Array.isArray(processedSpace.images)) {
        processedSpace.images = [];
      }
      
      processedSpace.images = processedSpace.images.filter(img => img && img.trim() !== '');
    } else {
      processedSpace.images = [];
    }
    
    if (processedSpace.imagenes) {
      if (typeof processedSpace.imagenes === 'string') {
        processedSpace.imagenes = [processedSpace.imagenes];
      } else if (!Array.isArray(processedSpace.imagenes)) {
        processedSpace.imagenes = [];
      }
      
      processedSpace.imagenes = processedSpace.imagenes.filter(img => img && img.trim() !== '');
    } else {
      processedSpace.imagenes = [];
    }
    
    processedSpace.images = processedSpace.images.map(img => {
      if (img && !img.startsWith('http') && !img.startsWith('file://')) {
        const cleanPath = img.startsWith('/') ? img.substring(1) : img;
        return `${BACKEND_URL}/${cleanPath}`;
      }
      return img;
    });
    
    processedSpace.imagenes = processedSpace.imagenes.map(img => {
      if (img && !img.startsWith('http') && !img.startsWith('file://')) {
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
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity onPress={returnToList} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FF3A5E" />
              <Text style={styles.backButtonText}>Volver a la lista</Text>
            </TouchableOpacity>
            <Text style={styles.fullScreenTitle}>Mi Ubicación</Text>
          </View>
          
          <View style={styles.fullScreenSearchContainer}>
            <OpenStreetMapSearch onLocationSelect={handleLocationSelect} />
          </View>
          
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
                
                {(searchQuery.trim() !== '' ? filteredSpaces : nearbySpaces).map((space, index) => {
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
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
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
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                bounces={true}
                overScrollMode="always"
                alwaysBounceVertical={true}
                removeClippedSubviews={false}
                keyboardShouldPersistTaps="handled"
                scrollEventThrottle={16}
                style={styles.modalScrollView}
              >
                <View style={styles.spacePlaceholder}>
                  <View style={styles.imageContainer}>
                    {(selectedSpace.images?.length > 0 || selectedSpace.imagenes?.length > 0) ? (
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageScrollView}
                        contentContainerStyle={styles.imageScrollContent}
                      >
                        {selectedSpace.images?.map((imagePath, index) => {
                          console.log(`Intentando cargar imagen ${index} desde images:`, imagePath);
                          const isLocalPath = imagePath && (
                            imagePath.startsWith('file://') || 
                            imagePath.startsWith('/') || 
                            (Platform.OS === 'win32' && /^[a-zA-Z]:\\/.test(imagePath))
                          );
                          
                          let imageSource;
                          if (isLocalPath) {
                            imageSource = { uri: imagePath };
                            console.log('Usando ruta local:', imageSource);
                          } else if (imagePath && imagePath.startsWith('http')) {
                            imageSource = { uri: imagePath };
                            console.log('Usando URL remota:', imageSource);
                          } else if (imagePath) {
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
                        
                        {selectedSpace.imagenes?.map((imagePath, index) => {
                          if (selectedSpace.images?.length > 0) return null;
                          
                          console.log(`Intentando cargar imagen ${index} desde imagenes:`, imagePath);
                          const isLocalPath = imagePath && (
                            imagePath.startsWith('file://') || 
                            imagePath.startsWith('/') || 
                            (Platform.OS === 'win32' && /^[a-zA-Z]:\\/.test(imagePath))
                          );
                          
                          let imageSource;
                          if (isLocalPath) {
                            imageSource = { uri: imagePath };
                            console.log('Usando ruta local:', imageSource);
                          } else if (imagePath && imagePath.startsWith('http')) {
                            imageSource = { uri: imagePath };
                            console.log('Usando URL remota:', imageSource);
                          } else if (imagePath) {
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
                

                
                <Text style={styles.modalSpaceName}>{selectedSpace.nombreEspacio || 'Espacio Cultural'}</Text>
                <Text style={styles.modalSpaceAddress}>{selectedSpace.direccion || 'Dirección no disponible'}</Text>

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

                {selectedSpace.descripcion && (
                  <>
                    <Text style={styles.descriptionTitle}>Descripción</Text>
                    <Text style={styles.descriptionText}>{selectedSpace.descripcion}</Text>
                  </>
                )}
                
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
                        setModalVisible(false);
                        
                        setMapRegion({
                          latitude: lat,
                          longitude: lng,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        });
                        
                        setTimeout(() => {
                          setMapModalVisible(true);
                        }, 300);
                      } else {
                        
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
            
            <View style={styles.mapContainer}>
              {Platform.OS === 'web' ? (
                <View style={styles.webMapContainer}>
                  <Text style={styles.webMapMessage}>
                    <Ionicons name="map-outline" size={24} color="#FF3A5E" /> 
                    Usa el buscador de OpenStreetMap para encontrar ubicaciones
                  </Text>
                  <OpenStreetMapSearch onLocationSelect={handleLocationSelect} />
                </View>
              ) : (
                <View style={styles.mapPlaceholder}>
                  <Ionicons name="map-outline" size={50} color="#FF3A5E" />
                  <Text style={styles.mapPlaceholderText}>Opciones de Mapa</Text>
                  
                  <TouchableOpacity 
                    style={styles.openMapsButton}
                    onPress={getUserLocation}
                  >
                    <Ionicons name="locate-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
                    <Text style={styles.openMapsButtonText}>Mi Ubicación</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.openMapsButton, {marginTop: 10}]}
                    onPress={() => {
                      const url = `https://www.openstreetmap.org/search?query=espacios+culturales+bucaramanga`;
                      Linking.openURL(url);
                    }}
                  >
                    <Ionicons name="search-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
                    <Text style={styles.openMapsButtonText}>Buscar Espacios Culturales</Text>
                  </TouchableOpacity>
                  
                  {selectedSpace && selectedSpace.latitud && selectedSpace.longitud && (
                    <TouchableOpacity 
                      style={[styles.openMapsButton, {marginTop: 10}]}
                      onPress={() => {
                        
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

      <EventRequestForm 
        visible={requestFormVisible}
        onClose={() => {
          setRequestFormVisible(false);
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
 