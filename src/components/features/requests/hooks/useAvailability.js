/**
 * Este archivo maneja el hook de disponibilidad
 * - Hooks
 * - Disponibilidad
 * - Estado
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { getDayName } from '../utils/eventRequestUtils';

const useAvailability = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);

  const loadAvailability = async (managerId, spaceId, selectedDate, setLoadingSlots, setFilteredTimeSlots, setSpaceCapacity, filterAvailableTimeSlots) => {
    if (!spaceId || !managerId) {
      console.error('No se puede cargar disponibilidad sin spaceId o managerId');
      return;
    }
    
    setFilteredTimeSlots([]);
    setAvailableSlots([]);
    setBlockedSlots([]);
    
    setLoadingSlots(true);
    try {
      try {
        let spaceData = null;
        
        try {
          const culturalSpaceResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/space/manager/${managerId}`);
          console.log(`Datos del espacio cultural para el gestor ${managerId}:`, culturalSpaceResponse.data);
          
          if (culturalSpaceResponse.data.success && culturalSpaceResponse.data.space) {
            spaceData = culturalSpaceResponse.data.space;
          }
        } catch (error) {
          console.log('No se pudo obtener el espacio por ID de gestor, intentando con ID de espacio');
        }
        
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
        
        if (spaceData) {
          let capacity = null;
          if (spaceData.capacidad !== undefined) {
            capacity = spaceData.capacidad;
          } else if (spaceData.capacity !== undefined) {
            capacity = spaceData.capacity;
          } else if (spaceData.aforo !== undefined) {
            capacity = spaceData.aforo;
          }
          
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
      
      const dateToUse = selectedDate;
      const date = dateToUse.toISOString().split('T')[0];
      const dayOfWeek = dateToUse.getDay();
      
      console.log(`Cargando disponibilidad para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
      
      const availabilityResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${date}`);
      
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
        
        setAvailableSlots(formattedAvailabilities);
      }
      
      const blockedResponse = await axios.get(`${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?date=${date}`);
      const allBlockedSlots = blockedResponse.data && blockedResponse.data.blockedSlots ? blockedResponse.data.blockedSlots : [];
      
      setBlockedSlots(allBlockedSlots);
      
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

  const filterAvailableTimeSlots = (dateToFilter, eventDate, availableSlots, blockedSlots, setFilteredTimeSlots, setLoadingSlots) => {
    const dateToUse = dateToFilter || eventDate;
    if (!dateToUse) {
      console.log('No hay fecha seleccionada');
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
      return;
    }
    
    const dayOfWeek = dateToUse.getDay();
    
    const date = dateToUse.toISOString().split('T')[0];
    
    console.log(`Filtrando slots para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
    console.log(`Total slots bloqueados: ${blockedSlots.length}`);
    
    if (availableSlots.length === 0) {
      console.log('No hay configuración de disponibilidad cargada para esta fecha');
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
      return;
    }
    
    const availabilityForDay = availableSlots.find(a => a.dayOfWeek === dayOfWeek);
    if (!availabilityForDay || !availabilityForDay.timeSlots || availabilityForDay.timeSlots.length === 0) {
      console.log(`No hay disponibilidad configurada para ${getDayName(dayOfWeek)}`);
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
      return;
    }
    
    console.log(`Disponibilidad para ${getDayName(dayOfWeek)}: ${availabilityForDay.timeSlots.join(', ')}`);
    
    const blockedSlotsForDate = blockedSlots.filter(slot => {
      return slot.date === date;
    });
    
    console.log(`Slots bloqueados para fecha ${date}: ${blockedSlotsForDate.length}`);
    
    const blockedHours = blockedSlotsForDate.map(slot => slot.hour);
    console.log(`Horas bloqueadas: ${blockedHours.join(', ')}`);
    
    const availableHours = availabilityForDay.timeSlots.filter(hour => !blockedHours.includes(hour));
    console.log(`Horas disponibles después de filtrar: ${availableHours.join(', ')}`);
    
    const formattedSlots = availableHours.map(hour => {
      const startHour = hour < 10 ? `0${hour}:00:00` : `${hour}:00:00`;
      const endHour = hour + 1 < 10 ? `0${hour + 1}:00:00` : `${hour + 1}:00:00`;
      
      const start = startHour.substring(0, 5);
      const end = endHour.substring(0, 5);
      
      return {
        hour: hour,
        start: start,
        end: end,
        isAvailable: true
      };
    });
    
    formattedSlots.sort((a, b) => a.hour - b.hour);
    
    console.log(`Total slots disponibles formateados: ${formattedSlots.length}`);
    
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