import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, TextInput, Modal, Image, ScrollView } from 'react-native';
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
        (space.nombreEspacio && space.nombreEspacio.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (space.direccion && space.direccion.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (space.descripcion && space.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredSpaces(filtered);
    }
  }, [searchQuery, spaces]);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      // Primero, obtener todos los espacios culturales registrados
      const response = await axios.get(`${BACKEND_URL}/api/managers/managers`);
      console.log('Espacios cargados:', response.data);
      
      if (response.data.success) {
        // Crear un array para almacenar los espacios con datos completos
        let spacesWithFullData = [];
        
        // Para cada espacio, obtener sus datos completos
        for (const space of response.data.managers) {
          try {
            // Obtener los datos completos del espacio cultural
            const managerId = space.userId || space.id;
            if (managerId) {
              const detailsResponse = await axios.get(`${BACKEND_URL}/api/managers/profile/${managerId}`);
              
              if (detailsResponse.data.success && detailsResponse.data.manager) {
                const fullSpaceData = {
                  ...space,
                  ...detailsResponse.data.manager,
                  // Preservar explícitamente los horarios y descripción
                  horarios: detailsResponse.data.manager.horarios || space.horarios,
                  descripcion: detailsResponse.data.manager.descripcion || space.descripcion
                };
                
                // Formatear los horarios para asegurar consistencia
                let horariosFormateados = {
                  lunes: '',
                  martes: '',
                  miercoles: '',
                  jueves: '',
                  viernes: '',
                  sabado: '',
                  domingo: ''
                };
                
                // Si horarios es un array de objetos con la estructura { dayOfWeek, isOpen, timeSlots }
                if (Array.isArray(fullSpaceData.horarios)) {
                  fullSpaceData.horarios.forEach(dia => {
                    // Convertir el formato de array a objeto con días como claves
                    if (dia && dia.dayOfWeek && dia.timeSlots && Array.isArray(dia.timeSlots)) {
                      let nombreDia = dia.dayOfWeek.toLowerCase();
                      
                      // Normalizar nombres de días (quitar acentos y estandarizar)
                      if (nombreDia.includes('miércoles') || nombreDia.includes('miercoles')) {
                        nombreDia = 'miercoles';
                      } else if (nombreDia.includes('sábado') || nombreDia.includes('sabado')) {
                        nombreDia = 'sabado';
                      }
                      
                      // Convertir timeSlots a string (ej: "09:00-18:00")
                      const horasString = dia.timeSlots.map(slot => 
                        `${slot.start}-${slot.end}`
                      ).join(', ');
                      
                      horariosFormateados[nombreDia] = dia.isOpen ? horasString : 'Cerrado';
                    }
                  });
                } else if (typeof fullSpaceData.horarios === 'object' && !Array.isArray(fullSpaceData.horarios)) {
                  // Si ya es un objeto, asegurarse de que tenga todos los días
                  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
                  dias.forEach(dia => {
                    horariosFormateados[dia] = fullSpaceData.horarios[dia] || '';
                  });
                }
                
                // Agregar el espacio con datos completos al array
                spacesWithFullData.push({
                  ...fullSpaceData,
                  horarios: horariosFormateados
                });
              } else {
                // Si no se pudieron obtener los detalles, usar los datos básicos
                spacesWithFullData.push(space);
              }
            } else {
              // Si no hay ID de manager, usar los datos básicos
              spacesWithFullData.push(space);
            }
          } catch (detailsError) {
            console.error('Error al obtener detalles del espacio:', detailsError);
            // Si hay error, usar los datos básicos
            spacesWithFullData.push(space);
          }
        }
        
        console.log('Espacios con datos completos:', spacesWithFullData);
        setSpaces(spacesWithFullData || []);
        setFilteredSpaces(spacesWithFullData || []);
      } else {
        console.log('Error al cargar espacios:', response.data);
        setSpaces([]);
        setFilteredSpaces([]);
      }
    } catch (error) {
      console.error('Error al cargar espacios:', error);
      setSpaces([]);
      setFilteredSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpacePress = (space) => {
    // Como ya tenemos todos los datos completos, solo necesitamos mostrar el modal
    setSelectedSpace(space);
    setModalVisible(true);
    console.log('Mostrando detalles del espacio:', space);
  };

  const renderSpaceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.spaceItem}
      onPress={() => handleSpacePress(item)}
    >
      <View style={styles.spaceContent}>
        <Text style={styles.spaceName}>{item.nombreEspacio || 'Espacio sin nombre'}</Text>
        <Text style={styles.spaceAddress}>{item.direccion || 'Dirección no disponible'}</Text>
        <Text style={styles.spaceCapacity}>Capacidad: {item.capacidad || 'No especificada'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#FF3A5E" />
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={50} color="#DDD" />
      <Text style={styles.emptyText}>No se encontraron espacios</Text>
      <Text style={styles.emptySubText}>Intenta con otra búsqueda</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-outline" size={24} color="#FF3A5E" />
        </TouchableOpacity>
        <Text style={styles.title}>Buscar Espacios Culturales</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#AAA" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, dirección o descripción"
          placeholderTextColor="#AAA"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3A5E" />
          <Text style={styles.loadingText}>Cargando espacios culturales...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSpaces}
          keyExtractor={(item) => item.id?.toString() || item.userId?.toString() || Math.random().toString()}
          renderItem={renderSpaceItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView 
            contentContainerStyle={styles.modalScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close-outline" size={24} color="#FF3A5E" />
              </TouchableOpacity>

              {selectedSpace && (
                <>
                  {/* Imagen o placeholder */}
                  <View style={styles.spacePlaceholder}>
                    {(selectedSpace.images && selectedSpace.images.length > 0) || 
                     (selectedSpace.imagenes && selectedSpace.imagenes.length > 0) ? (
                      <Image 
                        source={{ uri: selectedSpace.images?.[0] || selectedSpace.imagenes?.[0] }} 
                        style={styles.spaceImage} 
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="image-outline" size={50} color="#FF3A5E" />
                    )}
                  </View>

                  {/* Nombre y dirección */}
                  <Text style={styles.modalSpaceName}>{selectedSpace.nombreEspacio || 'Espacio Cultural'}</Text>
                  <Text style={styles.modalSpaceAddress}>{selectedSpace.direccion || 'Dirección no disponible'}</Text>

                  {/* Información de contacto */}
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={20} color="#FF3A5E" />
                    <Text style={styles.infoText}>
                      {selectedSpace.contacto?.email || selectedSpace.email || 'No disponible'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color="#FF3A5E" />
                    <Text style={styles.infoText}>
                      {selectedSpace.contacto?.telefono || selectedSpace.telefono || 'No disponible'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={20} color="#FF3A5E" />
                    <Text style={styles.infoText}>
                      Capacidad: {selectedSpace.capacidad || 'No especificada'}
                    </Text>
                  </View>

                  {/* Redes sociales */}
                  {selectedSpace.redesSociales && (
                    <View style={styles.infoSection}>
                      <Text style={styles.sectionTitle}>Redes Sociales</Text>
                      <View style={styles.tagsContainer}>
                        {selectedSpace.redesSociales.facebook && (
                          <TouchableOpacity style={styles.tagItem}>
                            <Text style={styles.tagText}>
                              <Ionicons name="logo-facebook" size={14} color="#FF3A5E" /> Facebook
                            </Text>
                          </TouchableOpacity>
                        )}
                        {selectedSpace.redesSociales.instagram && (
                          <TouchableOpacity style={styles.tagItem}>
                            <Text style={styles.tagText}>
                              <Ionicons name="logo-instagram" size={14} color="#FF3A5E" /> Instagram
                            </Text>
                          </TouchableOpacity>
                        )}
                        {selectedSpace.redesSociales.twitter && (
                          <TouchableOpacity style={styles.tagItem}>
                            <Text style={styles.tagText}>
                              <Ionicons name="logo-twitter" size={14} color="#FF3A5E" /> Twitter
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Instalaciones */}
                  {selectedSpace.instalaciones && selectedSpace.instalaciones.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Instalaciones</Text>
                      <View style={styles.tagsContainer}>
                        {selectedSpace.instalaciones.map((instalacion, index) => (
                          <View key={index} style={styles.tagItem}>
                            <Text style={styles.tagText}>{instalacion}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  {/* Horarios */}
                  <Text style={styles.sectionTitle}>Horarios</Text>
                  <View style={styles.horariosContainer}>
                    {selectedSpace.horarios && Object.entries(selectedSpace.horarios).map(([dia, horario]) => (
                      <View key={dia} style={styles.horarioItem}>
                        <Text style={styles.horarioDia}>
                          {dia.charAt(0).toUpperCase() + dia.slice(1)}
                        </Text>
                        <Text style={styles.horarioHoras}>
                          {horario || 'Cerrado'}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Descripción */}
                  {selectedSpace.descripcion && (
                    <>
                      <Text style={styles.descriptionTitle}>Descripción</Text>
                      <Text style={styles.descriptionText}>{selectedSpace.descripcion}</Text>
                    </>
                  )}

                  {/* Botón de solicitar espacio */}
                  <TouchableOpacity style={styles.requestButton}>
                    <Text style={styles.requestButtonText}>Solicitar Espacio</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    margin: 15,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContent: {
    padding: 15,
  },
  spaceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  spaceContent: {
    flex: 1,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  spaceAddress: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 5,
  },
  spaceCapacity: {
    fontSize: 14,
    color: '#FF3A5E',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 15,
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300, // Ancho optimizado para móviles
    paddingHorizontal: 0,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 15,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  horariosContainer: {
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    marginBottom: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.2)',
  },
  horariosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 15,
    textAlign: 'center',
    width: '100%', // Asegurar que el título ocupe todo el ancho
  },
  horarioItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 2,
  },
  horarioDia: {
    color: '#FF3A5E',
    fontWeight: 'bold',
    width: 95,
    fontSize: 14,
  },
  horarioHoras: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
    paddingLeft: 5,
  },
  spacePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 15,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 58, 94, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.2)',
    marginTop: 10,
    overflow: 'hidden',
  },
  spaceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  modalSpaceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSpaceAddress: {
    fontSize: 16,
    color: '#CCC',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#EEE',
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 10,
  },
  infoSection: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tagItem: {
    backgroundColor: 'rgba(255, 58, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#FF3A5E',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
  },
  requestButton: {
    backgroundColor: '#FF3A5E',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 25,
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SpaceSearch;
