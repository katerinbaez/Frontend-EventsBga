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
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';
import { useAuth } from '../../../context/AuthContext';

const ArtistProfilesModal = ({ visible = true, onClose, initialSelectedArtistId }) => {
  // Obtener dimensiones de la pantalla para cálculos de altura
  const windowHeight = Dimensions.get('window').height;
  const { user } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedArtistDetails, setSelectedArtistDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedTrabajoId, setExpandedTrabajoId] = useState(null);

  // Cargar artistas cuando se monta el componente
  useEffect(() => {
    loadArtists();
    loadFavorites();
  }, []);
  
  // Mostrar detalles del artista seleccionado si se proporciona un ID inicial
  useEffect(() => {
    const loadSelectedArtistDetails = async () => {
      if (initialSelectedArtistId) {
        console.log('Mostrando detalles del artista seleccionado:', initialSelectedArtistId);
        setSelectedArtistId(initialSelectedArtistId);
        setLoadingDetails(true);
        
        try {
          // Cargar detalles completos del artista
          const response = await axios.get(`${BACKEND_URL}/api/artists/profile-by-id/${initialSelectedArtistId}`);
          if (response.data && response.data.success) {
            console.log('Detalles del artista cargados:', JSON.stringify(response.data.artist, null, 2));
            
            // Procesar los datos del artista
            const artistData = response.data.artist;
            
            // Asegurarse de que portfolio tenga la estructura correcta según el modelo
            if (!artistData.portfolio) {
              artistData.portfolio = { trabajos: [], imagenes: [] };
              console.log('No se encontró portfolio, se inicializó vacío');
            } else if (typeof artistData.portfolio === 'string') {
              try {
                // Intentar parsear el portfolio si viene como string JSON
                artistData.portfolio = JSON.parse(artistData.portfolio);
                console.log('Portfolio parseado de string JSON:', JSON.stringify(artistData.portfolio, null, 2));
              } catch (e) {
                console.error('Error al parsear portfolio:', e);
                artistData.portfolio = { trabajos: [], imagenes: [] };
              }
            }
            
            // Actualizar el estado con los detalles del artista
            setSelectedArtistDetails(artistData);
          } else {
            console.error('Error al cargar detalles del artista:', response.data);
            Alert.alert('Error', 'No se pudieron cargar los detalles del artista');
          }
        } catch (error) {
          console.error('Error al cargar detalles del artista:', error);
          Alert.alert('Error', 'No se pudieron cargar los detalles del artista');
        } finally {
          setLoadingDetails(false);
        }
      }
    };
    
    loadSelectedArtistDetails();
  }, [initialSelectedArtistId]);
  
  // Efecto adicional para depurar y verificar que los detalles se están cargando correctamente
  useEffect(() => {
    if (selectedArtistDetails) {
      console.log('Detalles del artista actualizados:', selectedArtistDetails.nombreArtistico);
    }
  }, [selectedArtistDetails]);

  const loadArtists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/artists/all`);
      
      if (response.data && response.data.success) {
        // Procesar los datos de los artistas para asegurar que la foto de perfil esté correcta
        const processedArtists = response.data.artists.map(artist => {
          // Verificar si la foto de perfil existe y tiene un formato válido
          if (artist.fotoPerfil) {
            // Asegurarse de que la URL sea absoluta
            if (!artist.fotoPerfil.startsWith('http')) {
              // Si es una ruta relativa, convertirla a absoluta
              artist.fotoPerfil = `${BACKEND_URL}${artist.fotoPerfil}`;
            }
            console.log(`Foto de perfil de ${artist.nombreArtistico} (procesada):`, artist.fotoPerfil);
          } else {
            console.log(`${artist.nombreArtistico} no tiene foto de perfil`);
          }
          return artist;
        });
        
        setArtists(processedArtists);
      }
    } catch (error) {
      console.error('Error al cargar artistas:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los perfiles de artistas. Por favor, intenta de nuevo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      if (!user) return;
      
      // Usar el mismo endpoint que usa FavoritesList
      const userId = user.id || user.sub || user._id;
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        params: { 
          userId: userId,
          targetType: 'artist'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Obtener los artistas para poder identificar los favoritos
        const artistsResponse = await axios.get(`${BACKEND_URL}/api/artists/all`);
        
        if (artistsResponse.data && artistsResponse.data.success) {
          // Crear un mapa de IDs de artistas para búsqueda rápida
          const artistsById = {};
          artistsResponse.data.artists.forEach(artist => {
            artistsById[artist.id] = true;
          });
          
          // Extraer los IDs de favoritos y verificar que correspondan a artistas existentes
          const favoriteIds = [];
          response.data.forEach(fav => {
            // Verificar si el ID del favorito corresponde a un artista existente
            // Esto es necesario porque ahora los IDs se almacenan como strings
            const artistExists = artistsResponse.data.artists.some(artist => 
              artist.id === fav.targetId || artist.id.toString() === fav.targetId
            );
            
            if (artistExists) {
              favoriteIds.push(fav.targetId);
            }
          });
          
          setFavorites(favoriteIds);
        }
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  };

  // Ya no necesitamos esta función porque el backend ahora maneja los IDs como strings
  // La dejamos comentada por si acaso se necesita en el futuro
  /*
  const uuidToInteger = (uuid) => {
    // Eliminar guiones y tomar solo los primeros 8 caracteres
    const cleanUuid = uuid.replace(/-/g, '');
    // Convertir a un número usando parseInt con base 16 (hexadecimal)
    // y limitar a un valor máximo seguro para INTEGER en PostgreSQL
    return parseInt(cleanUuid.substring(0, 8), 16) % 2147483647; // Máximo valor para INTEGER en PostgreSQL
  };
  */

  const toggleFavorite = async (artist) => {
    try {
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para agregar artistas a favoritos');
        return;
      }
      
      const isFavorite = favorites.includes(artist.id);
      const userId = user.id || user.sub || user._id;
      
      // Usar el ID directamente como string
      console.log(`Usando ID de artista: ${artist.id}`);
      
      if (isFavorite) {
        // Eliminar de favoritos usando el mismo endpoint que FavoritesList
        await axios.delete(`${BACKEND_URL}/api/favorites`, {
          data: { 
            userId: userId,
            targetType: 'artist',
            targetId: artist.id 
          }
        });
        setFavorites(favorites.filter(id => id !== artist.id));
        Alert.alert('Éxito', `${artist.nombreArtistico} ha sido eliminado de tus favoritos`);
      } else {
        // Agregar a favoritos usando el mismo endpoint que FavoritesList
        await axios.post(`${BACKEND_URL}/api/favorites`, {
          userId: userId,
          targetType: 'artist',
          targetId: artist.id
        });
        setFavorites([...favorites, artist.id]);
        Alert.alert('Éxito', `${artist.nombreArtistico} ha sido agregado a tus favoritos`);
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      Alert.alert(
        'Error',
        'No se pudo actualizar tus favoritos. Por favor, intenta de nuevo más tarde.'
      );
    }
  };

  const handleViewArtistDetails = async (artist) => {
    // Si ya estamos viendo este artista, lo cerramos
    if (selectedArtistId === artist.id) {
      setSelectedArtistId(null);
      setSelectedArtistDetails(null);
      return;
    }
    
    // Mostrar los detalles del artista
    setSelectedArtistId(artist.id);
    setLoadingDetails(true);
    
    try {
      // Cargar detalles completos del artista
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile-by-id/${artist.id}`);
      if (response.data && response.data.success) {
        console.log('Detalles del artista cargados:', JSON.stringify(response.data.artist, null, 2));
        
        // Procesar los datos del artista
        const artistData = response.data.artist;
        
        // Asegurarse de que portfolio tenga la estructura correcta según el modelo
        if (!artistData.portfolio) {
          artistData.portfolio = { trabajos: [], imagenes: [] };
          console.log('No se encontró portfolio, se inicializó vacío');
        } else if (typeof artistData.portfolio === 'string') {
          try {
            // Intentar parsear el portfolio si viene como string JSON
            artistData.portfolio = JSON.parse(artistData.portfolio);
            console.log('Portfolio parseado de string JSON:', JSON.stringify(artistData.portfolio, null, 2));
          } catch (e) {
            console.error('Error al parsear portfolio:', e);
            console.log('Contenido del portfolio que causó error:', artistData.portfolio);
            artistData.portfolio = { trabajos: [], imagenes: [] };
          }
        } else {
          console.log('Portfolio ya está en formato objeto:', JSON.stringify(artistData.portfolio, null, 2));
        }
        
        // Asegurar que trabajos sea un array
        if (!artistData.portfolio.trabajos) {
          artistData.portfolio.trabajos = [];
          console.log('No se encontraron trabajos en el portfolio, se inicializó array vacío');
        } else {
          console.log('Trabajos encontrados en portfolio:', artistData.portfolio.trabajos.length);
        }
        
        // Asegurar que imágenes sea un array
        if (!artistData.portfolio.imagenes) {
          artistData.portfolio.imagenes = [];
          console.log('No se encontraron imágenes en el portfolio, se inicializó array vacío');
        } else {
          console.log('Imágenes encontradas en portfolio:', artistData.portfolio.imagenes.length);
        }
        
        // Procesar cada trabajo para asegurar que tenga la estructura correcta
        artistData.portfolio.trabajos = artistData.portfolio.trabajos.map((trabajo, index) => {
          console.log(`Procesando trabajo ${index}:`, JSON.stringify(trabajo, null, 2));
          // Si el trabajo es un string, intentar parsearlo como JSON
          if (typeof trabajo === 'string') {
            try {
              const parsedTrabajo = JSON.parse(trabajo);
              console.log(`Trabajo ${index} parseado correctamente:`, JSON.stringify(parsedTrabajo, null, 2));
              return parsedTrabajo;
            } catch (e) {
              console.error(`Error al parsear trabajo ${index}:`, e);
              return {
                titulo: `Trabajo ${index + 1}`,
                descripcion: trabajo // Usar el string como descripción
              };
            }
          }
          return trabajo;
        });
        
        console.log('Portfolio procesado:', JSON.stringify(artistData.portfolio, null, 2));
        setSelectedArtistDetails(artistData);
      } else {
        console.error('Error al cargar detalles del artista:', response.data);
        setSelectedArtistDetails(artist); // Usar los datos que ya tenemos
      }
    } catch (error) {
      console.error('Error al cargar detalles del artista:', error);
      setSelectedArtistDetails(artist); // Usar los datos que ya tenemos
    } finally {
      setLoadingDetails(false);
    }
  };

  // Función para renderizar los detalles del artista
  const renderArtistDetails = () => {
    if (!selectedArtistId || !selectedArtistDetails) return null;
    
    const artist = selectedArtistDetails;
    
    const handleContactPress = () => {
      if (artist.email) {
        Linking.openURL(`mailto:${artist.email}`);
      }
    };
    
    return (
      <View style={[styles.detailsContainer, { height: windowHeight * 0.7 }]}>
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>Detalles del Perfil</Text>
          <TouchableOpacity 
            onPress={() => setSelectedArtistId(null)}
            style={styles.closeDetailsButton}
          >
            <Ionicons name="chevron-up" size={24} color="#FF3A5E" />
          </TouchableOpacity>
        </View>
        
        {loadingDetails ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3A5E" />
            <Text style={styles.loadingText}>Cargando detalles...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.detailsScrollView}
            contentContainerStyle={styles.detailsScrollViewContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            alwaysBounceVertical={true}
            overScrollMode="always"
            nestedScrollEnabled={true}
          >
            {/* Biografía */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Biografía</Text>
              <Text style={styles.biographyText}>
                {artist.biografia || 'Este artista no ha proporcionado una biografía.'}
              </Text>
            </View>
            
            {/* Información de contacto */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Información de Contacto</Text>
              
              {/* Verificar si existe contacto y sus propiedades */}
              {artist.contacto && artist.contacto.email && (
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`mailto:${artist.contacto.email}`)}
                  style={styles.contactRow}
                >
                  <Ionicons name="mail" size={18} color="#FF3A5E" />
                  <Text style={styles.contactText}>{artist.contacto.email}</Text>
                </TouchableOpacity>
              )}
              
              {artist.contacto && artist.contacto.telefono && (
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`tel:${artist.contacto.telefono}`)}
                  style={styles.contactRow}
                >
                  <Ionicons name="call" size={18} color="#FF3A5E" />
                  <Text style={styles.contactText}>{artist.contacto.telefono}</Text>
                </TouchableOpacity>
              )}
              
              {artist.contacto && artist.contacto.ciudad && (
                <View style={styles.contactRow}>
                  <Ionicons name="location" size={18} color="#FF3A5E" />
                  <Text style={styles.contactText}>{artist.contacto.ciudad}</Text>
                </View>
              )}
              
              {/* Verificar si no hay información de contacto */}
              {(!artist.contacto || 
                (!artist.contacto.email && !artist.contacto.telefono && !artist.contacto.ciudad)) && (
                <Text style={styles.noDataText}>No hay información de contacto disponible</Text>
              )}
            </View>
            
            {/* Habilidades */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Habilidades</Text>
              {artist.habilidades && artist.habilidades.length > 0 ? (
                <View style={styles.skillsContainer}>
                  {artist.habilidades.map((skill, index) => (
                    <View key={index} style={styles.detailTag}>
                      <Text style={styles.detailTagText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>No hay habilidades registradas</Text>
              )}
            </View>
            
            {/* Portfolio */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
              
              {artist.portfolio ? (
                <>
                  {/* Sección de depuración eliminada */}
                  
                  {/* Trabajos */}
                  {artist.portfolio.trabajos && artist.portfolio.trabajos.length > 0 ? (
                    <View style={styles.portfolioSection}>
                      <Text style={styles.portfolioSubtitle}>Trabajos Destacados</Text>
                      {artist.portfolio.trabajos.map((trabajo, index) => {
                        console.log(`Procesando trabajo ${index}:`, JSON.stringify(trabajo, null, 2));
                        
                        // Crear un ID único para este trabajo
                        const trabajoId = `${artist.id}-${index}`;
                        const isExpanded = expandedTrabajoId === trabajoId;
                        
                        // Si trabajo es null o undefined, mostrar un mensaje genérico
                        if (!trabajo) {
                          return (
                            <View key={index} style={styles.portfolioItemContainer}>
                              <View style={styles.portfolioItem}>
                                <Text style={styles.portfolioItemTitle}>Trabajo {index + 1}</Text>
                                <Text style={styles.portfolioItemDescription}>No hay detalles disponibles</Text>
                              </View>
                            </View>
                          );
                        }
                        
                        // Si trabajo es un string, mostrarlo directamente
                        if (typeof trabajo === 'string') {
                          console.log(`Trabajo ${index} es un string:`, trabajo);
                          return (
                            <View key={index} style={styles.portfolioItemContainer}>
                              <View style={styles.portfolioItem}>
                                <Text style={styles.portfolioItemTitle}>Trabajo {index + 1}</Text>
                                <Text style={styles.portfolioItemDescription}>{trabajo}</Text>
                              </View>
                            </View>
                          );
                        }
                        
                        // Para trabajos que son objetos
                        console.log('Renderizando trabajo real:', JSON.stringify(trabajo, null, 2));
                        
                        // Mostrar todos los datos del trabajo, independientemente de su estructura
                        return (
                          <View key={index} style={styles.portfolioItemContainer}>
                            <TouchableOpacity 
                              style={[styles.portfolioItem, isExpanded && styles.portfolioItemExpanded]}
                              onPress={() => {
                                console.log('Trabajo clickeado:', trabajoId, 'Expandido actual:', expandedTrabajoId);
                                setExpandedTrabajoId(isExpanded ? null : trabajoId);
                              }}
                            >
                              <View style={styles.portfolioItemHeader}>
                                <Text style={styles.portfolioItemTitle}>
                                  {trabajo.titulo || `Trabajo ${index + 1}`}
                                </Text>
                                <Ionicons 
                                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                                  size={18} 
                                  color="#FF3A5E" 
                                />
                              </View>
                              
                              {/* Información básica siempre visible */}
                              {trabajo.fecha && (
                                <Text style={styles.portfolioItemDate}>{trabajo.fecha}</Text>
                              )}
                              
                              {/* Mostrar una vista previa de la descripción si existe */}
                              {trabajo.descripcion && (
                                <Text style={styles.portfolioItemPreview} numberOfLines={1}>
                                  {trabajo.descripcion}
                                </Text>
                              )}
                            </TouchableOpacity>
                            
                            {/* Detalles expandibles */}
                            {isExpanded && (
                              <View style={styles.portfolioItemDetails}>
                                <Text style={styles.detailSectionTitle}>Detalles del trabajo</Text>
                                
                                {/* Mostrar el título del trabajo */}
                                {(trabajo.titulo || trabajo.title) && (
                                  <View style={styles.portfolioTitleContainer}>
                                    <Text style={styles.portfolioDetailTitle}>
                                      {trabajo.titulo || trabajo.title}
                                    </Text>
                                  </View>
                                )}
                                
                                {/* Mostrar la imagen si existe (considerando diferentes formatos de nombre) */}
                                {(trabajo.imageUrl || trabajo.ImageUrl || trabajo.imagenUrl || trabajo.imagen) && (
                                  <View style={styles.portfolioImageContainer}>
                                    <Image 
                                      source={{ uri: trabajo.imageUrl || trabajo.ImageUrl || trabajo.imagenUrl || trabajo.imagen }} 
                                      style={styles.portfolioImage}
                                      resizeMode="cover"
                                    />
                                  </View>
                                )}
                                
                                {/* Mostrar campos seleccionados del trabajo */}
                                {Object.entries(trabajo).map(([key, value]) => {
                                  // Ignorar campos específicos que no queremos mostrar o que ya se muestran
                                  if (['titulo', 'title', 'id', 'imageUrl', 'ImageUrl', 'imagenUrl', 'imagen'].includes(key)) return null;
                                  
                                  // Ignorar cualquier campo que contenga URLs o rutas de archivo
                                  const valueStr = String(value).toLowerCase();
                                  if (valueStr.includes('http://') || 
                                      valueStr.includes('https://') || 
                                      valueStr.includes('file://') || 
                                      valueStr.includes('/data/user/') || 
                                      valueStr.includes('.png') || 
                                      valueStr.includes('.jpg') || 
                                      valueStr.includes('.jpeg') || 
                                      key.toLowerCase().includes('url')) {
                                    return null;
                                  }
                                  
                                  // Si el valor es un objeto o array, convertirlo a string
                                  const displayValue = typeof value === 'object' 
                                    ? JSON.stringify(value) 
                                    : String(value);
                                  
                                  // Formatear el nombre del campo para mostrarlo
                                  const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
                                  
                                  return (
                                    <View key={key} style={styles.detailRow}>
                                      <Text style={styles.detailLabel}>{fieldName}:</Text>
                                      <Text style={styles.detailValue}>{displayValue}</Text>
                                    </View>
                                  );
                                })}
                                
                                {/* Botón para ver más detalles solo si hay URL */}
                                {trabajo.url && (
                                  <TouchableOpacity 
                                    style={styles.portfolioLink}
                                    onPress={() => Linking.openURL(trabajo.url)}
                                  >
                                    <Ionicons name="link" size={16} color="#FF3A5E" />
                                    <Text style={styles.portfolioLinkText}>Ver proyecto</Text>
                                  </TouchableOpacity>
                                )}
                                
                                {/* Mensaje si el objeto está vacío */}
                                {Object.keys(trabajo).length === 0 && (
                                  <Text style={styles.noDataText}>No hay detalles disponibles para este trabajo.</Text>
                                )}
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>No hay trabajos en el portfolio</Text>
                  )}
                  
                  {/* Imágenes */}
                  {artist.portfolio.imagenes && artist.portfolio.imagenes.length > 0 ? (
                    <View style={styles.portfolioImagesSection}>
                      <Text style={styles.portfolioSubtitle}>Imágenes</Text>
                      <Text style={styles.portfolioImagesCount}>
                        {artist.portfolio.imagenes.length} imagen(es) disponible(s)
                      </Text>
                      {/* Lista de imágenes */}
                      <View style={styles.imageGrid}>
                        {artist.portfolio.imagenes.map((imagen, index) => (
                          <View key={index} style={styles.imageContainer}>
                            <Text style={styles.imageIndex}>Imagen {index + 1}</Text>
                            <Text style={styles.imageUrl}>{typeof imagen === 'string' ? imagen : JSON.stringify(imagen)}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </>
              ) : (
                <Text style={styles.noDataText}>No hay información de portfolio disponible</Text>
              )}
            </View>
            
            {/* Estado del perfil */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Estado del Perfil</Text>
              <View style={styles.profileStatusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: artist.isProfileComplete ? '#4CAF50' : '#FF9800' }]} />
                <Text style={styles.profileStatusText}>
                  {artist.isProfileComplete ? 'Perfil completo' : 'Perfil incompleto'}
                </Text>
              </View>
            </View>
            
            {/* Redes Sociales */}
            {artist.redesSociales && Object.keys(artist.redesSociales || {}).length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Redes Sociales</Text>
                <View style={styles.socialLinksContainer}>
                  {artist.redesSociales.facebook && (
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => Linking.openURL(artist.redesSociales.facebook)}
                    >
                      <Ionicons name="logo-facebook" size={24} color="#FFF" />
                    </TouchableOpacity>
                  )}
                  {artist.redesSociales.instagram && (
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => Linking.openURL(artist.redesSociales.instagram)}
                    >
                      <Ionicons name="logo-instagram" size={24} color="#FFF" />
                    </TouchableOpacity>
                  )}
                  {artist.redesSociales.twitter && (
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => Linking.openURL(artist.redesSociales.twitter)}
                    >
                      <Ionicons name="logo-twitter" size={24} color="#FFF" />
                    </TouchableOpacity>
                  )}
                  {artist.redesSociales.youtube && (
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => Linking.openURL(artist.redesSociales.youtube)}
                    >
                      <Ionicons name="logo-youtube" size={24} color="#FFF" />
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

  const renderArtistItem = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    // Usar directamente la URL de la foto de perfil
    const imageUrl = item.fotoPerfil || null;
    
    // Imprimir información de depuración
    console.log(`Artista: ${item.nombreArtistico}`);
    console.log(`Foto de perfil: ${imageUrl}`);
    console.log(`Objeto completo:`, JSON.stringify(item, null, 2));
    
    const isSelected = selectedArtistId === item.id;
    
    return (
      <View>
        <TouchableOpacity 
          style={[styles.artistItem, isSelected && styles.selectedArtistItem]}
          onPress={() => handleViewArtistDetails(item)}
        >
          <View style={styles.artistImageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.artistImage}
                resizeMode="cover"
                onLoad={() => console.log('Imagen cargada correctamente')}
                onError={(e) => console.log('Error al cargar imagen:', e.nativeEvent.error)}
              />
            ) : (
              <View style={styles.artistImagePlaceholder}>
                <Ionicons name="person" size={30} color="#FFF" />
              </View>
            )}
          </View>
          
          <View style={styles.artistInfo}>
            <Text style={styles.artistName}>{item.nombreArtistico}</Text>
            <Text style={styles.artistBio} numberOfLines={2}>
              {item.biografia || 'Sin biografía disponible'}
            </Text>
            
            {item.habilidades && item.habilidades.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.habilidades.slice(0, 3).map((skill, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                  </View>
                ))}
                {item.habilidades.length > 3 && (
                  <Text style={styles.moreTag}>+{item.habilidades.length - 3}</Text>
                )}
              </View>
            )}
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation(); // Evitar que el toque se propague al elemento padre
                toggleFavorite(item);
              }}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#FF3A5E" : "#999"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.detailButton}
              onPress={() => handleViewArtistDetails(item)}
            >
              <Ionicons 
                name={isSelected ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#FF3A5E" 
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        
        {isSelected && renderArtistDetails()}
      </View>
    );
  };

  return (
    <View style={styles.modalContainer}>
      <View style={[styles.modalContent, { maxHeight: windowHeight * 0.9 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfiles de Artistas</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FF3A5E" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#FF3A5E" style={styles.loader} />
        ) : artists.length > 0 ? (
          <FlatList
            data={artists}
            renderItem={renderArtistItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.artistsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay perfiles de artistas disponibles</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.95)', // Fondo negro casi opaco
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // Mayor prioridad para estar por encima de todo
    paddingTop: 35, // Margen para respetar la barra de estado
  },
  modalContent: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 5,
  },
  loader: {
    marginVertical: 20,
  },
  artistsList: {
    paddingBottom: 20,
  },
  artistItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#333',
    // Añadir efecto de presión para indicar que es presionable
    activeOpacity: 0.7,
  },
  selectedArtistItem: {
    borderColor: '#FF3A5E',
    borderWidth: 2,
    backgroundColor: '#2D2D2D',
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
  },
  detailButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3A5E',
    textShadowColor: 'rgba(255, 58, 94, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  closeDetailsButton: {
    padding: 5,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsScrollView: {
    maxHeight: undefined, // Eliminar la restricción de altura máxima
    flex: 1,
  },
  detailsScrollViewContent: {
    paddingBottom: 50, // Más espacio adicional al final para mejor experiencia de desplazamiento
    flexGrow: 1, // Asegurar que el contenido pueda crecer
  },
  detailsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FF3A5E', // Mantener el color de acento rojo que prefiere el usuario
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: '80%', // Limitar la altura del contenedor de detalles al 80% de la pantalla
    flex: 1, // Permitir que el contenedor crezca
  },
  detailSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  biographyText: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    color: '#CCC',
    marginLeft: 10,
    fontSize: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailTag: {
    backgroundColor: '#333',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  detailTagText: {
    color: '#FFF',
    fontSize: 13,
  },
  experienceText: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  socialUrlsContainer: {
    marginTop: 10,
  },
  socialUrlText: {
    color: '#CCC',
    fontSize: 12,
    marginBottom: 5,
  },
  socialUrlLabel: {
    fontWeight: 'bold',
    color: '#FF3A5E',
  },
  portfolioSection: {
    marginTop: 10,
  },
  portfolioSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DDD',
    marginBottom: 8,
  },
  portfolioItemContainer: {
    marginBottom: 12,
  },
  portfolioItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  portfolioItemExpanded: {
    backgroundColor: '#333',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  portfolioItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  portfolioItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  portfolioItemDescription: {
    fontSize: 12,
    color: '#CCC',
    marginBottom: 4,
  },
  portfolioItemDate: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  portfolioItemPreview: {
    fontSize: 12,
    color: '#CCC',
    marginTop: 4,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  portfolioItemDetails: {
    padding: 12,
    backgroundColor: '#222',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#333',
    borderBottomColor: '#333',
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 10,
  },
  detailRow: {
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    color: '#CCC',
  },
  portfolioLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 6,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  portfolioLinkText: {
    fontSize: 12,
    color: '#FF3A5E',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  portfolioImagesSection: {
    marginTop: 10,
  },
  portfolioImagesCount: {
    fontSize: 12,
    color: '#CCC',
    fontStyle: 'italic',
  },
  debugSection: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  debugText: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    width: '100%',
    borderLeftWidth: 2,
    borderLeftColor: '#FF3A5E',
  },
  imageIndex: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  imageUrl: {
    color: '#CCC',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  portfolioImageContainer: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  portfolioImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#222',
  },
  portfolioTitleContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FF3A5E',
    paddingBottom: 8,
  },
  portfolioDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  profileStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  profileStatusText: {
    fontSize: 14,
    color: '#CCC',
  },
  noDataText: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#CCC',
    marginTop: 10,
    fontSize: 14,
  },
  bottomSpace: {
    height: 20,
  },
  artistImageContainer: {
    marginRight: 15,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3A5E',
    overflow: 'hidden',
  },
  artistImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  artistImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
    textShadowColor: 'rgba(255, 58, 94, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  artistBio: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 8,
    lineHeight: 18,
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
    borderWidth: 1,
    borderColor: '#555',
  },
  tagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  moreTag: {
    color: '#999',
    fontSize: 12,
    marginLeft: 5,
    alignSelf: 'center',
  },
  favoriteButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ArtistProfilesModal;
