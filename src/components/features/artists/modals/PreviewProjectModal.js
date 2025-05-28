import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/ArtistPortfolioStyles';

// Colores de acento del tema importados desde el archivo de estilos
const { ACCENT_COLOR, LIGHT_TEXT, DARK_BG } = styles;

const PreviewProjectModal = ({ 
  visible, 
  onClose, 
  selectedItem,
  currentImageIndex,
  setCurrentImageIndex,
  onDeleteItem
}) => {
  const handleNextImage = () => {
    if (selectedItem && selectedItem.images && selectedItem.images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % selectedItem.images.length;
      setCurrentImageIndex(nextIndex);
    }
  };

  const handlePrevImage = () => {
    if (selectedItem && selectedItem.images && selectedItem.images.length > 1) {
      const prevIndex = currentImageIndex;
      setCurrentImageIndex(
        prevIndex === 0 ? selectedItem.images.length - 1 : prevIndex - 1
      );
    }
  };

  if (!selectedItem) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={LIGHT_TEXT} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Detalles del proyecto</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.previewContainer}>
          <View style={styles.previewImageContainer}>
            {selectedItem.images && selectedItem.images.length > 0 ? (
              <>
                <Image 
                  source={{ uri: selectedItem.images[currentImageIndex] }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                
                {selectedItem.images.length > 1 && (
                  <>
                    <TouchableOpacity 
                      style={[styles.imageNavButton, styles.prevButton]}
                      onPress={handlePrevImage}
                    >
                      <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.imageNavButton, styles.nextButton]}
                      onPress={handleNextImage}
                    >
                      <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={60} color="#666" />
                <Text style={styles.noImageText}>No hay imagen disponible</Text>
              </View>
            )}

            {/* Miniaturas de imágenes */}
            {selectedItem.images && selectedItem.images.length > 1 && (
              <ScrollView 
                horizontal 
                style={styles.thumbnailsContainer}
                showsHorizontalScrollIndicator={false}
              >
                {selectedItem.images.map((img, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => setCurrentImageIndex(index)}
                    style={[
                      styles.thumbnailWrapper,
                      currentImageIndex === index && styles.activeThumbnail
                    ]}
                  >
                    <Image 
                      source={{ uri: img }} 
                      style={styles.thumbnailImage}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle}>{selectedItem.title}</Text>
            <Text style={styles.previewDate}>
              {new Date(selectedItem.date).toLocaleDateString()}
            </Text>
            <Text style={styles.previewDescription}>{selectedItem.description}</Text>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => onDeleteItem(selectedItem.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Eliminar proyecto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PreviewProjectModal;
