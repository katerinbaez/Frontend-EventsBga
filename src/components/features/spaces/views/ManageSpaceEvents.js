/**
 * Este archivo maneja la gestión de eventos del espacio
 * - UI
 * - Espacios
 * - Eventos
 * - Gestión
 * - CRUD
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../context/AuthContext';
import { loadAvailability, filterAvailableTimeSlots } from '../../events/services/availabilityService';

import { loadSpaceEvents, loadCategories } from '../services/EventManagementService';
import { updateEvent } from '../services/EventUpdateService';
import { deleteEvent } from '../services/EventDeleteService';

import { handleBlockedSlots } from '../services/BlockedSlotsService';
import { getCategoryColor, getCategoryName } from '../utils/EventFormatUtils';
import { formatDate, formatTime } from '../utils/DateTimeUtils';

import EventsList from '../ui/EventsList';
import EventEditModal from '../ui/EventEditModal';

import { styles } from '../../../../styles/ManageSpaceEventsStyles';

const ManageSpaceEvents = ({ navigation, route }) => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const managerId = route.params?.managerId || user?.id || user?.sub;
  const spaceName = route.params?.spaceName || 'Mi Espacio Cultural';

  useEffect(() => {
    loadData();
  }, [managerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const loadedEvents = await loadSpaceEvents(managerId);
      setEvents(loadedEvents);
      
      const loadedCategories = await loadCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error al cargar datos:', error.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (formData) => {
    try {
      setLoading(true);
      
      const eventId = formData.id || currentEvent?.id;
      if (!eventId) {
        Alert.alert('Error', 'No se pudo identificar el evento a actualizar');
        setLoading(false);
        return;
      }
      
      const originalEvent = events.find(e => e.id === eventId);
      const originalDate = originalEvent?.fechaProgramada ? new Date(originalEvent.fechaProgramada) : null;
      const originalHour = originalDate ? originalDate.getHours() : null;
      const originalDay = originalDate ? originalDate.getDay() : null;
      
      const newDate = new Date(formData.fechaProgramada || currentEvent?.fechaProgramada);
      const newHour = newDate.getHours();
      const newDay = newDate.getDay();
      
      const hourChanged = originalHour !== null && newHour !== originalHour;
      
      const result = await updateEvent(formData, managerId);
      
      if (result.success) {
        handleLoadAvailability(newDate);
        
        if (hourChanged) {
          try {
            await handleBlockedSlots(originalHour, originalDay, newHour, newDay, managerId);
          } catch (slotError) {
            console.error('Error al manejar los slots bloqueados:', slotError);
          }
          
          Alert.alert(
            'Recordatorio',
            'Has cambiado la hora del evento. Por favor, actualiza manualmente los horarios bloqueados en la configuración de horarios del espacio.',
            [{ text: 'Entendido' }]
          );
        }
        
        Alert.alert('Éxito', 'Evento actualizado correctamente');
        setShowEditModal(false);
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
            await deleteEvent(event, token, loadData, setLoading);
          },
        },
      ]
    );
  };

  const handleLoadAvailability = async (selectedDate = new Date()) => {
    try {
      setLoadingSlots(true);
      
      if (!selectedDate || !(selectedDate instanceof Date)) {
        selectedDate = new Date();
      }
      
      const { availableSlots: slots, blockedSlots: blocked } = await loadAvailability(managerId, selectedDate);
      
      setAvailableSlots(slots);
      setBlockedSlots(blocked);
      
      const filtered = filterAvailableTimeSlots(slots, blocked, selectedDate);
      setFilteredTimeSlots(filtered);
      
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      Alert.alert('Error', 'No se pudo cargar la disponibilidad de horarios');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSlotSelection = (slot) => {
    const isSelected = selectedTimeSlots.some(s => s.id === slot.id);
    
    if (isSelected) {
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s.id !== slot.id));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
  };

  const openEditModal = (event) => {
    let fechaProgramada = event.fechaProgramada;
    if (typeof event.fechaProgramada === 'string') {
      fechaProgramada = new Date(event.fechaProgramada);
    }
    
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
    
    handleLoadAvailability(fechaProgramada);
  };

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
