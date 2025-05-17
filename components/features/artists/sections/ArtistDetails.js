import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../../styles/ArtistProfilesModalStyles';

/**
 * Componente para mostrar los detalles de un artista
 */
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
          {/* Biografía */}
          <BiografiaSection biografia={artist.biografia} />
          
          {/* Información de contacto */}
          <ContactoSection contacto={artist.contacto} />
          
          {/* Habilidades */}
          <HabilidadesSection habilidades={artist.habilidades} />
          
          {/* Portfolio */}
          <PortfolioSection 
            portfolio={artist.portfolio} 
            artistId={artist.id}
            expandedTrabajoId={expandedTrabajoId}
            setExpandedTrabajoId={setExpandedTrabajoId}
          />
          
          {/* Redes Sociales */}
          <RedesSocialesSection redesSociales={artist.redesSociales} />
          
          <View style={styles.bottomSpace} />
        </ScrollView>
      )}
    </View>
  );
};

/**
 * Sección de biografía
 */
const BiografiaSection = ({ biografia }) => (
  <View style={styles.detailSection}>
    <Text style={styles.sectionTitle}>Biografía</Text>
    <Text style={styles.biographyText}>
      {biografia || 'Este artista no ha proporcionado una biografía.'}
    </Text>
  </View>
);

/**
 * Sección de información de contacto
 */
const ContactoSection = ({ contacto }) => (
  <View style={styles.detailSection}>
    <Text style={styles.sectionTitle}>Información de Contacto</Text>
    
    {/* Verificar si existe contacto y sus propiedades */}
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
    
    {/* Verificar si no hay información de contacto */}
    {(!contacto || 
      (!contacto.email && !contacto.telefono && !contacto.ciudad)) && (
      <Text style={styles.noDataText}>No hay información de contacto disponible</Text>
    )}
  </View>
);

/**
 * Sección de habilidades
 */
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

/**
 * Componente para mostrar un trabajo individual del portfolio
 */
const TrabajoItem = ({ trabajo, index, artistId, expandedTrabajoId, setExpandedTrabajoId }) => {
  // Si trabajo es null o undefined, mostrar un mensaje genérico
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
  
  // Si trabajo es un string, mostrarlo directamente
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
  
  // Crear un ID único para este trabajo
  const trabajoId = `${artistId}-${index}`;
  const isExpanded = expandedTrabajoId === trabajoId;
  
  // Para trabajos que son objetos
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
            if (["titulo", "title", "id", "imageUrl", "ImageUrl", "imagenUrl", "imagen"].includes(key)) return null;
            
            // Ignorar cualquier campo que contenga URLs o rutas de archivo
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
            
            // Si el valor es un objeto o array, convertirlo a string
            const displayValue = typeof value === "object" 
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
};

/**
 * Sección de portfolio
 */
const PortfolioSection = ({ portfolio, artistId, expandedTrabajoId, setExpandedTrabajoId }) => (
  <View style={styles.detailSection}>
    <Text style={styles.sectionTitle}>Portfolio</Text>
    
    {portfolio ? (
      <>
        {/* Trabajos */}
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
        
        {/* Imágenes */}
        {portfolio.imagenes && portfolio.imagenes.length > 0 ? (
          <View style={styles.portfolioImagesSection}>
            <Text style={styles.portfolioSubtitle}>Galería</Text>
            <Text style={styles.portfolioImagesCount}>
              {portfolio.imagenes.length} imagen(es) disponible(s)
            </Text>
            {/* Lista de imágenes */}
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

/**
 * Sección de redes sociales
 */
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
