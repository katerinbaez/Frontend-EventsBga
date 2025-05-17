import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../context/AuthContext';
import { loadAvailability, filterAvailableTimeSlots } from '../../events/services/availabilityService';

// Importar servicios
import { loadSpaceEvents, loadCategories } from '../services/EventManagementService';
import { updateEvent } from '../services/EventUpdateService';
import { deleteEvent } from '../services/EventDeleteService';
import { handleBlockedSlots } from '../services/BlockedSlotsService';

// Importar utilidades
import { getCategoryColor, getCategoryName } from '../utils/EventFormatUtils';
import { formatDate, formatTime } from '../utils/DateTimeUtils';

// Importar componentes UI
import EventsList from '../ui/EventsList';
import EventEditModal from '../ui/EventEditModal';

// Importar estilos
import { styles } from '../../../../styles/ManageSpaceEventsStyles';

const ManageSpaceEvents = ({ navigation, route }) => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  
  // Estados para manejar disponibilidad de horarios
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Usar el managerId proporcionado o el del usuario autenticado
  const managerId = route.params?.managerId || user?.id || user?.sub;
  const spaceName = route.params?.spaceName || 'Mi Espacio Cultural';

  useEffect(() => {
    loadData();
  }, [managerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar eventos
      const loadedEvents = await loadSpaceEvents(managerId);
      setEvents(loadedEvents);
      
      // Cargar categorías
      const loadedCategories = await loadCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error al cargar datos:', error.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la actualización de eventos
  const handleUpdateEvent = async (formData) => {
    try {
      setLoading(true);
      
      // Verificar que el evento tenga un ID válido
      const eventId = formData.id || currentEvent?.id;
      if (!eventId) {
        Alert.alert('Error', 'No se pudo identificar el evento a actualizar');
        setLoading(false);
        return;
      }
      
      // Guardar la fecha y hora anterior para desbloquearla después
      const originalEvent = events.find(e => e.id === eventId);
      const originalDate = originalEvent?.fechaProgramada ? new Date(originalEvent.fechaProgramada) : null;
      const originalHour = originalDate ? originalDate.getHours() : null;
      const originalDay = originalDate ? originalDate.getDay() : null;
      
      // Obtener la nueva fecha y hora
      const newDate = new Date(formData.fechaProgramada || currentEvent?.fechaProgramada);
      const newHour = newDate.getHours();
      const newDay = newDate.getDay();
      
      // Verificar si la hora ha cambiado
      const hourChanged = originalHour !== null && newHour !== originalHour;
      
      // Actualizar el evento
      const result = await updateEvent(formData, managerId);
      
      if (result.success) {
        // Recargar la disponibilidad para reflejar los cambios
        handleLoadAvailability(newDate);
        
        // Si la hora ha cambiado, manejar los slots bloqueados
        if (hourChanged) {
          try {
            await handleBlockedSlots(originalHour, originalDay, newHour, newDay, managerId);
          } catch (slotError) {
            console.error('Error al manejar los slots bloqueados:', slotError);
          }
          
          // Mostrar aviso al usuario
          Alert.alert(
            'Recordatorio',
            'Has cambiado la hora del evento. Por favor, actualiza manualmente los horarios bloqueados en la configuración de horarios del espacio.',
            [{ text: 'Entendido' }]
          );
        }
        
        Alert.alert('Éxito', 'Evento actualizado correctamente');
        setShowEditModal(false);
        loadData(); // Recargar la lista de eventos
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la eliminación de eventos
  const handleDeleteEvent = (event) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar el evento "${event.titulo}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            // Usar el servicio de eliminación con la implementación exacta del original
            await deleteEvent(event, token, loadData, setLoading);
          },
        },
      ]
    );
  };

  // Función para cargar disponibilidad de horarios
  const handleLoadAvailability = async (selectedDate = new Date()) => {
    try {
      setLoadingSlots(true);
      
      // Verificar que la fecha sea válida
      if (!selectedDate || !(selectedDate instanceof Date)) {
        selectedDate = new Date(); // Usar fecha actual como respaldo
      }
      
      // Cargar disponibilidad para la fecha seleccionada
      const { availableSlots: slots, blockedSlots: blocked } = await loadAvailability(managerId, selectedDate);
      
      setAvailableSlots(slots);
      setBlockedSlots(blocked);
      
      // Filtrar slots disponibles para la fecha seleccionada
      const filtered = filterAvailableTimeSlots(slots, blocked, selectedDate);
      setFilteredTimeSlots(filtered);
      
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      Alert.alert('Error', 'No se pudo cargar la disponibilidad de horarios');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Función para manejar la selección de slots de tiempo
  const handleTimeSlotSelection = (slot) => {
    // Verificar si el slot ya está seleccionado
    const isSelected = selectedTimeSlots.some(s => s.id === slot.id);
    
    if (isSelected) {
      // Quitar de la selección
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s.id !== slot.id));
    } else {
      // Agregar a la selección
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
  };

  // Función para abrir el modal de edición
  const openEditModal = (event) => {
    // Asegurarse de que fechaProgramada sea un objeto Date
    let fechaProgramada = event.fechaProgramada;
    if (typeof event.fechaProgramada === 'string') {
      fechaProgramada = new Date(event.fechaProgramada);
    }
    
    // Si no hay fechaProgramada válida, usar la fecha actual
    if (!fechaProgramada || isNaN(fechaProgramada.getTime())) {
      fechaProgramada = new Date();
    }
    
    const formattedEvent = {
      id: event.id,
      titulo: event.titulo || '',
      descripcion: event.descripcion || '',
      fechaProgramada: fechaProgramada,
      categoria: event.categoria || '',
      asistentesEsperados: event.asistentesEsperados || 0,
      requerimientosAdicionales: event.requerimientosAdicionales || '',
      spaceId: event.spaceId || '',
      managerId: event.managerId || managerId
    };
    
    setCurrentEvent(formattedEvent);
    setShowEditModal(true);
    
    // Cargar disponibilidad para la fecha del evento
    handleLoadAvailability(fechaProgramada);
  };

  // Funciones para pasar a los componentes
  const getCategoryColorWrapper = (categoryId) => getCategoryColor(categoryId, categories);
  const getCategoryNameWrapper = (categoryId) => getCategoryName(categoryId, categories);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eventos de {spaceName}</Text>
      </View>
      
      <EventsList 
        events={events}
        loading={loading}
        getCategoryColor={getCategoryColorWrapper}
        getCategoryName={getCategoryNameWrapper}
        formatDate={formatDate}
        formatTime={formatTime}
        onEditEvent={openEditModal}
        onDeleteEvent={handleDeleteEvent}
      />
      
      <EventEditModal 
        visible={showEditModal}
        currentEvent={currentEvent}
        setCurrentEvent={setCurrentEvent}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateEvent}
        formatDate={formatDate}
        formatTime={formatTime}
        loadingSlots={loadingSlots}
        filteredTimeSlots={filteredTimeSlots}
      />
    </View>
  );
};

export default ManageSpaceEvents;
