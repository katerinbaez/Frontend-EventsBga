import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../../../constants/config';
import { getDayName } from '../utils/ScheduleUtils';
import { getValidManagerId } from './AvailabilityService';

// Función para guardar los slots bloqueados en AsyncStorage
const saveBlockedSlotsToStorage = async (slots, user) => {
  try {
    const managerId = getValidManagerId(user);
    if (!managerId) {
      console.log('No se pudo guardar slots bloqueados: ID de manager inválido');
      return;
    }
    
    // Asegurarnos de que los slots tengan el formato correcto antes de guardarlos
    const formattedSlots = slots.map(slot => {
      // Asegurarnos de que day y hour sean números
      const day = typeof slot.day === 'string' ? parseInt(slot.day, 10) : slot.day;
      const hour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
      
      return {
        ...slot,
        day: day,
        hour: hour,
        // Añadir un campo compuesto para facilitar la búsqueda exacta
        dayHourKey: `${day}-${hour}`
      };
    });
    
    // Guardar en AsyncStorage
    const key = `blockedSlots_${managerId}`;
    await AsyncStorage.setItem(key, JSON.stringify(formattedSlots));
    console.log('Slots bloqueados guardados correctamente:', formattedSlots);
  } catch (error) {
    console.log('Error al guardar slots bloqueados en el almacenamiento local:', error);
  }
};

