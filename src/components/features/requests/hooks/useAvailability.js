import { useState } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { getDayName } from '../utils/eventRequestUtils';

const useAvailability = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);

  // Cargar disponibilidad para la fecha seleccionada
  const loadAvailability = async (managerId, spaceId, selectedDate, setLoadingSlots, setFilteredTimeSlots, setSpaceCapacity, filterAvailableTimeSlots) => {
    if (!spaceId || !managerId) {
      console.error('No se puede cargar disponibilidad sin spaceId o managerId');
      return;
    }
    
    // Reiniciar estados relacionados con slots
    setFilteredTimeSlots([]);
    setAvailableSlots([]);
    setBlockedSlots([]);
    
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
        const availabilityDataObj = availabilityResponse.data.availability || {};
        
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
      setTimeout(() => filterAvailableTimeSlots(selectedDate), 100);
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
  const filterAvailableTimeSlots = (dateToFilter, eventDate, availableSlots, blockedSlots, setFilteredTimeSlots, setLoadingSlots) => {
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
    
    // Encontrar la disponibilidad para el día de la semana seleccionado
    const availabilityForDay = availableSlots.find(a => a.dayOfWeek === dayOfWeek);
    if (!availabilityForDay || !availabilityForDay.timeSlots || availabilityForDay.timeSlots.length === 0) {
      console.log(`No hay disponibilidad configurada para ${getDayName(dayOfWeek)}`);
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
      return;
    }
    
    console.log(`Disponibilidad para ${getDayName(dayOfWeek)}: ${availabilityForDay.timeSlots.join(', ')}`);
    
    // Filtrar los slots bloqueados para la fecha seleccionada
    const blockedSlotsForDate = blockedSlots.filter(slot => {
      return slot.date === date;
    });
    
    console.log(`Slots bloqueados para fecha ${date}: ${blockedSlotsForDate.length}`);
    
    // Crear un array de horas bloqueadas
    const blockedHours = blockedSlotsForDate.map(slot => slot.hour);
    console.log(`Horas bloqueadas: ${blockedHours.join(', ')}`);
    
    // Filtrar las horas disponibles, excluyendo las bloqueadas
    const availableHours = availabilityForDay.timeSlots.filter(hour => !blockedHours.includes(hour));
    console.log(`Horas disponibles después de filtrar: ${availableHours.join(', ')}`);
    
    // Convertir las horas disponibles a slots con formato
    const formattedSlots = availableHours.map(hour => {
      // Formatear la hora de inicio y fin
      const startHour = hour < 10 ? `0${hour}:00:00` : `${hour}:00:00`;
      const endHour = hour + 1 < 10 ? `0${hour + 1}:00:00` : `${hour + 1}:00:00`;
      
      // Formatear para mostrar
      const start = startHour.substring(0, 5);
      const end = endHour.substring(0, 5);
      
      return {
        hour: hour,
        start: start,
        end: end,
        isAvailable: true
      };
    });
    
    // Ordenar los slots por hora
    formattedSlots.sort((a, b) => a.hour - b.hour);
    
    console.log(`Total slots disponibles formateados: ${formattedSlots.length}`);
    
    // Actualizar el estado con los slots filtrados
    setFilteredTimeSlots(formattedSlots);
    setLoadingSlots(false);
  };

  return {
    availableSlots,
    blockedSlots,
    setAvailableSlots,
    setBlockedSlots,
    loadAvailability,
    filterAvailableTimeSlots
  };
};

export default useAvailability;