import React from 'react';
import { View, ScrollView, Image, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpaceStyles';

const ImageGallery = ({ images, isEditing, onPickImage, onRemoveImage }) => {
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
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => onRemoveImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3A5E" />
                  </TouchableOpacity>
                </View>
              ))}
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
            {images.map((uri, index) => (
              <Image 
                key={index} 
                source={{ uri }} 
                style={styles.spaceImage} 
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.text}>No hay imágenes disponibles</Text>
        )
      )}
    </View>
  );
};

export default ImageGallery;
