/**
 * Este archivo maneja la programación de eventos
 * - UI
 * - Eventos
 * - Programación
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import { styles } from '../../../../styles/EventProgrammingStyles';
import EventProgrammingHeader from '../ui/EventProgrammingHeader';
import ConfirmationModal from '../ui/ConfirmationModal';
import EventDetailsSection from '../sections/EventDetailsSection';
import EventDateSection from '../sections/EventDateSection';
import EventCategorySection from '../sections/EventCategorySection';
import AdditionalInfoSection from '../sections/AdditionalInfoSection';
import AvailabilitySection from '../sections/AvailabilitySection';
import { loadManagerProfile } from '../services/managerService';
import { loadAvailability, filterAvailableTimeSlots } from '../services/availabilityService';
import { createEvent } from '../services/eventServiceP';
import { getDayName } from '../utils/dateUtils';
import { getTimeRange, calculateTotalDuration } from '../utils/timeUtils';

const EventProgramming = ({ navigation, route }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  
  const [spaceId, setSpaceId] = useState(route?.params?.spaceId || '');
  const [spaceName, setSpaceName] = useState(route?.params?.spaceName || 'Mi Espacio Cultural');
  const [managerId, setManagerId] = useState(route?.params?.managerId || '');
  
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventCategory, setEventCategory] = useState('otro');
  const [customCategory, setCustomCategory] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  
  useEffect(() => {
    if (route?.params?.managerId) {
      console.log(`Usando managerId de parámetros: ${route.params.managerId}`);
      setManagerId(route.params.managerId);
      setSpaceId(route.params.spaceId || '');
      setSpaceName(route.params.spaceName || 'Mi Espacio Cultural');
      handleLoadAvailability();
      return;
    }
    
    const initializeManager = async () => {
      try {
        const managerData = await loadManagerProfile(user?.sub);
        if (managerData) {
          setManagerId(managerData.userId || managerData.id);
          setSpaceId(managerData.id);
          setSpaceName(managerData.spaceName || managerData.name || 'Mi Espacio Cultural');
          handleLoadAvailability();
        } else {
          Alert.alert(
            'Perfil no encontrado', 
            'No se encontró información de tu espacio cultural. Por favor, completa tu perfil primero.',
            [{ text: 'Ir a registro', onPress: () => navigation.navigate('ManagerRegistration') }]
          );
        }
      } catch (error) {
        console.error('Error al cargar datos del gestor:', error);
        Alert.alert(
          'Error', 
          'No se pudo cargar la información de tu espacio cultural.',
          [{ text: 'OK' }]
        );
      }
    };
    
    initializeManager();
  }, [user, navigation, route?.params?.managerId]);
  
  const handleLoadAvailability = async (selectedDate = eventDate) => {
    if (!managerId) {
      console.error('No se puede cargar disponibilidad sin managerId');
      return;
    }
    
    setLoadingSlots(true);
    try {
      const { availableSlots: slots, blockedSlots: blocked } = await loadAvailability(managerId, selectedDate);
      
      setAvailableSlots(slots);
      setBlockedSlots(blocked);
      
      setTimeout(() => {
        handleFilterTimeSlots(selectedDate);
      }, 100);
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      Alert.alert(
        'Error', 
        'No se pudo cargar la disponibilidad del espacio. Por favor, inténtelo de nuevo más tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingSlots(false);
    }
  };
  
  const handleFilterTimeSlots = (dateToFilter = null) => {
    const filtered = filterAvailableTimeSlots(
      availableSlots,
      blockedSlots,
      dateToFilter || eventDate
    );
    setFilteredTimeSlots(filtered);
  };
  
  const handleTimeSlotSelection = (slot) => {
    if (selectedTimeSlots.length === 0) {
      setSelectedTimeSlots([slot]);
      setSelectedTimeSlot(slot);
      return;
    }
    
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    if (slot.hour === firstSlot.hour - 1) {
      const newSlots = [slot, ...sortedSlots];
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]);
      return;
    }
    
    if (slot.hour === lastSlot.hour + 1) {
      const newSlots = [...sortedSlots, slot];
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]);
      return;
    }
    
    if (selectedTimeSlots.some(s => s.hour === slot.hour)) {
      if (selectedTimeSlots.length === 1) {
        setSelectedTimeSlots([]);
        setSelectedTimeSlot(null);
        return;
      }
      
      if (slot.hour !== firstSlot.hour && slot.hour !== lastSlot.hour) {
        Alert.alert(
          'Selección no válida', 
          'Solo puedes deseleccionar el primer o último slot de la secuencia.',
          [{ text: 'Entendido', style: 'cancel' }]
        );
        return;
      }
      
      const newSlots = selectedTimeSlots.filter(s => s.hour !== slot.hour);
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]);
      return;
    }
    
    Alert.alert(
      'Selección no válida', 
      'Solo puedes seleccionar slots consecutivos. Si necesitas más tiempo, selecciona un slot que sea consecutivo con los ya seleccionados.',
      [{ text: 'Entendido', style: 'cancel' }]
    );
  };
  
  const handleCreateEvent = async () => {
    if (!eventName || !eventDescription || selectedTimeSlots.length === 0) {
      Alert.alert('Datos incompletos', 'Por favor, completa todos los campos obligatorios.');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await createEvent({
        eventName,
        eventDescription,
        eventDate,
        selectedTimeSlots,
        eventCategory: eventCategory === 'otro' && customCategory ? customCategory : eventCategory,
        eventType,
        expectedAttendees,
        additionalRequirements,
        managerId,
        spaceId,
        getDayName
      });
      
      if (success) {
        Alert.alert(
          'Evento Programado', 
          'El evento ha sido programado exitosamente.',
          [{ 
            text: 'OK', 
            onPress: () => {
              setEventName('');
              setEventDescription('');
              setEventDate(new Date());
              setSelectedTimeSlots([]);
              setSelectedTimeSlot(null);
              setExpectedAttendees('');
              setEventType('');
              setEventCategory('otro');
              setCustomCategory('');
              setAdditionalRequirements('');
              
              setConfirmModalVisible(false);
              
              navigation.navigate('DashboardManager');
            }
          }]
        );
      } else {
        Alert.alert(
          'Error', 
          'No se pudo crear el evento. Por favor, inténtelo de nuevo más tarde.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      Alert.alert(
        'Error', 
        'No se pudo crear el evento. Por favor, inténtelo de nuevo más tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  const getTimeRangeForModal = () => {
    return getTimeRange(selectedTimeSlots);
  };
  
  const calculateTotalDurationForModal = () => {
    return calculateTotalDuration(selectedTimeSlots);
  };
  
  return (
    <View style={styles.container}>
      <EventProgrammingHeader 
        title="Programar Evento" 
        navigation={navigation} 
      />
      
      <ScrollView style={styles.content}>
        <EventDetailsSection 
          spaceName={spaceName}
          eventName={eventName}
          eventDescription={eventDescription}
          onChangeEventName={setEventName}
          onChangeEventDescription={setEventDescription}
        />
        
        <EventDateSection 
          eventDate={eventDate}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          onDateChange={(date) => {
            setEventDate(date);
            handleLoadAvailability(date);
          }}
        />
        
        <EventCategorySection 
          eventCategory={eventCategory}
          customCategory={customCategory}
          onCategoryChange={setEventCategory}
          onCustomCategoryChange={setCustomCategory}
        />
        
        <AdditionalInfoSection 
          eventType={eventType}
          expectedAttendees={expectedAttendees}
          additionalRequirements={additionalRequirements}
          onEventTypeChange={setEventType}
          onExpectedAttendeesChange={setExpectedAttendees}
          onAdditionalRequirementsChange={setAdditionalRequirements}
        />
        
        <AvailabilitySection 
          filteredTimeSlots={filteredTimeSlots}
          selectedTimeSlots={selectedTimeSlots}
          loadingSlots={loadingSlots}
          onTimeSlotSelect={handleTimeSlotSelection}
          onProgramEvent={() => setConfirmModalVisible(true)}
          isFormValid={eventName && eventDescription && selectedTimeSlots.length > 0}
        />
      </ScrollView>
      
      <ConfirmationModal 
        visible={confirmModalVisible}
        eventName={eventName}
        eventDate={eventDate}
        eventCategory={eventCategory}
        eventType={eventType}
        expectedAttendees={expectedAttendees}
        selectedTimeSlots={selectedTimeSlots}
        getTimeRange={getTimeRangeForModal}
        calculateTotalDuration={calculateTotalDurationForModal}
        loading={loading}
        onCancel={() => setConfirmModalVisible(false)}
        onConfirm={handleCreateEvent}
      />
    </View>
  );
};

export default EventProgramming;