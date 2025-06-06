import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, Switch, DatePickerIOS, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../../../../styles/SpaceScheduleStyles';

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
  const [blockedSlotsByDate, setBlockedSlotsByDate] = useState({});
  const [isRecurring, setIsRecurring] = useState(false);
  const [modalMode, setModalMode] = useState('info'); // 'info', 'block', 'availability'

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [useSpecificDate, setUseSpecificDate] = useState(false);
  const [configSpecificDate, setConfigSpecificDate] = useState(null);
  const [showConfigDatePicker, setShowConfigDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);
  const [selectedBlockedSlot, setSelectedBlockedSlot] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [weekDaysWithDates, setWeekDaysWithDates] = useState([]);


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

  // Franjas horarias (de 6am a 12pm)
  const timeSlots = Array.from({ length: 19 }, (_, index) => {
    const hour = index + 6;
    return { 
      id: hour, 
      hour: hour > 12 ? hour - 12 : hour, 
      period: hour >= 12 ? 'PM' : 'AM' 
    };
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Cargando datos iniciales...');
        setLoading(true);
        
        // PASO 1: Inicializar días de la semana con fechas locales correctas
        const initialWeekDays = initializeWeekDays();
        setWeekDaysWithDates(initialWeekDays);
        console.log('Días de la semana inicializados correctamente');
        
        // PASO 2: Seleccionar el día actual por defecto usando la fecha local
        const now = new Date();
        const todayDayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
        const todayDay = initialWeekDays.find(day => parseInt(day.id, 10) === todayDayOfWeek);
        
        if (todayDay) {
          setSelectedDay(todayDay);
          console.log(`Día seleccionado: ${todayDay.name} (${todayDay.date})`);
          
          // Actualizar la fecha seleccionada con la fecha local correcta
          const [year, month, day] = todayDay.date.split('-').map(num => parseInt(num, 10));
          const dateObj = new Date(year, month - 1, day);
          
          // Manejar cambio de fecha en el selector
          const handleDateChange = (date) => {
            console.log('Cambiando a fecha:', date.toLocaleDateString());
            setSelectedDate(date);
            
            // Actualizar el día seleccionado en base a la fecha
            const dayOfWeek = date.getDay();
            const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Ajustar para que lunes sea 0
            setSelectedDay(adjustedDayOfWeek.toString());
            
            // Primero cargar configuración de disponibilidad para la fecha seleccionada
            loadAvailabilitySettings(date);
            
            // Luego cargar slots bloqueados para la fecha seleccionada
            loadBlockedSlots(date);
            
            // Actualizar los días de la semana para reflejar la semana de la fecha seleccionada
            updateWeekDays(date);
          };
          
          // Actualizar los días de la semana basados en la fecha seleccionada
          const updateWeekDays = (date) => {
            // Obtener el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
            const currentDay = date.getDay();
            
            // Ajustar para que la semana comience en lunes (1)
            const firstDayOfWeek = 1; // Lunes
            
            // Calcular el lunes de la semana actual
            const mondayOffset = currentDay === 0 ? -6 : firstDayOfWeek - currentDay;
            const monday = new Date(date);
            monday.setDate(date.getDate() + mondayOffset);
            
            // Generar fechas para cada día de la semana (lunes a domingo)
            const newDays = [];
            for (let i = 0; i < 7; i++) {
              const currentDate = new Date(monday);
              currentDate.setDate(monday.getDate() + i);
              
              const dayName = getDayName(currentDate.getDay());
              const dateStr = currentDate.toISOString().split('T')[0];
              
              newDays.push({
                id: i.toString(),
                name: dayName,
                date: dateStr
              });
            }
            
            setWeekDaysWithDates(newDays);
            console.log('Días de la semana actualizados:', newDays);
          };
          
          if (!isNaN(dateObj.getTime())) {
            setSelectedDate(dateObj);
            console.log(`Fecha seleccionada establecida: ${dateObj.toLocaleDateString()}`);
          }
        } else {
          setSelectedDay(initialWeekDays[0]);
          console.log(`No se encontró el día actual, seleccionando el primer día: ${initialWeekDays[0].name}`);
        }
        
        // PASO 3: Cargar configuración de disponibilidad
        await loadAvailabilitySettings();
        
        // PASO 4: Cargar eventos
        await loadEvents();
        
        // PASO 5: Cargar slots bloqueados después de que los días estén inicializados
        // Esperamos a que todo esté listo para garantizar que los slots se asignen correctamente
        await loadBlockedSlots();
        
        // PASO 6: Forzar actualización de la UI para asegurar que todo se muestre correctamente
        setForceUpdate(prev => prev + 1);
        
        console.log('Datos iniciales cargados correctamente');
        setLoading(false);
        
        // PASO 7: Ejecutar depuración para verificar que todo está correcto
        setTimeout(() => {
          debugWeekDays();
          debugBlockedSlots();
        }, 1000);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setLoading(false);
      }
    };
    
    // Cargar datos iniciales al montar el componente
    loadInitialData();
    
    // Configurar sincronización automática cada 5 minutos
    const syncInterval = setInterval(() => {
      console.log('🔄 Sincronización automática iniciada...');
      
      // Actualizar días de la semana
      const updatedWeekDays = initializeWeekDays();
      setWeekDaysWithDates(updatedWeekDays);
      
      // Recargar slots bloqueados
      loadBlockedSlots().then(() => {
        console.log('✅ Sincronización automática completada');
        
        // Forzar actualización de la UI
        setForceUpdate(prev => prev + 1);
      }).catch(error => {
        console.error('Error en sincronización automática:', error);
      });
    }, 5 * 60 * 1000); // 5 minutos en milisegundos
    
    // Limpiar intervalo al desmontar el componente
    return () => {
      clearInterval(syncInterval);
    };
  }, []);

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
    if (blockedSlots.length > 0) {
      console.log(`🔍 Se han cargado ${blockedSlots.length} slots bloqueados`);
      debugBlockedSlots();
      
      // Verificar que los slots bloqueados solo aparezcan en su fecha específica
      console.log('Verificando que los slots bloqueados solo aparezcan en su fecha específica...');
      
      // Recorrer todos los días de la semana
      weekDaysWithDates.forEach(day => {
        if (day && day.date) {
          // Verificar si hay slots bloqueados para esta fecha
          const slotsForDate = blockedSlotsByDate[day.date] || [];
          if (slotsForDate.length > 0) {
            console.log(`Día ${day.name} (${day.date}): ${slotsForDate.length} slots bloqueados`);
          }
        }
      });
    }
  }, [blockedSlots, blockedSlotsByDate, weekDaysWithDates]);

  useEffect(() => {
    // Solo cargar si configSpecificDate tiene un valor y no estamos en medio de una configuración
    if (configSpecificDate && !modalVisible && !isLoading) {
      // Usar un timeout para evitar múltiples actualizaciones en el mismo ciclo
      const timer = setTimeout(() => {
        loadSpecificDateAvailability(configSpecificDate);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [configSpecificDate, modalVisible]);

  // Efecto adicional para forzar la actualización de fechas al iniciar la aplicación
  useEffect(() => {
    // Ejecutar una actualización forzada después de que el componente se monte completamente
    const forceInitialUpdate = setTimeout(() => {
      console.log('🔄 Forzando actualización inicial automática...');
      
      // Actualizar días de la semana
      const updatedWeekDays = initializeWeekDays();
      setWeekDaysWithDates(updatedWeekDays);
      
      // Seleccionar el día actual
      const now = new Date();
      const todayDayOfWeek = now.getDay();
      const todayDay = updatedWeekDays.find(day => parseInt(day.id, 10) === todayDayOfWeek);
      
      if (todayDay) {
        setSelectedDay(todayDay);
        console.log(`Día seleccionado actualizado: ${todayDay.name} (${todayDay.date})`);
        
        // Actualizar la fecha seleccionada
        const [year, month, day] = todayDay.date.split('-').map(num => parseInt(num, 10));
        const dateObj = new Date(year, month - 1, day);
        setSelectedDate(dateObj);
      }
      
      // Recargar los slots bloqueados
      loadBlockedSlots().then(() => {
        console.log('✅ Actualización inicial completada');
        
        // Forzar actualización de la UI
        setForceUpdate(prev => prev + 1);
      });
    }, 2000); // Esperar 2 segundos después de montar el componente
    
    return () => clearTimeout(forceInitialUpdate);
  }, []); // Este efecto se ejecuta solo una vez al montar el componente

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

  const loadAvailabilitySettings = async (date = null) => {
    try {
      setIsLoading(true);
      
      const managerId = getValidManagerId();
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
          
          // Preguntar al usuario si desea crear una configuración específica
          if (!modalVisible) {
            Alert.alert(
              'Configuración no encontrada',
              `No hay configuración específica para ${date.toLocaleDateString()}. ¿Deseas crear una?`,
              [
                {
                  text: 'No',
                  style: 'cancel',
                  onPress: () => {
                    // Volver a cargar la configuración general
                    setUseSpecificDate(false);
                    setConfigSpecificDate(null);
                    loadAvailabilitySettings();
                  }
                },
                {
                  text: 'Sí, configurar',
                  onPress: () => {
                    // Configurar para fecha específica
                    setUseSpecificDate(true);
                    setConfigSpecificDate(new Date(date));
                    
                    // Abrir el modal para configurar
                    setModalMode('availability');
                    setModalVisible(true);
                  }
                }
              ]
            );
          }
          return;
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
      } else {
        console.error('Error al cargar disponibilidad:', response.data?.message);
      }
    } catch (error) {
      console.error('Error al cargar configuración de disponibilidad:', error);
      setIsLoading(false);
    }
  };

  const loadBlockedSlots = async (specificDate = null) => {
    try {
      console.log('🔍 Iniciando carga de slots bloqueados...');
      
      const managerId = getValidManagerId();
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
        
        // Ejecutar depuración para verificar
        setTimeout(() => {
          debugWeekDays();
          debugBlockedSlots();
        }, 500);
        
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
          console.log(` Slots bloqueados cargados desde AsyncStorage: ${parsedSlots.length}`);
          
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
          
          // Ejecutar depuración para verificar
          setTimeout(() => {
            debugWeekDays();
            debugBlockedSlots();
          }, 500);
          
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

  const debugBlockedSlots = () => {
    console.log(' DEPURACIÓN DE SLOTS BLOQUEADOS:');
    console.log(` Total de slots bloqueados: ${blockedSlots.length}`);
    console.log(' Mapa de slots bloqueados por fecha:', Object.keys(blockedSlotsByDate));
    
    // Verificar qué slots se mostrarían para la fecha seleccionada
    const currentDate = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
    if (currentDate) {
      debugBlockedSlotsForDate(currentDate);
    }
  };
  
  // Función para depurar slots bloqueados para una fecha específica
  const debugBlockedSlotsForDate = (dateStr) => {
    console.log(`Verificando slots bloqueados para fecha: ${dateStr}`);
    
    if (blockedSlotsByDate[dateStr]) {
      console.log(`Encontrados ${blockedSlotsByDate[dateStr].length} slots bloqueados para esta fecha`);
      blockedSlotsByDate[dateStr].forEach((slot, index) => {
        console.log(`  Slot ${index + 1}: hora=${slot.hour}, día=${slot.day}, id=${slot.id}`);
      });
    } else {
      console.log('No hay slots bloqueados para esta fecha');
    }
  };

  const handleDayPress = (day) => {
    console.log(`Día seleccionado: ${day.name} (${day.date})`);
    
    // Actualizar el día seleccionado
    setSelectedDay(day);
    
    // Actualizar la fecha seleccionada si existe
    if (day.date) {
      try {
        // Crear un objeto Date a partir de la cadena de fecha
        const [year, month, dayNum] = day.date.split('-').map(num => parseInt(num, 10));
        const dateObj = new Date(year, month - 1, dayNum);
        
        // Verificar que la fecha sea válida
        if (!isNaN(dateObj.getTime())) {
          console.log(`Fecha seleccionada: ${dateObj.toISOString()}`);
          
          // Actualizar la fecha seleccionada
          setSelectedDate(dateObj);
          console.log(`Cargando disponibilidad para fecha específica: ${day.date}`);
          
          // Cargar la disponibilidad específica para esta fecha
          loadAvailabilitySettings(dateObj);
          
          // Cargar los slots bloqueados para esta fecha
          loadBlockedSlots(dateObj);
        }
      } catch (error) {
        console.error(`Error al procesar fecha ${day.date}:`, error);
      }
    }
    
    // Forzar actualización de la UI
    setForceUpdate(prev => prev + 1);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    
    // Verificar si la franja está bloqueada
    const slotIsBlocked = isSlotBlocked(slot.id, selectedDay);
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
  const isSlotBlocked = (hour, dayObj) => {
    // Verificar que tengamos los datos necesarios
    if (!dayObj || !dayObj.date || !hour) {
      console.log(' Datos insuficientes para verificar slot bloqueado');
      return false;
    }

    // Obtener la fecha del día
    const dayDate = dayObj.date; // Formato: YYYY-MM-DD

    // Verificar si hay slots bloqueados para esta fecha específica
    if (blockedSlotsByDate && blockedSlotsByDate[dayDate]) {
      // Buscar si hay un slot bloqueado para esta hora en esta fecha específica
      const isBlocked = blockedSlotsByDate[dayDate].some(slot => {
        const slotHour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
        const hourToCheck = typeof hour === 'string' ? parseInt(hour, 10) : hour;

        // COMPARACIÓN DIRECTA: Solo verificar que la hora coincida, ya que estamos filtrando por fecha exacta
        const hourMatches = slotHour === hourToCheck;

        if (hourMatches) {
          console.log(` Slot bloqueado encontrado: fecha=${dayDate}, hora=${hour}`);
        }

        return hourMatches;
      });

      return isBlocked;
    }

    // No hay slots bloqueados para esta fecha
    return false;
  };

  const renderTimeSlot = (slot, day) => {
    const hourId = parseInt(slot.id, 10);
    const dayId = parseInt(day.id, 10);
    
    // IMPORTANTE: Obtener la fecha específica del día actual
    const currentDayDate = day.date;
    
    // SOLUCIÓN DIRECTA: Verificar SOLO la fecha actual (no fechas adyacentes)
    // Esto evita que los slots bloqueados aparezcan en múltiples días
    let isBlockedSlot = false;
    
    // Verificar si el slot está bloqueado para esta fecha específica
    if (currentDayDate && blockedSlotsByDate && blockedSlotsByDate[currentDayDate]) {
      const blockedSlotsForDate = blockedSlotsByDate[currentDayDate];
      
      isBlockedSlot = blockedSlotsForDate.some(blockedSlot => {
        const blockedHour = typeof blockedSlot.hour === 'string' ? parseInt(blockedSlot.hour, 10) : blockedSlot.hour;
        return blockedHour === hourId;
      });
      
      if (isBlockedSlot) {
        console.log(` Slot bloqueado encontrado en fecha ${currentDayDate}, hora=${hourId}`);
      }
    }
    
    // Verificar disponibilidad
    // Si estamos en modo de fecha específica, verificar la disponibilidad para esa fecha
    // La disponibilidad para fechas específicas viene en la respuesta del backend
    // con el formato {dayId: [hourId1, hourId2, ...]} donde dayId es el día de la semana (0-6)
    const isAvailable = availabilitySettings[dayId]?.includes(hourId);
    
    // Verificar si hay un evento en este slot
    const event = events.find(
      e => e.day === dayId && e.hour === hourId
    );
    
    // Aplicar estilo directo para slots bloqueados con un color rojo más oscuro
    const slotStyle = isBlockedSlot ? [
        styles.timeSlot,
        styles.blockedSlot,
        {
          backgroundColor: '#990000', // Rojo más oscuro
          borderColor: '#990000'
        }
      ] : [
        styles.timeSlot,
        isAvailable ? styles.availableSlot : styles.unavailableSlot,
        event && styles.eventSlot
      ];
    
    // Determinar el estilo del texto
    const textStyle = isBlockedSlot ? [styles.timeText, styles.blockedText] : [styles.timeText, isAvailable ? styles.availableText : styles.unavailableText];
    
    return (
      <TouchableOpacity
        key={`${dayId}-${hourId}`}
        style={slotStyle}
        onPress={() => {
          // Si el slot está bloqueado, mostrar opción para desbloquear
          if (isBlockedSlot) {
            // Buscar el slot bloqueado específico
            let blockedSlot = null;
            
            // Buscar en la fecha actual
            if (currentDayDate && blockedSlotsByDate && blockedSlotsByDate[currentDayDate]) {
              blockedSlot = blockedSlotsByDate[currentDayDate].find(bs => {
                const bsHour = typeof bs.hour === 'string' ? parseInt(bs.hour, 10) : bs.hour;
                return bsHour === hourId;
              });
            }
            
            showUnblockModal(day, slot, blockedSlot);
          } else {
            handleTimeSlotSelect(slot);
          }
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={textStyle}>{`${slot.hour}:00 ${slot.period}`}</Text>
          {isBlockedSlot && (
            <Ionicons name="lock-closed" size={16} color="#FFFFFF" style={{ marginLeft: 5 }} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTimeSlots = () => {
    if (!selectedDay) {
      return null;
    }
    
    return timeSlots.map(slot => renderTimeSlot(slot, selectedDay));
  };

  // Función auxiliar para obtener el nombre del día a partir de su ID
  const getDayName = (dayId) => {
    const days = [
      'Domingo',  // 0
      'Lunes',    // 1
      'Martes',   // 2
      'Miércoles',// 3
      'Jueves',   // 4
      'Viernes',  // 5
      'Sábado'    // 6
    ];
    
    // Asegurar que dayId sea un número
    const dayIdNum = typeof dayId === 'string' ? parseInt(dayId, 10) : dayId;
    
    // Asegurar que el índice esté dentro del rango válido (0-6)
    const index = ((dayIdNum % 7) + 7) % 7;
    
    return days[index];
  };

  const updateAvailability = (day, slot, isAvailable) => {
    if (!day || !slot) {
      console.error('Día o slot no válidos para actualizar disponibilidad');
      return;
    }
    
    const dayId = parseInt(day.id, 10);
    const slotId = parseInt(slot.id, 10);
    
    console.log(`Actualizando disponibilidad: día=${dayId}, hora=${slotId}, disponible=${isAvailable}`);
    
    // Crear una copia del estado actual para modificarlo
    const updatedSettings = { ...availabilitySettings };
    
    // Inicializar el array para este día si no existe
    if (!updatedSettings[dayId]) {
      updatedSettings[dayId] = [];
    }
    
    if (isAvailable) {
      // Si debe estar disponible, añadir el slot si no está ya
      if (!updatedSettings[dayId].includes(slotId)) {
        updatedSettings[dayId].push(slotId);
      }
    } else {
      // Si no debe estar disponible, eliminar el slot si está
      updatedSettings[dayId] = updatedSettings[dayId].filter(id => id !== slotId);
    }
    
    // Actualizar el estado
    setAvailabilitySettings(updatedSettings);
    
    // Forzar actualización de la UI
    setForceUpdate(prev => prev + 1);
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

  const loadAvailabilityWithRetry = async (retries = 3) => {
    const isEditingAvailability = modalVisible && modalMode === 'availability' && configSpecificDate;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (!isConfiguringSpecificDate) {
          setIsLoading(true);
        }
        
        // Asegurarnos que managerId sea un número válido
        const managerId = getValidManagerId();
        if (!managerId) {
          console.log('No se pudo cargar disponibilidad: ID de manager inválido');
          initializeDefaultAvailability();
          setIsLoading(false);
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
        
        // Construir la URL base
        let url = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`;
        
        // Si hay una fecha específica, añadirla como parámetro de consulta
        let dateParam = '';
        if (configSpecificDate) {
          dateParam = configSpecificDate.toISOString().split('T')[0];
          url += `?date=${dateParam}`;
          console.log(`Cargando disponibilidad para fecha específica: ${dateParam}`);
        }
        
        console.log(`Intento ${attempt}/${retries}: Solicitando disponibilidad desde URL:`, url);
        
        // Mostrar información detallada sobre los datos que se enviarán
        const diasConfig = Object.keys(availabilitySettings).length;
        console.log(`Configurando ${diasConfig} días${configSpecificDate ? ` para fecha específica: ${configSpecificDate.toLocaleDateString()}` : ' (configuración general)'}`);
        
        // Preparar datos para enviar al backend
        const requestData = {
          availability: availabilitySettings
        };
        
        // Si estamos configurando para una fecha específica, incluirla
        if (configSpecificDate) {
          requestData.date = configSpecificDate.toISOString().split('T')[0];
          console.log(`Configurando disponibilidad para fecha específica: ${requestData.date}`);
        } else {
          console.log('Configurando disponibilidad general (sin fecha específica)');
        }
        
        // Enviar la configuración limpia al backend con timeout
        console.log('Enviando datos al servidor:', JSON.stringify(requestData));
        const response = await axios.get(url, { timeout: 10000 }); // Timeout de 10 segundos
        
        if (!isConfiguringSpecificDate) {
          setIsLoading(false);
        }
        
        console.log('Respuesta recibida:', response.status);
        
        if (response.data && response.data.success) {
          console.log('Datos de disponibilidad recibidos:', {
            días: Object.keys(response.data.availability).length,
            fecha: response.data.date,
            esEspecífica: response.data.isSpecificDate,
            puedeCrearConfig: response.data.canCreateConfig
          });
          
          // Verificar si hay datos de disponibilidad
          if (Object.keys(response.data.availability).length > 0) {
            setAvailabilitySettings(response.data.availability);
            saveAvailabilityToStorage(response.data.availability);
            
            // Mostrar mensaje según el tipo de configuración
            if (configSpecificDate && !isConfiguringSpecificDate) {
              if (response.data.isSpecificDate) {
                console.log('Usando configuración específica para la fecha seleccionada');
                // No mostrar alerta para no interrumpir la experiencia del usuario
              } else {
                console.log('Usando configuración recurrente (no hay configuración específica para esta fecha)');
                if (showNotifications && response.data.canCreateConfig) {
                  Alert.alert(
                    'Configuración para fecha específica',
                    `No hay configuración específica para ${configSpecificDate.toLocaleDateString()}. ¿Deseas crear una?`,
                    [
                      { text: 'No', style: 'cancel' },
                      { 
                        text: 'Sí, configurar', 
                        onPress: () => {
                          // Inicializar con la configuración general actual como base
                          const currentConfig = {...availabilitySettings};
                          setAvailabilitySettings(currentConfig);
                          
                          // Detener cualquier proceso de carga en curso
                          setIsLoading(false);
                          
                          // Guardar la fecha específica en una variable local
                          const dateToUse = new Date(configSpecificDate);
                          
                          // Usar setTimeout para asegurar que el modal se abra después de que
                          // se haya cerrado el diálogo de alerta
                          setTimeout(() => {
                            console.log('Abriendo modal de configuración para fecha específica:', dateToUse.toLocaleDateString());
                            setConfigSpecificDate(dateToUse);
                            setModalMode('availability');
                            setModalVisible(true);
                            setUseSpecificDate(true);
                          }, 500);
                        },
                        style: 'default'
                      }
                    ]
                  );
                } else if (showNotifications) {
                  Alert.alert('Información', `No hay configuración específica para ${configSpecificDate.toLocaleDateString()}, mostrando configuración general`);
                }
              }
            }
          } else {
            console.log('No se encontraron datos de disponibilidad');
            if (configSpecificDate && showNotifications && !isConfiguringSpecificDate) {
              if (response.data.canCreateConfig) {
                Alert.alert(
                  'Sin configuración',
                  `No hay configuración para ${configSpecificDate.toLocaleDateString()}. ¿Deseas crear una configuración específica para esta fecha?`,
                  [
                    {
                      text: 'No',
                      style: 'cancel',
                      onPress: () => {
                        // Volver a cargar la configuración general
                        setUseSpecificDate(false);
                        setConfigSpecificDate(null);
                        loadAvailabilitySettings();
                      }
                    },
                    {
                      text: 'Sí, configurar',
                      onPress: () => {
                        // Configurar para fecha específica
                        setUseSpecificDate(true);
                        setConfigSpecificDate(date);
                        
                        // Abrir el modal para configurar
                        setModalMode('availability');
                        setModalVisible(true);
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Información', `No hay configuración para ${configSpecificDate.toLocaleDateString()}`);
              }
            }
          }
          
          // Si llegamos aquí, la carga fue exitosa
          return;
        } else {
          console.log('Error en la respuesta:', response.data);
          // No mostrar alerta de error al usuario
          if (attempt === retries) {
            // Inicializar con disponibilidad por defecto
            initializeDefaultAvailability();
          }
        }
      } catch (error) {
        if (!isConfiguringSpecificDate) {
          setIsLoading(false);
        }
        
        console.log(`Intento ${attempt}/${retries} - Error al cargar disponibilidad:`, error.message);
        
        if (error.code === 'ECONNABORTED') {
          console.log('Timeout al conectar con el servidor');
        }
        
        // Si es el último intento, mostrar mensaje de error
        if (attempt === retries) {
          console.log('Detalles del error:', error.response ? error.response.data : 'No hay detalles adicionales');
          
          // No mostrar alertas de error al usuario
          // En su lugar, inicializar con disponibilidad por defecto
          initializeDefaultAvailability();
          
          // Registrar el error en la consola para depuración
          console.log('Error al cargar disponibilidad, usando configuración por defecto');
        } else {
          // Esperar antes del siguiente intento (tiempo exponencial)
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Esperando ${waitTime}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
  };

  const handleUnblockSlot = async (day, hour, blockedSlot = null) => {
    try {
      setIsLoading(true);
      
      const managerId = getValidManagerId();
      if (!managerId) {
        Alert.alert('Error', 'ID de manager inválido');
        setIsLoading(false);
        return;
      }
      
      // Validar que tengamos valores válidos
      if ((day === undefined || hour === undefined) && !blockedSlot) {
        console.error('Valores faltantes para desbloquear slot:', { day, hour, blockedSlot });
        Alert.alert('Error', 'Información incompleta para desbloquear el horario');
        setIsLoading(false);
        return;
      }
      
      console.log(`Intentando desbloquear slot:`, { day, hour, blockedSlotId: blockedSlot?.id });
      
      let response;
      
      // Si tenemos el ID del slot bloqueado, usar ese endpoint
      if (blockedSlot && blockedSlot.id) {
        console.log(`Desbloqueando por ID: ${blockedSlot.id}`);
        response = await axios.post(`${BACKEND_URL}/api/spaces/unblock-slot-by-id/${blockedSlot.id}`);
      } else {
        // Si no tenemos el ID, usar el endpoint que requiere día y hora
        // Asegurarnos de que day y hour sean números
        const dayNum = typeof day === 'string' ? parseInt(day, 10) : day;
        const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
        
        if (isNaN(dayNum) || isNaN(hourNum)) {
          console.error('Valores inválidos para desbloquear slot:', { day, hour, dayNum, hourNum });
          Alert.alert('Error', 'Valores inválidos para desbloquear el horario');
          setIsLoading(false);
          return;
        }
        
        console.log(`Desbloqueando por día/hora: ${dayNum}/${hourNum}`);
        
        // Crear un objeto limpio sin referencias circulares
        const requestData = {
          day: dayNum,
          hour: hourNum
        };
        
        // Si hay una fecha específica seleccionada, incluirla
        if (selectedDate) {
          requestData.date = selectedDate.toISOString().split('T')[0];
        } else if (configSpecificDate) {
          requestData.date = configSpecificDate.toISOString().split('T')[0];
        }
        
        console.log('Datos de desbloqueo:', JSON.stringify(requestData));
        
        // Asegurarnos de que la URL sea correcta
        const url = `${BACKEND_URL}/api/spaces/unblock-slot/${managerId}`;
        console.log('URL de desbloqueo:', url);
        
        response = await axios.post(url, requestData);
      }
      
      setIsLoading(false);
      
      if (response.data && response.data.success) {
        // Actualizar inmediatamente el estado local de slots bloqueados
        // Esto es crucial para que la interfaz se actualice sin tener que recargar
        if (blockedSlot && blockedSlot.id) {
          // Si tenemos el ID del slot, eliminarlo del array de slots bloqueados
          setBlockedSlots(prevSlots => prevSlots.filter(slot => slot.id !== blockedSlot.id));
        } else {
          // Si no tenemos el ID, eliminar por día y hora
          const dayNum = typeof day === 'string' ? parseInt(day, 10) : day;
          const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
          
          setBlockedSlots(prevSlots => {
            return prevSlots.filter(slot => {
              // Si hay fecha específica, filtrar por fecha también
              if (selectedDate || configSpecificDate) {
                const dateToCheck = selectedDate ? selectedDate : configSpecificDate;
                const dateStr = dateToCheck.toISOString().split('T')[0];
                return !(slot.day === dayNum && slot.hour === hourNum && slot.date === dateStr);
              }
              // Si no hay fecha específica, filtrar solo por día y hora
              return !(slot.day === dayNum && slot.hour === hourNum);
            });
          });
        }
        
        Alert.alert('Éxito', 'Horario desbloqueado correctamente');
        
        // Recargar los slots bloqueados desde el servidor para asegurar sincronización
        loadBlockedSlots();
        
        // Cerrar el modal
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'No se pudo desbloquear el horario: ' + (response.data?.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al desbloquear slot:', error);
      console.error('Detalles del error:', error.response ? error.response.data : 'No hay detalles adicionales');
      console.error('Código de estado:', error.response ? error.response.status : 'Desconocido');
      
      setIsLoading(false);
      
      // Mensaje más específico según el código de error
      let errorMessage = 'Error al desbloquear el horario';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Datos inválidos para desbloquear el horario. Verifica que los valores sean correctos.';
        } else if (error.response.status === 404) {
          errorMessage = 'No se encontró el slot para desbloquear.';
        } else if (error.response.status === 500) {
          errorMessage = 'Error interno del servidor al desbloquear el horario.';
        }
        
        // Incluir mensaje del servidor si está disponible
        if (error.response.data && error.response.data.message) {
          errorMessage += ` Mensaje del servidor: ${error.response.data.message}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const showUnblockModal = (day, slot, blockedSlot = null) => {
    // Guardar el día y slot seleccionados
    setSelectedDay(day);
    setSelectedTimeSlot(slot);
    
    // Configurar el modal para desbloqueo
    setModalMode('unblock');
    setModalVisible(true);
    
    // Guardar el slot bloqueado si se proporciona
    setSelectedBlockedSlot(blockedSlot);
  };

  const executeUnblock = () => {
    // Verificar que tengamos los datos necesarios
    if (!selectedDay || !selectedTimeSlot) {
      Alert.alert('Error', 'Debes seleccionar un día y una hora');
      return;
    }
    
    // Llamar a la función de desbloqueo con los valores seleccionados
    handleUnblockSlot(selectedDay.id, selectedTimeSlot.id, selectedBlockedSlot);
  };

  const handleBlockSlot = async () => {
    try {
      if (!selectedTimeSlot) {
        return;
      }
      
      setIsLoading(true);
      
      // Obtener el ID del manager
      const managerId = getValidManagerId();
      if (!managerId) {
        Alert.alert('Error', 'No se pudo identificar el manager');
        setIsLoading(false);
        return;
      }
      
      // Obtener el día y la hora seleccionados
      const dayId = selectedDay ? parseInt(selectedDay.id, 10) : null;
      const hourId = selectedTimeSlot ? parseInt(selectedTimeSlot.id, 10) : null;
      
      if (dayId === null || hourId === null) {
        Alert.alert('Error', 'Día u hora no seleccionados');
        setIsLoading(false);
        return;
      }
      
      // Obtener la fecha correspondiente al día seleccionado
      let dateToUse = null;
      let dateStrToUse = null;
      
      // Si estamos usando una fecha específica, usarla
      if (useSpecificDate && selectedDate) {
        try {
          dateToUse = selectedDate;
          // IMPORTANTE: Asegurar que la fecha se guarde correctamente sin desfase
          dateStrToUse = selectedDate.toISOString().split('T')[0];
          console.log(`Usando fecha específica: ${dateStrToUse}`);
        } catch (error) {
          console.error('Error al procesar fecha específica:', error);
          Alert.alert('Error', 'Formato de fecha incorrecto');
          setIsLoading(false);
          return;
        }
      } else {
        // Si no, usar la fecha correspondiente al día seleccionado
        const selectedDayWithDate = weekDaysWithDates.find(day => parseInt(day.id, 10) === dayId);
        if (selectedDayWithDate && selectedDayWithDate.date) {
          // IMPORTANTE: Usar directamente la fecha del día seleccionado sin modificaciones
          dateStrToUse = selectedDayWithDate.date;
          console.log(`Usando fecha del día seleccionado (sin modificar): ${dateStrToUse}`);
          
          try {
            // Crear objeto Date sin ajustes de zona horaria para evitar desfases
            const [year, month, day] = dateStrToUse.split('-').map(num => parseInt(num, 10));
            dateToUse = new Date(year, month - 1, day); // month es 0-indexed en JavaScript
            console.log(`Fecha creada: ${dateToUse.toISOString()}`);
          } catch (error) {
            console.error(`Error al crear objeto Date con ${dateStrToUse}:`, error);
            // Continuar con dateStrToUse aunque dateToUse sea null
          }
        } else {
          console.log(`No se encontró fecha para el día ${dayId}`);
          Alert.alert('Error', 'No se pudo determinar la fecha para el día seleccionado');
          setIsLoading(false);
          return;
        }
      }
      
      if (!dateStrToUse) {
        Alert.alert('Error', 'No se pudo determinar la fecha para bloquear el horario');
        setIsLoading(false);
        return;
      }
      
      // Crear el objeto de slot bloqueado
      const blockedSlot = {
        managerId,
        hour: hourId,
        day: dayId,
        dayName: getDayName(dayId),
        date: dateStrToUse,
        isRecurring: isRecurring
      };
      
      console.log(`Bloqueando slot: día=${dayId}, hora=${hourId}, fecha=${dateStrToUse}`);
      
      // Enviar al backend - probar con URL alternativa
      const response = await axios.post(`${BACKEND_URL}/api/spaces/block-slot/${managerId}`, blockedSlot);
      
      if (response.status === 201 || response.status === 200) {
        console.log('Slot bloqueado exitosamente');
        
        // Actualizar el estado local
        const newBlockedSlot = response.data;
        
        // Asegurar que el slot tenga la fecha correcta
        const updatedSlot = {
          ...newBlockedSlot,
          date: dateStrToUse,
          day: dayId,
          hour: hourId,
          dayName: getDayName(dayId)
        };
        
        // ACTUALIZACIÓN INMEDIATA: Añadir el nuevo slot al estado
        setBlockedSlots(prev => {
          const newSlots = [...prev, updatedSlot];
          console.log(`✅ Slots bloqueados actualizados: ${newSlots.length} slots`);
          return newSlots;
        });
        
        // ACTUALIZACIÓN INMEDIATA: Actualizar el mapa de slots bloqueados por fecha
        setBlockedSlotsByDate(prev => {
          const newMap = { ...prev };
          if (!newMap[dateStrToUse]) {
            newMap[dateStrToUse] = [];
          }
          
          // Verificar si ya existe un slot con la misma hora para evitar duplicados
          const slotExists = newMap[dateStrToUse].some(slot => {
            const slotHour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
            return slotHour === hourId;
          });
          
          if (!slotExists) {
            newMap[dateStrToUse].push(updatedSlot);
            console.log(`✅ Slot añadido a fecha ${dateStrToUse}: hora=${hourId}`);
          }
          
          return newMap;
        });
        
        // ACTUALIZACIÓN INMEDIATA: Forzar actualización de la UI
        setForceUpdate(prev => prev + 1);
        
        // Cerrar el modal
        setModalVisible(false);
        
        // Ocultar indicador de carga
        setIsLoading(false);
        
        // Mostrar mensaje de éxito
        Alert.alert('Éxito', 'Horario bloqueado correctamente');
        
        // ACTUALIZACIÓN INMEDIATA: Actualizar la visualización sin necesidad de recargar
        setTimeout(() => {
          // Forzar una segunda actualización después de un breve retraso
          // para asegurar que la UI se actualice correctamente
          setForceUpdate(prev => prev + 1);
        }, 100);
      } else {
        console.error('Error al bloquear slot:', response.data);
        Alert.alert('Error', 'No se pudo bloquear el horario');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error al bloquear slot:', error);
      Alert.alert('Error', 'No se pudo bloquear el horario: ' + (error.message || 'Error desconocido'));
      setIsLoading(false);
    }
  };

  const handleSpecificDateChange = (date) => {
    if (!date) {
      console.log('Fecha específica es null o undefined');
      return;
    }
    
    try {
      console.log(`Cambiando fecha específica a: ${date.toLocaleDateString()}`);
      // Cerrar el selector de fecha
      setShowConfigDatePicker(false);
      // Actualizar la fecha específica sin desencadenar una carga inmediata
      setConfigSpecificDate(date);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      // Cerrar el selector de fecha de todos modos
      setShowConfigDatePicker(false);
      // Actualizar la fecha específica usando un formato alternativo
      setConfigSpecificDate(date);
    }
  };

  const openAvailabilityModal = (date = null) => {
    // Si se proporciona una fecha, configurarla
    if (date) {
      setConfigSpecificDate(date);
    }
    
    // Configurar el modo del modal
    setModalMode('availability');
    
    // Mostrar el modal
    setModalVisible(true);
  };

  const loadSpecificDateAvailability = (date) => {
    if (!date) return;
    
    // Evitar ciclos de carga
    if (isLoading) return;
    
    console.log(`Cargando disponibilidad para fecha específica: ${date.toLocaleDateString()}`);
    
    // Primero cargar la configuración general como base
    const managerId = getValidManagerId();
    if (!managerId) return;
    
    // Mostrar indicador de carga
    setIsLoading(true);
    
    // Cargar primero la configuración general como base
    axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`)
      .then(generalResponse => {
        if (generalResponse.data && generalResponse.data.success) {
          // Guardar la configuración general como base
          const generalSettings = generalResponse.data.availability;
          console.log('Configuración general cargada como base:', generalSettings);
          
          // Ahora cargar la configuración específica
          const dateString = date.toISOString().split('T')[0];
          axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${dateString}`)
            .then(specificResponse => {
              setIsLoading(false);
              
              if (specificResponse.data && specificResponse.data.success) {
                const specificSettings = specificResponse.data.availability;
                
                // Si hay configuración específica, combinarla con la general
                if (Object.keys(specificSettings).length > 0) {
                  console.log('Configuración específica encontrada:', specificSettings);
                  
                  // Combinar configuración general con específica
                  const combinedSettings = { ...generalSettings };
                  
                  // Sobrescribir solo los días que tienen configuración específica
                  for (const day in specificSettings) {
                    combinedSettings[day] = specificSettings[day];
                  }
                  
                  setAvailabilitySettings(combinedSettings);
                  console.log('Configuración combinada:', combinedSettings);
                } else if (specificResponse.data.canCreateConfig) {
                  // Si no hay configuración específica pero se puede crear, usar la general como base
                  setAvailabilitySettings(generalSettings);
                  console.log('No hay configuración específica, usando general como base');
                  
                  // Preguntar si quiere crear configuración específica
                  if (!modalVisible) {
                    Alert.alert(
                      'Configuración no encontrada',
                      `No hay configuración específica para ${date.toLocaleDateString()}. ¿Deseas crear una?`,
                      [
                        {
                          text: 'No',
                          style: 'cancel',
                          onPress: () => {
                            // Volver a cargar la configuración general
                            setUseSpecificDate(false);
                            setConfigSpecificDate(null);
                            loadAvailabilitySettings();
                          }
                        },
                        {
                          text: 'Sí, configurar',
                          onPress: () => {
                            // Configurar para fecha específica
                            setUseSpecificDate(true);
                            setConfigSpecificDate(date);
                            
                            // Abrir el modal para configurar
                            setModalMode('availability');
                            setModalVisible(true);
                          }
                        }
                      ]
                    );
                  }
                  return;
                }
              } else {
                console.error('Error al cargar configuración específica:', specificResponse.data?.message);
                setAvailabilitySettings(generalSettings);
              }
            })
            .catch(error => {
              console.error('Error al cargar configuración específica:', error);
              setIsLoading(false);
              setAvailabilitySettings(generalSettings);
            });
        } else {
          console.error('Error al cargar configuración general:', generalResponse.data?.message);
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error('Error al cargar configuración general:', error);
        setIsLoading(false);
      });
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    const result = [];
    
    // Ajustar para que la semana comience en lunes (1)
    const firstDayOfWeek = 1; // Lunes
    
    // Calcular el lunes de la semana actual
    const mondayOffset = currentDay === 0 ? -6 : firstDayOfWeek - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    // Generar fechas para cada día de la semana (lunes a domingo)
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      result.push(date);
    }
    
    return result;
  };

  // Obtener fechas de la semana actual
  const weekDates = useMemo(() => getCurrentWeekDates(), []);

  // Calcular los días de la semana con sus fechas correspondientes
  // Pero NO actualizar el estado aquí para evitar ciclos infinitos
  const calculatedWeekDaysWithDates = useMemo(() => {
    return weekDays.map((day, index) => {
      const date = weekDates[index];
      const formattedDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const displayDate = `${date.getDate()}/${date.getMonth() + 1}`; // Formato DD/MM
      
      return {
        ...day,
        date: formattedDate,
        displayDate: displayDate
      };
    });
  }, [weekDays, weekDates]);
  
  // Inicializar weekDaysWithDates una sola vez al montar el componente
  useEffect(() => {
    // Solo actualizar si el estado está vacío para evitar ciclos
    if (weekDaysWithDates.length === 0) {
      setWeekDaysWithDates(calculatedWeekDaysWithDates);
    }
  }, [calculatedWeekDaysWithDates, weekDaysWithDates.length]);

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
            <TouchableOpacity
              style={[styles.closeButton, { position: 'absolute', top: 10, right: 10, zIndex: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.modalBody}>
              {(modalMode === 'block' || modalMode === 'unblock') && (
                <View>
                  {modalMode === 'block' && (
                    <View style={styles.datePickerContainer}>
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Usar fecha específica</Text>
                        <Switch
                          value={useSpecificDate}
                          onValueChange={(value) => {
                            if (value) {
                              setIsRecurring(false); // No puede ser recurrente si es fecha específica
                            }
                            setUseSpecificDate(value);
                          }}
                          trackColor={{ false: '#ccc', true: '#4A90E2' }}
                          thumbColor={useSpecificDate ? '#FFFFFF' : '#f4f3f4'}
                        />
                      </View>
                      
                      {useSpecificDate && (
                        <View style={styles.datePickerWrapper}>
                          <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                          >
                            <Text style={styles.datePickerButtonText}>
                              Seleccionar fecha: {selectedDate.toLocaleDateString()}
                            </Text>
                            <Ionicons name="calendar" size={20} color="#FFF" />
                          </TouchableOpacity>
                          
                          {showDatePicker && (
                            <View>
                              {Platform.OS === 'ios' ? (
                                <DatePickerIOS
                                  date={selectedDate}
                                  onDateChange={setSelectedDate}
                                  mode="date"
                                  style={{ height: 200, marginTop: 10 }}
                                />
                              ) : (
                                <DateTimePicker
                                  value={selectedDate}
                                  mode="date"
                                  display="default"
                                  onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) {
                                      setSelectedDate(date);
                                    }
                                  }}
                                />
                              )}
                              
                              {Platform.OS === 'ios' && (
                                <TouchableOpacity
                                  style={[styles.modalButton, { backgroundColor: '#4A90E2', marginTop: 10 }]}
                                  onPress={() => setShowDatePicker(false)}
                                >
                                  <Text style={styles.modalButtonText}>Confirmar fecha</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                  
                  <Text style={styles.modalLabel}>Selecciona una franja horaria:</Text>
                  <ScrollView contentContainerStyle={styles.modalScrollViewContent} style={styles.modalScrollView}>
                    {timeSlots.map(slot => {
                      // Asegurarnos de que los IDs sean números para comparación consistente
                      const dayId = selectedDay ? parseInt(selectedDay.id, 10) : null;
                      const hourId = parseInt(slot.id, 10);
                      
                      // Obtener la fecha correspondiente al día seleccionado
                      const selectedDayWithDate = weekDaysWithDates.find(d => parseInt(d.id, 10) === dayId);
                      const currentDayDate = selectedDayWithDate?.date || null;
                      
                      // Verificar si estamos en modo de fecha específica
                      const isSpecificDateMode = selectedDate !== null;
                      
                      // Determinar la fecha a verificar
                      const dateToCheck = isSpecificDateMode && selectedDate ? selectedDate.toISOString().split('T')[0] : currentDayDate;
                      
                      // Verificar disponibilidad
                      const isAvailable = availabilitySettings[dayId]?.includes(hourId);
                      
                      // SOLUCIÓN DIRECTA: Verificar SOLO la fecha actual (no fechas adyacentes)
                      // Esto evita que los slots bloqueados aparezcan en múltiples días
                      let isBlockedSlot = false;
                      
                      // Verificar si el slot está bloqueado para esta fecha específica
                      if (dateToCheck && blockedSlotsByDate && blockedSlotsByDate[dateToCheck]) {
                        const blockedSlotsForDate = blockedSlotsByDate[dateToCheck];
                        
                        isBlockedSlot = blockedSlotsForDate.some(blockedSlot => {
                          const blockedHour = typeof blockedSlot.hour === 'string' ? parseInt(blockedSlot.hour, 10) : blockedSlot.hour;
                          return blockedHour === hourId;
                        });
                        
                        if (isBlockedSlot) {
                          console.log(`✅ Slot bloqueado encontrado en fecha ${dateToCheck}, hora=${hourId}`);
                        }
                      }
                      
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
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Configurar para fecha específica</Text>
                    <Switch
                      value={!!configSpecificDate}
                      onValueChange={(value) => {
                        if (value) {
                          setConfigSpecificDate(new Date());
                          setShowConfigDatePicker(true);
                        } else {
                          setConfigSpecificDate(null);
                          // Recargar la configuración general
                          loadAvailabilitySettings();
                        }
                      }}
                      trackColor={{ false: '#ccc', true: '#4A90E2' }}
                      thumbColor={configSpecificDate ? '#FFFFFF' : '#f4f3f4'}
                    />
                  </View>
                  
                  {configSpecificDate && (
                    <View style={styles.datePickerWrapper}>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowConfigDatePicker(true)}
                      >
                        <Text style={styles.datePickerButtonText}>
                          Configurar para: {configSpecificDate.toLocaleDateString()}
                        </Text>
                        <Ionicons name="calendar" size={20} color="#FFF" />
                      </TouchableOpacity>
                      
                      {showConfigDatePicker && (
                        <View>
                          {Platform.OS === 'ios' ? (
                            <DatePickerIOS
                              date={configSpecificDate}
                              onDateChange={setConfigSpecificDate}
                              mode="date"
                              style={{ height: 200, marginTop: 10 }}
                            />
                          ) : (
                            <DateTimePicker
                              value={configSpecificDate}
                              mode="date"
                              display="default"
                              onChange={(event, date) => {
                                setShowConfigDatePicker(false);
                                if (date) {
                                  setConfigSpecificDate(date);
                                }
                              }}
                            />
                          )}
                          
                          {Platform.OS === 'ios' && (
                            <TouchableOpacity
                              style={[styles.modalButton, { backgroundColor: '#4A90E2', marginTop: 10 }]}
                              onPress={() => setShowConfigDatePicker(false)}
                            >
                              <Text style={styles.modalButtonText}>Confirmar fecha</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                  
                  <Text style={styles.availabilityText}>
                    Configure los horarios disponibles para {configSpecificDate ? 'esta fecha' : 'este día'}:
                  </Text>
                  <View style={styles.timeSlotContainer}>
                    <ScrollView>
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
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>
            
            {modalMode === 'block' && !useSpecificDate && (
              <View style={[styles.switchContainer, {marginBottom: 0, marginTop: 0}]}>
                <Text style={styles.switchLabel}>¿Repetir semanalmente?</Text>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: '#ccc', true: '#4A90E2' }}
                  thumbColor={isRecurring ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>
            )}
            
            <View style={styles.modalFooter}>
              {modalMode === 'block' && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.blockButton]}
                  onPress={handleBlockSlot}
                >
                  <Text style={styles.modalButtonText}>Bloquear</Text>
                </TouchableOpacity>
              )}
              
              {modalMode === 'unblock' && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.unblockButton]}
                  onPress={executeUnblock}
                >
                  <Text style={styles.modalButtonText}>Desbloquear Horario</Text>
                </TouchableOpacity>
              )}
              
              {modalMode === 'availability' && (
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#FF3A5E' }]}
                  onPress={handleUpdateAvailability}
                >
                  <Text style={styles.modalButtonText}>
                    {configSpecificDate ? 'Guardar para fecha específica' : 'Guardar '}
                  </Text>
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

  const initializeDefaultAvailability = () => {
    // Inicializar la disponibilidad con valores predeterminados (todos los días, todas las horas disponibles)
    const defaultSettings = {};
    weekDays.forEach(day => {
      defaultSettings[day.id] = timeSlots.map(slot => slot.id);
    });
    setAvailabilitySettings(defaultSettings);
  };

  // Función para inicializar los días de la semana
  const initializeWeekDays = () => {
    // Obtener la fecha actual local sin componentes de tiempo
    const now = new Date();
    
    // Crear una fecha usando componentes locales para evitar problemas de zona horaria
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Formatear la fecha para depuración
    const localDateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // Mostrar información detallada para depuración
    console.log('🕒 FECHA ACTUAL LOCAL:');
    console.log(`Fecha local: ${localDateStr}`);
    console.log(`Día: ${today.getDate()}, Mes: ${today.getMonth() + 1}, Año: ${today.getFullYear()}`);
    console.log(`Zona horaria: GMT${-now.getTimezoneOffset() / 60}`);
    
    // Obtener el día de la semana actual (0 = domingo, 1 = lunes, ..., 6 = sábado)
    const currentDayOfWeek = today.getDay();
    console.log(`Día de la semana actual: ${currentDayOfWeek} (${getDayName(currentDayOfWeek)})`);
    
    // Crear array con los 7 días de la semana
    const days = [];
    
    // Calcular el inicio de la semana (lunes)
    const mondayOffset = currentDayOfWeek === 0 ? -6 : -(currentDayOfWeek - 1);
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const mondayStr = `${monday.getFullYear()}-${(monday.getMonth() + 1).toString().padStart(2, '0')}-${monday.getDate().toString().padStart(2, '0')}`;
    console.log(`Lunes de esta semana: ${mondayStr}`);
    
    // Generar los días de la semana con sus fechas correspondientes
    for (let i = 0; i < 7; i++) {
      // Crear una nueva fecha para cada día
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      // Formatear la fecha como YYYY-MM-DD (mismo formato que en la base de datos)
      const formattedYear = date.getFullYear();
      const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
      const formattedDay = date.getDate().toString().padStart(2, '0');
      const formattedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;
      
      // El ID del día es el índice del día en la semana (0=domingo, 1=lunes, ..., 6=sábado)
      const dayId = date.getDay();
      
      const dayObj = {
        id: dayId,
        name: getDayName(dayId),
        shortName: getDayName(dayId).substring(0, 3),
        date: formattedDate,
        dateObj: date,
        displayDate: `${formattedDay}/${formattedMonth}` // Formato DD/MM
      };
      
      days.push(dayObj);
      console.log(`Día ${i+1}: id=${dayObj.id}, nombre=${dayObj.name}, fecha=${dayObj.date}`);
    }
    
    return days;
  };

  
  // Función para depurar las fechas de los días de la semana
  const debugWeekDays = () => {
    console.log('🔍 DEPURACIÓN DE DÍAS DE LA SEMANA:');
    
    // Obtener la fecha actual LOCAL (sin conversión a UTC)
    const now = new Date();
    const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const formattedDate = `${localDate.getFullYear()}-${(localDate.getMonth() + 1).toString().padStart(2, '0')}-${localDate.getDate().toString().padStart(2, '0')}`;
    
    console.log('Fecha actual LOCAL:', formattedDate);
    console.log('Día de la semana:', getDayName(localDate.getDay()));
    
    weekDaysWithDates.forEach((day, index) => {
      console.log(`Día ${index + 1}: id=${day.id}, nombre=${day.name}, fecha=${day.date}`);
      
      // Verificar si hay slots bloqueados para esta fecha
      if (day.date && blockedSlotsByDate[day.date]) {
        console.log(`  ✅ Slots bloqueados para ${day.date}: ${blockedSlotsByDate[day.date].length}`);
      } else {
        console.log(`  ❌ No hay slots bloqueados para ${day.date}`);
      }
    });
  };


  




  // Función para forzar la actualización de fechas y slots bloqueados
  const forceUpdateDates = () => {
    console.log('🔄 Forzando actualización de fechas y slots bloqueados...');
    
    // Mostrar indicador de carga
    setLoading(true);
    
    // Inicializar los días de la semana con fechas actualizadas
    const updatedWeekDays = initializeWeekDays();
    setWeekDaysWithDates(updatedWeekDays);
    
    // Seleccionar el día actual
    const now = new Date();
    const todayDayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    const todayDay = updatedWeekDays.find(day => parseInt(day.id, 10) === todayDayOfWeek);
    
    if (todayDay) {
      setSelectedDay(todayDay);
      console.log(`Día seleccionado actualizado: ${todayDay.name} (${todayDay.date})`);
      
      // También actualizar la fecha seleccionada
      const [year, month, day] = todayDay.date.split('-').map(num => parseInt(num, 10));
      const dateObj = new Date(year, month - 1, day);
      setSelectedDate(dateObj);
    }
    
    // Recargar los slots bloqueados para asegurar que estén correctamente asignados
    loadBlockedSlots().then(() => {
      console.log('✅ Slots bloqueados actualizados correctamente');
      
      // Ejecutar depuración para verificar
      debugWeekDays();
      debugBlockedSlots();
      
      // Ocultar indicador de carga
      setLoading(false);
      
      // Forzar actualización de la UI
      setForceUpdate(prev => prev + 1);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Actualización Completada',
        'Las fechas y slots bloqueados han sido actualizados correctamente.',
        [{ text: 'OK' }]
      );
    }).catch(error => {
      console.error('Error al actualizar slots bloqueados:', error);
      setLoading(false);
      
      Alert.alert(
        'Error',
        'Ocurrió un error al actualizar los slots bloqueados. Por favor, inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    });
  };

  const handleUpdateAvailability = async () => {
    try {
      setIsLoading(true);
      
      // Obtener el ID del manager
      const managerId = getValidManagerId();
      if (!managerId) {
        Alert.alert('Error', 'No se pudo identificar el manager');
        setIsLoading(false);
        return;
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
        saveAvailabilityToStorage(availabilitySettings);
        
        // Cerrar el modal
        setModalVisible(false);
        
        // Mostrar mensaje de éxito
        Alert.alert('Éxito', 'Configuración guardada correctamente');
        
        // Forzar actualización de la UI
        setForceUpdate(prev => prev + 1);
      } else {
        console.error('Error al guardar configuración:', response.data);
        Alert.alert('Error', 'No se pudo guardar la configuración');
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración: ' + (error.message || 'Error desconocido'));
      setIsLoading(false);
    }
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

            </View>
          </View>
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
            <View style={styles.contentContainer}>
              <View style={styles.weekDaysContainer}>
                {weekDaysWithDates.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      selectedDay?.id === day.id && styles.selectedDayButton
                    ]}
                    onPress={() => handleDayPress(day)}
                  >
                    <Text style={[
                      styles.dayText,
                      selectedDay?.id === day.id && styles.selectedDayText
                    ]}>
                      {day.shortName}
                    </Text>
                    <Text style={styles.dayDate}>{day.name}</Text>
                    <Text style={styles.dayDate}>{day.displayDate}</Text>
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
                  {renderTimeSlots()}
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

export default SpaceSchedule;
