/**
 * Este archivo maneja el hook de solicitud de evento
 * - Hooks
 * - Eventos
 * - Solicitud
 */

import { useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';

import useEventFormState from './useEventFormState';
import useTimeSlots from './useTimeSlots';
import useAvailability from './useAvailability';
import useEventSubmission from './useEventSubmission';

const useEventRequest = ({ visible, onClose, spaceId, spaceName, managerId }) => {
  const { user } = useAuth();
  
  const formState = useEventFormState();
  const timeSlots = useTimeSlots();
  const availability = useAvailability();
  const submission = useEventSubmission(onClose);

  useEffect(() => {
    if (visible && spaceId) {
      timeSlots.resetTimeSlots();
      formState.setEventDescription('');
      formState.setEventDate(new Date());
      formState.setExpectedAttendees('');
      formState.setEventType('');
      formState.setAdditionalRequirements('');
      
      setTimeout(() => {
        availability.loadAvailability(
          managerId, 
          spaceId, 
          formState.eventDate, 
          timeSlots.setLoadingSlots,
          timeSlots.setFilteredTimeSlots,
          formState.setSpaceCapacity,
          (date) => availability.filterAvailableTimeSlots(
            date,
            formState.eventDate,
            availability.availableSlots,
            availability.blockedSlots,
            timeSlots.setFilteredTimeSlots,
            timeSlots.setLoadingSlots
          )
        );
      }, 100);
    }
  }, [visible, spaceId, managerId]);
  
  useEffect(() => {
    if (formState.eventDate && availability.availableSlots.length > 0) {
      console.log('Detectado cambio en fecha, slots disponibles o bloqueados - Filtrando horarios...');
      availability.filterAvailableTimeSlots(
        null,
        formState.eventDate,
        availability.availableSlots,
        availability.blockedSlots,
        timeSlots.setFilteredTimeSlots,
        timeSlots.setLoadingSlots
      );
    } else if (formState.eventDate && availability.availableSlots.length === 0) {
      console.log('No hay slots disponibles para esta fecha');
      timeSlots.setFilteredTimeSlots([]);
      timeSlots.setLoadingSlots(false);
    }
  }, [formState.eventDate, availability.availableSlots, availability.blockedSlots]);

  const handleDateChange = (event, selectedDate, showPicker = false) => {
    if (event && event.type === 'dismissed') {
      formState.handleDateChange(null, null, false);
      return;
    }
    
    formState.handleDateChange(event, selectedDate, showPicker);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(12, 0, 0, 0);
      formState.setEventDate(newDate);
      
      timeSlots.setSelectedTimeSlots([]);
      timeSlots.setSelectedTimeSlot(null);
      
      timeSlots.setLoadingSlots(true);
      
      setTimeout(() => {
        availability.loadAvailability(
          managerId, 
          spaceId, 
          newDate, 
          timeSlots.setLoadingSlots,
          timeSlots.setFilteredTimeSlots,
          formState.setSpaceCapacity,
          (date) => availability.filterAvailableTimeSlots(
            date, 
            newDate, 
            availability.availableSlots, 
            availability.blockedSlots, 
            timeSlots.setFilteredTimeSlots, 
            timeSlots.setLoadingSlots
          )
        );
      }, 300); 
    }
  };

  const handleSubmit = async () => { 
    const timeRange = timeSlots.getTimeRange();
    
    const requestData = { 
      artistId: user.id, 
      managerId: managerId, 
      spaceId: spaceId, 
      spaceName: spaceName, 
      titulo: formState.eventName, 
      descripcion: formState.eventDescription, 
      fecha: formState.eventDate.toISOString().split('T')[0], 
      horaInicio: timeRange.start, 
      horaFin: timeRange.end, 
      duracionHoras: timeSlots.calculateTotalDuration(), 
      asistentesEsperados: parseInt(formState.expectedAttendees, 10), 
      tipoEvento: formState.eventType, 
      categoria: formState.eventCategory, 
      categoriaPersonalizada: formState.eventCategory === 'otro' ? formState.customCategory.trim() : null, 
      requerimientosAdicionales: formState.additionalRequirements || 'Ninguno', 
      estado: 'pendiente' 
    }; 
    submission.handleSubmit(user, requestData, () => {
      formState.resetForm();
      timeSlots.resetTimeSlots();
    });
  };

  return { 
    ...formState,
    ...timeSlots,
    loading: submission.loading,
    handleDateChange,
    handleSubmit
  }; 
};

export default useEventRequest;