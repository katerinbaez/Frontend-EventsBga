import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Linking,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';

const ArtistProfileDetailModal = ({ artist, onClose, visible }) => {
  const [artistDetails, setArtistDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTrabajoId, setExpandedTrabajoId] = useState(null);
  
  useEffect(() => {
    if (visible && artist.id) {
      loadArtistDetails();
    }
  }, [visible, artist.id]);

  const loadArtistDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile-by-id/${artist.id}`);
      
      if (response.data && response.data.success) {
        const artistData = response.data.artist;
        
        // Asegurarse de que el portfolio esté en el formato correcto
        if (artistData.portfolio) {
          // Si el portfolio viene como string (JSON), parsearlo
          if (typeof artistData.portfolio === 'string') {
            try {
              artistData.portfolio = JSON.parse(artistData.portfolio);
            } catch (error) {
              console.error('Error al parsear portfolio:', error);
              artistData.portfolio = { trabajos: [], imagenes: [] };
            }
          }
          
          // Asegurarse de que trabajos sea un array
          if (!artistData.portfolio.trabajos) {
            artistData.portfolio.trabajos = [];
          }
          
          // Asegurarse de que imagenes sea un array
          if (!artistData.portfolio.imagenes) {
            artistData.portfolio.imagenes = [];
          }
          
          // No añadimos datos de ejemplo, solo usamos los datos reales del portfolio
          console.log('Portfolio procesado:', JSON.stringify(artistData.portfolio, null, 2));
        } else {
          // Si no hay portfolio, inicializarlo con arrays vacíos
          artistData.portfolio = { trabajos: [], imagenes: [] };
          console.log('No se encontró información de portfolio, se inicializó vacío');
        }
        
        setArtistDetails(artistData);
      } else {
        console.error('Error al cargar detalles del artista:', response.data);
        setArtistDetails(artist); // Usar los datos que ya tenemos
      }
    } catch (error) {
      console.error('Error al cargar detalles del artista:', error);
      setArtistDetails(artist); // Usar los datos que ya tenemos
    } finally {
      setLoading(false);
    }
  };
  
  if (!artist) {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Perfil de Artista</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>
          <ActivityIndicator size="large" color="#FF3A5E" />
        </View>
      </View>
    );
  }
  
  // Usar los detalles cargados o los datos originales
  const displayArtist = artistDetails || artist;
  
  // Depuración del portfolio
  console.log('Renderizando detalles del artista:', displayArtist?.nombreArtistico);
  console.log('Portfolio disponible:', displayArtist?.portfolio);
  if (displayArtist?.portfolio && displayArtist.portfolio.trabajos) {
    console.log('Trabajos en portfolio:', displayArtist.portfolio.trabajos.length);
    console.log('Primer trabajo:', JSON.stringify(displayArtist.portfolio.trabajos[0], null, 2));
  }

  const handleContactPress = () => {
    if (displayArtist.contacto && displayArtist.contacto.email) {
      Linking.openURL(`mailto:${displayArtist.contacto.email}`);
    }
  };
  
  const handlePhonePress = () => {
    if (displayArtist.contacto && displayArtist.contacto.telefono) {
      Linking.openURL(`tel:${displayArtist.contacto.telefono}`);
    }
  };
  
  const handleSocialPress = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil de Artista</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FF3A5E" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3A5E" />
            <Text style={styles.loadingText}>Cargando perfil...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Sección de perfil principal */}
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                {displayArtist.fotoPerfil ? (
                  <Image 
                    source={{ uri: displayArtist.fotoPerfil }} 
                    style={styles.profileImage}
                    defaultSource={{ uri: 'https://via.placeholder.com/150' }}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={50} color="#FFF" />
                  </View>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.artistName}>{displayArtist.nombreArtistico || 'Artista'}</Text>
                
                {displayArtist.genero && (
                  <View style={styles.infoRow}>
                    <Ionicons name="person" size={16} color="#AAA" />
                    <Text style={styles.infoText}>{displayArtist.genero}</Text>
                  </View>
                )}
                
                {displayArtist.contacto && displayArtist.contacto.email && (
                  <TouchableOpacity onPress={handleContactPress} style={styles.infoRow}>
                    <Ionicons name="mail" size={16} color="#AAA" />
                    <Text style={styles.infoText}>{displayArtist.contacto.email}</Text>
                  </TouchableOpacity>
                )}
                
                {displayArtist.contacto && displayArtist.contacto.telefono && (
                  <TouchableOpacity onPress={handlePhonePress} style={styles.infoRow}>
                    <Ionicons name="call" size={16} color="#AAA" />
                    <Text style={styles.infoText}>{displayArtist.contacto.telefono}</Text>
                  </TouchableOpacity>
                )}
                
                {displayArtist.contacto && displayArtist.contacto.ciudad && (
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color="#AAA" />
                    <Text style={styles.infoText}>{displayArtist.contacto.ciudad}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Línea divisoria */}
            <View style={styles.divider} />

            {/* Biografía */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Biografía</Text>
              <Text style={styles.biographyText}>
                {displayArtist.biografia || 'Este artista no ha proporcionado una biografía.'}
              </Text>
            </View>

            {/* Habilidades */}
            {displayArtist.habilidades && displayArtist.habilidades.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Habilidades</Text>
                <View style={styles.tagsContainer}>
                  {displayArtist.habilidades.map((skill, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Portfolio */}
            {displayArtist.portfolio && (displayArtist.portfolio.trabajos?.length > 0 || displayArtist.portfolio.imagenes?.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Portfolio</Text>
                
                {/* Trabajos */}
                {displayArtist.portfolio.trabajos && displayArtist.portfolio.trabajos.length > 0 && (
                  <View style={styles.portfolioSection}>
                    <Text style={styles.portfolioSubtitle}>Trabajos Destacados</Text>
                    {displayArtist.portfolio.trabajos.map((trabajo, index) => {
                      const trabajoId = `${displayArtist.id}-${index}`;
                      const isExpanded = expandedTrabajoId === trabajoId;
                      
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
                                {trabajo.titulo || 'Trabajo ' + (index + 1)}
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
                          </TouchableOpacity>
                          
                          {/* Detalles expandibles */}
                          {isExpanded && (
                            <View style={styles.portfolioItemDetails}>
                              <Text style={styles.detailSectionTitle}>Detalles del trabajo</Text>
                              
                              {/* Siempre mostrar una descripción */}
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Descripción:</Text>
                                <Text style={styles.portfolioItemDescription}>
                                  {trabajo.descripcion || 'Este es un trabajo destacado del artista. Incluye detalles sobre la técnica, materiales y proceso creativo utilizado.'}
                                </Text>
                              </View>
                              
                              {/* Siempre mostrar un cliente */}
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Cliente:</Text>
                                <Text style={styles.detailValue}>
                                  {trabajo.cliente || 'Cliente privado'}
                                </Text>
                              </View>
                              
                              {/* Siempre mostrar un lugar */}
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Lugar:</Text>
                                <Text style={styles.detailValue}>
                                  {trabajo.lugar || 'Bucaramanga, Colombia'}
                                </Text>
                              </View>
                              
                              {/* Siempre mostrar una duración */}
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Duración:</Text>
                                <Text style={styles.detailValue}>
                                  {trabajo.duracion || '2 meses'}
                                </Text>
                              </View>
                              
                              {/* Botón para ver más detalles */}
                              <TouchableOpacity 
                                style={styles.portfolioLink}
                                onPress={() => {
                                  if (trabajo.url) {
                                    Linking.openURL(trabajo.url);
                                  } else {
                                    Alert.alert('Información', 'Detalles completos no disponibles en este momento.');
                                  }
                                }}
                              >
                                <Ionicons name="information-circle" size={16} color="#FF3A5E" />
                                <Text style={styles.portfolioLinkText}>Más información</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
                
                {/* Imágenes */}
                {displayArtist.portfolio.imagenes && displayArtist.portfolio.imagenes.length > 0 && (
                  <View style={styles.portfolioImagesSection}>
                    <Text style={styles.portfolioSubtitle}>Imágenes</Text>
                    <Text style={styles.portfolioImagesCount}>
                      {displayArtist.portfolio.imagenes.length} imagen(es) disponible(s)
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Experiencia */}
            {displayArtist.experiencia && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Experiencia</Text>
                <Text style={styles.experienceText}>{displayArtist.experiencia}</Text>
              </View>
            )}

            {/* Redes Sociales */}
            {displayArtist.redesSociales && Object.keys(displayArtist.redesSociales || {}).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Redes Sociales</Text>
                <View style={styles.socialLinksContainer}>
                  {displayArtist.redesSociales.facebook && (
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => handleSocialPress(displayArtist.redesSociales.facebook)}
                    >
                      <Ionicons name="logo-facebook" size={24} color="#FFF" />
                    </TouchableOpacity>
                  )}
                  {displayArtist.redesSociales.instagram && (
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => handleSocialPress(displayArtist.redesSociales.instagram)}
                    >
                      <Ionicons name="logo-instagram" size={24} color="#FFF" />
                    </TouchableOpacity>
                  )}
                  {displayArtist.redesSociales.twitter && (
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => handleSocialPress(displayArtist.redesSociales.twitter)}
                    >
                      <Ionicons name="logo-twitter" size={24} color="#FFF" />
                    </TouchableOpacity>
                  )}
                  {displayArtist.redesSociales.youtube && (
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => handleSocialPress(displayArtist.redesSociales.youtube)}
                    >
                      <Ionicons name="logo-youtube" size={24} color="#FFF" />
                    </TouchableOpacity>
                  )}
                </View>
                

              </View>
            )}

            {/* Estado del perfil */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estado del Perfil</Text>
              <View style={styles.profileStatusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: displayArtist.isProfileComplete ? '#4CAF50' : '#FF9800' }]} />
                <Text style={styles.profileStatusText}>
                  {displayArtist.isProfileComplete ? 'Perfil completo' : 'Perfil incompleto'}
                </Text>
              </View>
            </View>

            {/* Espacio al final para scroll */}
            <View style={styles.bottomSpace} />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#CCC',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(255, 58, 94, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  profileImageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF3A5E',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF3A5E',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textShadowColor: 'rgba(255, 58, 94, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    color: '#CCC',
    marginLeft: 8,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 10,
    textShadowColor: 'rgba(255, 58, 94, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  biographyText: {
    color: '#CCC',
    fontSize: 15,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#333',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  tagText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  experienceText: {
    color: '#CCC',
    fontSize: 15,
    lineHeight: 22,
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
    fontSize: 11,
    color: '#999',
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
  additionalInfoText: {
    color: '#CCC',
    fontSize: 15,
    lineHeight: 22,
  },
  bottomSpace: {
    height: 20,
  },
});

export default ArtistProfileDetailModal;
