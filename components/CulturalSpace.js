import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const CulturalSpace = ({ navigation, route }) => {
  const { user } = useAuth();
  const [space, setSpace] = useState({
    nombre: '',
    direccion: '',
    capacidad: '',
    descripcion: '',
    instalaciones: [],
    disponibilidad: [
      { dayOfWeek: 'Lunes', isOpen: true, timeSlots: [{ start: '08:00', end: '18:00' }] },
      { dayOfWeek: 'Martes', isOpen: true, timeSlots: [{ start: '08:00', end: '18:00' }] },
      { dayOfWeek: 'Miércoles', isOpen: true, timeSlots: [{ start: '08:00', end: '18:00' }] },
      { dayOfWeek: 'Jueves', isOpen: true, timeSlots: [{ start: '08:00', end: '18:00' }] },
      { dayOfWeek: 'Viernes', isOpen: true, timeSlots: [{ start: '08:00', end: '18:00' }] },
      { dayOfWeek: 'Sábado', isOpen: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
      { dayOfWeek: 'Domingo', isOpen: true, timeSlots: [{ start: '09:00', end: '17:00' }] }
    ],
    images: [],
    managerId: user?.id || ''
  });

  const [isEditing, setIsEditing] = useState(!route.params?.spaceId);
  const [timePickerVisible, setTimePickerVisible] = useState({
    visible: false,
    dayIndex: null,
    slotIndex: null,
    isStartTime: true
  });
  const [nuevaInstalacion, setNuevaInstalacion] = useState('');

  // Generar horas disponibles para seleccionar (de 00:00 a 24:00 en incrementos de 30 min)
  const availableTimes = [];
  for (let hour = 0; hour <= 24; hour++) {
    const hourFormatted = hour < 10 ? `0${hour}` : `${hour}`;
    availableTimes.push(`${hourFormatted}:00`);
    // Sólo agregar minutos :30 si no es la hora 24
    if (hour < 24) {
      availableTimes.push(`${hourFormatted}:30`);
    }
  }

  useEffect(() => {
    if (route.params?.spaceId) {
      loadSpaceData();
    }
  }, [route.params?.spaceId]);

  const loadSpaceData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces/${route.params.spaceId}`);
      setSpace(response.data);
    } catch (error) {
      console.error('Error al cargar espacio cultural:', error);
      Alert.alert('Error', 'No se pudo cargar la información del espacio cultural');
    }
  };

  const handleSave = async () => {
    try {
      let response;
      
      if (route.params?.spaceId) {
        // Actualizar espacio existente
        response = await axios.put(`${BACKEND_URL}/api/cultural-spaces/${route.params.spaceId}`, space);
      } else {
        // Crear nuevo espacio
        response = await axios.post(`${BACKEND_URL}/api/cultural-spaces`, space);
      }

      if (response.data.success) {
        Alert.alert('Éxito', 'Espacio cultural guardado correctamente');
        setIsEditing(false);
        if (!route.params?.spaceId) {
          navigation.goBack();
        }
      } else {
        Alert.alert('Error', 'No se pudo guardar el espacio cultural');
      }
    } catch (error) {
      console.error('Error al guardar espacio cultural:', error);
      Alert.alert('Error', `Error al guardar: ${error.message || 'Verifica la conexión al servidor'}`);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setSpace(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error);
    }
  };

  const renderViewMode = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{space.nombre}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="create-outline" size={24} color="#4A90E2" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        style={styles.imageGallery}
        showsHorizontalScrollIndicator={false}
      >
        {space.images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.spaceImage}
          />
        ))}
      </ScrollView>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dirección</Text>
        <Text style={styles.text}>{space.direccion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Capacidad</Text>
        <Text style={styles.text}>{space.capacidad} personas</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.text}>{space.descripcion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instalaciones</Text>
        <View style={styles.facilitiesContainer}>
          {space.instalaciones.map((instalacion, index) => (
            <View key={index} style={styles.facilityTag}>
              <Text style={styles.facilityText}>{instalacion}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horarios</Text>
        {space.disponibilidad.map((dia, index) => (
          <View key={index} style={styles.scheduleItem}>
            <Text style={styles.dayText}>{dia.dayOfWeek}</Text>
            {dia.isOpen ? (
              <View>
                {dia.timeSlots.map((slot, slotIndex) => (
                  <Text key={slotIndex} style={styles.timeText}>
                    {slot.start} - {slot.end}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={[styles.timeText, { color: '#FF3A5E' }]}>Cerrado</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderEditMode = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {route.params?.spaceId ? 'Editar Espacio' : 'Nuevo Espacio'}
        </Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Ionicons name="save-outline" size={24} color="#FFF" />
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={space.nombre}
          onChangeText={(text) => setSpace(prev => ({ ...prev, nombre: text }))}
          placeholder="Nombre del espacio cultural"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={space.direccion}
          onChangeText={(text) => setSpace(prev => ({ ...prev, direccion: text }))}
          placeholder="Dirección completa"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Capacidad</Text>
        <TextInput
          style={styles.input}
          value={String(space.capacidad)}
          onChangeText={(text) => setSpace(prev => ({ ...prev, capacidad: text }))}
          placeholder="Número de personas"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={space.descripcion}
          onChangeText={(text) => setSpace(prev => ({ ...prev, descripcion: text }))}
          placeholder="Describe el espacio cultural"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Instalaciones</Text>
        <View style={styles.facilitiesInputContainer}>
          <TextInput
            style={styles.facilitiesInput}
            value={nuevaInstalacion}
            onChangeText={setNuevaInstalacion}
            placeholder="Ejemplo: Escenario"
          />
          <TouchableOpacity 
            style={styles.addFacilityButton}
            onPress={() => {
              if (nuevaInstalacion.trim() !== '') {
                setSpace(prev => ({
                  ...prev,
                  instalaciones: [...prev.instalaciones, nuevaInstalacion.trim()]
                }));
                setNuevaInstalacion('');
              }
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.facilitiesTagsContainer}>
          {Array.isArray(space.instalaciones) && space.instalaciones.map((instalacion, index) => (
            <View key={index} style={styles.facilityTagEditable}>
              <Text style={styles.facilityText}>{instalacion}</Text>
              <TouchableOpacity
                onPress={() => {
                  const nuevasInstalaciones = [...space.instalaciones];
                  nuevasInstalaciones.splice(index, 1);
                  setSpace(prev => ({ ...prev, instalaciones: nuevasInstalaciones }));
                }}
              >
                <Ionicons name="close-circle" size={20} color="#FF3A5E" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Imágenes</Text>
        <TouchableOpacity 
          style={styles.imagePickerButton}
          onPress={handleImagePick}
        >
          <Ionicons name="images-outline" size={24} color="#4A90E2" />
          <Text style={styles.imagePickerText}>Agregar imágenes</Text>
        </TouchableOpacity>
        <ScrollView 
          horizontal 
          style={styles.imagePreviewContainer}
          showsHorizontalScrollIndicator={false}
        >
          {space.images.map((image, index) => (
            <View key={index} style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => {
                  setSpace(prev => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index)
                  }));
                }}
              >
                <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Horarios</Text>
        {space.disponibilidad.map((horario, index) => (
          <View key={index} style={styles.scheduleInputContainer}>
            <View style={styles.dayContainer}>
              <Text style={styles.dayText}>{horario.dayOfWeek}</Text>
              <TouchableOpacity
                style={[styles.toggleButton, horario.isOpen ? styles.toggleActive : styles.toggleInactive]}
                onPress={() => {
                  const newDisponibilidad = [...space.disponibilidad];
                  newDisponibilidad[index] = { 
                    ...horario, 
                    isOpen: !horario.isOpen 
                  };
                  setSpace(prev => ({ ...prev, disponibilidad: newDisponibilidad }));
                }}
              >
                <Text style={styles.toggleText}>{horario.isOpen ? 'Abierto' : 'Cerrado'}</Text>
              </TouchableOpacity>
            </View>
            
            {horario.isOpen && horario.timeSlots.map((slot, slotIndex) => (
              <View key={slotIndex} style={styles.timeSlotContainer}>
                <View style={styles.timeInputContainer}>
                  <TouchableOpacity
                    style={styles.timePickerButton}
                    onPress={() => {
                      setTimePickerVisible({
                        visible: true,
                        dayIndex: index,
                        slotIndex: slotIndex,
                        isStartTime: true
                      });
                    }}
                  >
                    <Text style={styles.timePickerButtonText}>{slot.start}</Text>
                    <Ionicons name="time" size={20} color="#FF3A5E" />
                  </TouchableOpacity>
                  <Text style={styles.timeText}>-</Text>
                  <TouchableOpacity
                    style={styles.timePickerButton}
                    onPress={() => {
                      setTimePickerVisible({
                        visible: true,
                        dayIndex: index,
                        slotIndex: slotIndex,
                        isStartTime: false
                      });
                    }}
                  >
                    <Text style={styles.timePickerButtonText}>{slot.end}</Text>
                    <Ionicons name="time" size={20} color="#FF3A5E" />
                  </TouchableOpacity>
                </View>
                
                {slotIndex === horario.timeSlots.length - 1 && (
                  <TouchableOpacity
                    style={styles.addSlotButton}
                    onPress={() => {
                      const newDisponibilidad = [...space.disponibilidad];
                      newDisponibilidad[index].timeSlots.push({ start: '09:00', end: '18:00' });
                      setSpace(prev => ({ ...prev, disponibilidad: newDisponibilidad }));
                    }}
                  >
                    <Ionicons name="add-circle" size={24} color="#FF3A5E" />
                  </TouchableOpacity>
                )}
                
                {horario.timeSlots.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeSlotButton}
                    onPress={() => {
                      const newDisponibilidad = [...space.disponibilidad];
                      newDisponibilidad[index].timeSlots.splice(slotIndex, 1);
                      setSpace(prev => ({ ...prev, disponibilidad: newDisponibilidad }));
                    }}
                  >
                    <Ionicons name="remove-circle" size={24} color="#FF3A5E" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <>
      {isEditing ? renderEditMode() : renderViewMode()}
      
      {/* Modal para seleccionar hora */}
      <Modal
        visible={timePickerVisible.visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTimePickerVisible({ ...timePickerVisible, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>
                Selecciona {timePickerVisible.isStartTime ? 'hora de inicio' : 'hora de cierre'}
              </Text>
              <TouchableOpacity
                onPress={() => setTimePickerVisible({ ...timePickerVisible, visible: false })}
              >
                <Ionicons name="close" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableTimes}
              keyExtractor={(item) => item}
              style={styles.timeList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.timeItem}
                  onPress={() => {
                    const { dayIndex, slotIndex, isStartTime } = timePickerVisible;
                    const newDisponibilidad = [...space.disponibilidad];
                    
                    if (isStartTime) {
                      newDisponibilidad[dayIndex].timeSlots[slotIndex].start = item;
                    } else {
                      newDisponibilidad[dayIndex].timeSlots[slotIndex].end = item;
                    }
                    
                    setSpace(prev => ({ ...prev, disponibilidad: newDisponibilidad }));
                    setTimePickerVisible({ ...timePickerVisible, visible: false });
                  }}
                >
                  <Text style={styles.timeItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  imageGallery: {
    height: 200,
    marginBottom: 20,
  },
  spaceImage: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityTag: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  facilityTagEditable: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityText: {
    color: '#4A90E2',
    fontSize: 14,
    marginRight: 5,
  },
  facilitiesInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  facilitiesInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginRight: 10,
  },
  addFacilityButton: {
    backgroundColor: '#FF3A5E',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilitiesTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  editButtonText: {
    marginLeft: 5,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    marginLeft: 5,
    color: '#FFF',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4A90E2',
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4A90E2',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imagePreview: {
    marginRight: 10,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingRight: 10,
    width: '100%',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },
  toggleActive: {
    backgroundColor: '#FF3A5E',
  },
  toggleInactive: {
    backgroundColor: '#34495E',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 20,
  },
  addSlotButton: {
    marginLeft: 10,
    padding: 5,
  },
  removeSlotButton: {
    marginLeft: 10,
    padding: 5,
  },
  scheduleInputContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    width: 100,
    backgroundColor: '#F8F9FA',
  },
  timePickerButtonText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  timeList: {
    maxHeight: 300,
  },
  timeItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeItemText: {
    fontSize: 18,
    color: '#2C3E50',
  },
});

export default CulturalSpace;
