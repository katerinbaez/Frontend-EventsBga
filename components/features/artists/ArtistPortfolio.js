import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal, 
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';
import { useAuth } from '../../../context/AuthContext';

// Colores de acento del tema
const ACCENT_COLOR = '#FF3A5E';
const DARK_BG = '#000000';
const MEDIUM_BG = '#000000';
const CARD_BG = '#000000';
const LIGHT_TEXT = '#FFFFFF';

/**
 * Pantalla para que los artistas puedan gestionar su portafolio de trabajos.
 * Permite subir, editar y eliminar proyectos artísticos con imágenes y descripciones.
 */
const ArtistPortfolio = ({ navigation, route }) => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [artistData, setArtistData] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Determinar si se debe mostrar el header basado en parámetros de navegación
  // Por defecto se muestra, pero se puede pasar showHeader: false en los parámetros
  const showHeader = route?.params?.showHeader !== false;
  
  // Estado para nuevo elemento del portafolio
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    images: [], // Cambiado de 'image' a 'images' como array
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadArtistData();
  }, []);

  useEffect(() => {
    console.log('Estado de autenticación:', { 
      isUserDefined: !!user,
      userId: user?.id,
      hasToken: !!token,
      tokenLength: token?.length || 0
    });
  }, [user, token]);

  const loadArtistData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${user.id}`);
      
      if (response.data.success) {
        setArtistData(response.data.artist);
        
        // Convertir el portafolio en un formato más fácil de usar
        if (response.data.artist.portfolio && response.data.artist.portfolio.trabajos) {
          setPortfolioItems(response.data.artist.portfolio.trabajos);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error cargando datos del artista:', error);
      setIsLoading(false);
      Alert.alert('Error', 'No pudimos cargar tu portafolio. Intenta de nuevo más tarde.');
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar imágenes');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // Permitir selección múltiple
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        // Agregar todas las imágenes seleccionadas al array existente
        const newImages = result.assets.map(asset => asset.uri);
        setNewItem({ 
          ...newItem, 
          images: [...newItem.images, ...newImages]
        });
      }
    } catch (error) {
      console.error('Error seleccionando imágenes:', error);
      Alert.alert('Error', 'No pudimos seleccionar las imágenes');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    // Filtrar el array de imágenes para eliminar la imagen en el índice especificado
    const updatedImages = newItem.images.filter((_, index) => index !== indexToRemove);
    setNewItem({ ...newItem, images: updatedImages });
  };

  const handleAddItem = async () => {
    // Validar campos requeridos
    if (!newItem.title.trim() || !newItem.description.trim() || newItem.images.length === 0) {
      Alert.alert('Datos incompletos', 'Por favor completa todos los campos y añade al menos una imagen');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Crear el nuevo elemento del portafolio con las imágenes locales
      // Esto es provisional en desarrollo hasta implementar una solución de almacenamiento
      const newPortfolioItem = {
        id: Date.now().toString(), // Generar un ID único
        title: newItem.title,
        description: newItem.description,
        imageUrl: newItem.images[0], // Para compatibilidad con el código existente, usar la primera imagen como principal
        images: newItem.images, // Guardar todas las imágenes
        date: newItem.date
      };
      
      // Crear una copia del array de trabajos actual o inicializarlo si está vacío
      const updatedItems = portfolioItems ? [...portfolioItems, newPortfolioItem] : [newPortfolioItem];
      
      // Preparar el objeto portfolio completo
      const updatedPortfolio = {
        trabajos: updatedItems,
        imagenes: artistData?.portfolio?.imagenes || []
      };
      
      // Convertir el objeto portfolio a una cadena JSON para enviarlo al backend
      const formData = new FormData();
      formData.append('portfolio', JSON.stringify(updatedPortfolio));
      
      // Actualizar el portafolio en el backend
      const updateResponse = await axios.put(
        `${BACKEND_URL}/api/artists/profile/${user.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token || ''}`
          }
        }
      );
      
      if (updateResponse.data.success) {
        // Actualizar el estado local
        setPortfolioItems(updatedItems);
        setShowAddModal(false);
        
        // Resetear el estado para un nuevo elemento
        setNewItem({
          title: '',
          description: '',
          images: [], // Resetear a un array vacío
          date: new Date().toISOString().split('T')[0]
        });
        
        Alert.alert('Éxito', 'Proyecto agregado al portafolio');
      } else {
        throw new Error(updateResponse.data.message || 'Error actualizando el portafolio');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error agregando proyecto al portafolio:', error);
      setIsLoading(false);
      
      // Mostrar un mensaje de error específico si está disponible
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      Alert.alert('Error', `No se pudo agregar el proyecto: ${errorMessage}`);

      // SOLO PARA DESARROLLO: simulación de éxito para testing
      if (process.env.NODE_ENV === 'development') {
        const newPortfolioItem = {
          id: Date.now().toString(),
          title: newItem.title,
          description: newItem.description,
          imageUrl: newItem.images[0], // Usar directamente la URI local (sólo para demo)
          images: newItem.images, // Guardar todas las imágenes
          date: newItem.date
        };
        
        const updatedItems = [...portfolioItems, newPortfolioItem];
        setPortfolioItems(updatedItems);
        setShowAddModal(false);
        
        // Resetear el estado para un nuevo elemento
        setNewItem({
          title: '',
          description: '',
          images: [], // Resetear a un array vacío
          date: new Date().toISOString().split('T')[0]
        });
        
        Alert.alert('Proyecto agregado', 'Tu proyecto ha sido añadido al portafolio (modo demo)');
      }
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setCurrentImageIndex(0); // Reiniciar el índice de imagen al abrir un nuevo item
    setShowPreviewModal(true);
  };

  const nextImage = () => {
    if (selectedItem?.images?.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === selectedItem.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedItem?.images?.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? selectedItem.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de querer eliminar este proyecto de tu portafolio?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Filtrar el elemento a eliminar
              const updatedItems = portfolioItems.filter(item => item.id !== itemId);
              
              // Actualizar en el backend
              await axios.put(
                `${BACKEND_URL}/api/artists/profile/${user.id}`,
                {
                  portfolio: {
                    trabajos: updatedItems,
                    imagenes: artistData.portfolio.imagenes || []
                  }
                },
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              
              // Actualizar localmente
              setPortfolioItems(updatedItems);
              setShowPreviewModal(false);
              setSelectedItem(null);
              setIsLoading(false);
              
              Alert.alert('Eliminado', 'El proyecto ha sido eliminado de tu portafolio');
            } catch (error) {
              console.error('Error eliminando proyecto:', error);
              setIsLoading(false);
              
              // Para demo, eliminar de todas formas
              const updatedItems = portfolioItems.filter(item => item.id !== itemId);
              setPortfolioItems(updatedItems);
              setShowPreviewModal(false);
              setSelectedItem(null);
              
              Alert.alert('Proyecto eliminado', 'El proyecto ha sido eliminado (modo demo)');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
        <Text style={styles.loadingText}>Cargando portafolio...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: DARK_BG}}>
      {showHeader && (
        <View style={styles.header}>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={LIGHT_TEXT} />
          </TouchableOpacity>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: LIGHT_TEXT}}>Mi Portafolio</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add-circle" size={30} color={LIGHT_TEXT} />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Botón flotante para añadir cuando el header está oculto */}
      {!showHeader && (
        <TouchableOpacity 
          style={styles.floatingAddButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={30} color={LIGHT_TEXT} />
        </TouchableOpacity>
      )}

      {portfolioItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={80} color="#4A5568" />
          <Text style={styles.emptyStateText}>Tu portafolio está vacío</Text>
          <Text style={styles.emptyStateSubtext}>Agrega proyectos para mostrar tu trabajo</Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.emptyStateButtonText}>Añadir primer proyecto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.portfolioGrid}>
          {portfolioItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.portfolioItem}
              onPress={() => handleViewItem(item)}
            >
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Modal para añadir nuevo proyecto */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir nuevo proyecto</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
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
                          style={styles.selectedImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity 
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage(index)}
                        >
                          <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={50} color="#aaa" />
                    <Text style={styles.imagePlaceholderText}>Seleccionar imágenes</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddItem}
              >
                <Text style={styles.saveButtonText}>Guardar proyecto</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para visualizar un proyecto */}
      <Modal
        visible={showPreviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPreviewModal(false)}
      >
        {selectedItem && (
          <View style={styles.previewModalContainer}>
            <View style={styles.previewModalContent}>
              <TouchableOpacity 
                style={styles.closePreviewButton}
                onPress={() => setShowPreviewModal(false)}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.imageCarouselContainer}>
                {/* Imagen principal */}
                <Image 
                  source={{ uri: selectedItem.images ? selectedItem.images[currentImageIndex] : selectedItem.imageUrl }} 
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                
                {/* Controles del carrusel si hay más de una imagen */}
                {selectedItem.images && selectedItem.images.length > 1 && (
                  <View style={styles.carouselControls}>
                    <TouchableOpacity style={styles.carouselButton} onPress={prevImage}>
                      <Ionicons name="chevron-back" size={30} color="#fff" />
                    </TouchableOpacity>
                    
                    <Text style={styles.imageCounter}>
                      {currentImageIndex + 1}/{selectedItem.images.length}
                    </Text>
                    
                    <TouchableOpacity style={styles.carouselButton} onPress={nextImage}>
                      <Ionicons name="chevron-forward" size={30} color="#fff" />
                    </TouchableOpacity>
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
                  onPress={() => handleDeleteItem(selectedItem.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Eliminar proyecto</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DARK_BG,
  },
  loadingText: {
    marginTop: 10,
    color: LIGHT_TEXT,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FF3A5E',
    marginTop: 45,         // Margen superior aumentado para respetar la barra de estado
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginHorizontal: 5,   // Margen horizontal para que no ocupe todo el ancho
    elevation: 4,          // Sombra para Android
    shadowColor: '#000',   // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
  },
  addButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: 10,
    textAlign: 'center',
    maxWidth: '80%',
  },
  emptyStateButton: {
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
  },
  emptyStateButtonText: {
    color: LIGHT_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  portfolioItem: {
    width: '48%',
    marginHorizontal: '1%',
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: CARD_BG,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  itemImage: {
    width: '100%',
    height: 150,
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageSelector: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  imageGridItem: {
    width: '30%',
    height: 100,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: LIGHT_TEXT,
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  previewModalContent: {
    width: '90%',
    maxHeight: '90%',
    alignSelf: 'center',
    borderRadius: 15,
    overflow: 'hidden',
  },
  closePreviewButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  imageCarouselContainer: {
    backgroundColor: '#000',
    position: 'relative',
  },
  carouselControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
  },
  carouselButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  imageCounter: {
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  thumbnailsContainer: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#FF3A5E',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  previewInfo: {
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginBottom: 5,
  },
  previewDate: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 15,
  },
  previewDescription: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 24,
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: ACCENT_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  deleteButtonText: {
    color: LIGHT_TEXT,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACCENT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ArtistPortfolio;
