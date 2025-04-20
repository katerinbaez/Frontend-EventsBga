import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, TextInput, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const SpaceSearch = ({ onClose }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSpaces(spaces);
    } else {
      const filtered = spaces.filter(space => 
        space.nombreEspacio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSpaces(filtered);
    }
  }, [searchQuery, spaces]);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/managers/managers`);
      if (response.data.success) {
        // Aquí asumimos que la API devuelve una lista de espacios culturales
        setSpaces(response.data.managers || []);
        setFilteredSpaces(response.data.managers || []);
      } else {
        console.log('Error al cargar espacios:', response.data);
      }
    } catch (error) {
      console.error('Error al cargar espacios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpacePress = (space) => {
    setSelectedSpace(space);
    setModalVisible(true);
  };

  const renderSpaceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.spaceCard}
      onPress={() => handleSpacePress(item)}
    >
      <View style={styles.spaceHeader}>
        <Text style={styles.spaceName}>{item.nombreEspacio || 'Espacio Cultural'}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
        </View>
      </View>
      <Text style={styles.spaceAddress}>{item.direccion || 'Dirección no disponible'}</Text>
      <Text style={styles.spaceDescription} numberOfLines={2}>
        {item.descripcion || 'Descripción no disponible'}
      </Text>
      <View style={styles.spaceFooter}>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>Capacidad: {item.capacidad || 'N/A'}</Text>
        </View>
        <Text style={styles.moreInfo}>+ Más información</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={60} color="#444" />
      <Text style={styles.emptyText}>No se encontraron espacios culturales</Text>
      <Text style={styles.emptySubText}>Intenta con otra búsqueda</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar Espacios</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, ubicación..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3A5E" />
        </View>
      ) : (
        <FlatList
          data={filteredSpaces}
          renderItem={renderSpaceItem}
          keyExtractor={(item, index) => (item.id || index.toString())}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-circle" size={30} color="#FF3A5E" />
            </TouchableOpacity>

            <View style={styles.spacePlaceholder}>
              <Ionicons name="business" size={60} color="#FF3A5E" />
            </View>

            <Text style={styles.modalSpaceName}>{selectedSpace?.nombreEspacio || 'Espacio Cultural'}</Text>
            <Text style={styles.modalSpaceAddress}>{selectedSpace?.direccion || 'Dirección no disponible'}</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="people" size={18} color="#FF3A5E" />
              <Text style={styles.infoText}>Capacidad: {selectedSpace?.capacidad || 'No especificada'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={18} color="#FF3A5E" />
              <Text style={styles.infoText}>Horario: {selectedSpace?.horario || 'No especificado'}</Text>
            </View>

            <Text style={styles.descriptionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{selectedSpace?.descripcion || 'No hay descripción disponible para este espacio cultural.'}</Text>

            <TouchableOpacity 
              style={styles.requestButton}
              onPress={() => {
                setModalVisible(false);
                // Aquí podrías navegar a un formulario para solicitar el espacio
                navigation.navigate('RequestSpace', { spaceId: selectedSpace?.id });
              }}
            >
              <Text style={styles.requestButtonText}>Solicitar este espacio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 50,
  },
  spaceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  spaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 3,
    fontWeight: 'bold',
  },
  spaceAddress: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 8,
  },
  spaceDescription: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 10,
  },
  spaceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    color: '#FF3A5E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    overflow: 'hidden',
  },
  moreInfo: {
    color: '#666',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
  },
  spacePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSpaceName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  modalSpaceAddress: {
    fontSize: 16,
    color: '#CCC',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#EEE',
    marginLeft: 10,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: '#FF3A5E',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SpaceSearch;
