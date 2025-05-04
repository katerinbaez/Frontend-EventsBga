import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, TextInput, Modal, Image, ScrollView, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import EventRequestForm from './EventRequestForm';

const SpaceSearch = ({ onClose }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [requestFormVisible, setRequestFormVisible] = useState(false);

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
                      descripcion: fullSpaceData.descripcion || spaceData.descripcion || ''
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
                        descripcion: fullSpaceData.descripcion || matchingSpace.descripcion || ''
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
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-outline" size={24} color="#FF3A5E" />
        </TouchableOpacity>
        <Text style={styles.title}>Buscar Espacios Culturales</Text>
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
});

export default SpaceSearch;
