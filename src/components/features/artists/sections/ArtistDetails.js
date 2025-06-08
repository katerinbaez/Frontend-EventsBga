/**
 * Este archivo maneja los detalles del artista
 * - Perfil
 * - Trabajos
 * - Contacto
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../../styles/ArtistProfilesModalStyles';


const ArtistDetails = ({ 
  artist, 
  loadingDetails, 
  onClose, 
  expandedTrabajoId,
  setExpandedTrabajoId 
}) => {
  if (!artist) return null;
  
  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>Detalles del Perfil</Text>
        <TouchableOpacity 
          onPress={onClose}
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
        <ScrollView style={styles.detailsScrollView}>
          <BiografiaSection biografia={artist.biografia} />
          
          <ContactoSection contacto={artist.contacto} />
          
          <HabilidadesSection habilidades={artist.habilidades} />
          
          <PortfolioSection 
            portfolio={artist.portfolio} 
            artistId={artist.id}
            expandedTrabajoId={expandedTrabajoId}
            setExpandedTrabajoId={setExpandedTrabajoId}
          />
          
          <RedesSocialesSection redesSociales={artist.redesSociales} />
          
          <View style={styles.bottomSpace} />
        </ScrollView>
      )}
    </View>
  );
};

const BiografiaSection = ({ biografia }) => (
  <View style={styles.detailSection}>
    <Text style={styles.sectionTitle}>Biografía</Text>
    <Text style={styles.biographyText}>
      {biografia || 'Este artista no ha proporcionado una biografía.'}
    </Text>
  </View>
);

const ContactoSection = ({ contacto }) => (
  <View style={styles.detailSection}>
    <Text style={styles.sectionTitle}>Información de Contacto</Text>
    
    {contacto && contacto.email && (
      <TouchableOpacity 
        onPress={() => Linking.openURL(`mailto:${contacto.email}`)}
        style={styles.contactRow}
      >
        <Ionicons name="mail" size={18} color="#FF3A5E" />
        <Text style={styles.contactText}>{contacto.email}</Text>
      </TouchableOpacity>
    )}
    
    {contacto && contacto.telefono && (
      <TouchableOpacity 
        onPress={() => Linking.openURL(`tel:${contacto.telefono}`)}
        style={styles.contactRow}
      >
        <Ionicons name="call" size={18} color="#FF3A5E" />
        <Text style={styles.contactText}>{contacto.telefono}</Text>
      </TouchableOpacity>
    )}
    
    {contacto && contacto.ciudad && (
      <View style={styles.contactRow}>
        <Ionicons name="location" size={18} color="#FF3A5E" />
        <Text style={styles.contactText}>{contacto.ciudad}</Text>
      </View>
    )}
    
    {(!contacto || 
      (!contacto.email && !contacto.telefono && !contacto.ciudad)) && (
      <Text style={styles.noDataText}>No hay información de contacto disponible</Text>
    )}
  </View>
);

const HabilidadesSection = ({ habilidades }) => (
  <View style={styles.detailSection}>
    <Text style={styles.sectionTitle}>Habilidades</Text>
    {habilidades && habilidades.length > 0 ? (
      <View style={styles.skillsContainer}>
        {habilidades.map((skill, index) => (
          <View key={index} style={styles.detailTag}>
            <Text style={styles.detailTagText}>{skill}</Text>
          </View>
        ))}
      </View>
    ) : (
      <Text style={styles.noDataText}>No hay habilidades registradas</Text>
    )}
  </View>
);

const TrabajoItem = ({ trabajo, index, artistId, expandedTrabajoId, setExpandedTrabajoId }) => {
  if (!trabajo) {
    return (
      <View style={styles.portfolioItemContainer}>
        <View style={styles.portfolioItem}>
          <Text style={styles.portfolioItemTitle}>Trabajo {index + 1}</Text>
          <Text style={styles.portfolioItemDescription}>No hay detalles disponibles</Text>
        </View>
      </View>
    );
  }
  
  if (typeof trabajo === 'string') {
    return (
      <View style={styles.portfolioItemContainer}>
        <View style={styles.portfolioItem}>
          <Text style={styles.portfolioItemTitle}>Trabajo {index + 1}</Text>
          <Text style={styles.portfolioItemDescription}>{trabajo}</Text>
        </View>
      </View>
    );
  }
  
  const trabajoId = `${artistId}-${index}`;
  const isExpanded = expandedTrabajoId === trabajoId;
  
  return (
    <View style={styles.portfolioItemContainer}>
      <TouchableOpacity 
        style={[styles.portfolioItem, isExpanded && styles.portfolioItemExpanded]}
        onPress={() => {
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
        
        {trabajo.fecha && (
          <Text style={styles.portfolioItemDate}>{trabajo.fecha}</Text>
        )}
        
        {trabajo.descripcion && (
          <Text style={styles.portfolioItemPreview} numberOfLines={1}>
            {trabajo.descripcion}
          </Text>
        )}
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.portfolioItemDetails}>
          <Text style={styles.detailSectionTitle}>Detalles del trabajo</Text>
          
          {(trabajo.titulo || trabajo.title) && (
            <View style={styles.portfolioTitleContainer}>
              <Text style={styles.portfolioDetailTitle}>
                {trabajo.titulo || trabajo.title}
              </Text>
            </View>
          )}
          
          {(() => {
            const images = [];
            
            const mainImage = trabajo.imageUrl || trabajo.ImageUrl || trabajo.imagenUrl || trabajo.imagen;
            if (mainImage) images.push(mainImage);
            
            if (trabajo.images && Array.isArray(trabajo.images) && trabajo.images.length > 0) {
              // Añadir todas las imágenes del array que no sean la principal
              trabajo.images.forEach(img => {
                if (img && img !== mainImage) images.push(img);
              });
            }
            
            if (images.length === 0) return null;
            
            if (images.length === 1) {
              return (
                <View style={styles.portfolioImageContainer}>
                  <Image 
                    source={{ uri: images[0] }} 
                    style={styles.portfolioImage}
                    resizeMode="cover"
                  />
                </View>
              );
            }
            
            const scrollViewRef = React.useRef(null);
            const [currentImageIndex, setCurrentImageIndex] = useState(0);
            
            const handleScroll = (event) => {
              const contentOffsetX = event.nativeEvent.contentOffset.x;
              const width = event.nativeEvent.layoutMeasurement.width;
              const newIndex = Math.round(contentOffsetX / width);
              
              if (newIndex !== currentImageIndex) {
                setCurrentImageIndex(newIndex);
              }
            };
            
            const screenWidth = Dimensions.get('window').width;
            const imageWidth = screenWidth - 40;
            
            return (
              <View style={styles.carouselContainer}>
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={handleScroll}
                  snapToInterval={imageWidth} 
                  decelerationRate="fast" 
                  contentContainerStyle={{ flexGrow: 0 }}
                >
                  {images.map((imageUri, index) => (
                    <View key={index} style={[styles.portfolioImageContainer, { width: imageWidth }]}>
                      {imageUri ? (
                        <Image 
                          source={{ uri: imageUri }} 
                          style={styles.portfolioImage}
                          resizeMode="cover"
                          onError={(e) => console.error('Error cargando imagen:', e.nativeEvent.error)}
                        />
                      ) : (
                        <View style={[styles.portfolioImage, { justifyContent: 'center', alignItems: 'center' }]}>
                          <Ionicons name="image-outline" size={50} color="#666" />
                          <Text style={{ color: '#666', marginTop: 10 }}>No se pudo cargar la imagen</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
                <Text style={styles.imageCounter}>
                  {currentImageIndex + 1}/{images.length}
                </Text>
              </View>
            );
          })()}
          
          {Object.entries(trabajo).map(([key, value]) => {
            if (["titulo", "title", "id", "imageUrl", "ImageUrl", "imagenUrl", "imagen"].includes(key)) return null;
            
            const valueStr = String(value).toLowerCase();
            if (valueStr.includes("http://") || 
                valueStr.includes("https://") || 
                valueStr.includes("file://") || 
                valueStr.includes("/data/user/") || 
                valueStr.includes(".png") || 
                valueStr.includes(".jpg") || 
                valueStr.includes(".jpeg") || 
                key.toLowerCase().includes("url")) {
              return null;
            }
            
            const displayValue = typeof value === "object" 
              ? JSON.stringify(value) 
              : String(value);
            
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
            
            return (
              <View key={key} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{fieldName}:</Text>
                <Text style={styles.detailValue}>{displayValue}</Text>
              </View>
            );
          })}
          
          {trabajo.url && (
            <TouchableOpacity 
              style={styles.portfolioLink}
              onPress={() => Linking.openURL(trabajo.url)}
            >
              <Ionicons name="link" size={16} color="#FF3A5E" />
              <Text style={styles.portfolioLinkText}>Ver proyecto</Text>
            </TouchableOpacity>
          )}
          
          {Object.keys(trabajo).length === 0 && (
            <Text style={styles.noDataText}>No hay detalles disponibles para este trabajo.</Text>
          )}
        </View>
      )}
    </View>
  );
};


const PortfolioSection = ({ portfolio, artistId, expandedTrabajoId, setExpandedTrabajoId }) => (
  <View style={styles.detailSection}>
    <Text style={styles.sectionTitle}>Portfolio</Text>
    
    {portfolio ? (
      <>
        {portfolio.trabajos && portfolio.trabajos.length > 0 ? (
          <View style={styles.portfolioSection}>
            <Text style={styles.portfolioSubtitle}>Trabajos Destacados</Text>
            {portfolio.trabajos.map((trabajo, index) => (
              <TrabajoItem 
                key={index}
                trabajo={trabajo} 
                index={index} 
                artistId={artistId}
                expandedTrabajoId={expandedTrabajoId}
                setExpandedTrabajoId={setExpandedTrabajoId}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>No hay trabajos en el portfolio</Text>
        )}
        
        {portfolio.imagenes && portfolio.imagenes.length > 0 ? (
          <View style={styles.portfolioImagesSection}>
            <Text style={styles.portfolioSubtitle}>Galería</Text>
            <Text style={styles.portfolioImagesCount}>
              {portfolio.imagenes.length} imagen(es) disponible(s)
            </Text>
            <View style={styles.imageGrid}>
              {portfolio.imagenes.map((imagen, index) => (
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
);

const RedesSocialesSection = ({ redesSociales }) => {
  if (!redesSociales || Object.keys(redesSociales).length === 0) return null;
  
  return (
    <View style={styles.detailSection}>
      <Text style={styles.sectionTitle}>Redes Sociales</Text>
      <View style={styles.socialLinksContainer}>
        {redesSociales.facebook && (
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL(redesSociales.facebook)}
          >
            <Ionicons name="logo-facebook" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
        {redesSociales.instagram && (
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL(redesSociales.instagram)}
          >
            <Ionicons name="logo-instagram" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
        {redesSociales.twitter && (
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL(redesSociales.twitter)}
          >
            <Ionicons name="logo-twitter" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
        {redesSociales.youtube && (
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL(redesSociales.youtube)}
          >
            <Ionicons name="logo-youtube" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ArtistDetails;
