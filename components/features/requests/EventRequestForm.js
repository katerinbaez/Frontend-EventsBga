import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Modal, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';

const EventRequestForm = ({ visible, onClose, spaceId, spaceName, managerId }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [spaceCapacity, setSpaceCapacity] = useState(null);
  const [capacityExceeded, setCapacityExceeded] = useState(false);
  
  // Función auxiliar para obtener el nombre del día a partir de su ID
  const getDayName = (dayId) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayId] || 'Desconocido';
  };
  
  // Función para convertir el valor de la categoría a un texto más legible
  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'musica': 'Música',
      'danza': 'Danza',
      'teatro': 'Teatro',
      'artes_visuales': 'Artes Visuales',
      'literatura': 'Literatura',
      'cine': 'Cine',
      'fotografia': 'Fotografía',
      'otro': 'Otro'
    };
    return categoryLabels[category] || (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'No especificada');
  };
  
  // Función para calcular la duración del evento
  const calculateEventDuration = (startTime, endTime) => {
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinutes = endTime.getMinutes();
    
    const durationHours = endHour - startHour;
    const durationMinutes = endMinutes - startMinutes;
    
    return `${durationHours} horas y ${durationMinutes} minutos`;
  };
  
  // Estados para el formulario
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // Mantener para compatibilidad
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventCategory, setEventCategory] = useState('otro');
  const [customCategory, setCustomCategory] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  
  // Función para manejar la selección de múltiples slots de tiempo
  const handleTimeSlotSelection = (slot) => {
    // Si no hay slots seleccionados, simplemente añadir el slot
    if (selectedTimeSlots.length === 0) {
      setSelectedTimeSlots([slot]);
      setSelectedTimeSlot(slot); // Mantener para compatibilidad
      return;
    }
    
    // Ordenar los slots seleccionados por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => {
      return a.hour - b.hour;
    });
    
    // Verificar si el slot seleccionado es consecutivo con los ya seleccionados
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    // Si el slot es una hora antes del primer slot seleccionado
    if (slot.hour === firstSlot.hour - 1) {
      const newSlots = [slot, ...sortedSlots];
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]); // Actualizar para compatibilidad
      return;
    }
    
    // Si el slot es una hora después del último slot seleccionado
    if (slot.hour === lastSlot.hour + 1) {
      const newSlots = [...sortedSlots, slot];
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]); // Mantener el primer slot para compatibilidad
      return;
    }
    
    // Si el slot ya está seleccionado, deseleccionarlo
    if (selectedTimeSlots.some(s => s.hour === slot.hour)) {
      // Si solo hay un slot seleccionado, deseleccionar todo
      if (selectedTimeSlots.length === 1) {
        setSelectedTimeSlots([]);
        setSelectedTimeSlot(null);
        return;
      }
      
      // Si hay múltiples slots, verificar si el slot a deseleccionar rompe la secuencia
      if (slot.hour !== firstSlot.hour && slot.hour !== lastSlot.hour) {
        // No permitir deseleccionar slots intermedios
        Alert.alert(
          'Selección no válida', 
          'Solo puedes deseleccionar el primer o último slot de la secuencia.',
          [{ text: 'Entendido', style: 'cancel' }]
        );
        return;
      }
      
      // Deseleccionar el primer o último slot
      const newSlots = selectedTimeSlots.filter(s => s.hour !== slot.hour);
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]); // Actualizar para compatibilidad
      return;
    }
    
    // Si el slot no es consecutivo, mostrar un mensaje
    Alert.alert(
      'Selección no válida', 
      'Solo puedes seleccionar slots consecutivos. Si necesitas más tiempo, selecciona un slot que sea consecutivo con los ya seleccionados.',
      [{ text: 'Entendido', style: 'cancel' }]
    );
  };
  
  // Calcular la duración total del evento en horas
  const calculateTotalDuration = () => {
    if (selectedTimeSlots.length === 0) return 0;
    
    // Ordenar los slots por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    // Calcular la duración total
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    return (lastSlot.hour + 1) - firstSlot.hour;
  };
  
  // Obtener el slot de inicio y fin para mostrar en el resumen
  const getTimeRange = () => {
    if (selectedTimeSlots.length === 0) return { start: '', end: '' };
    
    // Ordenar los slots por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    return {
      start: sortedSlots[0].start,
      end: sortedSlots[sortedSlots.length - 1].end
    };
  };
  
  // Cargar disponibilidad cuando el modal es visible
  useEffect(() => {
    if (visible && spaceId) {
      // Reiniciar estados
      setFilteredTimeSlots([]);
      setSelectedTimeSlot(null);
      setLoadingSlots(true);
      setEventDescription('');
      setEventDate(new Date());
      setExpectedAttendees('');
      setEventType('');
      setAdditionalRequirements('');
      setFilteredTimeSlots([]);
      setAvailableSlots([]);
      setBlockedSlots([]);
      
      // Usar setTimeout para asegurar que los estados se actualicen antes de cargar datos
      setTimeout(() => {
        // Cargar disponibilidad para la fecha actual
        loadAvailability();
        
        // Asegurar que se filtren los slots bloqueados correctamente
        setTimeout(() => {
          filterAvailableTimeSlots();
        }, 300);
      }, 100);
    }
  }, [visible, spaceId, managerId]);
  
  // Filtrar horarios disponibles cuando cambia la fecha o se cargan datos
  useEffect(() => {
    if (eventDate && availableSlots.length > 0) {
      // Asegurar que se filtren los horarios cuando cambian los datos relevantes
      console.log('Detectado cambio en fecha, slots disponibles o bloqueados - Filtrando horarios...');
      filterAvailableTimeSlots();
    } else if (eventDate && availableSlots.length === 0) {
      // Si no hay slots disponibles, limpiar los filtrados
      console.log('No hay slots disponibles para esta fecha');
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
    }
  }, [eventDate, availableSlots, blockedSlots]);

  // Cargar datos de disponibilidad y bloqueos desde el backend
  const loadAvailabilityPromise = async (specificDate) => {
    return new Promise(async (resolve, reject) => {
      try {
        await loadAvailability(specificDate);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
  
  // Versión promesa de loadBlockedSlotsForDate para manejar secuencias
  const loadBlockedSlotsPromise = async (specificDate) => {
    return new Promise(async (resolve, reject) => {
      try {
        await loadBlockedSlotsForDate(specificDate);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
  
  // Cargar disponibilidad para la fecha seleccionada
  const loadAvailability = async (selectedDate = eventDate) => {
    if (!spaceId || !managerId) {
      console.error('No se puede cargar disponibilidad sin spaceId o managerId');
      return;
    }
    
    // Reiniciar estados relacionados con slots
    setFilteredTimeSlots([]);
    setAvailableSlots([]);
    setBlockedSlots([]);
    setSelectedTimeSlots([]);
    setSelectedTimeSlot(null);
    
    setLoadingSlots(true);
    try {
      // Cargar información del espacio para obtener capacidad
      try {
        // Intentar obtener la capacidad del espacio desde diferentes endpoints
        let spaceData = null;
        
        // Intentar primero con la ruta del espacio por ID de gestor
        try {
          const culturalSpaceResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/space/manager/${managerId}`);
          console.log(`Datos del espacio cultural para el gestor ${managerId}:`, culturalSpaceResponse.data);
          
          if (culturalSpaceResponse.data.success && culturalSpaceResponse.data.space) {
            spaceData = culturalSpaceResponse.data.space;
          }
        } catch (error) {
          console.log('No se pudo obtener el espacio por ID de gestor, intentando con ID de espacio');
        }
        
        // Si no funcionó, intentar con la ruta directa del espacio
        if (!spaceData && spaceId) {
          try {
            const directSpaceResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/${spaceId}`);
            if (directSpaceResponse.data.success && directSpaceResponse.data.space) {
              spaceData = directSpaceResponse.data.space;
            }
          } catch (error) {
            console.log('No se pudo obtener el espacio por ID directo');
          }
        }
        
        // Si tenemos datos del espacio, intentar obtener la capacidad
        if (spaceData) {
          // Intentar obtener la capacidad de diferentes propiedades posibles
          let capacity = null;
          if (spaceData.capacidad !== undefined) {
            capacity = spaceData.capacidad;
          } else if (spaceData.capacity !== undefined) {
            capacity = spaceData.capacity;
          } else if (spaceData.aforo !== undefined) {
            capacity = spaceData.aforo;
          }
          
          // Convertir a número si es posible
          if (capacity !== null) {
            const capacityNum = parseInt(capacity, 10);
            if (!isNaN(capacityNum)) {
              setSpaceCapacity(capacityNum);
              console.log(`Capacidad del espacio: ${capacityNum} personas`);
            } else {
              console.log(`La capacidad del espacio no es un número válido: ${capacity}`);
              setSpaceCapacity(null);
            }
          } else {
            console.log('El espacio no tiene una capacidad definida');
            setSpaceCapacity(null);
          }
        } else {
          console.log('No se pudo obtener información del espacio cultural');
          setSpaceCapacity(null);
        }
      } catch (error) {
        console.error('Error al cargar información del espacio:', error);
        setSpaceCapacity(null);
      }
      
      // Usar la fecha específica si se proporciona, o la fecha del evento seleccionada
      const dateToUse = selectedDate;
      const date = dateToUse.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const dayOfWeek = dateToUse.getDay(); // Día de la semana (0-6)
      
      console.log(`Cargando disponibilidad para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
      
      // Cargar disponibilidad para la fecha seleccionada
      const availabilityResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${date}`);
      
      // Procesar los datos de disponibilidad
      if (availabilityResponse.data) {
        const formattedAvailabilities = [];
        const availabilityDataObj = availabilityResponse.data.availability || availabilityDataObj;
        
        if (typeof availabilityDataObj === 'object' && Object.keys(availabilityDataObj).length > 0) {
          for (const day in availabilityDataObj) {
            const dayOfWeek = parseInt(day, 10);
            if (!isNaN(dayOfWeek)) {
              const hoursArray = availabilityDataObj[day];
              
              if (Array.isArray(hoursArray) && hoursArray.length > 0) {
                const hours = hoursArray.map(hour => {
                  return typeof hour === 'string' ? parseInt(hour, 10) : hour;
                }).filter(hour => !isNaN(hour));
                
                if (hours.length > 0) {
                  formattedAvailabilities.push({
                    day: getDayName(dayOfWeek),
                    dayOfWeek: dayOfWeek,
                    timeSlots: hours,
                    isSpecificDate: true
                  });
                }
              }
            }
          }
        }
        
        // Actualizar los estados con los datos cargados
        setAvailableSlots(formattedAvailabilities);
      }
      
      // Cargar slots bloqueados
      const blockedResponse = await axios.get(`${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?date=${date}`);
      const allBlockedSlots = blockedResponse.data && blockedResponse.data.blockedSlots ? blockedResponse.data.blockedSlots : [];
      
      // Actualizar los estados con los datos cargados
      setBlockedSlots(allBlockedSlots);
      
      // Volver a filtrar los slots disponibles con los nuevos datos de bloqueo
      setTimeout(() => filterAvailableTimeSlots(), 100);
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

  // Filtrar horarios disponibles para el día seleccionado
  const filterAvailableTimeSlots = (dateToFilter = null) => {
    // Usar la fecha proporcionada o la fecha actual del estado
    const dateToUse = dateToFilter || eventDate;
    if (!dateToUse) {
      console.log('No hay fecha seleccionada');
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
      return;
    }
    
    // Obtener el día de la semana (0-6) de la fecha seleccionada
    const dayOfWeek = dateToUse.getDay();
    
    // Formatear la fecha seleccionada para comparaciones
    const date = dateToUse.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    console.log(`Filtrando slots para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
    console.log(`Total slots bloqueados: ${blockedSlots.length}`);
    
    // Verificar si hay configuración de disponibilidad cargada
    if (availableSlots.length === 0) {
      console.log('No hay configuración de disponibilidad cargada para esta fecha');
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
      return;
    }
    
    // Buscar configuración de disponibilidad para este día
    const dayAvailability = availableSlots.find(slot => slot.dayOfWeek === dayOfWeek);
    
    if (!dayAvailability || !dayAvailability.timeSlots || dayAvailability.timeSlots.length === 0) {
      console.log(`No hay franjas configuradas para el día ${getDayName(dayOfWeek)}`);
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
      return;
    }
    
    // Verificar si es una configuración específica para esta fecha
    if (dayAvailability.isSpecificDate) {
      console.log(`Usando configuración ESPECÍFICA para fecha ${date}`);
    } else {
      console.log(`Usando configuración general para día ${getDayName(dayOfWeek)}`);
    }
    
    console.log(`Encontradas ${dayAvailability.timeSlots.length} franjas configuradas para ${getDayName(dayOfWeek)}`);
    
    // Crear array de slots disponibles
    const availableHours = dayAvailability.timeSlots.map(hour => {
      // Convertir a número si es string
      const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
      
      // Formatear la hora para mostrar
      const formattedHour = hourNum < 10 ? `0${hourNum}:00` : `${hourNum}:00`;
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
      const displayTime = `${displayHour}:00 ${period}`;
      
      // Añadir horas de inicio y fin para el evento (siempre exactamente 1 hora)
      const startHour = `${hourNum < 10 ? '0' + hourNum : hourNum}:00:00`;
      const endHour = `${(hourNum + 1) < 10 ? '0' + (hourNum + 1) : (hourNum + 1)}:00:00`;
      
      // Calcular la duración en horas
      const duration = (hourNum + 1) - hourNum;
      
      return {
        hour: hourNum,
        formattedHour,
        displayTime,
        start: startHour,
        end: endHour,
        duration: duration // Añadir la duración para filtrar después
      };
    });
    
    // Filtrar slots para asegurar que solo se muestren los que duran exactamente 1 hora
    const validDurationSlots = availableHours.filter(slot => slot.duration === 1);
    
    // Si hay slots que exceden la duración máxima, mostrar un mensaje en la consola
    if (validDurationSlots.length < availableHours.length) {
      console.log(`Se filtraron ${availableHours.length - validDurationSlots.length} slots que exceden la duración máxima de 1 hora`);
    }
    
    // Mostrar información detallada de todos los slots configurados
    console.log('Slots configurados antes de filtrar:');
    validDurationSlots.forEach(slot => {
      console.log(`- ${slot.displayTime} (Duración: ${slot.duration} hora)`);
    });
    
    // Mostrar información detallada de todos los slots bloqueados
    console.log('Slots bloqueados:');
    blockedSlots.forEach(slot => {
      console.log(`- Hora ${slot.hour}:00, Fecha ${slot.date || 'Recurrente'}, Día ${slot.day !== undefined ? getDayName(slot.day) : 'No especificado'}`);
    });
    
    // Ya tenemos la variable date definida arriba
    
    // Filtrar slots que ya están bloqueados para esta fecha
    // Solo consideramos slots que tienen la duración correcta (1 hora)
    const filteredHours = validDurationSlots.filter(slot => {
      // Verificar si este slot está bloqueado
      const isBlocked = blockedSlots.some(blockedSlot => {
        // Verificar si el slot bloqueado coincide con la hora actual
        const hourMatches = blockedSlot.hour === slot.hour;
        if (!hourMatches) return false;
        
        // Si el slot bloqueado es recurrente, verificar día de la semana
        if (blockedSlot.isRecurring) {
          // Verificar si el día coincide (usando day en lugar de dayOfWeek para compatibilidad)
          const dayMatches = blockedSlot.day === dayOfWeek;
          if (dayMatches) {
            console.log(`Slot ${slot.displayTime} bloqueado recurrentemente para ${getDayName(dayOfWeek)}`);
            return true;
          }
        }
        
        // Si no es recurrente, verificar fecha específica
        if (blockedSlot.date) {
          // Asegurar que estamos comparando el mismo formato de fecha
          const blockedDate = blockedSlot.date;
          const dateMatches = blockedDate === date;
          
          if (dateMatches) {
            console.log(`Slot ${slot.displayTime} bloqueado específicamente para la fecha ${date}`);
            return true;
          }
        }
        
        return false;
      });
      
      if (isBlocked) {
        console.log(`Excluyendo franja bloqueada: ${slot.displayTime}`);
      }
      
      // Solo incluir slots que no estén bloqueados
      return !isBlocked;
    });
    
    console.log(`Slots disponibles después de filtrar bloqueados: ${filteredHours.length}`);
    filteredHours.forEach(slot => {
      console.log(`Slot disponible: ${slot.displayTime} (Duración: ${slot.duration} hora)`);
    });
    
    // Ya no filtramos por eventos aprobados, usamos directamente los slots disponibles después de filtrar bloqueados
    console.log(`Slots disponibles finales: ${filteredHours.length}`);
    setFilteredTimeSlots(filteredHours);
  };

  // Manejar cambio de fecha
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      console.log(`Fecha seleccionada cambiada a: ${selectedDate.toLocaleDateString()}, día: ${getDayName(selectedDate.getDay())}`);
      
      // Indicar que estamos cargando
      setLoadingSlots(true);
      
      // Limpiar estados previos
      setFilteredTimeSlots([]);
      setSelectedTimeSlots([]);
      setSelectedTimeSlot(null);
      
      // Guardar la fecha seleccionada para usarla en las funciones de carga
      const selectedDateCopy = new Date(selectedDate.getTime());
      
      // Actualizar la fecha en el estado
      setEventDate(selectedDate);
      
      // Cargar datos de forma sincronizada
      const loadDataForDate = async () => {
        try {
          // Limpiar datos anteriores
          setAvailableSlots([]);
          setBlockedSlots([]);
          
          // Cargar disponibilidad directamente sin esperar a que se actualice el estado
          console.log(`Cargando disponibilidad directamente para fecha: ${selectedDateCopy.toISOString().split('T')[0]}`);
          const availabilityData = await axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${selectedDateCopy.toISOString().split('T')[0]}`);
          
          // Procesar los datos de disponibilidad
          if (availabilityData.data) {
            const formattedAvailabilities = [];
            const availabilityDataObj = availabilityData.data.availability || availabilityData.data;
            
            if (typeof availabilityDataObj === 'object' && Object.keys(availabilityDataObj).length > 0) {
              for (const day in availabilityDataObj) {
                const dayOfWeek = parseInt(day, 10);
                if (!isNaN(dayOfWeek)) {
                  const hoursArray = availabilityDataObj[day];
                  
                  if (Array.isArray(hoursArray) && hoursArray.length > 0) {
                    const hours = hoursArray.map(hour => {
                      return typeof hour === 'string' ? parseInt(hour, 10) : hour;
                    }).filter(hour => !isNaN(hour));
                    
                    if (hours.length > 0) {
                      formattedAvailabilities.push({
                        day: getDayName(dayOfWeek),
                        dayOfWeek: dayOfWeek,
                        timeSlots: hours,
                        isSpecificDate: true
                      });
                    }
                  }
                }
              }
            }
            
            // Cargar slots bloqueados
            const date = selectedDateCopy.toISOString().split('T')[0];
            const dayOfWeek = selectedDateCopy.getDay();
            
            // Cargar slots bloqueados específicos
            const blockedResponse = await axios.get(`${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?date=${date}`);
            const allBlockedSlots = blockedResponse.data && blockedResponse.data.blockedSlots ? blockedResponse.data.blockedSlots : [];
            
            // Actualizar los estados con los datos cargados
            setAvailableSlots(formattedAvailabilities);
            setBlockedSlots(allBlockedSlots);
            
            // Filtrar los slots disponibles inmediatamente
            if (formattedAvailabilities.length > 0) {
              // Crear array de slots disponibles para el día seleccionado
              const dayAvailability = formattedAvailabilities.find(slot => slot.dayOfWeek === dayOfWeek);
              
              if (dayAvailability && dayAvailability.timeSlots && dayAvailability.timeSlots.length > 0) {
                const availableHours = dayAvailability.timeSlots.map(hour => {
                  const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
                  
                  const formattedHour = hourNum < 10 ? `0${hourNum}:00` : `${hourNum}:00`;
                  const period = hourNum >= 12 ? 'PM' : 'AM';
                  const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
                  const displayTime = `${displayHour}:00 ${period}`;
                  
                  const startHour = `${hourNum < 10 ? '0' + hourNum : hourNum}:00:00`;
                  const endHour = `${(hourNum + 1) < 10 ? '0' + (hourNum + 1) : (hourNum + 1)}:00:00`;
                  
                  return {
                    hour: hourNum,
                    formattedHour,
                    displayTime,
                    start: startHour,
                    end: endHour
                  };
                });
                
                // Filtrar slots bloqueados
                const filteredHours = availableHours.filter(slot => {
                  return !allBlockedSlots.some(blockedSlot => {
                    return blockedSlot.hour === slot.hour && 
                           ((blockedSlot.isRecurring && blockedSlot.day === dayOfWeek) || 
                            (blockedSlot.date === date));
                  });
                });
                
                // Actualizar los slots filtrados
                setFilteredTimeSlots(filteredHours);
              } else {
                setFilteredTimeSlots([]);
              }
            } else {
              setFilteredTimeSlots([]);
            }
          }
          
          // Finalizar la carga
          setLoadingSlots(false);
        } catch (error) {
          console.error('Error al cargar datos para la fecha:', error);
          setLoadingSlots(false);
          setFilteredTimeSlots([]);
        }
      };
      
      // Iniciar la carga de datos inmediatamente
      loadDataForDate();
    }
  };

  // Cargar slots bloqueados para una fecha específica
  const loadBlockedSlotsForDate = async (specificDate) => {
    try {
      const date = specificDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const dayOfWeek = specificDate.getDay(); // Día de la semana (0-6)
      console.log(`Cargando slots bloqueados para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
      
      // Primero, intentamos cargar los slots bloqueados específicos para esta fecha
      const specificUrl = `${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?date=${date}`;
      console.log(`Solicitando slots bloqueados específicos desde URL: ${specificUrl}`);
      
      const specificResponse = await axios.get(specificUrl);
      let allBlockedSlots = [];
      
      // Procesamos los slots bloqueados específicos para esta fecha
      if (specificResponse.data && specificResponse.data.blockedSlots) {
        const specificBlockedSlots = specificResponse.data.blockedSlots;
        console.log(`Slots bloqueados específicos para fecha ${date}: ${specificBlockedSlots.length}`);
        
        // Filtrar solo los slots bloqueados específicos para esta fecha
        const dateSpecificSlots = specificBlockedSlots.filter(slot => {
          if (slot.date === date) {
            console.log(`Slot bloqueado específico para fecha ${date}: Hora ${slot.hour}:00`);
            return true;
          }
          return false;
        });
        
        allBlockedSlots = [...dateSpecificSlots];
      }
      
      // Ahora, cargamos los slots bloqueados recurrentes para este día de la semana
      const recurringUrl = `${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?recurring=true&day=${dayOfWeek}`;
      console.log(`Solicitando slots bloqueados recurrentes desde URL: ${recurringUrl}`);
      
      const recurringResponse = await axios.get(recurringUrl);
      
      // Procesamos los slots bloqueados recurrentes para este día de la semana
      if (recurringResponse.data && recurringResponse.data.blockedSlots) {
        const recurringBlockedSlots = recurringResponse.data.blockedSlots;
        console.log(`Slots bloqueados recurrentes para día ${getDayName(dayOfWeek)}: ${recurringBlockedSlots.length}`);
        
        // Filtrar solo los slots bloqueados recurrentes para este día de la semana
        const dayRecurringSlots = recurringBlockedSlots.filter(slot => {
          if (slot.isRecurring && slot.day === dayOfWeek) {
            console.log(`Slot bloqueado recurrente para día ${getDayName(dayOfWeek)}: Hora ${slot.hour}:00`);
            return true;
          }
          return false;
        });
        
        // Combinar los slots bloqueados específicos y recurrentes
        allBlockedSlots = [...allBlockedSlots, ...dayRecurringSlots];
      }
      
      // Eliminar duplicados (misma hora)
      const uniqueBlockedSlots = [];
      const seenHours = new Set();
      
      allBlockedSlots.forEach(slot => {
        if (!seenHours.has(slot.hour)) {
          seenHours.add(slot.hour);
          uniqueBlockedSlots.push(slot);
        }
      });
      
      console.log(`Total slots bloqueados para fecha ${date}: ${uniqueBlockedSlots.length}`);
      
      // Mostrar información detallada sobre los slots bloqueados
      uniqueBlockedSlots.forEach(slot => {
        const slotDay = slot.day !== undefined ? getDayName(slot.day) : 'No especificado';
        const slotDate = slot.date || 'No especificada';
        const slotHour = slot.hour < 10 ? `0${slot.hour}:00` : `${slot.hour}:00`;
        const slotType = slot.isRecurring ? 'Recurrente' : 'Específico';
        console.log(`Slot bloqueado (${slotType}): Día ${slotDay}, Hora ${slotHour}, Fecha ${slotDate}`);
      });
      
      // Guardar los slots bloqueados en el estado
      setBlockedSlots(uniqueBlockedSlots);
      
      // Volver a filtrar los slots disponibles con los nuevos datos de bloqueo
      setTimeout(() => filterAvailableTimeSlots(), 100);
    } catch (error) {
      console.error('Error al cargar slots bloqueados para fecha específica:', error);
      setBlockedSlots([]);
      // Volver a filtrar los slots disponibles sin bloqueos
      setTimeout(() => filterAvailableTimeSlots(), 100);
    }
  };

  // Mostrar resumen y confirmar envío
  const showSummaryAndConfirm = () => {
    if (!eventName || !eventDescription || selectedTimeSlots.length === 0 || !expectedAttendees || !eventType) {
      Alert.alert('Campos incompletos', 'Por favor complete todos los campos obligatorios');
      return;
    }
    
    // Calcular la duración total del evento
    const totalDuration = calculateTotalDuration();
    
    // Formatear la hora para mostrar en formato más amigable
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
    };
    
    // Verificar si se excede la capacidad
    let warningMessage = '';
    const defaultCapacity = 100; // Capacidad predeterminada si no se puede obtener del servidor
    const capacity = spaceCapacity || defaultCapacity;
    if (parseInt(expectedAttendees, 10) > capacity) {
      warningMessage = `\n\n⚠️ ADVERTENCIA: El número de asistentes (${expectedAttendees}) excede la capacidad del espacio (${capacity} personas).`;
    }
    
    // Obtener el rango de tiempo seleccionado
    const timeRange = getTimeRange();
    
    Alert.alert(
      'Confirmar solicitud',
      `Por favor, verifica los detalles de tu solicitud:
      
Nombre del evento: ${eventName}
Fecha: ${eventDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Horario: ${formatTime(timeRange.start)} - ${formatTime(timeRange.end)}
Duración: ${calculateTotalDuration()} horas
Asistentes esperados: ${expectedAttendees}
Tipo de evento: ${eventType}
Categoría: ${getCategoryLabel(eventCategory)}
${eventCategory === 'otro' ? `Categoría personalizada: ${customCategory}` : ''}${warningMessage}

¿Deseas enviar esta solicitud?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Enviar',
          onPress: () => handleSubmit()
        }
      ]
    );
  };
  
  // Enviar solicitud de evento al endpoint sin token de autenticación
const handleSubmit = async () => {
  setLoading(true);
  try {
    // Obtener el rango de tiempo de los slots seleccionados
    const timeRange = getTimeRange();
    
    // Crear los datos de la solicitud
    const requestData = {
      artistId: user.id,
      managerId: managerId,
      spaceId: spaceId,
      titulo: eventName,
      descripcion: eventDescription,
      fecha: eventDate.toISOString().split('T')[0],
      horaInicio: timeRange.start,
      horaFin: timeRange.end,
      duracionHoras: calculateTotalDuration(),
      asistentesEsperados: parseInt(expectedAttendees, 10),
      tipoEvento: eventType,
      categoria: eventCategory,
      categoriaPersonalizada: eventCategory === 'otro' ? customCategory.trim() : null,
      requerimientosAdicionales: additionalRequirements || 'Ninguno',
      estado: 'pendiente'
    };

    console.log('Datos de la solicitud:', JSON.stringify(requestData));
    
    // Verificar que el usuario esté autenticado
    if (!user || !user.id) {
      Alert.alert(
        'Error de autenticación', 
        'No se pudo verificar tu identidad. Por favor, inicia sesión nuevamente.',
        [{ text: 'Entendido', style: 'cancel' }]
      );
      setLoading(false);
      return;
    }
    
    try {
      console.log('Enviando solicitud sin token...');
      
      // Preparar los datos para el endpoint alternativo sin token
      const dataToSend = {
        ...requestData,
        artistEmail: user.email,  // Incluir email para verificación adicional
        oauth_id: user.id,  // Incluir ID de OAuth para verificación en backend
        // Asegurar que todos los campos requeridos estén presentes
        artistId: user.id || '',
        managerId: requestData.managerId || '',
        // Convertir spaceId a número entero si es posible, o usar 1 como valor por defecto
        spaceId: requestData.spaceId && !isNaN(parseInt(requestData.spaceId)) ? 
                parseInt(requestData.spaceId) : 1,
        // Usar el nombre del espacio que se recibe como prop
        spaceName: spaceName || 'Espacio Cultural',
        spaceAddress: 'Centro del oriente, Bucaramanga',
        titulo: requestData.titulo || '',
        descripcion: requestData.descripcion || '',
        fecha: requestData.fecha || new Date().toISOString().split('T')[0],
        horaInicio: requestData.horaInicio || '00:00:00',
        horaFin: requestData.horaFin || '01:00:00',
        duracionHoras: requestData.duracionHoras || 1,
        asistentesEsperados: parseInt(requestData.asistentesEsperados) || 0,
        tipoEvento: requestData.tipoEvento || '',
        categoria: requestData.categoria || '',
        requerimientosAdicionales: requestData.requerimientosAdicionales || ''
      };
      
      console.log('Enviando datos al endpoint sin token:', dataToSend);
      
      // Enviar la solicitud al endpoint alternativo que no requiere token
      const response = await axios.post(`${BACKEND_URL}/api/event-requests/artist-submit`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta exitosa del servidor:', response.data);
      
      // Mostrar mensaje de éxito con el color de acento rojo (#FF3A5E)
      Alert.alert(
        'Solicitud Enviada', 
        'Tu solicitud ha sido enviada con éxito. El gestor del espacio te notificará cuando sea revisada.',
        [{ text: 'OK', onPress: () => {
          // Limpiar formulario
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
          // Cerrar modal
          onClose();
        }}]
      );
    } catch (error) {
      console.error('Error al enviar solicitud:', error);

      let errorMessage = 'Ocurrió un error al enviar la solicitud. Por favor, inténtalo de nuevo.';

      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Error de respuesta:', error.response.data);
        if (error.response.status === 401) {
          errorMessage = 'No estás autorizado para realizar esta acción. Por favor, inicia sesión nuevamente.';
        } else if (error.response.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción.';
        } else if (error.response.status === 500) {
          errorMessage = 'Error en el servidor. El equipo técnico ha sido notificado. Por favor, inténtalo más tarde.';
          // Intentar extraer más información del error para mostrar un mensaje más específico
          if (error.response.data && error.response.data.error) {
            if (error.response.data.error.includes('foreign key constraint')) {
              errorMessage = 'Error de referencia: Uno de los datos proporcionados no existe en el sistema.';
            } else if (error.response.data.error.includes('null')) {
              errorMessage = 'Faltan datos obligatorios en el formulario. Por favor, completa todos los campos requeridos.';
            }
          }
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error('Error de solicitud:', error.request);
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }

      // Mostrar el error en un Alert con el color de acento rojo (#FF3A5E)
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'Entendido', style: 'cancel' }]
      );

      // No es necesario hacer scroll ya que usamos Alert
    }
  } catch (outerError) {
    console.error('Error inesperado:', outerError);
    Alert.alert('Error Inesperado', 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.');
  } finally {
    setLoading(false);
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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Solicitar Evento</Text>
              <Text style={styles.spaceName}>{spaceName}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerDivider} />
          
          <ScrollView 
            showsVerticalScrollIndicator={true} 
            persistentScrollbar={true} 
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del evento *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Concierto de Jazz"
                placeholderTextColor="#999"
                value={eventName}
                onChangeText={setEventName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe brevemente el evento"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={eventDescription}
                onChangeText={setEventDescription}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha *</Text>
              <View style={styles.dateContainer}>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#FF3A5E" style={styles.dateIcon} />
                  <Text style={styles.dateText}>
                    {eventDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                  <View style={styles.dateIndicator}>
                    <Ionicons name="chevron-down" size={16} color="#FF3A5E" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.dateHint}>Selecciona una fecha para ver los horarios disponibles</Text>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.label}>Horario disponible *</Text>
                {filteredTimeSlots.length > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{filteredTimeSlots.length}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.infoText}>Selecciona un horario disponible para tu evento</Text>
              
              {/* Indicador de selección múltiple */}
              {selectedTimeSlots.length > 0 && (
                <View style={styles.multiSelectInfo}>
                  <Ionicons name="information-circle" size={16} color="#FF3A5E" style={{marginRight: 6}} />
                  <Text style={styles.multiSelectText}>
                    {selectedTimeSlots.length === 1 
                      ? "Puedes seleccionar slots adicionales consecutivos si necesitas más tiempo" 
                      : `Has seleccionado ${selectedTimeSlots.length} slots consecutivos (${calculateTotalDuration()} horas)`}
                  </Text>
                </View>
              )}
              
              {loadingSlots ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF3A5E" />
                  <Text style={styles.loadingText}>Cargando horarios disponibles...</Text>
                </View>
              ) : filteredTimeSlots.length > 0 ? (
                <View style={styles.timeSlotListContainer}>
                  <View style={styles.timeSlotHeader}>
                    <View style={styles.timeSlotHeaderLeft}>
                      <Ionicons name="calendar" size={18} color="#FF3A5E" style={{marginRight: 8}} />
                      <Text style={styles.timeSlotHeaderText}>{eventDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</Text>
                    </View>
                    <View style={styles.timeSlotHeaderRight}>
                      <Ionicons name="time-outline" size={16} color="#FF3A5E" style={{marginRight: 4}} />
                      <Text style={styles.timeSlotCount}>{filteredTimeSlots.length} franjas</Text>
                    </View>
                  </View>
                  
                  <View style={styles.timeSlotScrollContainer}>
                    <ScrollView 
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                      persistentScrollbar={true}
                      contentContainerStyle={styles.timeSlotContentContainer}
                    >
                      {filteredTimeSlots.map((slot, index) => (
                        <TouchableOpacity
                          key={`time-slot-${index}`}
                          style={[
                            styles.timeSlot,
                            selectedTimeSlots.some(s => s.hour === slot.hour) ? styles.selectedTimeSlot : null
                          ]}
                          onPress={() => handleTimeSlotSelection(slot)}
                        >
                          <View style={styles.timeSlotIconContainer}>
                            <Ionicons 
                              name={selectedTimeSlots.some(s => s.hour === slot.hour) ? "checkmark-circle" : "time-outline"} 
                              size={20} 
                              color={selectedTimeSlots.some(s => s.hour === slot.hour) ? "white" : "#FF3A5E"} 
                            />
                          </View>
                          <Text 
                            style={[
                              styles.timeSlotText,
                              selectedTimeSlots.some(s => s.hour === slot.hour) ? styles.selectedTimeSlotText : null
                            ]}
                          >
                            {slot.displayTime}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              ) : (
                <View style={styles.noSlotsContainer}>
                  <Ionicons name="alert-circle-outline" size={24} color="#FF3A5E" />
                  <View style={styles.noSlotsTextContainer}>
                    <Text style={styles.noSlotsTitle}>No hay horarios disponibles</Text>
                    <Text style={styles.noSlotsText}>
                      No se encontraron franjas horarias disponibles para esta fecha. Por favor, selecciona otra fecha.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Asistentes esperados *</Text>
              <TextInput
                style={[
                  styles.input,
                  capacityExceeded && {borderColor: '#FF3A5E', borderWidth: 1}
                ]}
                placeholder="Ej. 50"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={expectedAttendees}
                onChangeText={handleExpectedAttendeesChange}
              />
              {capacityExceeded && (
                <View style={styles.warningContainer}>
                  <Ionicons name="warning-outline" size={16} color="#FF3A5E" />
                  <Text style={styles.warningText}>
                    El número de asistentes excede la capacidad del espacio ({spaceCapacity || 100} personas).
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de evento *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Concierto, exposición, taller"
                placeholderTextColor="#999"
                value={eventType}
                onChangeText={setEventType}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoría *</Text>
              <View style={styles.categoryContainer}>
                {['musica', 'teatro', 'danza', 'arte', 'literatura', 'cine', 'otro'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      eventCategory === cat && styles.categoryButtonActive
                    ]}
                    onPress={() => setEventCategory(cat)}
                  >
                    <Text 
                      style={[
                        styles.categoryButtonText,
                        eventCategory === cat && styles.categoryButtonTextActive
                      ]}
                    >
                      {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'No especificada'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {eventCategory === 'otro' && (
                <View style={styles.customCategoryContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Especifica otra categoría"
                    placeholderTextColor="#999"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                  />
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Requerimientos adicionales</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ej. Equipo de sonido, proyector, etc."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={additionalRequirements}
                onChangeText={setAdditionalRequirements}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={showSummaryAndConfirm}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Procesando...</Text>
                </View>
              ) : (
                <View style={styles.submitButtonContent}>
                  <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={styles.submitButtonIcon} />
                  <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
  },
  scrollContent: {
    paddingBottom: 20, // Añadir espacio adicional al final del contenido
    paddingHorizontal: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3A5E',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.3)',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateContainer: {
    marginBottom: 5,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.3)',
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    color: '#FFFFFF',
    flex: 1,
  },
  dateIndicator: {
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  dateHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
    marginLeft: 5,
  },
  timeSlotListContainer: {
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.3)',
  },
  timeSlotHeader: {
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 58, 94, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSlotHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeSlotHeaderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timeSlotCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeSlotListContent: {
    paddingBottom: 5,
  },
  timeSlotScrollContainer: {
    height: 200,
    flexGrow: 0,
  },
  timeSlotContentContainer: {
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  badgeContainer: {
    backgroundColor: '#FF3A5E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.3)',
    marginTop: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
  },
  timeSlot: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 58, 94, 0.2)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeSlotIconContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#FF3A5E'
  },
  timeSlotText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
  },
  selectedTimeSlotText: {
    color: 'white',
    fontWeight: 'bold'
  },
  noSlotsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 58, 94, 0.05)',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.3)',
  },
  noSlotsTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  
  // Estilos para la información de selección múltiple
  multiSelectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  multiSelectText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  noSlotsTitle: {
    color: '#FF3A5E',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  noSlotsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#FF3A5E',
    borderRadius: 25,
    padding: 15,
    marginTop: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    borderColor: '#FF3A5E',
  },
  categoryButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  customCategoryContainer: {
    marginTop: 10,
  },
  errorText: {
    color: '#FF3A5E',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  warningText: {
    fontSize: 13,
    color: '#FF3A5E',
    flex: 1,
    marginLeft: 8,
  },
});

export default EventRequestForm;
