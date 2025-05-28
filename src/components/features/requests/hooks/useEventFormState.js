import { useState } from 'react';
import { Platform } from 'react-native';

const useEventFormState = () => {
  // Estados para el formulario
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventCategory, setEventCategory] = useState('otro');
  const [customCategory, setCustomCategory] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [capacityExceeded, setCapacityExceeded] = useState(false);
  const [spaceCapacity, setSpaceCapacity] = useState(null);

  // Manejar cambio de categoría
  const handleCategoryChange = (category) => {
    setEventCategory(category);
    if (category !== 'otro') {
      setCustomCategory('');
    }
  };

  // Manejar cambio de asistentes esperados
  const handleExpectedAttendeesChange = (value) => {
    setExpectedAttendees(value);
    
    // Verificar si se excede la capacidad
    const defaultCapacity = 100; // Capacidad predeterminada si no se puede obtener del servidor
    const capacity = spaceCapacity || defaultCapacity;
    const attendees = parseInt(value, 10);
    if (!isNaN(attendees) && attendees > capacity) {
      setCapacityExceeded(true);
    } else {
      setCapacityExceeded(false);
    }
  };

  // Manejar cambio de fecha
  const handleDateChange = (event, selectedDate, showPicker = false) => {
    // Para Android, el evento puede ser 'set' o 'dismissed'
    if (event && event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    
    // Si solo queremos mostrar/ocultar el picker
    if (showPicker !== undefined) {
      setShowDatePicker(showPicker);
      return;
    }
    
    // Ocultar el picker en iOS, en Android se maneja automáticamente
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
    
    // Si no hay fecha seleccionada, mantener la actual
    if (!selectedDate) return;
    
    // Crear una nueva instancia de Date para evitar problemas de referencia
    const newDate = new Date(selectedDate);
    
    // Asegurar que la fecha sea correcta (sin problemas de zona horaria)
    // Establecer la hora a mediodía para evitar problemas con cambios de día debido a zonas horarias
    newDate.setHours(12, 0, 0, 0);
    
    // Actualizar la fecha seleccionada
    setEventDate(newDate);
  };

  // Resetear el formulario
  const resetForm = () => {
    setEventName('');
    setEventDescription('');
    setEventDate(new Date());
    setExpectedAttendees('');
    setEventType('');
    setEventCategory('otro');
    setCustomCategory('');
    setAdditionalRequirements('');
  };

  return {
    // Estados
    eventName,
    eventDescription,
    eventDate,
    showDatePicker,
    expectedAttendees,
    eventType,
    eventCategory,
    customCategory,
    additionalRequirements,
    confirmModalVisible,
    capacityExceeded,
    spaceCapacity,
    
    // Setters
    setEventName,
    setEventDescription,
    setEventDate,
    setEventType,
    setAdditionalRequirements,
    setShowDatePicker,
    setConfirmModalVisible,
    setSpaceCapacity,
    setExpectedAttendees,
    
    // Handlers
    handleCategoryChange,
    handleExpectedAttendeesChange,
    handleDateChange,
    setCustomCategory,
    resetForm
  };
};

export default useEventFormState;