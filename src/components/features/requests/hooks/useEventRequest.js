import { useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';

// Hooks personalizados
import useEventFormState from './useEventFormState';
import useTimeSlots from './useTimeSlots';
import useAvailability from './useAvailability';
import useEventSubmission from './useEventSubmission';

const useEventRequest = ({ visible, onClose, spaceId, spaceName, managerId }) => {
  const { user } = useAuth();
  
  // Componer los hooks
  const formState = useEventFormState();
  const timeSlots = useTimeSlots();
  const availability = useAvailability();
  const submission = useEventSubmission(onClose);

  // Efecto para cargar disponibilidad cuando el modal es visible
  useEffect(() => {
    if (visible && spaceId) {
      // Reiniciar estados
      timeSlots.resetTimeSlots();
      formState.setEventDescription('');
      formState.setEventDate(new Date());
      formState.setExpectedAttendees('');
      formState.setEventType('');
      formState.setAdditionalRequirements('');
      
      // Usar setTimeout para asegurar que los estados se actualicen antes de cargar datos
      setTimeout(() => {
        // Cargar disponibilidad para la fecha actual
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
  
  // Efecto para filtrar horarios disponibles cuando cambia la fecha o se cargan datos
  useEffect(() => {
    if (formState.eventDate && availability.availableSlots.length > 0) {
      // Asegurar que se filtren los horarios cuando cambian los datos relevantes
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
      // Si no hay slots disponibles, limpiar los filtrados
      console.log('No hay slots disponibles para esta fecha');
      timeSlots.setFilteredTimeSlots([]);
      timeSlots.setLoadingSlots(false);
    }
  }, [formState.eventDate, availability.availableSlots, availability.blockedSlots]);

  // Función para manejar el cambio de fecha que también actualiza los slots
  const handleDateChange = (event, selectedDate, showPicker = false) => {
    // Para Android, el evento puede ser 'set' o 'dismissed'
    if (event && event.type === 'dismissed') {
      formState.handleDateChange(null, null, false);
      return;
    }
    
    // Primero manejar el cambio de fecha en el estado del formulario
    formState.handleDateChange(event, selectedDate, showPicker);
    
    // Si hay una fecha seleccionada, también actualizar los slots
    if (selectedDate) {
      // Crear una nueva instancia de Date para evitar problemas de referencia
      const newDate = new Date(selectedDate);
      
      // Asegurar que la fecha sea correcta (sin problemas de zona horaria)
      // Establecer la hora a mediodía para evitar problemas con cambios de día debido a zonas horarias
      newDate.setHours(12, 0, 0, 0);
      
      // Actualizar explícitamente la fecha en el estado del formulario
      formState.setEventDate(newDate);
      
      // Reiniciar los slots seleccionados
      timeSlots.setSelectedTimeSlots([]);
      timeSlots.setSelectedTimeSlot(null);
      
      // Indicar que estamos cargando
      timeSlots.setLoadingSlots(true);
      
      // Esperar un momento para asegurar que el estado de la fecha se actualice
      setTimeout(() => {
        // Cargar disponibilidad para la nueva fecha
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
      }, 300); // Aumentar el tiempo de espera para asegurar que los estados se actualicen
    }
  };

  // Función para manejar el envío del formulario 
  const handleSubmit = async () => { 
    // Obtener el rango de tiempo de los slots seleccionados 
    const timeRange = timeSlots.getTimeRange();
    
    // Crear los datos de la solicitud 
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
    // Llamar a la función de envío
    submission.handleSubmit(user, requestData, () => {
      formState.resetForm();
      timeSlots.resetTimeSlots();
    });
  };

  return { 
    // Estados del formulario 
    ...formState,

    // Estados y métodos de time slots 
    ...timeSlots,
    
    // Estado de carga
    loading: submission.loading,

    // Métodos específicos
    handleDateChange,
    handleSubmit
  }; 
};

export default useEventRequest;