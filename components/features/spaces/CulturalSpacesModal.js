import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  Image, 
  ScrollView, 
  Linking,
  Modal
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BACKEND_URL } from '../../../constants/config';
import { useAuth } from '../../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de imagen de placeholder para usar cuando no hay imagen disponible
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150/000000/FFFFFF?text=No+Image';

// Función para validar si una URI de imagen es válida
const isValidImageUri = (uri) => {
  if (!uri) return false;
  return uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://');
};

// Función simplificada para manejar imágenes
const processImageForPersistence = (imageUri) => {
  // Simplemente devolver la URI original
  return imageUri;
};

const CulturalSpacesModal = ({ visible = true, onClose, initialSelectedSpaceId }) => {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);
  const [selectedSpaceDetails, setSelectedSpaceDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Cargar espacios culturales cuando se monta el componente
  useEffect(() => {
    loadSpaces();
    loadFavorites();
  }, []);

  // Recargar favoritos cuando el componente recibe el foco
  useFocusEffect(
    React.useCallback(() => {
      console.log('CulturalSpacesModal recibió el foco - recargando favoritos');
      loadFavorites();
      return () => {};
    }, [])
  );

  // Cargar espacios culturales desde el servidor
  const loadSpaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
      
      if (response.data && Array.isArray(response.data)) {
        setSpaces(response.data);
      } else if (response.data && response.data.spaces && Array.isArray(response.data.spaces)) {
        setSpaces(response.data.spaces);
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        Alert.alert('Error', 'No se pudieron cargar los espacios culturales.');
      }
    } catch (error) {
      console.error('Error al cargar espacios culturales:', error);
      Alert.alert('Error', 'No se pudieron cargar los espacios culturales.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar favoritos desde el servidor
  const loadFavorites = async () => {
    try {
      if (!user) return;
      
      const userId = user.id || user.sub || user._id;
      console.log('Cargando favoritos para el usuario:', userId);
      
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        params: { 
          userId: userId,
          targetType: 'space'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Extraer los IDs de favoritos y asegurarse de que sean strings
        const favoriteIds = response.data.map(fav => String(fav.targetId));
        console.log('Favoritos cargados desde servidor:', favoriteIds);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  };

  const toggleFavorite = async (space) => {
    try {
      if (!user) {
        Alert.alert(
          'Iniciar sesión requerido',
          'Debes iniciar sesión para guardar favoritos.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Asegurarse de que tenemos un ID de usuario válido
      const userId = user.id || user.sub || user._id;
      if (!userId) {
        console.error('ID de usuario no válido:', user);
        Alert.alert('Error', 'No se pudo identificar tu usuario. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      // Asegurarse de que tenemos un ID de espacio válido
      if (!space || !space.id) {
        console.error('ID de espacio no válido:', space);
        Alert.alert('Error', 'No se pudo identificar el espacio cultural.');
        return;
      }
      
      // Convertir a string para asegurar consistencia
      const spaceId = String(space.id);
      
      // Verificar si ya es favorito
      const isFavorite = favorites.includes(spaceId);
      console.log(`Actualizando favorito: ${space.nombre} (${spaceId}), Usuario: ${userId}, Es favorito actualmente: ${isFavorite}`);
      
      // Actualizar el estado de favoritos inmediatamente para una respuesta UI más rápida
      let newFavorites;
      if (isFavorite) {
        // Eliminar de favoritos localmente primero
        newFavorites = favorites.filter(id => id !== spaceId);
      } else {
        // Agregar a favoritos localmente primero
        newFavorites = [...favorites, spaceId];
      }
      
      // Actualizar estado inmediatamente
      setFavorites(newFavorites);
      
      // Sincronizar con el servidor
      try {
        if (isFavorite) {
          // Eliminar de favoritos en el servidor
          console.log('Enviando solicitud para eliminar de favoritos');
          await axios.delete(`${BACKEND_URL}/api/favorites`, {
            data: {
              userId: userId,
              targetId: spaceId,
              targetType: 'space'
            }
          });
          
          console.log('Favorito eliminado correctamente en el servidor');
        } else {
          // Agregar a favoritos en el servidor
          console.log('Enviando solicitud para agregar a favoritos');
          await axios.post(`${BACKEND_URL}/api/favorites`, {
            userId: userId,
            targetId: spaceId,
            targetType: 'space'
          });
          
          console.log('Favorito agregado correctamente en el servidor');
        }
      } catch (serverError) {
        console.error('Error al sincronizar favoritos con el servidor:', serverError);
        
        // Si hay un error en el servidor, NO revertir el cambio local
        // Esto mantiene la consistencia visual para el usuario
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      // No mostramos alerta aquí para no interrumpir la experiencia del usuario
    }
  };

  const handleViewSpaceDetails = async (space) => {
    try {
      setSelectedSpaceId(space.id);
      setLoadingDetails(true);
      
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces/${space.id}`);
      
      if (response.data) {
        const spaceDetails = response.data.space || response.data;
        
        // Imprimir información detallada sobre las imágenes
        console.log('Detalles del espacio:', JSON.stringify(spaceDetails, null, 2));
        console.log('Imágenes originales:', spaceDetails.images);
        
        setSelectedSpaceDetails(spaceDetails);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los detalles del espacio cultural.');
        setSelectedSpaceId(null);
      }
    } catch (error) {
      console.error('Error al cargar detalles del espacio:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles del espacio cultural.');
      setSelectedSpaceId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Función para renderizar los detalles del espacio cultural
  const renderSpaceDetails = () => {
    if (!selectedSpaceDetails) return null;

    const space = selectedSpaceDetails;

    const handleContactPress = () => {
      if (space.contacto && space.contacto.email) {
        Linking.openURL(`mailto:${space.contacto.email}`);
      }
    };

    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>Detalles del Espacio Cultural</Text>
          <TouchableOpacity
            onPress={() => {
              // Si se abrió desde favoritos (con initialSelectedSpaceId), cerrar completamente el modal
              if (initialSelectedSpaceId) {
                onClose();
              } else {
                // Comportamiento normal: solo cerrar los detalles
                setSelectedSpaceId(null);
              }
            }}
            style={styles.closeDetailsButton}
          >
            <Ionicons name="close" size={24} color="#FF3A5E" />
          </TouchableOpacity>
        </View>
        {loadingDetails ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3A5E" />
            <Text style={styles.loadingText}>Cargando detalles...</Text>
          </View>
        ) : (
          <ScrollView style={styles.detailsScrollView}>
            {/* Imágenes del espacio */}
            {space.images && Array.isArray(space.images) && space.images.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.imagesScrollView}
              >
                {space.images && Array.isArray(space.images) && space.images.length > 0 ? (
                  space.images.filter(img => isValidImageUri(img)).map((image, index) => {
                    console.log(`Renderizando imagen válida ${index}:`, image);
                    return (
                      <Image 
                        key={`image-${index}`}
                        source={{ 
                          uri: image,
                          cache: 'force-cache'
                        }} 
                        style={styles.spaceImage} 
                        resizeMode="cover"
                        onLoad={() => console.log(`Imagen ${index} cargada correctamente`)}
                        onError={(e) => {
                          console.log(`Error al cargar imagen ${index}:`, e.nativeEvent.error);
                          console.log(`URL que causó el error: ${image}`);
                        }}
                      />
                    );
                  })
                ) : (
                  <View style={styles.noImageContainer}>
                    <Ionicons name="image-outline" size={40} color="#555" />
                    <Text style={styles.noImageText}>No hay imágenes disponibles</Text>
                  </View>
                )}
              </ScrollView>
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={80} color="#444" />
                <Text style={styles.noImageText}>No hay imágenes disponibles</Text>
              </View>
            )}

            {/* Nombre y dirección */}
            <View style={styles.detailSection}>
              <Text style={styles.spaceName}>{space.nombre}</Text>
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={20} color="#FF3A5E" />
                <Text style={styles.addressText}>{space.direccion}</Text>
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.descriptionText}>
                {space.descripcion || 'Este espacio no ha proporcionado una descripción.'}
              </Text>
            </View>

            {/* Capacidad */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Capacidad</Text>
              <View style={styles.capacityContainer}>
                <Ionicons name="people-outline" size={20} color="#FF3A5E" />
                <Text style={styles.capacityText}>{space.capacidad} personas</Text>
              </View>
            </View>

            {/* Instalaciones */}
            {space.instalaciones && space.instalaciones.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Instalaciones</Text>
                <View style={styles.facilitiesContainer}>
                  {space.instalaciones.map((facility, index) => (
                    <View key={`facility-${index}`} style={styles.facilityTag}>
                      <Text style={styles.facilityText}>{facility}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Disponibilidad */}
            {space.disponibilidad && Array.isArray(space.disponibilidad) && space.disponibilidad.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Horarios</Text>
                {space.disponibilidad.map((day, index) => (
                  <View key={`day-${index}`} style={styles.dayContainer}>
                    <Text style={styles.dayName}>{day.dayOfWeek}</Text>
                    {day.isOpen ? (
                      <View style={styles.timeSlots}>
                        {day.timeSlots && day.timeSlots.map((slot, slotIndex) => (
                          <Text key={`slot-${slotIndex}`} style={styles.timeSlot}>
                            {slot.start} - {slot.end}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.closedText}>Cerrado</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Información de contacto */}
            {space.contacto && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Información de Contacto</Text>
                {space.contacto.email && (
                  <TouchableOpacity
                    onPress={handleContactPress}
                    style={styles.contactButton}
                  >
                    <Ionicons name="mail-outline" size={20} color="#FFF" />
                    <Text style={styles.contactButtonText}>Contactar por Email</Text>
                  </TouchableOpacity>
                )}
                {space.contacto.telefono && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${space.contacto.telefono}`)}
                    style={[styles.contactButton, { backgroundColor: '#4CAF50' }]}
                  >
                    <Ionicons name="call-outline" size={20} color="#FFF" />
                    <Text style={styles.contactButtonText}>Llamar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Redes sociales */}
            {space.redesSociales && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Redes Sociales</Text>
                <View style={styles.socialContainer}>
                  {space.redesSociales.facebook && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(space.redesSociales.facebook)}
                      style={[styles.socialButton, { backgroundColor: '#3b5998' }]}
                    >
                      <Ionicons name="logo-facebook" size={20} color="#FFF" />
                      <Text style={styles.socialButtonText}>Facebook</Text>
                    </TouchableOpacity>
                  )}
                  {space.redesSociales.instagram && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(space.redesSociales.instagram)}
                      style={[styles.socialButton, { backgroundColor: '#C13584' }]}
                    >
                      <Ionicons name="logo-instagram" size={20} color="#FFF" />
                      <Text style={styles.socialButtonText}>Instagram</Text>
                    </TouchableOpacity>
                  )}
                  {space.redesSociales.twitter && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(space.redesSociales.twitter)}
                      style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
                    >
                      <Ionicons name="logo-twitter" size={20} color="#FFF" />
                      <Text style={styles.socialButtonText}>Twitter</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <View style={styles.bottomSpace} />
          </ScrollView>
        )}
      </View>
    );
  };

  const renderSpaceItem = ({ item }) => {
    // Convertir el ID a string para asegurar consistencia en la comparación
    const spaceId = String(item.id);
    // Verificar explícitamente si el ID del espacio está en el array de favoritos
    const isFavorite = favorites.includes(spaceId);
    console.log(`Renderizando espacio ${item.nombre} (${spaceId}): ¿Es favorito? ${isFavorite}`, 'Favoritos actuales:', favorites);
    
    // Determinar la URL de la imagen para mostrar
    let imageUrl = null;
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      // Usar la primera imagen disponible
      for (let i = 0; i < item.images.length; i++) {
        const img = item.images[i];
        if (img && typeof img === 'string' && isValidImageUri(img)) {
          imageUrl = img;
          break;
        }
      }
    }
    
    // Imprimir información de depuración detallada
    console.log(`Renderizando espacio: ${item.nombre}`);
    console.log(`URL de la primera imagen válida: ${imageUrl}`);
    if (imageUrl) {
      console.log(`Tipo de URL: ${typeof imageUrl}`);
      console.log(`¿Es URI de archivo? ${imageUrl.startsWith('file://') ? 'Sí' : 'No'}`);
      console.log(`¿Es URL HTTP? ${imageUrl.startsWith('http') ? 'Sí' : 'No'}`);
      console.log(`Longitud de la URL: ${imageUrl.length}`);
    }
    
    return (
      <TouchableOpacity 
        style={styles.spaceItem}
        onPress={() => handleViewSpaceDetails(item)}
      >
        <View style={styles.spaceContent}>
          <View style={styles.spaceImageContainer}>
            {imageUrl ? (
              <Image 
                source={{ 
                  uri: imageUrl,
                  cache: 'force-cache'
                }} 
                style={styles.spaceThumb} 
                resizeMode="cover"
                onLoad={() => console.log(`Imagen de ${item.nombre} cargada correctamente`)}
                onError={(e) => {
                  console.log(`Error al cargar imagen de ${item.nombre}:`, e.nativeEvent.error);
                  console.log(`URL que causó el error: ${imageUrl}`);
                }}
              />
            ) : (
              <View style={styles.spaceImagePlaceholder}>
                <Ionicons name="business-outline" size={30} color="#FFF" />
              </View>
            )}
          </View>
          
          <View style={styles.spaceInfo}>
            <Text style={styles.spaceName}>{item.nombre}</Text>
            <Text style={styles.spaceAddress} numberOfLines={2}>{item.direccion}</Text>
            
            {item.instalaciones && item.instalaciones.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.instalaciones.slice(0, 2).map((facility, index) => (
                  <View key={`tag-${index}`} style={styles.tag}>
                    <Text style={styles.tagText}>{facility}</Text>
                  </View>
                ))}
                {item.instalaciones.length > 2 && (
                  <Text style={styles.moreTag}>+{item.instalaciones.length - 2} más</Text>
                )}
              </View>
            )}
          </View>
          
          <View style={styles.spaceActions}>
            <TouchableOpacity 
              style={[styles.favoriteButton, isFavorite ? styles.favoriteButtonActive : {}]}
              onPress={(e) => {
                e.stopPropagation(); // Evitar que el toque se propague al elemento padre
                toggleFavorite(item);
              }}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#FF3A5E" : "#FFF"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => handleViewSpaceDetails(item)}
            >
              <Ionicons name="arrow-forward-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.modalContainer}>
      {selectedSpaceId ? (
        renderSpaceDetails()
      ) : (
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Espacios Culturales</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FF3A5E" />
              <Text style={styles.loadingText}>Cargando espacios culturales...</Text>
            </View>
          ) : spaces.length > 0 ? (
            <FlatList
              data={spaces}
              renderItem={renderSpaceItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.spacesList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={60} color="#444" />
              <Text style={styles.emptyText}>No hay espacios culturales disponibles</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    paddingTop: 35, // Margen para respetar la barra de estado
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
  },
  spacesList: {
    padding: 15,
  },
  spaceItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  spaceContent: {
    flexDirection: 'row',
    padding: 15,
  },
  spaceImageContainer: {
    marginRight: 15,
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  spaceThumb: {
    width: '100%',
    height: '100%',
  },
  spaceImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceInfo: {
    flex: 1,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  spaceAddress: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    color: '#FFF',
    fontSize: 12,
  },
  moreTag: {
    color: '#999',
    fontSize: 12,
    marginLeft: 5,
    alignSelf: 'center',
  },
  spaceActions: {
    justifyContent: 'space-between',
    paddingLeft: 10,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    // Añadir sombra para mejorar visibilidad
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
  },
  detailsButton: {
    padding: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeDetailsButton: {
    padding: 8,
  },
  detailsScrollView: {
    flex: 1,
    padding: 15,
  },
  imagesScrollView: {
    height: 200,
    marginBottom: 20,
  },
  spaceImage: {
    width: 300,
    height: 200,
    borderRadius: 12,
    marginRight: 10,
  },
  noImageContainer: {
    height: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noImageText: {
    color: '#666',
    marginTop: 10,
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  addressText: {
    fontSize: 16,
    color: '#CCC',
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#CCC',
    lineHeight: 24,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 16,
    color: '#CCC',
    marginLeft: 8,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityTag: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  facilityText: {
    color: '#FFF',
    fontSize: 14,
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dayName: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
    width: 100,
  },
  timeSlots: {
    flex: 1,
  },
  timeSlot: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'right',
  },
  closedText: {
    fontSize: 14,
    color: '#FF3A5E',
    fontStyle: 'italic',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  socialButtonText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpace: {
    height: 30,
  },
});

export default CulturalSpacesModal;
