import React, { useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpaceStyles';

// Estilos adicionales para evitar estilos inline
const additionalStyles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    zIndex: 1,
    left: '50%',
    top: '50%',
    marginLeft: -15,
    marginTop: -15
  },
  galleryItemContainer: {
    position: 'relative'
  },
  galleryLoader: {
    position: 'absolute',
    zIndex: 1,
    left: '50%',
    top: '50%',
    marginLeft: -20,
    marginTop: -20
  },
  imagePlaceholder: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8
  },
  previewImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8
  }
});

const ImageGallery = ({ images, isEditing, onPickImage, onRemoveImage }) => {
  const [loadingImages, setLoadingImages] = useState({});
  const [errorImages, setErrorImages] = useState({});

  const handleImageLoad = (index) => {
    const safeIndex = String(index);
    setLoadingImages(prev => {
      const newState = { ...prev };
      newState[safeIndex] = false;
      return newState;
    });
  };

  const handleImageError = (index) => {
    const safeIndex = String(index);
    setErrorImages(prev => {
      const newState = { ...prev };
      newState[safeIndex] = true;
      return newState;
    });
    console.warn(`Error loading image at index ${safeIndex}`);
  };

  // Función para normalizar URLs
  const normalizeUri = (uri) => {
    if (!uri) return null;
    
    // Asegurarse de que la URI sea una cadena
    const uriStr = String(uri);
    
    // Si la URI ya tiene un esquema (http://, https://, file://, etc.), devolverla tal cual
    if (uriStr.match(/^(http|https|file|content|data):/i)) {
      return uriStr;
    }
    
    // Si es una ruta relativa, convertirla a una URI de archivo
    if (uriStr.startsWith('/')) {
      return `file://${uriStr}`;
    }
    
    // Si no tiene un esquema, asumir que es http
    return `https://${uriStr}`;
  };

  // Función para verificar si una URI es válida
  const isValidImageUri = (uri) => {
    if (!uri) return false;
    try {
      // Verificar que sea una cadena y no esté vacía
      return typeof uri === 'string' && uri.trim().length > 0;
    } catch (error) {
      console.warn('Error validando URI de imagen:', error);
      return false;
    }
  };

  return (
    <View style={styles.section}>
      {isEditing ? (
        <>
          <TouchableOpacity style={styles.imagePickerButton} onPress={onPickImage}>
            <Ionicons name="image-outline" size={24} color="#4A90E2" />
            <Text style={styles.imagePickerText}>Añadir Imagen</Text>
          </TouchableOpacity>
          
          {images && images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((uri, index) => {
                const normalizedUri = normalizeUri(uri);
                return (
                  <View key={index} style={styles.imagePreview}>
                    {loadingImages[String(index)] !== false && (
                      <ActivityIndicator 
                        size="small" 
                        color="#FF3A5E" 
                        style={additionalStyles.loaderContainer}
                      />
                    )}
                    {!errorImages[String(index)] && isValidImageUri(normalizedUri) ? (
                      <Image 
                        source={{ uri: normalizedUri }} 
                        style={styles.imagePreview}
                        onLoad={() => handleImageLoad(index)}
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <View style={additionalStyles.previewImagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#FF3A5E" />
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => onRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF3A5E" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </>
      ) : (
        images && images.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imageGallery}
          >
            {images.map((uri, index) => {
              const normalizedUri = normalizeUri(uri);
              return (
                <View key={index} style={additionalStyles.galleryItemContainer}>
                  {loadingImages[String(index)] !== false && (
                    <ActivityIndicator 
                      size="large" 
                      color="#FF3A5E" 
                      style={additionalStyles.galleryLoader}
                    />
                  )}
                  {!errorImages[String(index)] && isValidImageUri(normalizedUri) ? (
                    <Image 
                      key={index} 
                      source={{ uri: normalizedUri }} 
                      style={styles.spaceImage} 
                      resizeMode="cover"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                    />
                  ) : (
                    <View style={[styles.spaceImage, additionalStyles.imagePlaceholder]}>
                      <Ionicons name="image-outline" size={60} color="#FF3A5E" />
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.text}>No hay imágenes disponibles</Text>
        )
      )}
    </View>
  );
};

export default ImageGallery;
