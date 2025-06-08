/**
 * Este archivo maneja el servicio de disponibilidad
 * - API
 * - Carga
 * - Formato
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { getDayName } from '../utils/dateUtils';

export const loadAvailability = async (managerId, selectedDate) => {
  if (!managerId) {
    console.error('No se puede cargar disponibilidad sin managerId');
    return { availableSlots: [], blockedSlots: [] };
  }
  
  try {
    const date = selectedDate.toISOString().split('T')[0];
    const dayOfWeek = selectedDate.getDay();
    
    console.log(`Cargando disponibilidad para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
    
    const availabilityUrl = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${date}`;
    console.log(`Solicitando disponibilidad desde URL: ${availabilityUrl}`);
    
    const availabilityResponse = await axios.get(availabilityUrl);
    const formattedAvailabilities = [];
    
    if (availabilityResponse.data) {
      console.log('Respuesta de disponibilidad recibida:', availabilityResponse.data);
      
      const availabilityData = availabilityResponse.data.availability || availabilityResponse.data;
      
      console.log('Datos de disponibilidad recibidos:', JSON.stringify(availabilityData, null, 2));
      
      if (typeof availabilityData === 'object') {
        if (Object.keys(availabilityData).length === 0) {
          console.log(`No hay configuración específica para la fecha ${date}`);
        } else {
          for (const day in availabilityData) {
            const dayOfWeek = parseInt(day, 10);
            if (!isNaN(dayOfWeek)) {
              const hoursArray = availabilityData[day];
              
              if (Array.isArray(hoursArray) && hoursArray.length > 0) {
                const hours = hoursArray.map(hour => {
                  return typeof hour === 'string' ? parseInt(hour, 10) : hour;
                }).filter(hour => !isNaN(hour));
                
                if (hours.length > 0) {
                  console.log(`Franjas para día ${getDayName(dayOfWeek)}: ${hours.join(', ')}`);
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
      }
      
      if (formattedAvailabilities.length === 0) {
        console.log(`No hay disponibilidad específica para la fecha ${date}, intentando cargar disponibilidad general para el día ${getDayName(dayOfWeek)}`);
        
        const generalUrl = `${BACKEND_URL}/api/cultural-spaces/general-availability/${managerId}`;
        console.log(`Solicitando disponibilidad general desde URL: ${generalUrl}`);
        
        try {
          const generalResponse = await axios.get(generalUrl);
          
          if (generalResponse.data) {
            const generalData = generalResponse.data.availability || generalResponse.data;
            
            if (typeof generalData === 'object') {
              const dayConfig = generalData[dayOfWeek];
              
              if (Array.isArray(dayConfig) && dayConfig.length > 0) {
                const hours = dayConfig.map(hour => {
                  return typeof hour === 'string' ? parseInt(hour, 10) : hour;
                }).filter(hour => !isNaN(hour));
                
                if (hours.length > 0) {
                  console.log(`Franjas generales para día ${getDayName(dayOfWeek)}: ${hours.join(', ')}`);
                  formattedAvailabilities.push({
                    day: getDayName(dayOfWeek),
                    dayOfWeek: dayOfWeek,
                    timeSlots: hours,
                    isSpecificDate: false
                  });
                }
              }
            }
          }
        } catch (generalError) {
          console.warn('No se pudo cargar la disponibilidad general');
        }
      }
    }
    
    let blockedSlots = [];
    try {
      const blockedResponse = await axios.get(`${BACKEND_URL}/api/spaces/blocked-slots/${managerId}`);
      
      if (blockedResponse.data.blockedSlots || blockedResponse.data) {
        blockedSlots = blockedResponse.data.blockedSlots || blockedResponse.data;
        console.log(`Slots bloqueados cargados: ${blockedSlots.length}`);
      }
    } catch (blockedError) {
      console.error('Error al cargar slots bloqueados:', blockedError);
    }
    
    return { 
      availableSlots: formattedAvailabilities, 
      blockedSlots 
    };
  } catch (error) {
    console.error('Error al cargar disponibilidad:', error);
    throw error;
  }
};

export const filterAvailableTimeSlots = (availableSlots, blockedSlots, dateToFilter) => {
  if (!dateToFilter) {
    console.log('No hay fecha seleccionada');
    return [];
  }
  
  const dayOfWeek = dateToFilter.getDay();
  
  const date = dateToFilter.toISOString().split('T')[0];
  
  console.log(`Filtrando slots para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
  
  if (availableSlots.length === 0) {
    console.log('No hay configuración de disponibilidad cargada para esta fecha');
    return [];
  }
  
  const dayAvailability = availableSlots.find(slot => slot.dayOfWeek === dayOfWeek);
  
  if (!dayAvailability || !dayAvailability.timeSlots || dayAvailability.timeSlots.length === 0) {
    console.log(`No hay franjas configuradas para el día ${getDayName(dayOfWeek)}`);
    return [];
  }
  
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
      end: endHour,
      duration: 1
    };
  });
  
  const filteredHours = availableHours.filter(slot => {
    const isBlocked = blockedSlots.some(blockedSlot => {
      const hourMatches = blockedSlot.hour === slot.hour;
      if (!hourMatches) return false;
      
      if (blockedSlot.isRecurring) {
        const dayMatches = blockedSlot.day === dayOfWeek;
        if (dayMatches) return true;
      }
      
      if (blockedSlot.date) {
        const blockedDate = blockedSlot.date;
        const dateMatches = blockedDate === date;
        
        if (dateMatches) return true;
      }
      
      return false;
    });
    
    return !isBlocked;
  });
  
  console.log(`Slots disponibles después de filtrar bloqueados: ${filteredHours.length}`);
  return filteredHours;
};