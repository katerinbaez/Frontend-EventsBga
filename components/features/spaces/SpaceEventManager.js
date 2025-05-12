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
import { BACKEND_URL } from '../../../constants/config';
import { useAuth } from '../../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3A5E',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
    paddingBottom: 100,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestsList: {
    padding: 15,
    maxHeight: 500,
  },
  requestCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  requestInfo: {
    flex: 1,
    paddingRight: 10,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  requestArtist: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  requestDate: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  requestTime: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  requestActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 80,
  },
  requestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#50E3C2',
  },
  rejectButton: {
    backgroundColor: '#FF3A5E',
  },
});

const SpaceEventManager = ({ onClose }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [eventRequests, setEventRequests] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [spaceData, setSpaceData] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: new Date(),
    horaInicio: '19:00',
    horaFin: '21:00',
    precio: '0',
    categoria: '',
    imagen: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Cargar datos del espacio cultural
      const spaceResponse = await axios.get(`${BACKEND_URL}/api/managers/profile/${user.id}`);
      if (spaceResponse.data.success && spaceResponse.data.manager) {
        setSpaceData(spaceResponse.data.manager);
        
        // Cargar eventos del espacio
        const eventsResponse = await axios.get(`${BACKEND_URL}/api/spaces/${spaceResponse.data.manager._id}/events`);
        setEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data : []);
        
        // Cargar solicitudes de eventos
        const requestsResponse = await axios.get(`${BACKEND_URL}/api/spaces/${spaceResponse.data.manager._id}/requests`);
        setEventRequests(Array.isArray(requestsResponse.data) ? requestsResponse.data : []);
      }

      // Cargar categorías
      const categoriesResponse = await axios.get(`${BACKEND_URL}/api/categories`);
      setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos. Intente nuevamente.');
      
      // Usar datos de demo en caso de error
      setSpaceData({ _id: 'space1', nombreEspacio: 'Teatro Demo' });
      setEvents([]);
      setEventRequests([]);
      setCategories([
        { _id: 'cat1', nombre: 'Música', color: '#FF3A5E' },
        { _id: 'cat2', nombre: 'Teatro', color: '#4A90E2' },
        { _id: 'cat3', nombre: 'Danza', color: '#50E3C2' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      setIsLoading(true);
      
      // Validar formulario
      if (!formData.titulo || !formData.descripcion || !formData.categoria) {
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
        spaceId: spaceData._id,
        estado: 'confirmado' // Los eventos creados por el espacio están confirmados automáticamente
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

  const handleProcessRequest = async (requestId, action) => {
    try {
      setIsLoading(true);
      
      const response = await axios.put(`${BACKEND_URL}/api/event-requests/${requestId}`, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      
      if (response.data.success) {
        Alert.alert(
          'Éxito', 
          `Solicitud ${action === 'approve' ? 'aprobada' : 'rechazada'} correctamente`
        );
        loadData(); // Recargar datos
      }
    } catch (error) {
      console.error('Error al procesar solicitud:', error);
      Alert.alert('Error', 'No se pudo procesar la solicitud. Intente nuevamente.');
    } finally {
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
        <Text style={styles.headerTitle}>Gestión de Eventos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.requestsButton}
            onPress={() => setShowRequestsModal(true)}
          >
            <Ionicons name="notifications" size={24} color="#FFF" />
            {eventRequests.length > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{eventRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
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
            <Text style={styles.emptyStateTitle}>No hay eventos programados</Text>
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

      {/* Modal para mostrar solicitudes de eventos */}
      <Modal
        visible={showRequestsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRequestsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitudes de Eventos</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowRequestsModal(false)}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.requestsList}>
              {eventRequests.length > 0 ? (
                eventRequests.map((request) => (
                  <View key={request._id} style={styles.requestCard}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestTitle}>{request.titulo}</Text>
                      <Text style={styles.requestArtist}>
                        <Ionicons name="person" size={14} color="#999" /> {request.artista?.nombreArtistico || 'Artista'}
                      </Text>
                      <Text style={styles.requestDate}>
                        <Ionicons name="calendar" size={14} color="#999" /> {formatDate(request.fecha)}
                      </Text>
                      <Text style={styles.requestTime}>
                        <Ionicons name="time" size={14} color="#999" /> {request.horaInicio} - {request.horaFin}
                      </Text>
                    </View>
                    
                    <View style={styles.requestActions}>
                      <TouchableOpacity 
                        style={[styles.requestButton, styles.approveButton]}
                        onPress={() => handleProcessRequest(request._id, 'approve')}
                      >
                        <Ionicons name="checkmark" size={18} color="#FFF" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.requestButton, styles.rejectButton]}
                        onPress={() => handleProcessRequest(request._id, 'reject')}
                      >
                        <Ionicons name="close" size={18} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="notifications" size={50} color="#FF3A5E" />
                  <Text style={styles.emptyStateTitle}>No hay solicitudes pendientes</Text>
                </View>
              )}
            </ScrollView>
          </View>
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
