import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpacesModalStyles';
import { isValidImageUri } from '../services/CulturalSpacesService';

const SpaceImages = ({ images }) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return (
      <View style={styles.noImageContainer}>
        <Ionicons name="image-outline" size={80} color="#444" />
        <Text style={styles.noImageText}>No hay imágenes disponibles</Text>
      </View>
    );
  }

  // Filtrar imágenes válidas
  const validImages = images.filter(img => isValidImageUri(img));
  
  if (validImages.length === 0) {
    return (
      <View style={styles.noImageContainer}>
        <Ionicons name="image-outline" size={80} color="#444" />
        <Text style={styles.noImageText}>No hay imágenes disponibles</Text>
      </View>
    );
  }

  return (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.imagesScrollView}
      >
        {validImages.map((image, index) => (
          <View key={`image-container-${index}`} style={styles.imageContainer}>
            {index === 0 && (
              <View style={styles.imageOverlay}>
                <Text style={styles.imageOverlayText}>Hace 10 días</Text>
              </View>
            )}
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
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SpaceImages;
