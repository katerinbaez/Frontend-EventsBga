import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../../../constants/config';

// Función para obtener el ID del manager de forma segura
const getValidManagerId = (user) => {
  if (!user) {
    console.log('Usuario no disponible');
    return null;
  }
  
  // Preferir siempre el ID de OAuth si está disponible
  if (user.sub) {
    console.log('Usando sub del usuario (OAuth ID):', user.sub);
    return user.sub;
  }
  
  // En SpaceAvailabilityManager se usa _id directamente
  if (user._id) {
    console.log('Usando _id del usuario:', user._id);
    return user._id;
  }
  
  // Si no hay _id pero hay id, usamos ese
  if (user.id) {
    console.log('Usando id del usuario:', user.id);
    return user.id;
  }
  
  console.log('Usuario sin ID válido');
  return null;
};

// Función para guardar la configuración de disponibilidad en AsyncStorage
const saveAvailabilityToStorage = async (settings, user) => {
  try {
    const managerId = getValidManagerId(user);
    if (!managerId) {
      console.log('No se pudo guardar disponibilidad: ID de manager inválido');
      return;
    }
    
    // Guardar en AsyncStorage
    const key = `availability_${managerId}`;
    await AsyncStorage.setItem(key, JSON.stringify(settings));
    console.log('Disponibilidad guardada correctamente');
  } catch (error) {
    console.log('Error al guardar la disponibilidad en el almacenamiento local:', error);
  }
};

// Función para cargar la configuración de disponibilidad
const loadAvailabilitySettings = async (user, date = null, setIsLoading, setAvailabilitySettings, setUseSpecificDate, setConfigSpecificDate) => {
  try {
    setIsLoading(true);
    
    const managerId = getValidManagerId(user);
    if (!managerId) {
      console.error('No se pudo cargar disponibilidad: ID de manager inválido');
      setIsLoading(false);
      return;
    }
    
    // Construir la URL base
    let url = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`;
    
    // Si hay una fecha específica, añadirla como parámetro
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
      
      // Si estamos cargando una fecha específica y no hay datos, pero tenemos canCreateConfig
      if (date && Object.keys(availabilityData).length === 0 && response.data.canCreateConfig) {
        console.log('No hay configuración específica para esta fecha, pero se puede crear');
        
        // Cargar la configuración general como base
        const generalResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`);
        
        if (generalResponse.data && generalResponse.data.success) {
          // Usar la configuración general como base
          setAvailabilitySettings(generalResponse.data.availability);
          console.log('Usando configuración general como base:', generalResponse.data.availability);
        }
        
        return { needsConfig: true, date };
      }
      
      // Procesar los datos recibidos para asegurar que están en el formato correcto
      // La disponibilidad viene como un objeto donde las claves son los días de la semana (0-6)
      // y los valores son arrays de horas disponibles
      const processedAvailability = {};
      
      // Si la respuesta tiene la estructura esperada
      if (typeof availabilityData === 'object') {
        // Recorrer cada día en la respuesta
        for (const day in availabilityData) {
          // Asegurarse de que el día sea un número
          const dayNum = parseInt(day, 10);
          if (!isNaN(dayNum)) {
            // Asegurarse de que las horas sean números
            const hours = availabilityData[day].map(hour => {
              return typeof hour === 'string' ? parseInt(hour, 10) : hour;
            }).filter(hour => !isNaN(hour));
            
            processedAvailability[dayNum] = hours;
          }
        }
      }
      
      // Si estamos cargando para una fecha específica, asegurarnos de que se muestre correctamente
      if (date) {
        const dayOfWeek = date.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
        console.log(`Fecha específica: ${date.toLocaleDateString()}, día de la semana: ${dayOfWeek}`);
        
        // Si no hay datos para este día en la respuesta específica, establecer un array vacío
        // para que todas las franjas aparezcan como inhabilitadas
        if (!processedAvailability[dayOfWeek]) {
          console.log(`No hay configuración específica para el día ${dayOfWeek} (${getDayName(dayOfWeek)})`);
          console.log('Estableciendo todas las franjas como inhabilitadas para esta fecha');
          
          // Crear un array vacío para este día, lo que hará que todas las franjas aparezcan como inhabilitadas
          processedAvailability[dayOfWeek] = [];
        }
      }
      
      // Actualizar el estado con los datos procesados
      setAvailabilitySettings(processedAvailability);
      console.log('Configuración de disponibilidad procesada:', processedAvailability);
      
      // Si hay fecha específica en la respuesta, actualizar el estado
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

// Función para cargar disponibilidad para una fecha específica
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
    
    // Convertir la fecha a formato YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    const url = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${dateStr}`;
    
    console.log(`Cargando disponibilidad para fecha específica: ${dateStr}`);
    
    const response = await axios.get(url);
    
    setIsLoading(false);
    
    if (response.data && response.data.success) {
      // Procesar la respuesta
      const availabilityData = response.data.availability || {};
      
      // Actualizar el estado con los datos recibidos
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

// Función para actualizar la configuración de disponibilidad
const updateAvailability = async (user, availabilitySettings, configSpecificDate, setIsLoading) => {
  try {
    setIsLoading(true);
    
    // Obtener el ID del manager
    const managerId = getValidManagerId(user);
    if (!managerId) {
      setIsLoading(false);
      return { success: false, error: 'No se pudo identificar el manager' };
    }
    
    // Preparar datos para enviar al backend
    const requestData = {
      availability: availabilitySettings
    };
    
    // Si estamos configurando para una fecha específica, incluirla
    if (configSpecificDate) {
      // Obtener la fecha en formato YYYY-MM-DD
      const dateStr = configSpecificDate.toISOString().split('T')[0];
      requestData.date = dateStr;
      
      // IMPORTANTE: Obtener el día de la semana correcto para esta fecha
      // para asegurar que solo se aplique a ese día específico
      const dayOfWeek = configSpecificDate.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
      requestData.dayOfWeek = dayOfWeek;
      
      // Asegurar que la configuración solo se aplique al día correcto
      // Filtrar la configuración para incluir solo el día seleccionado
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
    
    // Construir la URL
    const url = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`;
    
    // Enviar la configuración al backend
    console.log('Enviando datos al servidor:', JSON.stringify(requestData));
    const response = await axios.post(url, requestData);
    
    setIsLoading(false);
    
    if (response.data && response.data.success) {
      console.log('Configuración guardada exitosamente');
      
      // Guardar localmente para acceso rápido
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

// Función para inicializar disponibilidad por defecto
const initializeDefaultAvailability = (setAvailabilitySettings) => {
  // Crear un objeto de disponibilidad por defecto
  const defaultAvailability = {};
  
  // Para cada día de la semana (0-6), establecer horas disponibles por defecto
  for (let day = 0; day <= 6; day++) {
    // Por defecto, disponible de 8am a 8pm (horas 8-20)
    defaultAvailability[day] = Array.from({ length: 13 }, (_, i) => i + 8);
  }
  
  // Actualizar el estado
  setAvailabilitySettings(defaultAvailability);
  
  return defaultAvailability;
};

// Función auxiliar para obtener el nombre del día
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
