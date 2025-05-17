import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { getDayName } from '../utils/dateUtils';

// Cargar disponibilidad para la fecha seleccionada
export const loadAvailability = async (managerId, selectedDate) => {
  if (!managerId) {
    console.error('No se puede cargar disponibilidad sin managerId');
    return { availableSlots: [], blockedSlots: [] };
  }
  
  try {
    const date = selectedDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const dayOfWeek = selectedDate.getDay(); // Día de la semana (0-6)
    
    console.log(`Cargando disponibilidad para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
    
    // 1. Cargar los slots disponibles configurados por el gestor para la fecha específica
    const availabilityUrl = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${date}`;
    console.log(`Solicitando disponibilidad desde URL: ${availabilityUrl}`);
    
    const availabilityResponse = await axios.get(availabilityUrl);
    const formattedAvailabilities = [];
    
    if (availabilityResponse.data) {
      console.log('Respuesta de disponibilidad recibida:', availabilityResponse.data);
      
      // Procesar los datos recibidos para asegurar que están en el formato correcto
      const availabilityData = availabilityResponse.data.availability || availabilityResponse.data;
      
      console.log('Datos de disponibilidad recibidos:', JSON.stringify(availabilityData, null, 2));
      
      // Si la respuesta tiene la estructura esperada
      if (typeof availabilityData === 'object') {
        // Verificar si hay configuración específica para la fecha seleccionada
        if (Object.keys(availabilityData).length === 0) {
          console.log(`No hay configuración específica para la fecha ${date}`);
          // No hay configuración específica, no mostramos franjas
        } else {
          // Recorrer cada día en la respuesta
          for (const day in availabilityData) {
            // Asegurar que el día sea un número
            const dayOfWeek = parseInt(day, 10);
            if (!isNaN(dayOfWeek)) {
              // Verificar si hay horas disponibles para este día
              const hoursArray = availabilityData[day];
              
              if (Array.isArray(hoursArray) && hoursArray.length > 0) {
                // Asegurar que las horas sean números
                const hours = hoursArray.map(hour => {
                  return typeof hour === 'string' ? parseInt(hour, 10) : hour;
                }).filter(hour => !isNaN(hour));
                
                // Solo añadir días que tengan horas disponibles
                if (hours.length > 0) {
                  console.log(`Franjas para día ${getDayName(dayOfWeek)}: ${hours.join(', ')}`);
                  formattedAvailabilities.push({
                    day: getDayName(dayOfWeek),
                    dayOfWeek: dayOfWeek,
                    timeSlots: hours,
                    isSpecificDate: true // Indicar que es una configuración específica
                  });
                }
              }
            }
          }
        }
      }
      
      // Si no hay disponibilidad para la fecha específica, intentamos cargar la disponibilidad general para el día de la semana
      if (formattedAvailabilities.length === 0) {
        console.log(`No hay disponibilidad específica para la fecha ${date}, intentando cargar disponibilidad general para el día ${getDayName(dayOfWeek)}`);
        
        // Cargar disponibilidad general para el día de la semana
        const generalUrl = `${BACKEND_URL}/api/cultural-spaces/general-availability/${managerId}`;
        console.log(`Solicitando disponibilidad general desde URL: ${generalUrl}`);
        
        try {
          const generalResponse = await axios.get(generalUrl);
          
          if (generalResponse.data) {
            const generalData = generalResponse.data.availability || generalResponse.data;
            
            if (typeof generalData === 'object') {
              // Buscar configuración para el día de la semana actual
              const dayConfig = generalData[dayOfWeek];
              
              if (Array.isArray(dayConfig) && dayConfig.length > 0) {
                // Asegurar que las horas sean números
                const hours = dayConfig.map(hour => {
                  return typeof hour === 'string' ? parseInt(hour, 10) : hour;
                }).filter(hour => !isNaN(hour));
                
                if (hours.length > 0) {
                  console.log(`Franjas generales para día ${getDayName(dayOfWeek)}: ${hours.join(', ')}`);
                  formattedAvailabilities.push({
                    day: getDayName(dayOfWeek),
                    dayOfWeek: dayOfWeek,
                    timeSlots: hours,
                    isSpecificDate: false // Indicar que es una configuración general
                  });
                }
              }
            }
          }
        } catch (generalError) {
          console.error('Error al cargar disponibilidad general:', generalError);
        }
      }
    }
    
    // 2. Cargar slots bloqueados
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

// Filtrar horarios disponibles para el día seleccionado
export const filterAvailableTimeSlots = (availableSlots, blockedSlots, dateToFilter) => {
  if (!dateToFilter) {
    console.log('No hay fecha seleccionada');
    return [];
  }
  
  // Obtener el día de la semana (0-6) de la fecha seleccionada
  const dayOfWeek = dateToFilter.getDay();
  
  // Formatear la fecha seleccionada para comparaciones
  const date = dateToFilter.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  
  console.log(`Filtrando slots para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
  
  // Verificar si hay configuración de disponibilidad cargada
  if (availableSlots.length === 0) {
    console.log('No hay configuración de disponibilidad cargada para esta fecha');
    return [];
  }
  
  // Buscar configuración de disponibilidad para este día
  const dayAvailability = availableSlots.find(slot => slot.dayOfWeek === dayOfWeek);
  
  if (!dayAvailability || !dayAvailability.timeSlots || dayAvailability.timeSlots.length === 0) {
    console.log(`No hay franjas configuradas para el día ${getDayName(dayOfWeek)}`);
    return [];
  }
  
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
    
    return {
      hour: hourNum,
      formattedHour,
      displayTime,
      start: startHour,
      end: endHour,
      duration: 1 // Duración fija de 1 hora
    };
  });
  
  // Filtrar slots que ya están bloqueados para esta fecha
  const filteredHours = availableHours.filter(slot => {
    // Verificar si este slot está bloqueado
    const isBlocked = blockedSlots.some(blockedSlot => {
      // Verificar si el slot bloqueado coincide con la hora actual
      const hourMatches = blockedSlot.hour === slot.hour;
      if (!hourMatches) return false;
      
      // Si el slot bloqueado es recurrente, verificar día de la semana
      if (blockedSlot.isRecurring) {
        // Verificar si el día coincide
        const dayMatches = blockedSlot.day === dayOfWeek;
        if (dayMatches) return true;
      }
      
      // Si no es recurrente, verificar fecha específica
      if (blockedSlot.date) {
        // Asegurar que estamos comparando el mismo formato de fecha
        const blockedDate = blockedSlot.date;
        const dateMatches = blockedDate === date;
        
        if (dateMatches) return true;
      }
      
      return false;
    });
    
    // Solo incluir slots que no estén bloqueados
    return !isBlocked;
  });
  
  console.log(`Slots disponibles después de filtrar bloqueados: ${filteredHours.length}`);
  return filteredHours;
};