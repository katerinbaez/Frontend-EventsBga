import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Modal, FlatList, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SpaceSchedule = ({ onClose }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [spaceData, setSpaceData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [events, setEvents] = useState([]);
  const [availabilitySettings, setAvailabilitySettings] = useState({});
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [modalMode, setModalMode] = useState('info'); // 'info', 'block', 'availability'
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly', 'daily'

  // Días de la semana
  const weekDays = [
    { id: 1, name: 'Lunes', shortName: 'Lun' },
    { id: 2, name: 'Martes', shortName: 'Mar' },
    { id: 3, name: 'Miércoles', shortName: 'Mié' },
    { id: 4, name: 'Jueves', shortName: 'Jue' },
    { id: 5, name: 'Viernes', shortName: 'Vie' },
    { id: 6, name: 'Sábado', shortName: 'Sáb' },
    { id: 0, name: 'Domingo', shortName: 'Dom' }
  ];

  // Franjas horarias (de 6am a 10pm)
  const timeSlots = Array.from({ length: 17 }, (_, index) => {
    const hour = index + 6;
    return { 
      id: hour, 
      hour: hour > 12 ? hour - 12 : hour, 
      period: hour >= 12 ? 'PM' : 'AM' 
    };
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (user && user.id) {
        try {
          // Cargar datos del espacio cultural primero
          await loadSpaceData();
          // Luego cargar el resto de los datos
          await loadEvents();
          await loadAvailabilitySettings();
          await loadBlockedSlots();
          
          // Seleccionar el primer día por defecto
          if (weekDays.length > 0) {
            setSelectedDay(weekDays[0]);
          }
        } catch (error) {
          console.error('Error al cargar datos:', error);
          initializeDefaultAvailability();
          setBlockedSlots([]);
        }
      } else {
        console.log('Usuario inválido o sin ID, inicializando valores por defecto', user);
        initializeDefaultAvailability();
        setBlockedSlots([]);
      }
      setLoading(false);
    };
    
    loadData();
  }, [user]);
  
  // Efecto adicional para forzar la actualización de la interfaz cuando cambian los slots bloqueados
  useEffect(() => {
    console.log('Slots bloqueados actualizados:', blockedSlots.length);
    // Este efecto se ejecuta cada vez que cambia el estado de blockedSlots
    // No necesita hacer nada más, solo asegura que el componente se vuelva a renderizar
  }, [blockedSlots]);

  // Función para obtener el ID del manager de forma segura
  const getValidManagerId = () => {
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

  // Función para guardar la configuración de disponibilidad
  const saveAvailabilityToStorage = async (settings) => {
    try {
      const managerId = getValidManagerId();
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

  // Función para guardar los slots bloqueados
  const saveBlockedSlotsToStorage = async (slots) => {
    try {
      const managerId = getValidManagerId();
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

  const loadSpaceData = async () => {
    if (!user) {
      console.log('No hay usuario autenticado');
      return null;
    }

    try {
      const managerId = getValidManagerId();
      if (!managerId) {
        console.log('ID de manager inválido, no se cargará información de espacio');
        return null;
      }

      // Cargar datos del espacio cultural
      console.log(`Cargando datos del espacio cultural para manager ID: ${managerId}`);
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces/manager/${managerId}`);
      
      if (response.data && response.data.success && response.data.space) {
        console.log('Datos del espacio cultural cargados correctamente:', response.data.space);
        setSpaceData(response.data.space);
        return response.data.space;
      } else {
        console.log('No se encontró información del espacio cultural:', response.data);
        // Crear un objeto de espacio cultural por defecto
        const defaultSpace = {
          nombreEspacio: 'Mi Espacio Cultural',
          id: managerId
        };
        setSpaceData(defaultSpace);
        return defaultSpace;
      }
    } catch (error) {
      console.log('Error al cargar información del espacio cultural:', error.message);
      // En caso de error, establecer un nombre por defecto
      const defaultSpace = {
        nombreEspacio: 'Mi Espacio Cultural',
        id: getValidManagerId()
      };
      setSpaceData(defaultSpace);
      return defaultSpace;
    } 
  };

  const loadEvents = async () => {
    // Inicializar con array vacío para evitar errores
    setEvents([]);
    
    try {
      // Intentar cargar eventos del backend
      const spaceId = user.id; // O usar el ID del espacio cultural si está disponible
      const response = await axios.get(`${BACKEND_URL}/api/events/space/${spaceId}`, {
        // Opción para evitar que se muestre el error en la consola
        validateStatus: (status) => {
          return status < 500; // Resuelve sólo si el código de estado es menor que 500
        }
      });
      
      if (response.data && response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      // Cargar datos ficticios para desarrollo si falla
      setEvents([]);
    }
  };

  const loadAvailabilitySettings = async () => {
    try {
      // Asegurarnos que managerId sea un número válido
      const managerId = getValidManagerId();
      if (!managerId) {
        console.log('No se pudo cargar disponibilidad: ID de manager inválido');
        initializeDefaultAvailability();
        return;
      }
      
      // Intentar cargar desde AsyncStorage primero para mostrar algo inmediatamente
      const key = `availability_${managerId}`;
      const storedSettings = await AsyncStorage.getItem(key);
      if (storedSettings) {
        setAvailabilitySettings(JSON.parse(storedSettings));
      } else {
        initializeDefaultAvailability();
      }
      
      // Luego intentar actualizar desde el backend
      try {
        const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`, {
          // Opción para evitar que se muestre el error en la consola
          validateStatus: (status) => {
            return status < 500; // Resuelve sólo si el código de estado es menor que 500
          }
        });
        
        if (response.data && response.data.success) {
          setAvailabilitySettings(response.data.availability);
          saveAvailabilityToStorage(response.data.availability);
        }
      } catch (error) {
        console.log(`Error al cargar disponibilidad desde el servidor: ${error.message}`);
        // Ya tenemos los datos de AsyncStorage, así que continuamos sin hacer nada más
      }
    } catch (error) {
      console.log(`Error al cargar configuración: ${error.message}`);
    }
  };

  const loadBlockedSlots = async () => {
    try {
      // Asegurarnos que managerId sea un ID válido
      const managerId = getValidManagerId();
      if (!managerId) {
        console.log('No se pudo cargar slots bloqueados: ID de manager inválido');
        return;
      }
      
      console.log('Cargando slots bloqueados para manager ID:', managerId);
      
      // SOLUCIÓN: Cargar SOLO desde el servidor y eliminar AsyncStorage
      // Esto evita la duplicación de slots
      try {
        // Limpiar AsyncStorage para evitar duplicados
        const key = `blockedSlots_${managerId}`;
        await AsyncStorage.removeItem(key);
        console.log('AsyncStorage limpiado para evitar duplicados');
        
        const timestamp = new Date().getTime(); // Añadir timestamp para evitar caché
        console.log(`Solicitando slots bloqueados al servidor: ${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?t=${timestamp}`);
        
        const response = await axios.get(`${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?t=${timestamp}`);
        
        if (response.data && response.data.blockedSlots && response.data.blockedSlots.length > 0) {
          console.log('Slots bloqueados recibidos del servidor:', response.data.blockedSlots.length);
          
          // Formatear los slots del servidor RESPETANDO el día asignado en la base de datos
          const serverSlots = response.data.blockedSlots.map(slot => {
            // Asegurarnos de que hour sea número
            const hour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
            
            // CORRECCIÓN: SIEMPRE usar el día que viene de la base de datos
            // Si no tiene día asignado, no lo mostramos (no asignamos día actual)
            const day = slot.day !== undefined ? 
              (typeof slot.day === 'string' ? parseInt(slot.day, 10) : slot.day) : 
              undefined;
            
            // Si no tiene día definido, no creamos el slot
            if (day === undefined) {
              console.log(`⚠️ Slot sin día definido, no se mostrará: ${slot.id}, hora: ${hour}`);
              return null;
            }
            
            // Crear el slot con el día correcto
            return {
              id: slot.id || `server-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              hour: hour,
              date: slot.date || new Date().toISOString().split('T')[0],
              day: day,
              dayName: slot.dayName || getDayName(day),
              isRecurring: Boolean(slot.isRecurring),
              dayHourKey: `${day}-${hour}`,
              fromServer: true
            };
          }).filter(slot => slot !== null); // Eliminar slots nulos (los que no tienen día)
          
          console.log(`Slots del servidor con día definido: ${serverSlots.length}`);
          
          // Verificar slots duplicados
          const uniqueSlots = [];
          const uniqueKeys = new Set();
          
          serverSlots.forEach(slot => {
            const key = `${slot.day}-${slot.hour}`;
            if (!uniqueKeys.has(key)) {
              uniqueKeys.add(key);
              uniqueSlots.push(slot);
            } else {
              console.log(`⚠️ Slot duplicado eliminado: Día=${slot.day} (${getDayName(slot.day)}), Hora=${slot.hour}`);
            }
          });
          
          console.log(`Slots únicos después de eliminar duplicados: ${uniqueSlots.length}`);
          
          // Actualizar el estado con los slots únicos
          setBlockedSlots(uniqueSlots);
        } else {
          console.log('No se recibieron slots bloqueados del servidor');
          setBlockedSlots([]);
        }
      } catch (serverError) {
        console.error('Error al cargar slots del servidor:', serverError);
        setBlockedSlots([]);
      }
    } catch (error) {
      console.error('Error general al cargar slots bloqueados:', error);
      setBlockedSlots([]);
    }
  };

  const initializeDefaultAvailability = () => {
    // Inicializar la disponibilidad con valores predeterminados (todos los días, todas las horas disponibles)
    const defaultSettings = {};
    weekDays.forEach(day => {
      defaultSettings[day.id] = timeSlots.map(slot => slot.id);
    });
    setAvailabilitySettings(defaultSettings);
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    
    // Verificar si la franja está bloqueada
    const slotIsBlocked = isSlotBlocked(selectedDay?.id, slot.id);
    console.log(`Slot seleccionado: día=${selectedDay?.id}, hora=${slot.id}, bloqueado=${slotIsBlocked}`);
    
    // Verificar si hay un evento en esta franja
    const event = events.find(event => 
      new Date(event.fecha).getDay() === selectedDay?.id && 
      parseInt(event.horaInicio.split(':')[0]) === slot.id
    );
    
    if (slotIsBlocked) {
      // Si está bloqueada, mostrar modal para desbloquear
      console.log('Mostrando modal para desbloquear');
      setModalMode('unblock');
      setModalVisible(true);
      
      // CORRECCIÓN: Eliminada la alerta duplicada para evitar confusión
      // Ahora solo se muestra el modal con la opción de desbloquear
    } else if (event) {
      // Si hay un evento, mostrar detalles del evento
      console.log('Mostrando modal de información de evento');
      setModalMode('info');
      setModalVisible(true);
    } else {
      // Si está disponible pero no tiene evento, mostrar opciones para bloquear
      console.log('Mostrando modal para bloquear');
      setModalMode('block');
      setModalVisible(true);
    }
  };

  // Función para verificar si un slot está bloqueado
  const isSlotBlocked = (dayId, hourId) => {
    if (!blockedSlots || blockedSlots.length === 0) {
      return false;
    }
    
    // Asegurarse de que los valores sean números para comparación consistente
    const day = typeof dayId === 'string' ? parseInt(dayId, 10) : dayId;
    const hour = typeof hourId === 'string' ? parseInt(hourId, 10) : hourId;
    
    // Crear una clave compuesta para búsqueda exacta
    const dayHourKey = `${day}-${hour}`;
    
    // DEPURACIÓN: Mostrar información detallada para este día y hora
    const matchingSlots = blockedSlots.filter(slot => {
      const slotDay = typeof slot.day === 'string' ? parseInt(slot.day, 10) : slot.day;
      const slotHour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
      return slotHour === hour;
    });
    
    if (matchingSlots.length > 0) {
      console.log(`🔍 Buscando slots para Día=${day}, Hora=${hour}`);
      console.log(`📊 Encontrados ${matchingSlots.length} slots con la misma hora:`);
      matchingSlots.forEach((slot, index) => {
        console.log(`  ${index + 1}. Día=${slot.day} (${getDayName(slot.day)}), Hora=${slot.hour}, ID=${slot.id.substring(0, 8)}`);
      });
    }
    
    // CORRECCIÓN: Verificar SOLO por día y hora exactos
    const isBlocked = blockedSlots.some(slot => {
      // Convertir valores a números para comparación consistente
      const slotDay = typeof slot.day === 'string' ? parseInt(slot.day, 10) : slot.day;
      const slotHour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
      
      // IMPORTANTE: Comparación exacta de día y hora
      const exactMatch = slotDay === day && slotHour === hour;
      
      if (exactMatch) {
        console.log(`✅ COINCIDENCIA EXACTA: Día=${slotDay} (${getDayName(slotDay)}), Hora=${slotHour}, ID=${slot.id.substring(0, 8)}`);
      }
      
      return exactMatch;
    });
    
    return isBlocked;
  };

  const updateAvailability = (day, slot, isAvailable) => {
    const currentSettings = { ...availabilitySettings };
    
    // Asegurarnos de que el ID del día sea un número válido
    const dayId = parseInt(day.id, 10);
    if (isNaN(dayId)) {
      console.error('ID de día inválido:', day.id);
      return;
    }
    
    // Asegurarnos de que el ID del slot sea un número válido
    const slotId = parseInt(slot.id, 10);
    if (isNaN(slotId)) {
      console.error('ID de slot inválido:', slot.id);
      return;
    }
    
    // Inicializar el array para este día si no existe
    if (!currentSettings[dayId]) {
      currentSettings[dayId] = [];
    }
    
    if (isAvailable) {
      // Si estamos marcando como disponible, añadir a la lista
      if (!currentSettings[dayId].includes(slotId)) {
        currentSettings[dayId].push(slotId);
        // Ordenar el array para mantener el orden de las horas
        currentSettings[dayId].sort((a, b) => a - b);
      }
    } else {
      // Si estamos marcando como no disponible, quitar de la lista
      currentSettings[dayId] = currentSettings[dayId].filter(id => id !== slotId);
    }
    
    setAvailabilitySettings(currentSettings);
  };

  const handleUpdateAvailability = async () => {
    try {
      const managerId = getValidManagerId();
      if (!managerId) {
        Alert.alert('Error', 'ID de manager inválido');
        return;
      }
      
      // Asegurarnos de que todos los valores sean números válidos
      const cleanedSettings = {};
      
      // Procesar cada día y sus horas disponibles
      for (const dayId in availabilitySettings) {
        // Convertir el ID del día a número entero
        const dayKey = parseInt(dayId, 10);
        if (isNaN(dayKey)) continue; // Saltar días con ID inválido
        
        // Filtrar y convertir las horas a números enteros
        const validHours = availabilitySettings[dayId]
          .filter(hourId => !isNaN(parseInt(hourId, 10)))
          .map(hourId => parseInt(hourId, 10));
        
        // Solo agregar días con horas válidas
        if (validHours.length > 0) {
          cleanedSettings[dayKey] = validHours;
        }
      }
      
      console.log('Enviando configuración de disponibilidad al servidor para manager ID:', managerId);
      console.log('Datos originales:', availabilitySettings);
      console.log('Datos limpiados:', cleanedSettings);
      
      // Enviar la configuración limpia al backend
      const response = await axios.post(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`, {
        availability: cleanedSettings
      });
      
      console.log('Respuesta del servidor:', response.data);
      if (response.data && response.data.success) {
        // Actualizar el estado con los datos limpios
        setAvailabilitySettings(cleanedSettings);
        // Guardar en local storage los datos limpios
        saveAvailabilityToStorage(cleanedSettings);
        Alert.alert('Éxito', 'Configuración guardada correctamente en el servidor');
      } else {
        Alert.alert('Error', 'No se pudo guardar la configuración en el servidor: ' + (response.data?.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error.message);
      console.error('Detalles del error:', error.response ? error.response.data : 'No hay detalles adicionales');
      console.error('Código de estado:', error.response ? error.response.status : 'Desconocido');
      
      // Mensaje más específico según el tipo de error
      let errorMessage = 'Error al guardar en el servidor.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'La ruta de la API no existe. Verifica la configuración del backend.';
        } else if (error.response.status === 500) {
          const serverError = error.response.data?.error || 'Error interno del servidor';
          errorMessage = `Error en el servidor: ${serverError}`;
        }
      }
      
      Alert.alert(
        'Error', 
        errorMessage,
        [
          { text: 'OK', onPress: () => {} }
        ]
      );
    } finally {
      setModalVisible(false);
    }
  };

  const handleBlockSlot = async () => {
    if (!selectedDay || !selectedTimeSlot) {
      Alert.alert('Error', 'Seleccione un día y una franja horaria');
      return;
    }
    
    try {
      const managerId = getValidManagerId();
      if (!managerId) {
        Alert.alert('Error', 'ID de manager inválido');
        return;
      }
      
      // IMPORTANTE: Usar directamente el ID del día seleccionado en la interfaz
      // Los IDs de los días son: 1=Lunes, 2=Martes, ..., 0=Domingo
      const selectedDayId = parseInt(selectedDay.id, 10);
      const selectedHourId = parseInt(selectedTimeSlot.id, 10);
      
      if (isNaN(selectedDayId) || isNaN(selectedHourId)) {
        Alert.alert('Error', 'Valores de día u hora inválidos');
        return;
      }
      
      // Crear una clave compuesta para identificar el slot de manera única
      const dayHourKey = `${selectedDayId}-${selectedHourId}`;
      
      console.log(`Intentando bloquear: Día=${selectedDayId} (${getDayName(selectedDayId)}), Hora=${selectedHourId}, Clave=${dayHourKey}`);
      
      // Verificar si el slot ya está bloqueado
      if (isSlotBlocked(selectedDayId, selectedHourId)) {
        Alert.alert('Información', 'Esta franja horaria ya está bloqueada');
        setModalVisible(false);
        return;
      }
      
      // Crear una fecha para el registro que corresponda al día seleccionado
      const currentDate = new Date();
      const diff = selectedDayId - currentDate.getDay();
      currentDate.setDate(currentDate.getDate() + diff);
      const dateStr = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Asegurar que todos los valores sean válidos y del tipo correcto
      const requestData = {
        date: dateStr,
        hour: selectedHourId,
        day: selectedDayId, // IMPORTANTE: Enviar explícitamente el día seleccionado al servidor
        dayName: getDayName(selectedDayId), // Enviar el nombre del día para referencia
        isRecurring: Boolean(isRecurring)
      };
      
      console.log(`Enviando solicitud al servidor con día explícito: ${selectedDayId} (${getDayName(selectedDayId)})`);
      
      // Mostrar un mensaje de espera
      Alert.alert('Procesando', 'Bloqueando franja horaria...');
      
      // SOLUCIÓN: Enviar directamente al servidor sin guardar localmente
      // Esto evita la duplicación de slots
      try {
        console.log(`Enviando solicitud al servidor: ${BACKEND_URL}/api/spaces/block-slot/${managerId}`);
        const response = await axios.post(`${BACKEND_URL}/api/spaces/block-slot/${managerId}`, requestData);
        
        console.log('Respuesta del servidor (bloqueo):', response.data);
        
        // Cerrar el modal
        setModalVisible(false);
        setSelectedTimeSlot(null);
        setIsRecurring(false);
        
        // Recargar los slots bloqueados desde el servidor
        await loadBlockedSlots();
        
        // Mostrar un mensaje de éxito
        Alert.alert('Éxito', `Franja horaria bloqueada correctamente para ${getDayName(selectedDayId)}`);
      } catch (error) {
        console.error('Error al bloquear slot en el servidor:', error);
        Alert.alert('Error', 'No se pudo bloquear la franja horaria. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error general al bloquear slot:', error);
      Alert.alert('Error', 'No se pudo bloquear la franja horaria. Inténtalo de nuevo.');
    }
  };

  const handleUnblockSlot = async () => {
    if (!selectedDay || !selectedTimeSlot) {
      Alert.alert('Error', 'Seleccione un día y una franja horaria');
      return;
    }
    
    // Convertir los IDs a números y validar que sean válidos
    const dayId = parseInt(selectedDay.id, 10);
    const hourId = parseInt(selectedTimeSlot.id, 10);
    
    if (isNaN(dayId) || isNaN(hourId)) {
      Alert.alert('Error', 'Valores de día u hora inválidos');
      return;
    }
    
    // Crear una clave compuesta para identificar el slot de manera única
    const dayHourKey = `${dayId}-${hourId}`;
    
    // Verificar si el slot está bloqueado usando la función isSlotBlocked
    if (!isSlotBlocked(dayId, hourId)) {
      Alert.alert('Error', 'Esta franja horaria no está bloqueada');
      return;
    }
    
    // Encontrar el slot bloqueado
    const blockedSlot = blockedSlots.find(slot => slot.dayHourKey === dayHourKey);
    
    if (!blockedSlot) {
      Alert.alert('Error', 'No se pudo encontrar la información de la franja bloqueada');
      return;
    }
    
    try {
      const managerId = getValidManagerId();
      if (!managerId) {
        Alert.alert('Error', 'ID de manager inválido');
        return;
      }
      
      // Actualizar inmediatamente el estado local para mostrar la franja como desbloqueada
      const updatedBlockedSlots = blockedSlots.filter(slot => slot.dayHourKey !== dayHourKey);
      
      // Actualizar el estado y AsyncStorage inmediatamente
      setBlockedSlots(updatedBlockedSlots);
      await saveBlockedSlotsToStorage(updatedBlockedSlots);
      
      // Mostrar mensaje de éxito inmediato para mejor UX
      Alert.alert('Éxito', 'Franja horaria desbloqueada correctamente');
      
      // Cerrar el modal inmediatamente
      setModalVisible(false);
      setSelectedTimeSlot(null);
      
      // Crear la fecha para la solicitud al servidor
      const currentDate = new Date();
      const diff = dayId - currentDate.getDay();
      currentDate.setDate(currentDate.getDate() + diff);
      const dateStr = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Intentar sincronizar con el servidor en segundo plano
      try {
        let response;
        
        // Si tenemos el ID del slot, intentar desbloquear por ID primero
        if (blockedSlot.id && blockedSlot.id.toString().indexOf('temp-') !== 0) {
          try {
            console.log(`Intentando desbloquear por ID: ${blockedSlot.id}`);
            response = await axios.post(`${BACKEND_URL}/api/spaces/unblock-slot-by-id/${blockedSlot.id}`);
          } catch (idError) {
            console.log('Error al desbloquear por ID, intentando por fecha/hora:', idError.message);
            // Si falla, intentar el método tradicional por fecha/hora
            response = await axios.post(`${BACKEND_URL}/api/spaces/unblock-slot/${managerId}`, {
              date: dateStr,
              hour: hourId
            });
          }
        } else {
          // Método tradicional si no tenemos ID o es un ID temporal
          response = await axios.post(`${BACKEND_URL}/api/spaces/unblock-slot/${managerId}`, {
            date: dateStr,
            hour: hourId
          });
        }
        
        console.log('Respuesta del servidor (desbloqueo):', response.data);
        
        // Recargar los slots bloqueados para asegurar sincronización completa
        if (response.data && response.data.success) {
          loadBlockedSlots();
        }
      } catch (serverError) {
        console.error('Error al sincronizar desbloqueo con el servidor:', serverError.message);
        console.log('La franja seguirá desbloqueada localmente en AsyncStorage');
      }
    } catch (error) {
      console.error('Error general al desbloquear franja horaria:', error.message);
      Alert.alert('Error', 'No se pudo desbloquear la franja horaria. Inténtelo de nuevo.');
      setModalVisible(false);
    }
  };

  const renderTimeSlot = ({ item: slot }) => {
    // Asegurarse de que los IDs sean números para comparación consistente
    const dayId = selectedDay ? parseInt(selectedDay.id, 10) : null;
    const hourId = parseInt(slot.id, 10);
    
    // Crear una clave compuesta para búsqueda exacta
    const dayHourKey = dayId !== null ? `${dayId}-${hourId}` : null;
    
    const isAvailable = availabilitySettings[dayId]?.includes(hourId);
    
    // CORRECCIÓN: Usar la función isSlotBlocked para verificar si el slot está bloqueado
    const isBlockedSlot = dayId !== null ? isSlotBlocked(dayId, hourId) : false;
    
    // Añadir depuración para este slot específico
    if (isBlockedSlot) {
      console.log(`🔴 SLOT BLOQUEADO EN VISTA DIARIA: Día=${dayId} (${getDayName(dayId)}), Hora=${hourId}`);
    }
    
    // Verificar si hay un evento en esta franja
    const event = events.find(event => 
      new Date(event.fecha).getDay() === dayId && 
      parseInt(event.horaInicio.split(':')[0]) === hourId
    );
    
    // Aplicar estilo directo para slots bloqueados
    const slotStyle = isBlockedSlot 
      ? { 
          padding: 12,
          borderRadius: 8,
          marginBottom: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FF0000', // Rojo brillante
          borderWidth: 3,
          borderColor: '#FF3A5E',
        }
      : [
          styles.timeSlot,
          isAvailable ? styles.availableSlot : styles.unavailableSlot,
          event && styles.eventSlot
        ];
    
    // Determinar el estilo del texto
    const textStyle = isBlockedSlot ? 
      [styles.timeText, {color: '#FFFFFF', fontWeight: 'bold'}] : 
      styles.timeText;
    
    return (
      <TouchableOpacity
        key={slot.id}
        style={slotStyle}
        onPress={() => handleTimeSlotSelect(slot)}
      >
        <Text style={textStyle}>
          {`${slot.hour}:00 ${slot.period}`}
        </Text>
        {event && (
          <Text style={styles.eventText} numberOfLines={1}>
            {event.titulo}
          </Text>
        )}
        {isBlockedSlot && (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: '#FFFFFF', marginRight: 5, fontWeight: 'bold'}}>Bloqueado</Text>
            <Ionicons name="lock-closed" size={20} color="#FFF" style={styles.lockIcon} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderModal = () => {
    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Se eliminó el header del modal */}
            <TouchableOpacity
              style={[styles.closeButton, { position: 'absolute', top: 10, right: 10, zIndex: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.modalBody}>
              {(modalMode === 'block' || modalMode === 'unblock') && (
                <View>
                  <Text style={styles.modalLabel}>Selecciona una franja horaria:</Text>
                  <ScrollView style={{ maxHeight: 300 }}>
                    {timeSlots.map(slot => {
                      // Asegurarnos de que los IDs sean números para comparación consistente
                      const dayId = parseInt(selectedDay.id, 10);
                      const hourId = parseInt(slot.id, 10);
                      
                      // Crear una clave compuesta para búsqueda exacta
                      const dayHourKey = `${dayId}-${hourId}`;
                      
                      // SOLUCIÓN RADICAL: Buscar directamente en el array de slots bloqueados usando la clave compuesta
                      const isBlockedSlot = blockedSlots.some(slot => slot.dayHourKey === dayHourKey);
                      
                      // Solo mostrar para desbloquear si está bloqueado
                      if (modalMode === 'unblock' && !isBlockedSlot) return null;
                      
                      // Solo mostrar para bloquear si no está bloqueado
                      if (modalMode === 'block' && isBlockedSlot) return null;
                      
                      return (
                        <TouchableOpacity
                          key={`slot-${slot.id}`}
                          style={[
                            styles.timeSlotItem,
                            selectedTimeSlot?.id === slot.id && styles.selectedTimeSlotItem
                          ]}
                          onPress={() => setSelectedTimeSlot(slot)}
                        >
                          <Text style={styles.timeSlotText}>
                            {`${slot.hour}:00 ${slot.period}`}
                          </Text>
                          {selectedTimeSlot?.id === slot.id && (
                            <Ionicons name="checkmark" size={20} color="#4A90E2" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  
                  {modalMode === 'block' && (
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchLabel}>¿Repetir semanalmente?</Text>
                      <Switch
                        value={isRecurring}
                        onValueChange={setIsRecurring}
                        trackColor={{ false: '#ccc', true: '#4A90E2' }}
                        thumbColor={isRecurring ? '#FFFFFF' : '#f4f3f4'}
                      />
                    </View>
                  )}
                </View>
              )}
              
              {modalMode === 'info' && selectedTimeSlot && (
                <View style={styles.eventInfoContainer}>
                  {events.find(event => 
                    new Date(event.fecha).getDay() === selectedDay?.id && 
                    parseInt(event.horaInicio.split(':')[0]) === selectedTimeSlot?.id
                  ) ? (
                    <View>
                      <Text style={styles.eventTitle}>
                        {events.find(event => 
                          new Date(event.fecha).getDay() === selectedDay?.id && 
                          parseInt(event.horaInicio.split(':')[0]) === selectedTimeSlot?.id
                        )?.titulo || 'Evento'}
                      </Text>
                      <Text style={styles.eventDescription}>
                        {events.find(event => 
                          new Date(event.fecha).getDay() === selectedDay?.id && 
                          parseInt(event.horaInicio.split(':')[0]) === selectedTimeSlot?.id
                        )?.descripcion || 'Sin descripción'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noEventText}>No hay eventos en esta franja horaria</Text>
                  )}
                </View>
              )}
              
              {modalMode === 'availability' && (
                <View style={styles.availabilityContainer}>
                  <Text style={styles.availabilityText}>
                    Configure los horarios disponibles para este día:
                  </Text>
                  <ScrollView style={{ maxHeight: 350 }}>
                    {timeSlots.map(slot => (
                      <TouchableOpacity
                        key={`avail-${slot.id}`}
                        style={[
                          styles.availabilityItem,
                          availabilitySettings[selectedDay?.id]?.includes(slot.id) ? 
                            styles.availableItem : styles.unavailableItem
                        ]}
                        onPress={() => updateAvailability(
                          selectedDay, 
                          slot, 
                          !availabilitySettings[selectedDay?.id]?.includes(slot.id)
                        )}
                      >
                        <Text style={styles.availabilityItemText}>
                          {`${slot.hour}:00 ${slot.period}`}
                        </Text>
                        <Ionicons 
                          name={availabilitySettings[selectedDay?.id]?.includes(slot.id) ? 
                            "checkmark-circle" : "close-circle"} 
                          size={24} 
                          color={availabilitySettings[selectedDay?.id]?.includes(slot.id) ? 
                            "#4CAF50" : "#FF5252"} 
                        />
                      </TouchableOpacity>
                    ))}
                    <View style={{ height: 80 }} />
                  </ScrollView>
                </View>
              )}
            </View>
            
            <View style={styles.modalFooter}>
              {modalMode === 'block' && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.blockButton]}
                  onPress={handleBlockSlot}
                >
                  <Text style={styles.modalButtonText}>Bloquear Horario</Text>
                </TouchableOpacity>
              )}
              
              {modalMode === 'unblock' && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.unblockButton]}
                  onPress={handleUnblockSlot}
                >
                  <Text style={styles.modalButtonText}>Desbloquear Horario</Text>
                </TouchableOpacity>
              )}
              
              {modalMode === 'availability' && (
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#FF3A5E' }]}
                  onPress={handleUpdateAvailability}
                >
                  <Text style={styles.modalButtonText}>Guardar Configuración</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#333' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Función auxiliar para obtener el nombre del día a partir de su ID
  const getDayName = (dayId) => {
    // Asegurarse de que dayId sea un número
    const dayIdNum = typeof dayId === 'string' ? parseInt(dayId, 10) : dayId;
    
    // Buscar el día en weekDays
    const day = weekDays.find(d => d.id === dayIdNum);
    
    // Si se encuentra, devolver el nombre; si no, mostrar un mensaje de depuración y devolver 'Desconocido'
    if (day) {
      return day.name;
    } else {
      console.log(`⚠️ ID de día no encontrado: ${dayIdNum}. IDs válidos: ${weekDays.map(d => d.id).join(', ')}`);
      return `Desconocido (ID: ${dayIdNum})`;
    }
  };

  const handleResetBlockedSlots = async () => {
    // Mostrar confirmación antes de eliminar todos los slots bloqueados
    Alert.alert(
      'Confirmar Acción',
      '¿Estás seguro de que deseas eliminar todas las franjas bloqueadas y restablecer la disponibilidad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Obtener el ID del manager
              const managerId = getValidManagerId();
              if (!managerId) {
                Alert.alert('Error', 'ID de manager inválido');
                return;
              }
              
              // Mostrar mensaje de carga
              Alert.alert('Procesando', 'Restableciendo disponibilidad...');
              
              // 1. Eliminar slots bloqueados locales
              await AsyncStorage.removeItem(`blockedSlots_${managerId}`);
              
              // 2. Intentar eliminar slots del servidor
              try {
                const response = await axios.post(`${BACKEND_URL}/api/spaces/reset-configuration/${managerId}`);
                console.log('Respuesta del servidor al restablecer slots:', response.data);
              } catch (serverError) {
                console.error('Error al restablecer slots en el servidor:', serverError);
                // Continuar con el proceso local incluso si hay error en el servidor
              }
              
              // 3. Limpiar el estado local
              setBlockedSlots([]);
              
              // 4. Mostrar mensaje de éxito
              Alert.alert(
                'Éxito',
                'Se ha restablecido la disponibilidad correctamente.',
                [{ text: 'OK' }]
              );
              
              // 5. Recargar los datos
              await loadBlockedSlots();
              
            } catch (error) {
              console.error('Error al restablecer disponibilidad:', error);
              Alert.alert('Error', 'No se pudo restablecer la disponibilidad. Inténtalo de nuevo.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3A5E" />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => {
                if (onClose && typeof onClose === 'function') {
                  onClose();
                } else {
                  navigation.goBack();
                }
              }} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{spaceData?.nombre || 'Gestión de Horarios'}</Text>
            <View style={styles.headerRight}>
              {/* Se eliminó el icono del calendario */}
            </View>
          </View>
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.contentContainer}>
              <View style={styles.weekDaysContainer}>
                {weekDays.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      selectedDay?.id === day.id && styles.selectedDayButton
                    ]}
                    onPress={() => handleDaySelect(day)}
                  >
                    <Text style={[
                      styles.dayText,
                      selectedDay?.id === day.id && styles.selectedDayText
                    ]}>
                      {day.shortName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {selectedDay && (
                <View style={styles.scheduleContainer}>
                  <View style={styles.scheduleHeader}>
                    <Text style={styles.scheduleDayTitle}>{selectedDay.name}</Text>
                    <View style={styles.scheduleActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#FF3A5E' }]}
                        onPress={() => {
                          setModalMode('availability');
                          setModalVisible(true);
                        }}
                      >
                        <Ionicons name="time" size={18} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Configurar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#333' }]}
                        onPress={() => {
                          setModalMode('block');
                          setModalVisible(true);
                        }}
                      >
                        <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Bloquear</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Lista de horarios disponibles */}
                  {timeSlots.map(slot => {
                    // Asegurarse de que los IDs sean números para comparación consistente
                    const dayId = selectedDay ? parseInt(selectedDay.id, 10) : null;
                    const hourId = parseInt(slot.id, 10);
                    
                    // Crear una clave compuesta para búsqueda exacta
                    const dayHourKey = dayId !== null ? `${dayId}-${hourId}` : null;
                    
                    // Verificar si la franja está en el horario disponible
                    const isAvailable = availabilitySettings[dayId]?.includes(hourId);
                    
                    // CORRECCIÓN: Usar la función isSlotBlocked para verificar si el slot está bloqueado
                    const isBlockedSlot = dayId !== null ? isSlotBlocked(dayId, hourId) : false;
                    
                    // Añadir depuración para este slot específico
                    if (isBlockedSlot) {
                      console.log(`🔴 SLOT BLOQUEADO EN VISTA DIARIA: Día=${dayId} (${getDayName(dayId)}), Hora=${hourId}`);
                    }
                    
                    // Verificar si hay un evento en esta franja
                    const event = events.find(event => 
                      new Date(event.fecha).getDay() === dayId && 
                      parseInt(event.horaInicio.split(':')[0]) === hourId
                    );
                    
                    // Aplicar estilo directo para slots bloqueados
                    const slotStyle = isBlockedSlot 
                      ? { 
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 10,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#FF0000', // Rojo brillante
                          borderWidth: 3,
                          borderColor: '#FF3A5E',
                        }
                      : [
                          styles.timeSlot,
                          isAvailable ? styles.availableSlot : styles.unavailableSlot,
                          event && styles.eventSlot
                        ];
                    
                    // Determinar el estilo del texto
                    const textStyle = isBlockedSlot ? 
                      [styles.timeText, {color: '#FFFFFF', fontWeight: 'bold'}] : 
                      styles.timeText;
                    
                    return (
                      <TouchableOpacity
                        key={slot.id}
                        style={slotStyle}
                        onPress={() => handleTimeSlotSelect(slot)}
                      >
                        <Text style={textStyle}>
                          {`${slot.hour}:00 ${slot.period}`}
                        </Text>
                        {event && (
                          <Text style={styles.eventText} numberOfLines={1}>
                            {event.titulo}
                          </Text>
                        )}
                        {isBlockedSlot && (
                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{color: '#FFFFFF', marginRight: 5, fontWeight: 'bold'}}>Bloqueado</Text>
                            <Ionicons name="lock-closed" size={20} color="#FFF" style={styles.lockIcon} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </>
      )}
      
      {renderModal()}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#FF3A5E' }]}
          onPress={handleResetBlockedSlots}
        >
          <Text style={styles.buttonText}>Restablecer Disponibilidad</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FF3A5E',
    marginTop: 35,         // Margen superior para respetar la barra de estado
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayButton: {
    backgroundColor: '#FF3A5E',
  },
  dayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  scheduleContainer: {
    marginBottom: 20,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scheduleDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scheduleActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontSize: 14,
  },
  timeSlot: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableSlot: {
    backgroundColor: '#1E3A2E',
  },
  unavailableSlot: {
    backgroundColor: '#3A1E1E',
  },
  eventSlot: {
    backgroundColor: '#1E2A3A',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  eventText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
  },
  lockIcon: {
    marginLeft: 5,
  },
  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#222222',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalBody: {
    padding: 15,
  },
  modalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  timeSlotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#333333',
  },
  selectedTimeSlotItem: {
    backgroundColor: '#1E3A3A',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  timeSlotText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#333333',
    borderRadius: 8,
  },
  switchLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  availabilityContainer: {
    marginBottom: 10,
  },
  availabilityText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#333333',
  },
  availableItem: {
    backgroundColor: '#1E3A2E',
  },
  unavailableItem: {
    backgroundColor: '#3A1E1E',
  },
  availabilityItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  eventInfoContainer: {
    padding: 10,
    backgroundColor: '#1E2A3A',
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  noEventText: {
    fontSize: 16,
    color: '#CCCCCC',
    fontStyle: 'italic',
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#444444',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  blockButton: {
    backgroundColor: '#8C2626',
  },
  unblockButton: {
    backgroundColor: '#267F8C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default SpaceSchedule;