// Función para cargar los slots bloqueados
const loadBlockedSlots = async (user, specificDate = null, setBlockedSlots, setBlockedSlotsByDate) => {
  try {
    console.log('🔍 Iniciando carga de slots bloqueados...');
    
    const managerId = getValidManagerId(user);
    if (!managerId) {
      console.error('ID de manager inválido al cargar slots bloqueados');
      return [];
    }
    
    console.log('🔍 Buscando slots bloqueados para manager:', managerId);
    
    // Limpiar el estado actual
    setBlockedSlots([]);
    setBlockedSlotsByDate({});
    
    // Construir la URL base
    let url = `${BACKEND_URL}/api/spaces/blocked-slots/${managerId}`;
    
    // Si hay una fecha específica, añadirla como parámetro
    if (specificDate) {
      const dateStr = specificDate.toISOString().split('T')[0];
      url += `?date=${dateStr}`;
      console.log(`Cargando slots bloqueados para fecha específica: ${dateStr}`);
    }
    
    // Intentar cargar desde el servidor
    try {
      const response = await axios.get(url);
      console.log('Respuesta del servidor:', response.status);
      
      // Determinar la estructura de los datos recibidos
      let serverSlots = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Si la respuesta es directamente un array
          serverSlots = response.data;
          console.log('Respuesta es un array directamente');
        } else if (response.data.blockedSlots && Array.isArray(response.data.blockedSlots)) {
          // Si la respuesta tiene un campo blockedSlots que es un array
          serverSlots = response.data.blockedSlots;
          console.log('Respuesta tiene campo blockedSlots');
        } else if (typeof response.data === 'object') {
          // Si la respuesta es un objeto, intentar convertirlo a array
          console.log('Respuesta es un objeto, intentando extraer slots');
          // Verificar si hay alguna propiedad que podría contener los slots
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              serverSlots = response.data[key];
              console.log(`Encontrados slots en propiedad: ${key}`);
              break;
            }
          }
          
          // Si no se encontró ningún array, usar el objeto como un solo slot
          if (serverSlots.length === 0 && response.data.hour !== undefined) {
            serverSlots = [response.data];
            console.log('Usando el objeto de respuesta como un solo slot');
          }
        }
      }
      
      console.log(`📋 Slots bloqueados recibidos del servidor: ${serverSlots.length}`);
      
      // IMPORTANTE: Procesar los slots usando fechas locales correctas
      const processedSlots = serverSlots.map(slot => {
        // Asegurarnos de que hour sea número
        const hour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
        
        // Obtener la fecha del slot
        let slotDate = null;
        
        // Unificar usando solo el campo date
        if (slot.date) {
          slotDate = typeof slot.date === 'string' ? slot.date : slot.date.toISOString().split('T')[0];
        } else if (slot.dateStr) {
          // Para compatibilidad con datos existentes, si no hay date pero hay dateStr
          slotDate = slot.dateStr;
        }
        
        // Determinar el día de la semana a partir de la fecha
        let day = slot.day;
        
        // Si tenemos una fecha, asegurémonos de que el día sea correcto
        if (slotDate) {
          try {
            // Crear un objeto Date a partir de la cadena de fecha (USANDO FECHA LOCAL)
            const dateParts = slotDate.split('-');
            if (dateParts.length === 3) {
              const [year, month, dayOfMonth] = dateParts.map(num => parseInt(num, 10));
              
              // Crear fecha local sin ajuste de zona horaria
              const dateObj = new Date(year, month - 1, dayOfMonth);
              
              // Obtener el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
              day = dateObj.getDay();
              
              console.log(`✅ Fecha ${slotDate} corresponde a día ${day} (${getDayName(day)})`);
            }
          } catch (error) {
            console.error(`Error al determinar día para fecha ${slotDate}:`, error);
          }
        }
        
        // Crear el slot con todos los campos necesarios
        return {
          id: slot.id || `server-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          hour: hour,
          date: slotDate,
          // Eliminamos dateStr para unificar en un solo campo
          day: day,
          dayName: slot.dayName || (day !== undefined ? getDayName(day) : null),
          fromServer: true
        };
      });
      
      console.log(`📋 Slots procesados: ${processedSlots.length}`);
      
      // Eliminar duplicados basados en fecha y hora
      const uniqueSlots = processedSlots.filter((slot, index, self) => {
        // Crear una clave única basada en fecha y hora
        const key = `${slot.date}-${slot.hour}`;
        // Mantener solo la primera ocurrencia con esta clave
        return index === self.findIndex(s => `${s.date}-${s.hour}` === key);
      });
      
      console.log(`📋 Slots bloqueados únicos: ${uniqueSlots.length}`);
      
      // Actualizar el estado
      setBlockedSlots(uniqueSlots);
      
      // Crear el mapa de slots bloqueados por fecha
      const newBlockedSlotsByDate = {};
      
      uniqueSlots.forEach(slot => {
        const slotDate = slot.date;
        
        if (slotDate) {
          if (!newBlockedSlotsByDate[slotDate]) {
            newBlockedSlotsByDate[slotDate] = [];
          }
          
          // Verificar que no exista ya un slot para esta fecha y hora
          const exists = newBlockedSlotsByDate[slotDate].some(s => s.hour === slot.hour);
          
          if (!exists) {
            newBlockedSlotsByDate[slotDate].push(slot);
            console.log(`Agregado slot bloqueado para fecha ${slotDate}, hora=${slot.hour}, día=${slot.day}`);
          }
        }
      });
      
      console.log('Mapa de slots bloqueados por fecha creado:', Object.keys(newBlockedSlotsByDate));
      setBlockedSlotsByDate(newBlockedSlotsByDate);
      
      // Guardar en AsyncStorage como respaldo
      AsyncStorage.setItem(`blockedSlots_${managerId}`, JSON.stringify(uniqueSlots));
      
      return uniqueSlots;
    } catch (serverError) {
      console.error('Error al cargar slots bloqueados desde el servidor:', serverError);
      // Continuar con la carga desde AsyncStorage
    }
    
    // Si no se pudo cargar del servidor, intentar desde AsyncStorage
    try {
      const storedSlots = await AsyncStorage.getItem(`blockedSlots_${managerId}`);
      if (storedSlots) {
        const parsedSlots = JSON.parse(storedSlots);
        console.log(`Slots bloqueados cargados desde AsyncStorage: ${parsedSlots.length}`);
        
        // Actualizar el estado
        setBlockedSlots(parsedSlots);
        
        // Crear el mapa de slots bloqueados por fecha
        const newBlockedSlotsByDate = {};
        
        parsedSlots.forEach(slot => {
          const slotDate = slot.date;
          
          if (slotDate) {
            if (!newBlockedSlotsByDate[slotDate]) {
              newBlockedSlotsByDate[slotDate] = [];
            }
            
            // Verificar que no exista ya un slot para esta fecha y hora
            const exists = newBlockedSlotsByDate[slotDate].some(s => s.hour === slot.hour);
            
            if (!exists) {
              newBlockedSlotsByDate[slotDate].push(slot);
            }
          }
        });
        
        console.log('Mapa de slots bloqueados por fecha creado desde AsyncStorage:', Object.keys(newBlockedSlotsByDate));
        setBlockedSlotsByDate(newBlockedSlotsByDate);
        
        return parsedSlots;
      } else {
        console.log('No hay slots bloqueados guardados localmente');
        setBlockedSlots([]);
        setBlockedSlotsByDate({});
        return [];
      }
    } catch (storageError) {
      console.error('Error al cargar slots bloqueados desde AsyncStorage:', storageError);
      setBlockedSlots([]);
      setBlockedSlotsByDate({});
      return [];
    }
  } catch (error) {
    console.error('Error general al cargar slots bloqueados:', error);
    setBlockedSlots([]);
    setBlockedSlotsByDate({});
    return [];
  }
};

// Función para bloquear un slot
const blockSlot = async (user, selectedDay, selectedTimeSlot, isRecurring, useSpecificDate, selectedDate) => {
  try {
    const managerId = getValidManagerId(user);
    if (!managerId) {
      return { success: false, error: 'ID de manager inválido' };
    }
    
    // Obtener el día y la hora seleccionados
    const day = parseInt(selectedDay.id, 10);
    const hour = parseInt(selectedTimeSlot.id, 10);
    
    // Preparar datos para enviar al servidor
    const blockData = {
      day: day,
      hour: hour,
      isRecurring: isRecurring,
      dayName: getDayName(day)
    };
    
    // Si estamos usando una fecha específica, incluirla
    if (useSpecificDate && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      blockData.date = dateStr;
      console.log(`Bloqueando slot para fecha específica: ${dateStr}`);
    }
    
    console.log('Datos para bloquear slot:', blockData);
    
    // Enviar solicitud al servidor
    const response = await axios.post(`${BACKEND_URL}/api/spaces/blocked-slots/space/${managerId}`, blockData);
    
    if (response.data && response.data.success) {
      console.log('Slot bloqueado correctamente:', response.data);
      return { success: true, data: response.data };
    } else {
      console.error('Error al bloquear slot:', response.data);
      return { success: false, error: response.data?.message || 'Error desconocido' };
    }
  } catch (error) {
    console.error('Error al bloquear slot:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
};

// Función para desbloquear un slot
const unblockSlot = async (user, selectedBlockedSlot) => {
  try {
    if (!selectedBlockedSlot || !selectedBlockedSlot.id) {
      return { success: false, error: 'No se seleccionó ningún slot para desbloquear' };
    }
    
    const managerId = getValidManagerId(user);
    if (!managerId) {
      return { success: false, error: 'ID de manager inválido' };
    }
    
    console.log(`Desbloqueando slot con ID: ${selectedBlockedSlot.id}`);
    
    // Enviar solicitud al servidor
    const response = await axios.delete(`${BACKEND_URL}/api/spaces/blocked-slots/${selectedBlockedSlot.id}`);
    
    if (response.data && response.data.success) {
      console.log('Slot desbloqueado correctamente:', response.data);
      return { success: true, data: response.data };
    } else {
      console.error('Error al desbloquear slot:', response.data);
      return { success: false, error: response.data?.message || 'Error desconocido' };
    }
  } catch (error) {
    console.error('Error al desbloquear slot:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
};

// Función para verificar si un slot está bloqueado
const isSlotBlocked = (hour, date, blockedSlotsByDate) => {
  // Convertir la hora a número si es una cadena
  const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
  
  // Obtener la fecha en formato YYYY-MM-DD
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
  
  // Verificar si hay slots bloqueados para esta fecha
  if (dateStr && blockedSlotsByDate && blockedSlotsByDate[dateStr]) {
    // Buscar un slot bloqueado con esta hora
    return blockedSlotsByDate[dateStr].some(slot => {
      const slotHour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
      return slotHour === hourNum;
    });
  }
  
  return false;
};

// Función para limpiar slots bloqueados duplicados
const cleanupDuplicateBlockedSlots = (blockedSlotsByDate, setBlockedSlotsByDate, setForceUpdate) => {
  console.log('🧹 Limpiando slots bloqueados duplicados...');
  
  // Conjunto para rastrear horas únicas por fecha
  const uniqueSlotsByHour = new Map();
  let duplicatesRemoved = 0;
  
  // Recorrer todas las fechas
  Object.keys(blockedSlotsByDate).forEach(dateKey => {
    const slots = blockedSlotsByDate[dateKey];
    
    // Filtrar slots duplicados
    const uniqueSlots = slots.filter(slot => {
      const hour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
      const key = `${hour}`;
      
      if (uniqueSlotsByHour.has(key)) {
        duplicatesRemoved++;
        return false;
      } else {
        uniqueSlotsByHour.set(key, slot);
        return true;
      }
    });
    
    // Actualizar el mapa con los slots únicos
    blockedSlotsByDate[dateKey] = uniqueSlots;
  });
  
  // Actualizar el estado
  setBlockedSlotsByDate({...blockedSlotsByDate});
  
  // Forzar actualización de la UI
  setForceUpdate(prev => prev + 1);
  
  return { duplicatesRemoved };
};

// Función para manejar slots bloqueados al actualizar eventos
const handleBlockedSlots = async (originalHour, originalDay, newHour, newDay, managerId) => {
  try {
    // 1. Desbloquear la hora anterior
    if (originalHour !== null && originalDay !== null) {
      await unblockSlotByHourDay(originalHour, originalDay, managerId);
    }
    
    // 2. Bloquear la nueva hora
    await blockSlotByHourDay(newHour, newDay, managerId);
    
    return { success: true };
  } catch (error) {
    console.error('Error al manejar los slots bloqueados:', error);
    throw error;
  }
};

// Función auxiliar para desbloquear un slot por hora y día
const unblockSlotByHourDay = async (hour, day, managerId) => {
  const unblockUrl = `${BACKEND_URL}/api/spaces/blocked-slots/${managerId}`;
  const blockedSlots = await axios.get(unblockUrl);
  
  const slotToUnblock = blockedSlots.data.blockedSlots?.find(slot => 
    slot.hour === hour && slot.day === day
  );
  
  if (slotToUnblock) {
    const deleteUrl = `${BACKEND_URL}/api/spaces/blocked-slots/${slotToUnblock.id}`;
    await axios.delete(deleteUrl);
  }
};

// Función auxiliar para bloquear un slot por hora y día
const blockSlotByHourDay = async (hour, day, managerId) => {
  const blockUrl = `${BACKEND_URL}/api/spaces/blocked-slots/space/${managerId}`;
  await axios.post(blockUrl, {
    day: day,
    hour: hour,
    isRecurring: false,
    dayName: getDayName(day)
  });
};

export {
  saveBlockedSlotsToStorage,
  loadBlockedSlots,
  blockSlot,
  unblockSlot,
  isSlotBlocked,
  cleanupDuplicateBlockedSlots,
  handleBlockedSlots,
  unblockSlotByHourDay,
  blockSlotByHourDay
};
