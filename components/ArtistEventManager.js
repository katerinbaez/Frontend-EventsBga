import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import SpaceAvailabilityManager from './SpaceAvailabilityManager';

const ArtistEventManager = ({ onClose }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: new Date(),
    horaInicio: '19:00',
    horaFin: '21:00',
    precio: '0',
    categoria: '',
    spaceId: '',
    spaceNombre: '',
    imagen: null
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showAvailabilitySelector, setShowAvailabilitySelector] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar eventos del artista
      const eventsResponse = await axios.get(`${BACKEND_URL}/api/artists/${user.id}/events`);
      setEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data : []);

      // Cargar categorías
      const categoriesResponse = await axios.get(`${BACKEND_URL}/api/categories`);
      setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);

      // Cargar espacios culturales
      const spacesResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
      setSpaces(Array.isArray(spacesResponse.data) ? spacesResponse.data : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos. Intente nuevamente.');
      
      // Usar datos de demo en caso de error
      setEvents([]);
      setCategories([
        { _id: 'cat1', nombre: 'Música', color: '#FF3A5E' },
        { _id: 'cat2', nombre: 'Teatro', color: '#4A90E2' },
        { _id: 'cat3', nombre: 'Danza', color: '#50E3C2' }
      ]);
      setSpaces([
        { _id: 'space1', nombre: 'Teatro Corfescu', direccion: 'Calle 33 #23-45, Bucaramanga' },
        { _id: 'space2', nombre: 'Centro Cultural del Oriente', direccion: 'Carrera 19 #31-65, Bucaramanga' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      setIsLoading(true);
      
      // Validar formulario
      if (!formData.titulo || !formData.descripcion || !formData.categoria || !formData.spaceId) {
        Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
        setIsLoading(false);
        return;
      }

      // Formatear fecha para API
      const fechaFormatted = formData.fecha.toISOString().split('T')[0];

      // Crear el evento
      const response = await axios.post(`${BACKEND_URL}/api/events`, {
        ...formData,
        fecha: fechaFormatted,
        artistaId: user.id
      });

      if (response.data.success) {
        Alert.alert('Éxito', 'Evento creado correctamente');
        setShowCreateModal(false);
        loadData(); // Recargar eventos
        
        // Resetear formulario
        setFormData({
          titulo: '',
          descripcion: '',
          fecha: new Date(),
          horaInicio: '19:00',
          horaFin: '21:00',
          precio: '0',
          categoria: '',
          spaceId: '',
          imagen: null
        });
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      Alert.alert('Error', 'No se pudo crear el evento. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    try {
      setIsLoading(true);
      
      if (!currentEvent || !currentEvent._id) {
        Alert.alert('Error', 'No se pudo identificar el evento a actualizar');
        setIsLoading(false);
        return;
      }

      // Validar formulario
      if (!formData.titulo || !formData.descripcion) {
        Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
        setIsLoading(false);
        return;
      }

      // Formatear fecha para API
      const fechaFormatted = formData.fecha.toISOString().split('T')[0];

      // Actualizar el evento
      const response = await axios.put(`${BACKEND_URL}/api/events/${currentEvent._id}`, {
        ...formData,
        fecha: fechaFormatted
      });

      if (response.data.success) {
        Alert.alert('Éxito', 'Evento actualizado correctamente');
        setShowEditModal(false);
        loadData(); // Recargar eventos
      }
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      Alert.alert('Error', 'No se pudo actualizar el evento. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      Alert.alert(
        'Confirmar eliminación',
        '¿Está seguro que desea eliminar este evento?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              const response = await axios.delete(`${BACKEND_URL}/api/events/${eventId}`);
              if (response.data.success) {
                Alert.alert('Éxito', 'Evento eliminado correctamente');
                loadData(); // Recargar eventos
              }
              setIsLoading(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      Alert.alert('Error', 'No se pudo eliminar el evento. Intente nuevamente.');
      setIsLoading(false);
    }
  };

  const openEditModal = (event) => {
    setCurrentEvent(event);
    setFormData({
      titulo: event.titulo || '',
      descripcion: event.descripcion || '',
      fecha: event.fecha ? new Date(event.fecha) : new Date(),
      horaInicio: event.horaInicio || '19:00',
      horaFin: event.horaFin || '21:00',
      precio: event.precio?.toString() || '0',
      categoria: event.categoria || '',
      spaceId: event.space?._id || '',
      imagen: event.imagen || null
    });
    setShowEditModal(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar imágenes');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8
    });
    
    if (!result.canceled) {
      setFormData({ ...formData, imagen: result.assets[0].uri });
    }
  };

  const handleSelectSpace = (space) => {
    setFormData({ ...formData, spaceId: space._id, spaceNombre: space.nombre });
    setShowSpaceModal(false);
  };

  const openAvailabilitySelector = () => {
    if (!formData.spaceId) {
      Alert.alert('Selecciona un espacio', 'Por favor, primero selecciona un espacio cultural');
      setShowSpaceModal(true);
    } else {
      setShowAvailabilitySelector(true);
    }
  };

  const handleSelectTimeSlot = (data) => {
    const { space, date, timeSlot } = data;
    const endHour = timeSlot.id + 2; // Por defecto, eventos de 2 horas
    
    // Formatear la hora de inicio
    const startHourFormatted = `${timeSlot.hour}:00 ${timeSlot.period}`;
    
    // Formatear la hora de fin
    const endHourDisplay = endHour > 12 ? endHour - 12 : endHour;
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const endHourFormatted = `${endHourDisplay}:00 ${endPeriod}`;
    
    setFormData({
      ...formData,
      spaceId: space._id,
      spaceNombre: space.nombre,
      fecha: date,
      horaInicio: startHourFormatted,
      horaFin: endHourFormatted
    });
    
    setShowAvailabilitySelector(false);
  };

  // Componente para el formulario de evento (usado tanto para crear como para editar)
  const EventForm = ({ isEdit = false, onSubmit }) => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>{isEdit ? 'Editar Evento' : 'Nuevo Evento'}</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={formData.titulo}
          onChangeText={(text) => setFormData({ ...formData, titulo: text })}
          placeholder="Título del evento"
          placeholderTextColor="#666"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.descripcion}
          onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
          placeholder="Descripción del evento"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => {
            // En lugar de mostrar un DateTimePicker nativo, mostramos un selector personalizado
            Alert.alert(
              "Seleccionar fecha",
              "Selecciona la fecha del evento",
              [
                {
                  text: "Hoy",
                  onPress: () => {
                    const today = new Date();
                    setFormData({ ...formData, fecha: today });
                  }
                },
                {
                  text: "Mañana",
                  onPress: () => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setFormData({ ...formData, fecha: tomorrow });
                  }
                },
                {
                  text: "En una semana",
                  onPress: () => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    setFormData({ ...formData, fecha: nextWeek });
                  }
                },
                { text: "Cancelar", style: "cancel" }
              ]
            );
          }}
        >
          <Text style={styles.datePickerText}>
            {formData.fecha.toLocaleDateString()}
          </Text>
          <Ionicons name="calendar" size={24} color="#FF3A5E" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.timeContainer}>
        <View style={[styles.formGroup, { width: '48%' }]}>
          <Text style={styles.label}>Hora inicio</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => {
              // Mostramos un selector personalizado
              Alert.alert(
                "Seleccionar hora de inicio",
                "Selecciona la hora de inicio del evento",
                [
                  {
                    text: "19:00",
                    onPress: () => setFormData({ ...formData, horaInicio: "19:00" })
                  },
                  {
                    text: "20:00",
                    onPress: () => setFormData({ ...formData, horaInicio: "20:00" })
                  },
                  {
                    text: "21:00",
                    onPress: () => setFormData({ ...formData, horaInicio: "21:00" })
                  },
                  { text: "Cancelar", style: "cancel" }
                ]
              );
            }}
          >
            <Text style={styles.datePickerText}>{formData.horaInicio}</Text>
            <Ionicons name="time" size={24} color="#FF3A5E" />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.formGroup, { width: '48%' }]}>
          <Text style={styles.label}>Hora fin</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => {
              // Mostramos un selector personalizado
              Alert.alert(
                "Seleccionar hora de fin",
                "Selecciona la hora de finalización del evento",
                [
                  {
                    text: "21:00",
                    onPress: () => setFormData({ ...formData, horaFin: "21:00" })
                  },
                  {
                    text: "22:00",
                    onPress: () => setFormData({ ...formData, horaFin: "22:00" })
                  },
                  {
                    text: "23:00",
                    onPress: () => setFormData({ ...formData, horaFin: "23:00" })
                  },
                  { text: "Cancelar", style: "cancel" }
                ]
              );
            }}
          >
            <Text style={styles.datePickerText}>{formData.horaFin}</Text>
            <Ionicons name="time" size={24} color="#FF3A5E" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Precio (COP)</Text>
        <TextInput
          style={styles.input}
          value={formData.precio}
          onChangeText={(text) => setFormData({ ...formData, precio: text })}
          placeholder="Precio en pesos colombianos"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Categoría</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryPicker}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryOption,
                { backgroundColor: formData.categoria === category._id ? category.color : '#333' }
              ]}
              onPress={() => setFormData({ ...formData, categoria: category._id })}
            >
              <Text style={styles.categoryText}>{category.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Espacio Cultural</Text>
        <TouchableOpacity 
          style={styles.availabilityButton}
          onPress={() => setShowSpaceModal(true)}
        >
          {formData.spaceId ? (
            <View style={styles.selectedTimeInfo}>
              <Text style={styles.selectedSpaceName}>{formData.spaceNombre}</Text>
              <Text style={styles.selectedSpaceAction}>Toca para cambiar</Text>
            </View>
          ) : (
            <View style={styles.availabilityPlaceholder}>
              <Ionicons name="business" size={24} color="#999" />
              <Text style={styles.availabilityPlaceholderText}>Seleccionar espacio cultural</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Horario Disponible</Text>
        <TouchableOpacity 
          style={[styles.availabilityButton, formData.spaceId ? styles.availabilityButtonHighlight : null]}
          onPress={openAvailabilitySelector}
        >
          {(formData.spaceId && formData.horaInicio) ? (
            <View style={styles.selectedTimeInfo}>
              <Text style={styles.selectedDateTime}>
                <Ionicons name="calendar" size={16} color="#FF3A5E" /> {formData.fecha.toLocaleDateString('es-ES', {day: 'numeric', month: 'long'})}
              </Text>
              <Text style={styles.selectedDateTime}>
                <Ionicons name="time" size={16} color="#FF3A5E" /> {formData.horaInicio} - {formData.horaFin}
              </Text>
            </View>
          ) : (
            <View style={styles.availabilityPlaceholder}>
              <Ionicons name="time" size={24} color={formData.spaceId ? '#FF3A5E' : '#999'} />
              <Text style={[styles.availabilityPlaceholderText, formData.spaceId ? {color: '#FF3A5E'} : null]}>
                {formData.spaceId ? 'Ver horarios disponibles' : 'Primero selecciona un espacio'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Imagen del evento</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {formData.imagen ? (
            <Image source={{ uri: formData.imagen }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="image" size={40} color="#666" />
              <Text style={styles.imagePickerText}>Seleccionar imagen</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.submitButton]}
          onPress={onSubmit}
        >
          <Text style={styles.buttonText}>{isEdit ? 'Actualizar' : 'Crear'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF3A5E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Eventos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.eventsList}>
        {events.length > 0 ? (
          events.map((event) => (
            <View key={event._id} style={styles.eventCard}>
              <View style={styles.eventImageContainer}>
                {event.imagen ? (
                  <Image source={{ uri: event.imagen }} style={styles.eventImage} />
                ) : (
                  <View style={styles.eventImagePlaceholder}>
                    <Ionicons name="image" size={40} color="#666" />
                  </View>
                )}
                <View 
                  style={[
                    styles.categoryTag, 
                    { backgroundColor: getCategoryColor(event.categoria) }
                  ]}
                >
                  <Text style={styles.categoryTagText}>
                    {getCategoryName(event.categoria)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.titulo}</Text>
                <Text style={styles.eventDate}>
                  <Ionicons name="calendar" size={16} color="#999" /> {formatDate(event.fecha)}
                </Text>
                <Text style={styles.eventTime}>
                  <Ionicons name="time" size={16} color="#999" /> {event.horaInicio} - {event.horaFin}
                </Text>
                <Text style={styles.eventLocation}>
                  <Ionicons name="location" size={16} color="#999" /> {event.space?.nombre || 'Sin espacio asignado'}
                </Text>
                <Text style={styles.eventPrice}>
                  <Ionicons name="cash" size={16} color="#999" /> {formatPrice(event.precio)}
                </Text>
                
                <View style={styles.eventActions}>
                  <TouchableOpacity 
                    style={[styles.eventButton, styles.editButton]}
                    onPress={() => openEditModal(event)}
                  >
                    <Ionicons name="create" size={18} color="#FFF" />
                    <Text style={styles.eventButtonText}>Editar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.eventButton, styles.deleteButton]}
                    onPress={() => handleDeleteEvent(event._id)}
                  >
                    <Ionicons name="trash" size={18} color="#FFF" />
                    <Text style={styles.eventButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar" size={50} color="#FF3A5E" />
            <Text style={styles.emptyStateTitle}>No tienes eventos</Text>
            <Text style={styles.emptyStateText}>
              Crea tu primer evento tocando el botón + en la parte superior
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal para crear evento */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <EventForm onSubmit={handleCreateEvent} />
          </View>
        </View>
      </Modal>

      {/* Modal para editar evento */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <EventForm isEdit={true} onSubmit={handleUpdateEvent} />
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar disponibilidad */}
      <Modal
        visible={showAvailabilitySelector}
        animationType="slide"
        onRequestClose={() => setShowAvailabilitySelector(false)}
      >
        <View style={styles.modalContainer}>
          <SpaceAvailabilityManager 
            selectMode={true}
            onSelectTimeSlot={handleSelectTimeSlot}
            onClose={() => setShowAvailabilitySelector(false)}
          />
        </View>
      </Modal>
    </View>
  );

  // Funciones auxiliares
  function getCategoryColor(categoryId) {
    const category = categories.find(c => c._id === categoryId);
    return category?.color || '#999';
  }
  
  function getCategoryName(categoryId) {
    const category = categories.find(c => c._id === categoryId);
    return category?.nombre || 'Sin categoría';
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  function formatPrice(price) {
    if (!price) return 'Gratis';
    return `$${parseInt(price).toLocaleString('es-CO')} COP`;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3A5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsList: {
    flex: 1,
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  eventImageContainer: {
    height: 180,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTag: {
    position: 'absolute',
    right: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryTagText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  eventContent: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  eventDate: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  eventPrice: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  eventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#4A90E2',
  },
  deleteButton: {
    backgroundColor: '#FF3A5E',
  },
  eventButtonText: {
    color: '#FFFFFF',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryPicker: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
  },
  categoryOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  availabilityButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderStyle: 'dashed',
  },
  availabilityPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  availabilityPlaceholderText: {
    color: '#999',
    marginTop: 10,
    fontSize: 16,
  },
  selectedTimeInfo: {
    width: '100%',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  selectedSpaceName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedSpaceAction: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  selectedDateTime: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
  },
  availabilityButtonHighlight: {
    borderColor: '#FF3A5E',
    borderStyle: 'solid',
  },
  imagePicker: {
    height: 180,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePickerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    width: '48%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  submitButton: {
    backgroundColor: '#FF3A5E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ArtistEventManager;
