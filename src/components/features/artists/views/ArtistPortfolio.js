/**
 * Este archivo maneja el portafolio del artista
 * - Proyectos
 * - Imágenes
 * - Edición
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, ScrollView, Modal, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { useAuth } from '../../../../context/AuthContext';
import CloudinaryService from '../../spaces/services/CloudinaryService';
import { styles } from '../../../../styles/ArtistPortfolioStyles';
import AddProjectModal from '../modals/AddProjectModal';
import PreviewProjectModal from '../modals/PreviewProjectModal';

const { ACCENT_COLOR, DARK_BG, LIGHT_TEXT } = styles;

const ArtistPortfolio = ({ navigation, route }) => {
  const { user, token } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [artistData, setArtistData] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const showHeader = route?.params?.showHeader !== false;
  
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    images: [],
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadArtistData();
  }, []);

  useEffect(() => {
    loadArtistData();
  }, []);

 
  const loadArtistData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${user.id}`);
      
      if (response.data.success) {
        setArtistData(response.data.artist);
        
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
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        const newImages = result.assets.map(asset => asset.uri);
        
        setIsLoading(true);
        
        try {
          console.warn('Subiendo imágenes a Cloudinary...');
          const cloudinaryUrls = await CloudinaryService.uploadMultipleImages(newImages);
          console.warn('Imágenes subidas a Cloudinary:', cloudinaryUrls);
          
          setNewItem({ 
            ...newItem, 
            images: [...newItem.images, ...cloudinaryUrls]
          });
          
          Alert.alert('Éxito', 'Imágenes subidas correctamente');
        } catch (cloudinaryError) {
          console.error('Error subiendo a Cloudinary:', cloudinaryError);
          setNewItem({ 
            ...newItem, 
            images: [...newItem.images, ...newImages]
          });
          Alert.alert('Advertencia', 'No se pudieron subir las imágenes a la nube. Se usarán las imágenes locales temporalmente.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error seleccionando imágenes:', error);
      Alert.alert('Error', 'No pudimos seleccionar las imágenes');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = newItem.images.filter((_, index) => index !== indexToRemove);
    setNewItem({ ...newItem, images: updatedImages });
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim() || !newItem.description.trim() || newItem.images.length === 0) {
      Alert.alert('Datos incompletos', 'Por favor completa todos los campos y añade al menos una imagen');
      return;
    }
    
    try {
      setIsLoading(true);
      
      let cloudinaryImages = [];
      try {
        const hasLocalImages = newItem.images.some(uri => !CloudinaryService.isCloudinaryUrl(uri));
        
        if (hasLocalImages) {
          console.warn('Subiendo imágenes locales a Cloudinary antes de guardar...');
          cloudinaryImages = await CloudinaryService.uploadMultipleImages(newItem.images);
          console.warn('Imágenes subidas exitosamente:', cloudinaryImages);
          
          if (cloudinaryImages.length > 0 && cloudinaryImages.some(url => CloudinaryService.isCloudinaryUrl(url))) {
            
            setNewItem({
              ...newItem,
              images: cloudinaryImages
            });
          }
        } else {
          cloudinaryImages = newItem.images;
        }
      } catch (imageError) {
        console.warn('Error al subir imágenes a Cloudinary:', imageError);
        cloudinaryImages = newItem.images;
        Alert.alert('Advertencia', 'No se pudieron subir algunas imágenes a la nube. Se intentará guardar con las imágenes locales.');
      }
      
      const newPortfolioItem = {
        id: Date.now().toString(),
        title: newItem.title,
        description: newItem.description,
        imageUrl: cloudinaryImages[0], 
        images: cloudinaryImages,      
        date: newItem.date
      };
      
      
      const updatedItems = [...portfolioItems, newPortfolioItem];
      
      
      const formData = new FormData();
      formData.append('portfolio', JSON.stringify({
        trabajos: updatedItems,
        imagenes: artistData?.portfolio?.imagenes || []
      }));
      
      
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
        
        setPortfolioItems(updatedItems);
        setShowAddModal(false);
        setNewItem({
          title: '',
          description: '',
          images: [],
          date: new Date().toISOString().split('T')[0]
        });
        
        Alert.alert('Proyecto añadido', 'Tu proyecto ha sido añadido a tu portafolio');
      } else {
        Alert.alert('Error', 'No pudimos guardar tu proyecto. Por favor intenta de nuevo.');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error añadiendo proyecto:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Hubo un problema al guardar tu proyecto. Por favor intenta de nuevo.');
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setCurrentImageIndex(0); 
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
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteProject(itemId)
        }
      ]
    );
  };
  
  
  const deleteProject = async (itemId) => {
    try {
      setIsLoading(true);
      
      const updatedItems = portfolioItems.filter(item => item.id !== itemId);
      
      const formData = new FormData();
      formData.append('portfolio', JSON.stringify({
        trabajos: updatedItems,
        imagenes: artistData.portfolio.imagenes || []
      }));
      
      
      await axios.put(
        `${BACKEND_URL}/api/artists/profile/${user.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token || ''}`
          }
        }
      );
      
      updateUIAfterDelete(updatedItems);
      Alert.alert('Eliminado', 'El proyecto ha sido eliminado de tu portafolio');
    } catch (error) {
      console.error('Error eliminando proyecto:', error?.response?.data || error.message);
      
      try {
        const updatedItems = portfolioItems.filter(item => item.id !== itemId);
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
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || ''}`
            }
          }
        );
        
        updateUIAfterDelete(updatedItems);
        Alert.alert('Eliminado', 'El proyecto ha sido eliminado de tu portafolio');
      } catch (secondError) {
        console.error('Error en segundo intento:', secondError?.response?.data || secondError.message);
        
        const updatedItems = portfolioItems.filter(item => item.id !== itemId);
        updateUIAfterDelete(updatedItems);
        Alert.alert('Error', 'Hubo un problema al comunicarse con el servidor, pero el proyecto ha sido eliminado de tu vista local.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUIAfterDelete = (updatedItems) => {
    setPortfolioItems(updatedItems);
    setShowPreviewModal(false);
    setSelectedItem(null);
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={ACCENT_COLOR} />
      <Text style={styles.loadingText}>Cargando portafolio...</Text>
    </View>
  );

  const renderHeader = () => (
    showHeader && (
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={LIGHT_TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Portafolio</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={LIGHT_TEXT} />
        </TouchableOpacity>
      </View>
    )
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={80} color="#999" />
      <Text style={styles.emptyStateText}>Tu portafolio está vacío</Text>
      <Text style={styles.emptyStateSubtext}>
        Añade tu primer proyecto para mostrar tu trabajo artístico
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.emptyStateButtonText}>Añadir primer proyecto</Text>
      </TouchableOpacity>
    </View>
  );

  
  const renderPortfolioGrid = () => (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.portfolioGrid}>
        {portfolioItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.portfolioItem, { borderWidth: 1, borderColor: '#ffffff', borderStyle: 'solid' }]}
            onPress={() => {
              setSelectedItem(item);
              setCurrentImageIndex(0);
              setShowPreviewModal(true);
            }}
          >
            <Image 
              source={{ uri: item.imageUrl || (item.images && item.images[0]) }} 
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.itemDate}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return renderLoading();
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle='light-content' translucent={true} />
      {renderHeader()}
      {portfolioItems.length === 0 ? renderEmptyState() : renderPortfolioGrid()}
      
      
      <AddProjectModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        onAddItem={handleAddItem}
      />

      <PreviewProjectModal
        visible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        selectedItem={selectedItem}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
        onDeleteItem={handleDeleteItem}
      />
    </View>
  );
};

export default ArtistPortfolio;
