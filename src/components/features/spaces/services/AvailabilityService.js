/**
 * Este archivo maneja el servicio de disponibilidad
 * - Servicios
 * - Espacios
 * - Disponibilidad
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../../../constants/config';

const getValidManagerId = (user) => {
  if (!user) {
    console.log('Usuario no disponible');
    return null;
  }
  
  if (user.sub) {
    console.log('Usando sub del usuario (OAuth ID):', user.sub);
    return user.sub;
  }
  
  if (user._id) {
    console.log('Usando _id del usuario:', user._id);
    return user._id;
  }
  
  if (user.id) {
    console.log('Usando id del usuario:', user.id);
    return user.id;
  }
  
  console.log('Usuario sin ID válido');
  return null;
};

const saveAvailabilityToStorage = async (settings, user) => {
  try {
    const managerId = getValidManagerId(user);
    if (!managerId) {
      console.log('No se pudo guardar disponibilidad: ID de manager inválido');
      return;
    }
    
    const key = `availability_${managerId}`;
    await AsyncStorage.setItem(key, JSON.stringify(settings));
    console.log('Disponibilidad guardada correctamente');
  } catch (error) {
    console.log('Error al guardar la disponibilidad en el almacenamiento local:', error);
  }
};

const loadAvailabilitySettings = async (user, date = null, setIsLoading, setAvailabilitySettings, setUseSpecificDate, setConfigSpecificDate) => {
  try {
    setIsLoading(true);
    
    const managerId = getValidManagerId(user);
    if (!managerId) {
      console.error('No se pudo cargar disponibilidad: ID de manager inválido');
      setIsLoading(false);
      return;
    }
    
    let url = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`;
    
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      url += `?date=${dateStr}`;
      console.log(`Cargando disponibilidad para fecha específica: ${dateStr}`);
    }
    
    console.log(`Solicitando disponibilidad desde URL: ${url}`);
    
    const response = await axios.get(url, { timeout: 10000 });
    
    setIsLoading(false);
    
    if (response.data && response.data.success) {
      const availabilityData = response.data.availability;
      console.log('Respuesta de disponibilidad recibida:', response.data);
      
      if (date && Object.keys(availabilityData).length === 0 && response.data.canCreateConfig) {
        console.log('No hay configuración específica para esta fecha, pero se puede crear');
        
        const generalResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`);
        
        if (generalResponse.data && generalResponse.data.success) {
          setAvailabilitySettings(generalResponse.data.availability);
          console.log('Usando configuración general como base:', generalResponse.data.availability);
        }
        
        return { needsConfig: true, date };
      }

      const processedAvailability = {};
      
      if (typeof availabilityData === 'object') {
        for (const day in availabilityData) {
          const dayNum = parseInt(day, 10);
          if (!isNaN(dayNum)) {
            const hours = availabilityData[day].map(hour => {
              return typeof hour === 'string' ? parseInt(hour, 10) : hour;
            }).filter(hour => !isNaN(hour));
            
            processedAvailability[dayNum] = hours;
          }
        }
      }
      
      if (date) {
        const dayOfWeek = date.getDay(); 
        console.log(`Fecha específica: ${date.toLocaleDateString()}, día de la semana: ${dayOfWeek}`);
        
        if (!processedAvailability[dayOfWeek]) {
          console.log(`No hay configuración específica para el día ${dayOfWeek} (${getDayName(dayOfWeek)})`);
          console.log('Estableciendo todas las franjas como inhabilitadas para esta fecha');
          
          processedAvailability[dayOfWeek] = [];
        }
      }
      
      setAvailabilitySettings(processedAvailability);
      console.log('Configuración de disponibilidad procesada:', processedAvailability);
      
      if (response.data.isSpecificDate) {
        setUseSpecificDate(true);
        if (response.data.date) {
          setConfigSpecificDate(new Date(response.data.date));
        }
      }
      
      return { success: true, availability: processedAvailability };
    } else {
      console.error('Error al cargar disponibilidad:', response.data?.message);
      return { success: false, error: response.data?.message };
    }
  } catch (error) {
    console.error('Error al cargar configuración de disponibilidad:', error);
    setIsLoading(false);
    return { success: false, error: error.message };
  }
};

const loadSpecificDateAvailability = async (user, date, setIsLoading, setAvailabilitySettings) => {
  if (!date) return;
  
  try {
    setIsLoading(true);
    
    const managerId = getValidManagerId(user);
    if (!managerId) {
      console.error('No se pudo cargar disponibilidad: ID de manager inválido');
      setIsLoading(false);
      return;
    }
    
    const dateStr = date.toISOString().split('T')[0];
    const url = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${dateStr}`;
    
    console.log(`Cargando disponibilidad para fecha específica: ${dateStr}`);
    
    const response = await axios.get(url);
    
    setIsLoading(false);
    
    if (response.data && response.data.success) {
      const availabilityData = response.data.availability || {};
      
      setAvailabilitySettings(availabilityData);
      
      console.log(`Disponibilidad cargada para fecha específica ${dateStr}:`, availabilityData);
      return { success: true, availability: availabilityData };
    } else {
      console.error('Error al cargar disponibilidad para fecha específica:', response.data?.message);
      return { success: false, error: response.data?.message };
    }
  } catch (error) {
    console.error('Error al cargar disponibilidad para fecha específica:', error);
    setIsLoading(false);
    return { success: false, error: error.message };
  }
};

const updateAvailability = async (user, availabilitySettings, configSpecificDate, setIsLoading) => {
  try {
    setIsLoading(true);
    
    const managerId = getValidManagerId(user);
    if (!managerId) {
      setIsLoading(false);
      return { success: false, error: 'No se pudo identificar el manager' };
    }
    
    const requestData = {
      availability: availabilitySettings
    };
    
    if (configSpecificDate) {
      const dateStr = configSpecificDate.toISOString().split('T')[0];
      requestData.date = dateStr;
      
      const dayOfWeek = configSpecificDate.getDay(); 
      requestData.dayOfWeek = dayOfWeek;
      
      const filteredAvailability = {};
      if (availabilitySettings[dayOfWeek]) {
        filteredAvailability[dayOfWeek] = availabilitySettings[dayOfWeek];
        requestData.availability = filteredAvailability;
      }
      
      console.log(`Guardando configuración para fecha específica: ${dateStr} (día ${dayOfWeek} - ${getDayName(dayOfWeek)})`);
      console.log('Configuración filtrada para día específico:', filteredAvailability);
    } else {
      console.log('Guardando configuración general (sin fecha específica)');
    }
    
    const url = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`;
    
    console.log('Enviando datos al servidor:', JSON.stringify(requestData));
    const response = await axios.post(url, requestData);
    
    setIsLoading(false);
    
    if (response.data && response.data.success) {
      console.log('Configuración guardada exitosamente');
      
      saveAvailabilityToStorage(availabilitySettings, user);
      
      return { success: true };
    } else {
      console.error('Error al guardar configuración:', response.data);
      return { success: false, error: response.data?.message || 'No se pudo guardar la configuración' };
    }
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    setIsLoading(false);
    return { success: false, error: error.message || 'Error desconocido' };
  }
};

const initializeDefaultAvailability = (setAvailabilitySettings) => {
  const defaultAvailability = {};
  
  for (let day = 0; day <= 6; day++) {
    defaultAvailability[day] = Array.from({ length: 13 }, (_, i) => i + 8);
  }
  
  setAvailabilitySettings(defaultAvailability);
  
  return defaultAvailability;
};
const getDayName = (dayIndex) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayIndex];
};

export {
  getValidManagerId,
  saveAvailabilityToStorage,
  loadAvailabilitySettings,
  loadSpecificDateAvailability,
  updateAvailability,
  initializeDefaultAvailability,
  getDayName
};
