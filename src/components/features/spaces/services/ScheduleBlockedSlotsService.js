/**
 * Este archivo maneja el servicio de programación de slots bloqueados
 * - Servicios
 * - Espacios
 * - Slots
 * - Programación
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../../../constants/config';
import { getDayName } from '../utils/ScheduleUtils';
import { getValidManagerId } from './AvailabilityService';

const saveBlockedSlotsToStorage = async (slots, user) => {
  try {
    const managerId = getValidManagerId(user);
    if (!managerId) {
      console.log('No se pudo guardar slots bloqueados: ID de manager inválido');
      return;
    }
    
    const formattedSlots = slots.map(slot => {
      const day = typeof slot.day === 'string' ? parseInt(slot.day, 10) : slot.day;
      const hour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
      
      return {
        ...slot,
        day: day,
        hour: hour,
        dayHourKey: `${day}-${hour}`
      };
    });
    
    const key = `blockedSlots_${managerId}`;
    await AsyncStorage.setItem(key, JSON.stringify(formattedSlots));
    console.log('Slots bloqueados guardados correctamente:', formattedSlots);
  } catch (error) {
    console.log('Error al guardar slots bloqueados en el almacenamiento local:', error);
  }
};

const loadBlockedSlots = async (user, specificDate = null, setBlockedSlots, setBlockedSlotsByDate) => {
  try {
    console.log('🔍 Iniciando carga de slots bloqueados...');
    
    const managerId = getValidManagerId(user);
    if (!managerId) {
      console.error('ID de manager inválido al cargar slots bloqueados');
      return [];
    }
    
    console.log('🔍 Buscando slots bloqueados para manager:', managerId);
    
    setBlockedSlots([]);
    setBlockedSlotsByDate({});
    
    let url = `${BACKEND_URL}/api/spaces/blocked-slots/${managerId}`;
    
    if (specificDate) {
      const dateStr = specificDate.toISOString().split('T')[0];
      url += `?date=${dateStr}`;
      console.log(`Cargando slots bloqueados para fecha específica: ${dateStr}`);
    }
    
    try {
      const response = await axios.get(url);
      console.log('Respuesta del servidor:', response.status);
      
      let serverSlots = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          serverSlots = response.data;
          console.log('Respuesta es un array directamente');
        } else if (response.data.blockedSlots && Array.isArray(response.data.blockedSlots)) {
          serverSlots = response.data.blockedSlots;
          console.log('Respuesta tiene campo blockedSlots');
        } else if (typeof response.data === 'object') {
          console.log('Respuesta es un objeto, intentando extraer slots');
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              serverSlots = response.data[key];
              console.log(`Encontrados slots en propiedad: ${key}`);
              break;
            }
          }
          
          if (serverSlots.length === 0 && response.data.hour !== undefined) {
            serverSlots = [response.data];
            console.log('Usando el objeto de respuesta como un solo slot');
          }
        }
      }
      
      console.log(`📋 Slots bloqueados recibidos del servidor: ${serverSlots.length}`);
      
      const processedSlots = serverSlots.map(slot => {
        const hour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
        
        let slotDate = null;
        
        if (slot.date) {
          slotDate = typeof slot.date === 'string' ? slot.date : slot.date.toISOString().split('T')[0];
        } else if (slot.dateStr) {
          slotDate = slot.dateStr;
        }
        
        let day = slot.day;
        
        if (slotDate) {
          try {
            const dateParts = slotDate.split('-');
            if (dateParts.length === 3) {
              const [year, month, dayOfMonth] = dateParts.map(num => parseInt(num, 10));
              
              const dateObj = new Date(year, month - 1, dayOfMonth);
              
              day = dateObj.getDay();
              
              console.log(`✅ Fecha ${slotDate} corresponde a día ${day} (${getDayName(day)})`);
            }
          } catch (error) {
            console.error(`Error al determinar día para fecha ${slotDate}:`, error);
          }
        }
        
        return {
          id: slot.id || `server-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          hour: hour,
          date: slotDate,
          day: day,
          dayName: slot.dayName || (day !== undefined ? getDayName(day) : null),
          fromServer: true
        };
      });
      
      console.log(`📋 Slots procesados: ${processedSlots.length}`);
      
      const uniqueSlots = processedSlots.filter((slot, index, self) => {
        const key = `${slot.date}-${slot.hour}`;
        return index === self.findIndex(s => `${s.date}-${s.hour}` === key);
      });
      
      console.log(`📋 Slots bloqueados únicos: ${uniqueSlots.length}`);
      
      setBlockedSlots(uniqueSlots);
      
      const newBlockedSlotsByDate = {};
      
      uniqueSlots.forEach(slot => {
        const slotDate = slot.date;
        
        if (slotDate) {
          if (!newBlockedSlotsByDate[slotDate]) {
            newBlockedSlotsByDate[slotDate] = [];
          }
          
          const exists = newBlockedSlotsByDate[slotDate].some(s => s.hour === slot.hour);
          
          if (!exists) {
            newBlockedSlotsByDate[slotDate].push(slot);
            console.log(`Agregado slot bloqueado para fecha ${slotDate}, hora=${slot.hour}, día=${slot.day}`);
          }
        }
      });
      
      console.log('Mapa de slots bloqueados por fecha creado:', Object.keys(newBlockedSlotsByDate));
      setBlockedSlotsByDate(newBlockedSlotsByDate);
      
      AsyncStorage.setItem(`blockedSlots_${managerId}`, JSON.stringify(uniqueSlots));
      
      return uniqueSlots;
    } catch (serverError) {
      console.error('Error al cargar slots bloqueados desde el servidor:', serverError);
    }
    
    try {
      const storedSlots = await AsyncStorage.getItem(`blockedSlots_${managerId}`);
      if (storedSlots) {
        const parsedSlots = JSON.parse(storedSlots);
        console.log(`Slots bloqueados cargados desde AsyncStorage: ${parsedSlots.length}`);
        
        setBlockedSlots(parsedSlots);
        
        const newBlockedSlotsByDate = {};
        
        parsedSlots.forEach(slot => {
          const slotDate = slot.date;
          
          if (slotDate) {
            if (!newBlockedSlotsByDate[slotDate]) {
              newBlockedSlotsByDate[slotDate] = [];
            }
            
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

const blockSlot = async (user, selectedDay, selectedTimeSlot, isRecurring, useSpecificDate, selectedDate) => {
  try {
    const managerId = getValidManagerId(user);
    if (!managerId) {
      return { success: false, error: 'ID de manager inválido' };
    }
    
    const day = parseInt(selectedDay.id, 10);
    const hour = parseInt(selectedTimeSlot.id, 10);
    
    const blockData = {
      day: day,
      hour: hour,
      isRecurring: isRecurring,
      dayName: getDayName(day)
    };
    
    
    if (useSpecificDate && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      blockData.date = dateStr;
      console.log(`Bloqueando slot para fecha específica: ${dateStr}`);
    }
    
    console.log('Datos para bloquear slot:', blockData);
    
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

const isSlotBlocked = (hour, date, blockedSlotsByDate) => {
  const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
  
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
  
  if (dateStr && blockedSlotsByDate && blockedSlotsByDate[dateStr]) {
    return blockedSlotsByDate[dateStr].some(slot => {
      const slotHour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
      return slotHour === hourNum;
    });
  }
  
  return false;
};

const cleanupDuplicateBlockedSlots = (blockedSlotsByDate, setBlockedSlotsByDate, setForceUpdate) => {
  console.log('🧹 Limpiando slots bloqueados duplicados...');
  
  const uniqueSlotsByHour = new Map();
  let duplicatesRemoved = 0;
  
  Object.keys(blockedSlotsByDate).forEach(dateKey => {
    const slots = blockedSlotsByDate[dateKey];
    
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
    
    blockedSlotsByDate[dateKey] = uniqueSlots;
  });
  
  setBlockedSlotsByDate({...blockedSlotsByDate});
  
  setForceUpdate(prev => prev + 1);
  
  return { duplicatesRemoved };
};

const handleBlockedSlots = async (originalHour, originalDay, newHour, newDay, managerId) => {
  try {
    if (originalHour !== null && originalDay !== null) {
      await unblockSlotByHourDay(originalHour, originalDay, managerId);
    }
    
    await blockSlotByHourDay(newHour, newDay, managerId);
    
    return { success: true };
  } catch (error) {
    console.error('Error al manejar los slots bloqueados:', error);
    throw error;
  }
};
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
