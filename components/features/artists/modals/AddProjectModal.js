import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../../../../styles/ArtistPortfolioStyles';

// Colores de acento del tema importados desde el archivo de estilos
const { ACCENT_COLOR, LIGHT_TEXT } = styles;

const AddProjectModal = ({ 
  visible, 
  onClose, 
  newItem, 
  setNewItem, 
  onAddItem 
}) => {
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar imágenes');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Obtener las URIs de las imágenes seleccionadas
        const selectedImages = result.assets.map(asset => asset.uri);
        
        // Actualizar el estado con las nuevas imágenes
        setNewItem({
          ...newItem,
          images: [...newItem.images, ...selectedImages].slice(0, 5) // Limitar a 5 imágenes
        });
      }
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error);
      Alert.alert('Error', 'No pudimos seleccionar las imágenes');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    // Filtrar el array de imágenes para eliminar la imagen en el índice especificado
    const updatedImages = newItem.images.filter((_, index) => index !== indexToRemove);
    setNewItem({ ...newItem, images: updatedImages });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Añadir nuevo proyecto</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          <Text style={styles.inputLabel}>Título del proyecto *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Exposición de pinturas contemporáneas"
            value={newItem.title}
            onChangeText={(text) => setNewItem({...newItem, title: text})}
            maxLength={50}
          />

          <Text style={styles.inputLabel}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe este proyecto: técnicas, inspiración, proceso..."
            value={newItem.description}
            onChangeText={(text) => setNewItem({...newItem, description: text})}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <Text style={styles.inputLabel}>Imágenes del proyecto *</Text>
          <TouchableOpacity 
            style={styles.imageSelector}
            onPress={handlePickImage}
          >
            {newItem.images.length > 0 ? (
              <View style={styles.imageGrid}>
                {newItem.images.map((image, index) => (
                  <View key={index} style={styles.imageGridItem}>
                    <Image 
                      source={{ uri: image }} 
                      style={styles.imageGridThumb} 
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={ACCENT_COLOR} />
                    </TouchableOpacity>
                  </View>
                ))}
                {newItem.images.length < 5 && (
                  <TouchableOpacity 
                    style={styles.addMoreImagesButton}
                    onPress={handlePickImage}
                  >
                    <Ionicons name="add" size={30} color="#000000" />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                <Ionicons 
                  name="images-outline" 
                  size={70} 
                  color="#000000" 
                  style={styles.imageSelectorIcon} 
                />
                <Text style={styles.imageSelectorText}>
                  Toca para seleccionar imágenes
                </Text>
                <Text style={styles.imageSelectorSubtext}>
                  Puedes seleccionar hasta 5 imágenes
                </Text>
              </>
            )}
          </TouchableOpacity>

          

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={onAddItem}
          >
            <Text style={styles.submitButtonText}>Guardar proyecto</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AddProjectModal;
