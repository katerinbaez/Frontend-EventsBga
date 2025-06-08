/**
 * Este archivo maneja el horario del espacio
 * - UI
 * - Espacios
 * - Horario
 * - Gestión
 * - Disponibilidad
 */

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


  const weekDays = [
    { id: 1, name: 'Lunes', shortName: 'Lun' },
    { id: 2, name: 'Martes', shortName: 'Mar' },
    { id: 3, name: 'Miércoles', shortName: 'Mié' },
    { id: 4, name: 'Jueves', shortName: 'Jue' },
    { id: 5, name: 'Viernes', shortName: 'Vie' },
    { id: 6, name: 'Sábado', shortName: 'Sáb' },
    { id: 0, name: 'Domingo', shortName: 'Dom' }
  ];

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
        
        const initialWeekDays = initializeWeekDays();
        setWeekDaysWithDates(initialWeekDays);
        console.log('Días de la semana inicializados correctamente');
        
        const now = new Date();
        const todayDayOfWeek = now.getDay();
        const todayDay = initialWeekDays.find(day => parseInt(day.id, 10) === todayDayOfWeek);
        
        if (todayDay) {
          setSelectedDay(todayDay);
          console.log(`Día seleccionado: ${todayDay.name} (${todayDay.date})`);
          
          const [year, month, day] = todayDay.date.split('-').map(num => parseInt(num, 10));
          const dateObj = new Date(year, month - 1, day);
          
          const handleDateChange = (date) => {
            console.log('Cambiando a fecha:', date.toLocaleDateString());
            setSelectedDate(date);
            
            const dayOfWeek = date.getDay();
            const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            setSelectedDay(adjustedDayOfWeek.toString());
            
            loadAvailabilitySettings(date);
            
            loadBlockedSlots(date);
            
            updateWeekDays(date);
          };
          
          const updateWeekDays = (date) => {
            const currentDay = date.getDay();
            
            const firstDayOfWeek = 1; 
            
            const mondayOffset = currentDay === 0 ? -6 : firstDayOfWeek - currentDay;
            const monday = new Date(date);
            monday.setDate(date.getDate() + mondayOffset);
            
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
        
        await loadAvailabilitySettings();
        
        await loadEvents();
        
        await loadBlockedSlots();
        
        setForceUpdate(prev => prev + 1);
        
        console.log('Datos iniciales cargados correctamente');
        setLoading(false);
        
        setTimeout(() => {
          debugWeekDays();
          debugBlockedSlots();
        }, 1000);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setLoading(false);
      }
    };
    
    loadInitialData();
    
    const syncInterval = setInterval(() => {
      console.log('🔄 Sincronización automática iniciada...');
      
      const updatedWeekDays = initializeWeekDays();
      setWeekDaysWithDates(updatedWeekDays);
      
      loadBlockedSlots().then(() => {
        console.log('✅ Sincronización automática completada');
        
        setForceUpdate(prev => prev + 1);
      }).catch(error => {
        console.error('Error en sincronización automática:', error);
      });
    }, 5 * 60 * 1000); 
    
    return () => {
      clearInterval(syncInterval);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (user && user.id) {
        try {
          await loadSpaceData();
          await loadEvents();
          await loadAvailabilitySettings();
          await loadBlockedSlots();
          
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
  
  useEffect(() => {
    if (blockedSlots.length > 0) {
      console.log(`🔍 Se han cargado ${blockedSlots.length} slots bloqueados`);
      debugBlockedSlots();
      
      console.log('Verificando que los slots bloqueados solo aparezcan en su fecha específica...');
      
      weekDaysWithDates.forEach(day => {
        if (day && day.date) {
          const slotsForDate = blockedSlotsByDate[day.date] || [];
          if (slotsForDate.length > 0) {
            console.log(`Día ${day.name} (${day.date}): ${slotsForDate.length} slots bloqueados`);
          }
        }
      });
    }
  }, [blockedSlots, blockedSlotsByDate, weekDaysWithDates]);

  useEffect(() => {
    if (configSpecificDate && !modalVisible && !isLoading) {
      const timer = setTimeout(() => {
        loadSpecificDateAvailability(configSpecificDate);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [configSpecificDate, modalVisible]);

  useEffect(() => {
    const forceInitialUpdate = setTimeout(() => {
      console.log('🔄 Forzando actualización inicial automática...');
      
      const updatedWeekDays = initializeWeekDays();
      setWeekDaysWithDates(updatedWeekDays);
      
      const now = new Date();
      const todayDayOfWeek = now.getDay();
      const todayDay = updatedWeekDays.find(day => parseInt(day.id, 10) === todayDayOfWeek);
      
      if (todayDay) {
        setSelectedDay(todayDay);
        console.log(`Día seleccionado actualizado: ${todayDay.name} (${todayDay.date})`);
        
        const [year, month, day] = todayDay.date.split('-').map(num => parseInt(num, 10));
        const dateObj = new Date(year, month - 1, day);
        setSelectedDate(dateObj);
      }
      
      loadBlockedSlots().then(() => {
        console.log('✅ Actualización inicial completada');
        
        setForceUpdate(prev => prev + 1);
      });
    }, 2000);
    
    return () => clearTimeout(forceInitialUpdate);
  }, []); 

  const getValidManagerId = () => {
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

  const saveAvailabilityToStorage = async (settings) => {
    try {
      const managerId = getValidManagerId();
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

  const saveBlockedSlotsToStorage = async (slots) => {
    try {
      const managerId = getValidManagerId();
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

      console.log(`Cargando datos del espacio cultural para manager ID: ${managerId}`);
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces/manager/${managerId}`);
      
      if (response.data && response.data.success && response.data.space) {
        console.log('Datos del espacio cultural cargados correctamente:', response.data.space);
        setSpaceData(response.data.space);
        return response.data.space;
      } else {
        console.log('No se encontró información del espacio cultural:', response.data);
        const defaultSpace = {
          nombreEspacio: 'Mi Espacio Cultural',
          id: managerId
        };
        setSpaceData(defaultSpace);
        return defaultSpace;
      }
    } catch (error) {
      console.log('Error al cargar información del espacio cultural:', error.message);
      const defaultSpace = {
        nombreEspacio: 'Mi Espacio Cultural',
        id: getValidManagerId()
      };
      setSpaceData(defaultSpace);
      return defaultSpace;
    } 
  };

  const loadEvents = async () => {
    setEvents([]);
    
    try {
      const spaceId = user.id;
      const response = await axios.get(`${BACKEND_URL}/api/events/space/${spaceId}`, {
        validateStatus: (status) => {
          return status < 500;
        }
      });
      
      if (response.data && response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
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
          
          if (!modalVisible) {
            Alert.alert(
              'Configuración no encontrada',
              `No hay configuración específica para ${date.toLocaleDateString()}. ¿Deseas crear una?`,
              [
                {
                  text: 'No',
                  style: 'cancel',
                  onPress: () => {
                    setUseSpecificDate(false);
                    setConfigSpecificDate(null);
                    loadAvailabilitySettings();
                  }
                },
                {
                  text: 'Sí, configurar',
                  onPress: () => {
                    setUseSpecificDate(true);
                    setConfigSpecificDate(new Date(date));
                    
                    setModalMode('availability');
                    setModalVisible(true);
                  }
                }
              ]
            );
          }
          return;
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
        
        setTimeout(() => {
          debugWeekDays();
          debugBlockedSlots();
        }, 500);
        
        return uniqueSlots;
      } catch (serverError) {
        console.error('Error al cargar slots bloqueados desde el servidor:', serverError);
      }
      
      try {
        const storedSlots = await AsyncStorage.getItem(`blockedSlots_${managerId}`);
        if (storedSlots) {
          const parsedSlots = JSON.parse(storedSlots);
          console.log(` Slots bloqueados cargados desde AsyncStorage: ${parsedSlots.length}`);
          
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
    
    const currentDate = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
    if (currentDate) {
      debugBlockedSlotsForDate(currentDate);
    }
  };
  
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
    
    setSelectedDay(day);
    
    if (day.date) {
      try {
        const [year, month, dayNum] = day.date.split('-').map(num => parseInt(num, 10));
        const dateObj = new Date(year, month - 1, dayNum);
        
        if (!isNaN(dateObj.getTime())) {
          console.log(`Fecha seleccionada: ${dateObj.toISOString()}`);
          
          setSelectedDate(dateObj);
          console.log(`Cargando disponibilidad para fecha específica: ${day.date}`);
          
          loadAvailabilitySettings(dateObj);
          
          loadBlockedSlots(dateObj);
        }
      } catch (error) {
        console.error(`Error al procesar fecha ${day.date}:`, error);
      }
    }
    
    setForceUpdate(prev => prev + 1);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    
    const slotIsBlocked = isSlotBlocked(slot.id, selectedDay);
    console.log(`Slot seleccionado: día=${selectedDay?.id}, hora=${slot.id}, bloqueado=${slotIsBlocked}`);
    
    const event = events.find(event => 
      new Date(event.fecha).getDay() === selectedDay?.id && 
      parseInt(event.horaInicio.split(':')[0]) === slot.id
    );
    
    if (slotIsBlocked) {
      console.log('Mostrando modal para desbloquear');
      setModalMode('unblock');
      setModalVisible(true);
      
    } else if (event) {
      console.log('Mostrando modal de información de evento');
      setModalMode('info');
      setModalVisible(true);
    } else {
      console.log('Mostrando modal para bloquear');
      setModalMode('block');
      setModalVisible(true);
    }
  };

  const isSlotBlocked = (hour, dayObj) => {
    if (!dayObj || !dayObj.date || !hour) {
      console.log(' Datos insuficientes para verificar slot bloqueado');
      return false;
    }

    const dayDate = dayObj.date;

    if (blockedSlotsByDate && blockedSlotsByDate[dayDate]) {
      const isBlocked = blockedSlotsByDate[dayDate].some(slot => {
        const slotHour = typeof slot.hour === 'string' ? parseInt(slot.hour, 10) : slot.hour;
        const hourToCheck = typeof hour === 'string' ? parseInt(hour, 10) : hour;

        const hourMatches = slotHour === hourToCheck;

        if (hourMatches) {
          console.log(` Slot bloqueado encontrado: fecha=${dayDate}, hora=${hour}`);
        }

        return hourMatches;
      });

      return isBlocked;
    }

    return false;
  };

  const renderTimeSlot = (slot, day) => {
    const hourId = parseInt(slot.id, 10);
    const dayId = parseInt(day.id, 10);
    
    const currentDayDate = day.date;
    
    let isBlockedSlot = false;
    
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
    
    const isAvailable = availabilitySettings[dayId]?.includes(hourId);
    
    const event = events.find(
      e => e.day === dayId && e.hour === hourId
    );
    
    const slotStyle = isBlockedSlot ? [
        styles.timeSlot,
        styles.blockedSlot,
        {
          backgroundColor: '#990000',
          borderColor: '#990000'
        }
      ] : [
        styles.timeSlot,
        isAvailable ? styles.availableSlot : styles.unavailableSlot,
        event && styles.eventSlot
      ];
    
    const textStyle = isBlockedSlot ? [styles.timeText, styles.blockedText] : [styles.timeText, isAvailable ? styles.availableText : styles.unavailableText];
    
    return (
      <TouchableOpacity
        key={`${dayId}-${hourId}`}
        style={slotStyle}
        onPress={() => {
          if (isBlockedSlot) {
            let blockedSlot = null;
            
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

  const getDayName = (dayId) => {
    const days = [
      'Domingo',  
      'Lunes',    
      'Martes',   
      'Miércoles',
      'Jueves',   
      'Viernes',  
      'Sábado'    
    ];
    
    const dayIdNum = typeof dayId === 'string' ? parseInt(dayId, 10) : dayId;
    
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
    
    const updatedSettings = { ...availabilitySettings };
    
    if (!updatedSettings[dayId]) {
      updatedSettings[dayId] = [];
    }
    
    if (isAvailable) {
      if (!updatedSettings[dayId].includes(slotId)) {
        updatedSettings[dayId].push(slotId);
      }
    } else {
      updatedSettings[dayId] = updatedSettings[dayId].filter(id => id !== slotId);
    }
    
    setAvailabilitySettings(updatedSettings);
    setForceUpdate(prev => prev + 1);
  };

  const handleResetBlockedSlots = async () => {
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
              const managerId = getValidManagerId();
              if (!managerId) {
                Alert.alert('Error', 'ID de manager inválido');
                return;
              }
              
              Alert.alert('Procesando', 'Restableciendo disponibilidad...');
              
              await AsyncStorage.removeItem(`blockedSlots_${managerId}`);
              
              try {
                const response = await axios.post(`${BACKEND_URL}/api/spaces/reset-configuration/${managerId}`);
                console.log('Respuesta del servidor al restablecer slots:', response.data);
              } catch (serverError) {
                console.error('Error al restablecer slots en el servidor:', serverError);
              }
              
              setBlockedSlots([]);
              
              Alert.alert(
                'Éxito',
                'Se ha restablecido la disponibilidad correctamente.',
                [{ text: 'OK' }]
              );
              
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
        
        const managerId = getValidManagerId();
        if (!managerId) {
          console.log('No se pudo cargar disponibilidad: ID de manager inválido');
          initializeDefaultAvailability();
          setIsLoading(false);
          return;
        }
        
        const key = `availability_${managerId}`;
        const storedSettings = await AsyncStorage.getItem(key);
        if (storedSettings) {
          setAvailabilitySettings(JSON.parse(storedSettings));
        } else {
          initializeDefaultAvailability();
        }
        
        let url = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`;
        
        let dateParam = '';
        if (configSpecificDate) {
          dateParam = configSpecificDate.toISOString().split('T')[0];
          url += `?date=${dateParam}`;
          console.log(`Cargando disponibilidad para fecha específica: ${dateParam}`);
        }
        
        console.log(`Intento ${attempt}/${retries}: Solicitando disponibilidad desde URL:`, url);
        
        const diasConfig = Object.keys(availabilitySettings).length;
        console.log(`Configurando ${diasConfig} días${configSpecificDate ? ` para fecha específica: ${configSpecificDate.toLocaleDateString()}` : ' (configuración general)'}`);
        
        const requestData = {
          availability: availabilitySettings
        };
        
        if (configSpecificDate) {
          requestData.date = configSpecificDate.toISOString().split('T')[0];
          console.log(`Configurando disponibilidad para fecha específica: ${requestData.date}`);
        } else {
          console.log('Configurando disponibilidad general (sin fecha específica)');
        }
        
        console.log('Enviando datos al servidor:', JSON.stringify(requestData));
        const response = await axios.get(url, { timeout: 10000 }); 
        
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
          
          if (Object.keys(response.data.availability).length > 0) {
            setAvailabilitySettings(response.data.availability);
            saveAvailabilityToStorage(response.data.availability);
            
            if (configSpecificDate && !isConfiguringSpecificDate) {
              if (response.data.isSpecificDate) {
                console.log('Usando configuración específica para la fecha seleccionada');
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
                          const currentConfig = {...availabilitySettings};
                          setAvailabilitySettings(currentConfig);
                          
                          setIsLoading(false);
                          
                          const dateToUse = new Date(configSpecificDate);
                          
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
                        setUseSpecificDate(false);
                        setConfigSpecificDate(null);
                        loadAvailabilitySettings();
                      }
                    },
                    {
                      text: 'Sí, configurar',
                      onPress: () => {
                        setUseSpecificDate(true);
                        setConfigSpecificDate(date);
                        
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
          
          return;
        } else {
          console.log('Error en la respuesta:', response.data);
          if (attempt === retries) {
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
        
        if (attempt === retries) {
          console.log('Detalles del error:', error.response ? error.response.data : 'No hay detalles adicionales');
          
          initializeDefaultAvailability();
          
          console.log('Error al cargar disponibilidad, usando configuración por defecto');
        } else {
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
      
      if ((day === undefined || hour === undefined) && !blockedSlot) {
        console.error('Valores faltantes para desbloquear slot:', { day, hour, blockedSlot });
        Alert.alert('Error', 'Información incompleta para desbloquear el horario');
        setIsLoading(false);
        return;
      }
      
      console.log(`Intentando desbloquear slot:`, { day, hour, blockedSlotId: blockedSlot?.id });
      
      let response;
      
      if (blockedSlot && blockedSlot.id) {
        console.log(`Desbloqueando por ID: ${blockedSlot.id}`);
        response = await axios.post(`${BACKEND_URL}/api/spaces/unblock-slot-by-id/${blockedSlot.id}`);
      } else {
        const dayNum = typeof day === 'string' ? parseInt(day, 10) : day;
        const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
        
        if (isNaN(dayNum) || isNaN(hourNum)) {
          console.error('Valores inválidos para desbloquear slot:', { day, hour, dayNum, hourNum });
          Alert.alert('Error', 'Valores inválidos para desbloquear el horario');
          setIsLoading(false);
          return;
        }
        
        console.log(`Desbloqueando por día/hora: ${dayNum}/${hourNum}`);
        
        const requestData = {
          day: dayNum,
          hour: hourNum
        };
        
        if (selectedDate) {
          requestData.date = selectedDate.toISOString().split('T')[0];
        } else if (configSpecificDate) {
          requestData.date = configSpecificDate.toISOString().split('T')[0];
        }
        
        console.log('Datos de desbloqueo:', JSON.stringify(requestData));
        
        const url = `${BACKEND_URL}/api/spaces/unblock-slot/${managerId}`;
        console.log('URL de desbloqueo:', url);
        
        response = await axios.post(url, requestData);
      }
      
      setIsLoading(false);
      
      if (response.data && response.data.success) {
        if (blockedSlot && blockedSlot.id) {
          setBlockedSlots(prevSlots => prevSlots.filter(slot => slot.id !== blockedSlot.id));
        } else {
          const dayNum = typeof day === 'string' ? parseInt(day, 10) : day;
          const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
          
          setBlockedSlots(prevSlots => {
            return prevSlots.filter(slot => {
              if (selectedDate || configSpecificDate) {
                const dateToCheck = selectedDate ? selectedDate : configSpecificDate;
                const dateStr = dateToCheck.toISOString().split('T')[0];
                return !(slot.day === dayNum && slot.hour === hourNum && slot.date === dateStr);
              }
              return !(slot.day === dayNum && slot.hour === hourNum);
            });
          });
        }
        
        Alert.alert('Éxito', 'Horario desbloqueado correctamente');
        
        loadBlockedSlots();
        
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'No se pudo desbloquear el horario: ' + (response.data?.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al desbloquear slot:', error);
      console.error('Detalles del error:', error.response ? error.response.data : 'No hay detalles adicionales');
      console.error('Código de estado:', error.response ? error.response.status : 'Desconocido');
      
      setIsLoading(false);
      
      let errorMessage = 'Error al desbloquear el horario';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Datos inválidos para desbloquear el horario. Verifica que los valores sean correctos.';
        } else if (error.response.status === 404) {
          errorMessage = 'No se encontró el slot para desbloquear.';
        } else if (error.response.status === 500) {
          errorMessage = 'Error interno del servidor al desbloquear el horario.';
        }
        
        if (error.response.data && error.response.data.message) {
          errorMessage += ` Mensaje del servidor: ${error.response.data.message}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const showUnblockModal = (day, slot, blockedSlot = null) => {
    setSelectedDay(day);
    setSelectedTimeSlot(slot);
    
    setModalMode('unblock');
    setModalVisible(true);
    
    setSelectedBlockedSlot(blockedSlot);
  };

  const executeUnblock = () => {
    if (!selectedDay || !selectedTimeSlot) {
      Alert.alert('Error', 'Debes seleccionar un día y una hora');
      return;
    }
    
    handleUnblockSlot(selectedDay.id, selectedTimeSlot.id, selectedBlockedSlot);
  };

  const handleBlockSlot = async () => {
    try {
      if (!selectedTimeSlot) {
        return;
      }
      
      setIsLoading(true);
      
      const managerId = getValidManagerId();
      if (!managerId) {
        Alert.alert('Error', 'No se pudo identificar el manager');
        setIsLoading(false);
        return;
      }
      
      const dayId = selectedDay ? parseInt(selectedDay.id, 10) : null;
      const hourId = selectedTimeSlot ? parseInt(selectedTimeSlot.id, 10) : null;
      
      if (dayId === null || hourId === null) {
        Alert.alert('Error', 'Día u hora no seleccionados');
        setIsLoading(false);
        return;
      }
      
      let dateToUse = null;
      let dateStrToUse = null;
      
      if (useSpecificDate && selectedDate) {
        try {
          dateToUse = selectedDate;
          dateStrToUse = selectedDate.toISOString().split('T')[0];
          console.log(`Usando fecha específica: ${dateStrToUse}`);
        } catch (error) {
          console.error('Error al procesar fecha específica:', error);
          Alert.alert('Error', 'Formato de fecha incorrecto');
          setIsLoading(false);
          return;
        }
      } else {
        const selectedDayWithDate = weekDaysWithDates.find(day => parseInt(day.id, 10) === dayId);
        if (selectedDayWithDate && selectedDayWithDate.date) {
          dateStrToUse = selectedDayWithDate.date;
          console.log(`Usando fecha del día seleccionado (sin modificar): ${dateStrToUse}`);
          
          try {
            const [year, month, day] = dateStrToUse.split('-').map(num => parseInt(num, 10));
            dateToUse = new Date(year, month - 1, day);
            console.log(`Fecha creada: ${dateToUse.toISOString()}`);
          } catch (error) {
            console.error(`Error al crear objeto Date con ${dateStrToUse}:`, error);
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
      
      const blockedSlot = {
        managerId,
        hour: hourId,
        day: dayId,
        dayName: getDayName(dayId),
        date: dateStrToUse,
        isRecurring: isRecurring
      };
      
      console.log(`Bloqueando slot: día=${dayId}, hora=${hourId}, fecha=${dateStrToUse}`);
      
      const response = await axios.post(`${BACKEND_URL}/api/spaces/block-slot/${managerId}`, blockedSlot);
      console.log(`Respuesta del servidor: ${response.data}`);
      if (response.status === 201 || response.status === 200) {
        console.log('Slot bloqueado exitosamente');
        
        const newBlockedSlot = response.data;
        
        const updatedSlot = {
          ...newBlockedSlot,
          date: dateStrToUse,
          day: dayId,
          hour: hourId,
          dayName: getDayName(dayId)
        };
        
        setBlockedSlots(prev => {
          const newSlots = [...prev, updatedSlot];
          console.log(`✅ Slots bloqueados actualizados: ${newSlots.length} slots`);
          return newSlots;
        });
        
        setBlockedSlotsByDate(prev => {
          const newMap = { ...prev };
          if (!newMap[dateStrToUse]) {
            newMap[dateStrToUse] = [];
          }
          
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
        
        setForceUpdate(prev => prev + 1);
        
        setModalVisible(false);
        
        setIsLoading(false);
        
        Alert.alert('Éxito', 'Horario bloqueado correctamente');
        
        setTimeout(() => {
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
      setShowConfigDatePicker(false);
      setConfigSpecificDate(date);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      setShowConfigDatePicker(false);
      setConfigSpecificDate(date);
    }
  };

  const openAvailabilityModal = (date = null) => {
    if (date) {
      setConfigSpecificDate(date);
    }
    
    setModalMode('availability');
    
    setModalVisible(true);
  };

  const loadSpecificDateAvailability = (date) => {
    if (!date) return;
    
    if (isLoading) return;
    
    console.log(`Cargando disponibilidad para fecha específica: ${date.toLocaleDateString()}`);
    
    const managerId = getValidManagerId();
    if (!managerId) return;
    
    setIsLoading(true);
    
    axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}`)
      .then(generalResponse => {
        if (generalResponse.data && generalResponse.data.success) {
          const generalSettings = generalResponse.data.availability;
          console.log('Configuración general cargada como base:', generalSettings);
          
          const dateString = date.toISOString().split('T')[0];
          axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${dateString}`)
            .then(specificResponse => {
              setIsLoading(false);
              
              if (specificResponse.data && specificResponse.data.success) {
                const specificSettings = specificResponse.data.availability;
                
                if (Object.keys(specificSettings).length > 0) {
                  console.log('Configuración específica encontrada:', specificSettings);
                  
                  const combinedSettings = { ...generalSettings };
                  
                  for (const day in specificSettings) {
                    combinedSettings[day] = specificSettings[day];
                  }
                  
                  setAvailabilitySettings(combinedSettings);
                  console.log('Configuración combinada:', combinedSettings);
                } else if (specificResponse.data.canCreateConfig) {
                  setAvailabilitySettings(generalSettings);
                  console.log('No hay configuración específica, usando general como base');
                  
                  if (!modalVisible) {
                    Alert.alert(
                      'Configuración no encontrada',
                      `No hay configuración específica para ${date.toLocaleDateString()}. ¿Deseas crear una?`,
                      [
                        {
                          text: 'No',
                          style: 'cancel',
                          onPress: () => {
                            setUseSpecificDate(false);
                            setConfigSpecificDate(null);
                            loadAvailabilitySettings();
                          }
                        },
                        {
                          text: 'Sí, configurar',
                          onPress: () => {
                            setUseSpecificDate(true);
                            setConfigSpecificDate(date);
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
    const currentDay = today.getDay(); 
    const result = [];
    
    const firstDayOfWeek = 1; 
    
    const mondayOffset = currentDay === 0 ? -6 : firstDayOfWeek - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      result.push(date);
    }
    
    return result;
  };

  const weekDates = useMemo(() => getCurrentWeekDates(), []);

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
  
  useEffect(() => {
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
                      const dayId = selectedDay ? parseInt(selectedDay.id, 10) : null;
                      const hourId = parseInt(slot.id, 10);
                      
                      const selectedDayWithDate = weekDaysWithDates.find(d => parseInt(d.id, 10) === dayId);
                      const currentDayDate = selectedDayWithDate?.date || null;
                      
                      const isSpecificDateMode = selectedDate !== null;
                      
                      const dateToCheck = isSpecificDateMode && selectedDate ? selectedDate.toISOString().split('T')[0] : currentDayDate;
                      
                      const isAvailable = availabilitySettings[dayId]?.includes(hourId);
                      
                      let isBlockedSlot = false;
                      
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
                      
                      if (modalMode === 'unblock' && !isBlockedSlot) return null;
                      
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
    const defaultSettings = {};
    weekDays.forEach(day => {
      defaultSettings[day.id] = timeSlots.map(slot => slot.id);
    });
    setAvailabilitySettings(defaultSettings);
  };

  const initializeWeekDays = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const localDateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    console.log('🕒 FECHA ACTUAL LOCAL:');
    console.log(`Fecha local: ${localDateStr}`);
    console.log(`Día: ${today.getDate()}, Mes: ${today.getMonth() + 1}, Año: ${today.getFullYear()}`);
    console.log(`Zona horaria: GMT${-now.getTimezoneOffset() / 60}`);
    
    const currentDayOfWeek = today.getDay();
    console.log(`Día de la semana actual: ${currentDayOfWeek} (${getDayName(currentDayOfWeek)})`);
    
    const days = [];
    
    const mondayOffset = currentDayOfWeek === 0 ? -6 : -(currentDayOfWeek - 1);
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const mondayStr = `${monday.getFullYear()}-${(monday.getMonth() + 1).toString().padStart(2, '0')}-${monday.getDate().toString().padStart(2, '0')}`;
    console.log(`Lunes de esta semana: ${mondayStr}`);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const formattedYear = date.getFullYear();
      const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
      const formattedDay = date.getDate().toString().padStart(2, '0');
      const formattedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;
      
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

  
  const debugWeekDays = () => {
    console.log('🔍 DEPURACIÓN DE DÍAS DE LA SEMANA:');
    
    const now = new Date();
    const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const formattedDate = `${localDate.getFullYear()}-${(localDate.getMonth() + 1).toString().padStart(2, '0')}-${localDate.getDate().toString().padStart(2, '0')}`;
    
    console.log('Fecha actual LOCAL:', formattedDate);
    console.log('Día de la semana:', getDayName(localDate.getDay()));
    
    weekDaysWithDates.forEach((day, index) => {
      console.log(`Día ${index + 1}: id=${day.id}, nombre=${day.name}, fecha=${day.date}`);
      
      if (day.date && blockedSlotsByDate[day.date]) {
        console.log(`  ✅ Slots bloqueados para ${day.date}: ${blockedSlotsByDate[day.date].length}`);
      } else {
        console.log(`  ❌ No hay slots bloqueados para ${day.date}`);
      }
    });
  };

  const forceUpdateDates = () => {
    console.log('🔄 Forzando actualización de fechas y slots bloqueados...');
    
    setLoading(true);
    
    const updatedWeekDays = initializeWeekDays();
    setWeekDaysWithDates(updatedWeekDays);
    
    const now = new Date();
    const todayDayOfWeek = now.getDay();
    const todayDay = updatedWeekDays.find(day => parseInt(day.id, 10) === todayDayOfWeek);
    
    if (todayDay) {
      setSelectedDay(todayDay);
      console.log(`Día seleccionado actualizado: ${todayDay.name} (${todayDay.date})`);
      
      const [year, month, day] = todayDay.date.split('-').map(num => parseInt(num, 10));
      const dateObj = new Date(year, month - 1, day);
      setSelectedDate(dateObj);
    }
    
    loadBlockedSlots().then(() => {
      console.log('✅ Slots bloqueados actualizados correctamente');
      
      debugWeekDays();
      debugBlockedSlots();
      
      setLoading(false);
      
      setForceUpdate(prev => prev + 1);
      
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
      
      const managerId = getValidManagerId();
      if (!managerId) {
        Alert.alert('Error', 'No se pudo identificar el manager');
        setIsLoading(false);
        return;
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
        
        saveAvailabilityToStorage(availabilitySettings);
        
        setModalVisible(false);
        
        Alert.alert('Éxito', 'Configuración guardada correctamente');
        
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
