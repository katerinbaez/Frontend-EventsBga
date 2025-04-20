import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppState } from 'react-native';

const SpaceAvailabilityManager = ({ onClose, selectMode = false, onSelectTimeSlot = null }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState([]);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allBlockedSlots, setAllBlockedSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [events, setEvents] = useState([]);
  const [showBlockedSlots, setShowBlockedSlots] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  const [isResetting, setIsResetting] = useState(false);

  const weekDays = [
    { id: 0, name: 'Domingo', shortName: 'Dom' },
    { id: 1, name: 'Lunes', shortName: 'Lun' },
    { id: 2, name: 'Martes', shortName: 'Mar' },
    { id: 3, name: 'Miércoles', shortName: 'Mié' },
    { id: 4, name: 'Jueves', shortName: 'Jue' },
    { id: 5, name: 'Viernes', shortName: 'Vie' },
    { id: 6, name: 'Sábado', shortName: 'Sáb' }
  ];

  const timeSlots = Array.from({ length: 18 }, (_, index) => {
    const hour = index + 6; 
    return {
      id: hour,
      hour: hour > 12 ? hour - 12 : hour,
      period: hour >= 12 ? 'PM' : 'AM',
      formatted: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
    };
  });

  useEffect(() => {
    loadSpaces();
    
    // Configurar un intervalo para actualizar los datos cada 5 segundos
    const intervalId = setInterval(() => {
      if (selectedSpace && selectedSpace._id) {
        loadAllBlockedSlots();
        loadBlockedSlotsDetailed();
      }
    }, 5000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (selectedSpace && selectedSpace._id) {
      // Cargar datos iniciales
      console.log('Espacio seleccionado, cargando datos iniciales...');
      loadAllBlockedSlots();
      loadBlockedSlotsDetailed(); // Cargar franjas bloqueadas detalladas inmediatamente
      loadEvents();
      
      // Configurar intervalo para recargar datos cada 5 segundos
      const intervalId = setInterval(() => {
        console.log('Recargando datos automáticamente...');
        loadAllBlockedSlots();
        loadBlockedSlotsDetailed(); // Recargar también las franjas bloqueadas detalladas
      }, 5000);
      
      // Limpiar intervalo al desmontar
      return () => clearInterval(intervalId);
    }
  }, [selectedSpace]);

  // Efecto para cargar los slots bloqueados cuando cambia la fecha o el espacio seleccionado
  useEffect(() => {
    if (selectedSpace && selectedSpace._id) {
      loadAllBlockedSlots();
    }
  }, [selectedDate, selectedSpace]);

  // Efecto para actualizar periódicamente los slots bloqueados
  useEffect(() => {
    // Cargar los slots bloqueados inicialmente
    if (selectedSpace && selectedSpace._id) {
      loadAllBlockedSlots();
      // Cargar también las franjas bloqueadas detalladas al inicio
      loadBlockedSlotsDetailed();
    }
    
    // Configurar un intervalo para actualizar los slots bloqueados cada 5 segundos
    const intervalId = setInterval(() => {
      if (selectedSpace && selectedSpace._id) {
        loadAllBlockedSlots();
      }
    }, 5000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [selectedSpace]);
  
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && selectedSpace && selectedSpace._id) {
        console.log('App volvió a estar activa, recargando datos...');
        loadAllBlockedSlots(); 
        loadEvents();
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [selectedSpace]);

  const loadSpaces = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
      if (Array.isArray(response.data)) {
        setSpaces(response.data);
        if (response.data.length > 0) {
          setSelectedSpace(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error al cargar espacios culturales:', error);
      Alert.alert('Error', 'No se pudieron cargar los espacios culturales');

      const demoSpaces = [
        { _id: 'space1', nombre: 'Teatro Corfescu', direccion: 'Calle 33 #23-45, Bucaramanga', horarioApertura: '08:00', horarioCierre: '22:00' },
        { _id: 'space2', nombre: 'Centro Cultural del Oriente', direccion: 'Carrera 19 #31-65, Bucaramanga', horarioApertura: '09:00', horarioCierre: '20:00' }
      ];
      setSpaces(demoSpaces);
      setSelectedSpace(demoSpaces[0]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar los slots bloqueados en AsyncStorage
  const saveBlockedSlotsToStorage = async (slots) => {
    try {
      if (!selectedSpace || !selectedSpace._id) return;
      
      const managerId = selectedSpace.userId || String(selectedSpace._id);
      const key = `blockedSlots_${managerId}`;
      
      await AsyncStorage.setItem(key, JSON.stringify(slots));
      console.log('Slots bloqueados guardados en AsyncStorage');
    } catch (error) {
      console.error('Error al guardar slots bloqueados en AsyncStorage:', error);
    }
  };

  // Función para cargar los slots bloqueados desde AsyncStorage
  const loadBlockedSlotsFromStorage = async () => {
    try {
      if (!selectedSpace || !selectedSpace._id) return null;
      
      const managerId = selectedSpace.userId || String(selectedSpace._id);
      const key = `blockedSlots_${managerId}`;
      
      const storedData = await AsyncStorage.getItem(key);
      if (storedData) {
        const slots = JSON.parse(storedData);
        console.log(`Cargados ${slots.length} slots bloqueados desde AsyncStorage`);
        return slots;
      }
      return null;
    } catch (error) {
      console.error('Error al cargar slots bloqueados desde AsyncStorage:', error);
      return null;
    }
  };

  const loadAllBlockedSlots = async () => {
    try {
      setIsLoading(true);
      if (!selectedSpace || !selectedSpace._id) {
        console.error('Error: No hay espacio seleccionado o ID inválido');
        setAllBlockedSlots([]);
        return;
      }
      
      // Usar el ID de usuario del manager, no el ID del espacio
      const managerId = selectedSpace.userId || String(selectedSpace._id);
      console.log(`Cargando slots bloqueados para manager ${managerId}`);
      
      // Intentar obtener slots bloqueados de la ruta /api/spaces/ con timestamp para evitar caché
      const timestamp = new Date().getTime();
      try {
        console.log(`Haciendo petición a: ${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?t=${timestamp}`);
        const spacesResponse = await axios.get(`${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?t=${timestamp}`);
        console.log('Respuesta recibida:', spacesResponse.data);
        
        if (spacesResponse.data && spacesResponse.data.blockedSlots) {
          console.log(`Recibidos ${spacesResponse.data.blockedSlots.length} slots de spaces`);
          
          // Formatear los slots bloqueados
          const formattedSlots = spacesResponse.data.blockedSlots.map(slot => {
            const formattedSlot = {
              id: slot.id || Math.random().toString(),
              hour: typeof slot.hour === 'string' ? parseInt(slot.hour) : slot.hour,
              date: new Date().toISOString().split('T')[0], // Usar la fecha actual para todos los slots
              day: new Date().getDay(), // Usar el día actual para todos los slots
              isRecurring: slot.isRecurring || false
            };
            console.log('Slot formateado:', formattedSlot);
            return formattedSlot;
          });
          
          console.log('Total de slots formateados:', formattedSlots.length);
          
          // Guardar en el estado
          setAllBlockedSlots(formattedSlots);
          
          // Guardar en AsyncStorage para persistencia
          await saveBlockedSlotsToStorage(formattedSlots);
          
          // Usar todos los slots sin filtrar por fecha
          console.log('Mostrando todas las franjas bloqueadas');
          
          // Actualizar el estado con todos los slots
          setBlockedSlots(formattedSlots);
          
          // Forzar actualización de la UI
          setRefreshKey(prevKey => prevKey + 1);
        } else {
          console.log('No se encontraron slots bloqueados en la respuesta');
          
          // Intentar cargar desde AsyncStorage como respaldo
          const storedSlots = await loadBlockedSlotsFromStorage();
          if (storedSlots && storedSlots.length > 0) {
            console.log(`Cargados ${storedSlots.length} slots desde AsyncStorage`);
            setAllBlockedSlots(storedSlots);
            setBlockedSlots(storedSlots);
            setRefreshKey(prevKey => prevKey + 1);
          } else {
            setAllBlockedSlots([]);
            setBlockedSlots([]);
          }
        }
      } catch (error) {
        console.error('Error al obtener slots bloqueados:', error);
        
        // Intentar cargar desde AsyncStorage como respaldo
        const storedSlots = await loadBlockedSlotsFromStorage();
        if (storedSlots && storedSlots.length > 0) {
          console.log(`Cargados ${storedSlots.length} slots desde AsyncStorage`);
          setAllBlockedSlots(storedSlots);
          setBlockedSlots(storedSlots);
          setRefreshKey(prevKey => prevKey + 1);
        } else {
          setAllBlockedSlots([]);
          setBlockedSlots([]);
        }
      }
      
      // Cargar también las franjas bloqueadas detalladas
      loadBlockedSlotsDetailed();
      
    } catch (error) {
      console.error('Error al cargar todos los slots bloqueados:', error);
      
      // Intentar cargar desde AsyncStorage como último recurso
      try {
        const storedSlots = await loadBlockedSlotsFromStorage();
        if (storedSlots && storedSlots.length > 0) {
          console.log(`Cargados ${storedSlots.length} slots desde AsyncStorage (recuperación de error)`);
          setAllBlockedSlots(storedSlots);
          setBlockedSlots(storedSlots);
          setRefreshKey(prevKey => prevKey + 1);
        } else {
          setAllBlockedSlots([]);
          setBlockedSlots([]);
        }
      } catch (storageError) {
        console.error('Error al cargar desde AsyncStorage:', storageError);
        setAllBlockedSlots([]);
        setBlockedSlots([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar los slots bloqueados cuando cambia la fecha
  const updateBlockedSlotsForSelectedDate = useCallback(() => {
    if (!allBlockedSlots || allBlockedSlots.length === 0) {
      setBlockedSlots([]);
      return;
    }
    
    console.log(`Actualizando slots bloqueados para todas las fechas`);
    console.log(`Total de slots disponibles: ${allBlockedSlots.length}`);
    
    // Simplemente usar todos los slots sin filtrar por fecha
    // Esto asegura que las franjas bloqueadas se muestren en todas las fechas
    setBlockedSlots(allBlockedSlots);
    
    // Forzar actualización de la UI
    setRefreshKey(prevKey => prevKey + 1);
  }, [allBlockedSlots]);

  // Efecto para actualizar los slots bloqueados cuando cambia la fecha o todos los slots
  useEffect(() => {
    updateBlockedSlotsForSelectedDate();
  }, [selectedDate, allBlockedSlots, updateBlockedSlotsForSelectedDate]);

  const filterBlockedSlotsForSelectedDate = (slotsToFilter = null) => {
    // Usar los slots proporcionados o los del estado
    const slots = slotsToFilter || allBlockedSlots;
    
    if (slots.length === 0) {
      console.log('No hay slots para mostrar');
      setBlockedSlots([]);
      return;
    }
    
    console.log(`Mostrando todos los slots bloqueados sin filtrar por fecha`);
    console.log(`Total de slots disponibles: ${slots.length}`);
    
    // Simplemente usar todos los slots sin filtrar
    setBlockedSlots(slots);
    
    // Forzar actualización de la UI
    setRefreshKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    if (selectedDate && allBlockedSlots.length > 0) {
      console.log('Fecha o slots cambiados, filtrando slots...');
      filterBlockedSlotsForSelectedDate(allBlockedSlots);
    }
  }, [selectedDate, allBlockedSlots, refreshKey]);

  const loadEvents = async () => {
    try {
      if (!selectedSpace || !selectedSpace._id) {
        console.error('Error: No hay espacio seleccionado o ID inválido');
        setEvents([]);
        return;
      }

      const formattedDate = selectedDate.toISOString().split('T')[0];
      const spaceId = String(selectedSpace._id);
      const response = await axios.get(`${BACKEND_URL}/api/spaces/events/${spaceId}?date=${formattedDate}`);
      
      if (response.data && response.data.events) {
        setEvents(response.data.events);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setEvents([]);
    }
  };

  const loadAvailability = async () => {
    setIsLoading(true);
    try {
      if (!selectedSpace || !selectedSpace._id) {
        console.error('Error: No hay espacio seleccionado o ID inválido');
        const demoAvailability = generateDemoAvailability();
        setAvailabilityData(demoAvailability);
        setIsLoading(false);
        return;
      }

      const dayOfWeek = selectedDate.getDay(); 
      const spaceId = String(selectedSpace._id);
      const response = await axios.get(`${BACKEND_URL}/api/spaces/availability/${spaceId}?day=${dayOfWeek}`);
      
      if (response.data && response.data.availability) {
        setAvailabilityData(response.data.availability);
      } else {
        const defaultAvailability = timeSlots.map(slot => ({
          hour: slot.id,
          isAvailable: true
        }));
        setAvailabilityData(defaultAvailability);
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);

      const demoAvailability = generateDemoAvailability();
      setAvailabilityData(demoAvailability);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoAvailability = () => {
    const openingHour = parseInt(selectedSpace.horarioApertura?.split(':')[0]) || 8;
    const closingHour = parseInt(selectedSpace.horarioCierre?.split(':')[0]) || 20;

    const availableSlots = [];
    const totalSlots = closingHour - openingHour;
    const occupiedCount = Math.floor(totalSlots * 0.3);

    const occupiedSlots = new Set();
    while (occupiedSlots.size < occupiedCount) {
      const randomHour = Math.floor(Math.random() * totalSlots) + openingHour;
      occupiedSlots.add(randomHour);
    }

    for (let hour = openingHour; hour < closingHour; hour++) {
      availableSlots.push({
        hour,
        isAvailable: !occupiedSlots.has(hour),
        event: occupiedSlots.has(hour) ? {
          _id: `demo-${hour}`,
          titulo: 'Evento Programado',
          artista: { nombreArtistico: 'Artista Demo' }
        } : null
      });
    }

    return availableSlots;
  };

  const handleTimeSlotPress = (item) => {
    if (!selectedSpace || !selectedSpace._id) {
      Alert.alert(
        "Error",
        "No hay un espacio cultural seleccionado válido.",
        [{ text: "Entendido" }]
      );
      return;
    }

    const openingHour = parseInt(selectedSpace.horarioApertura?.split(':')[0]) || 8;
    const closingHour = parseInt(selectedSpace.horarioCierre?.split(':')[0]) || 20;
    const isOperatingHour = item.id >= openingHour && item.id < closingHour;
    
    // Verificar disponibilidad configurada por el gestor
    const isConfiguredAsAvailable = availabilityData.some(slot => 
      slot.hour === item.id && slot.isAvailable
    );
    
    // Verificar si está bloqueado usando la función auxiliar
    const isBlocked = checkIfBlocked(item.id);
    
    // Verificar si hay un evento
    const hasEvent = events.some(event => {
      const eventHour = parseInt(event.horaInicio.split(':')[0]);
      return eventHour === item.id;
    });

    if (isBlocked) {
      Alert.alert(
        "Desbloquear Horario",
        `¿Deseas desbloquear el horario de las ${item.formatted}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Desbloquear", onPress: () => toggleAvailability(item.id) }
        ]
      );
    } else {
      Alert.alert(
        "Bloquear Horario",
        `¿Deseas bloquear el horario de las ${item.formatted}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Bloquear", onPress: () => toggleAvailability(item.id) }
        ]
      );
    }
  };

  const toggleAvailability = async (hour) => {
    try {
      setIsLoading(true); 
      
      if (!selectedSpace || !selectedSpace._id) {
        Alert.alert(
          "Error",
          "No hay un espacio cultural seleccionado válido.",
          [{ text: "Entendido" }]
        );
        setIsLoading(false);
        return;
      }

      const formattedDate = selectedDate.toISOString().split('T')[0];
      const managerId = selectedSpace.userId || String(selectedSpace._id);
      
      // Determinar si el slot está bloqueado
      const isBlocked = checkIfBlocked(hour);
      
      if (isBlocked) {
        // DESBLOQUEAR SLOT
        console.log(`Intentando desbloquear slot: hora=${hour}, fecha=${formattedDate}, managerId=${managerId}`);
        
        // Actualizar inmediatamente el estado local para mostrar la franja como desbloqueada
        // Esto proporciona feedback visual inmediato al usuario
        const updatedBlockedSlots = allBlockedSlots.filter(slot => {
          const slotHour = typeof slot.hour === 'number' ? slot.hour : parseInt(slot.hour);
          return slotHour !== hour;
        });
        
        // Actualizar ambos estados
        setAllBlockedSlots(updatedBlockedSlots);
        setBlockedSlots(updatedBlockedSlots);
        
        // Guardar en AsyncStorage para persistencia
        await saveBlockedSlotsToStorage(updatedBlockedSlots);
        
        // Forzar actualización de la UI
        setRefreshKey(prevKey => prevKey + 1);
        
        const response = await axios.post(`${BACKEND_URL}/api/spaces/unblock-slot/${managerId}`, {
          date: formattedDate,
          hour: parseInt(hour)
        });
        
        if (response.data && response.data.success) {
          console.log('Slot desbloqueado correctamente');
          // Actualizar la UI desde el servidor para confirmar
          loadBlockedSlotsDetailed();
          loadAllBlockedSlots();
        } else {
          console.error('Error al desbloquear slot:', response.data?.message || 'Error desconocido');
          Alert.alert("Error", `No se pudo desbloquear el horario: ${response.data?.message || 'Error desconocido'}`);
          
          // Revertir cambios locales si hubo error
          loadAllBlockedSlots();
        }
      } else {
        // BLOQUEAR SLOT
        console.log(`Intentando bloquear slot: hora=${hour}, fecha=${formattedDate}, managerId=${managerId}`);
        
        // Actualizar inmediatamente el estado local para mostrar la franja como bloqueada
        // Esto proporciona feedback visual inmediato al usuario
        const newBlockedSlot = {
          id: `temp-${Date.now()}`, // ID temporal hasta que se confirme desde el servidor
          hour: parseInt(hour),
          date: formattedDate,
          day: new Date(formattedDate).getDay(),
          isRecurring: false
        };
        
        // Añadir al estado local
        const updatedBlockedSlots = [...allBlockedSlots, newBlockedSlot];
        setAllBlockedSlots(updatedBlockedSlots);
        setBlockedSlots(updatedBlockedSlots);
        
        // Guardar en AsyncStorage para persistencia
        await saveBlockedSlotsToStorage(updatedBlockedSlots);
        
        // Forzar actualización de la UI
        setRefreshKey(prevKey => prevKey + 1);
        
        const response = await axios.post(`${BACKEND_URL}/api/spaces/block-slot/${managerId}`, {
          date: formattedDate,
          hour: parseInt(hour)
        });
        
        if (response.data && response.data.success) {
          console.log('Slot bloqueado correctamente');
          // Actualizar la UI desde el servidor para confirmar
          loadBlockedSlotsDetailed();
          loadAllBlockedSlots();
        } else {
          console.error('Error al bloquear slot:', response.data?.message || 'Error desconocido');
          Alert.alert("Error", `No se pudo bloquear el horario: ${response.data?.message || 'Error desconocido'}`);
          
          // Revertir cambios locales si hubo error
          loadAllBlockedSlots();
        }
      }
    } catch (error) {
      console.error('Error al modificar disponibilidad:', error);
      Alert.alert("Error", "No se pudo modificar la disponibilidad del horario");
      
      // Recargar datos en caso de error
      loadAllBlockedSlots();
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfBlocked = (hour) => {
    if (!blockedSlots || blockedSlots.length === 0) {
      // Si no hay slots en el estado, intentar obtenerlos de allBlockedSlots
      if (allBlockedSlots && allBlockedSlots.length > 0) {
        // Buscar en allBlockedSlots
        for (const slot of allBlockedSlots) {
          const slotHour = typeof slot.hour === 'number' ? slot.hour : parseInt(slot.hour);
          if (slotHour === hour) {
            return true;
          }
        }
      }
      return false;
    }
    
    // Verificar en los slots filtrados para la fecha actual
    for (const slot of blockedSlots) {
      // Obtener la hora del slot (puede ser número o string)
      const slotHour = typeof slot.hour === 'number' ? slot.hour : parseInt(slot.hour);
      
      // Si coincide la hora, está bloqueado
      if (slotHour === hour) {
        return true;
      }
    }
    
    return false;
  };
  
  const isSameDayAsSelected = (slot) => {
    const dateValue = slot.date;
    if (!dateValue) return false;
    
    const slotDate = new Date(dateValue);
    const currentDate = new Date(selectedDate);
    
    slotDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    return (
      slotDate.getFullYear() === currentDate.getFullYear() &&
      slotDate.getMonth() === currentDate.getMonth() &&
      slotDate.getDate() === currentDate.getDate()
    );
  };
  
  const renderTimeSlot = ({ item }) => {
    const openingHour = parseInt(selectedSpace?.horarioApertura?.split(':')[0]) || 8;
    const closingHour = parseInt(selectedSpace?.horarioCierre?.split(':')[0]) || 20;
    const isOperatingHour = item.id >= openingHour && item.id < closingHour;
    
    // Verificar disponibilidad configurada por el gestor
    const isConfiguredAsAvailable = availabilityData.some(slot => 
      slot.hour === item.id && slot.isAvailable
    );
    
    // Verificar si está bloqueado usando la función auxiliar
    // Forzar re-evaluación con refreshKey para actualizar cuando cambie el estado
    const isBlocked = checkIfBlocked(item.id);
    console.log(`Hora ${item.id}: ${isBlocked ? 'BLOQUEADA' : 'No bloqueada'} (refreshKey: ${refreshKey})`);
    
    // Verificar si hay un evento
    const hasEvent = events.some(event => {
      const eventHour = parseInt(event.horaInicio.split(':')[0]);
      return eventHour === item.id;
    });

    // Determinar el estado del slot
    const isAvailable = isOperatingHour && isConfiguredAsAvailable && !isBlocked && !hasEvent;
    
    let statusText = 'Cerrado';
    let statusIcon = null;
    
    if (isOperatingHour) {
      if (hasEvent) {
        statusText = 'Ocupado';
        statusIcon = <Ionicons name="calendar" size={20} color="#FFF" />;
      } else if (isBlocked) {
        statusText = 'Bloqueado';
        statusIcon = <Ionicons name="close-circle" size={20} color="#FFF" />;
      } else if (isConfiguredAsAvailable) {
        statusText = selectMode ? 'Seleccionar' : 'Disponible';
        statusIcon = <Ionicons name="checkmark-circle" size={20} color="#FFF" />;
      } else {
        statusText = 'No disponible';
        statusIcon = <Ionicons name="time" size={20} color="#FFF" />;
      }
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.timeSlotContainer,
          !isOperatingHour && styles.timeSlotClosed,
          isAvailable && styles.timeSlotAvailable,
          hasEvent && styles.timeSlotBooked,
          isBlocked && styles.timeSlotBlocked,
          !isOperatingHour || (!isAvailable && !hasEvent && !isBlocked) ? styles.timeSlotUnavailable : null,
          selectMode && isAvailable && styles.timeSlotSelectable
        ]}
        onPress={() => handleTimeSlotPress(item)}
        disabled={selectMode ? !isAvailable : !isOperatingHour}
      >
        <View style={styles.timeSlotContent}>
          <Text style={styles.timeSlotTime}>{item.hour}:00 {item.period}</Text>
          <Text style={styles.timeSlotStatus}>
            {statusText}
          </Text>
        </View>
        <View style={styles.timeSlotIconContainer}>
          {statusIcon}
          {(selectMode && isAvailable) && <Ionicons name="add-circle" size={20} color="#FF3A5E" />}
        </View>
      </TouchableOpacity>
    );
  };

  const getNextDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        id: i,
        date,
        formatted: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
      });
    }

    return dates;
  };

  // Para mostrar fechas de los próximos 14 días
  const availableDates = getNextDates();

  const loadBlockedSlotsDetailed = async () => {
    try {
      if (!selectedSpace || !selectedSpace._id) {
        console.error('Error: No hay espacio seleccionado o ID inválido');
        setBlockedDates([]);
        return;
      }
      
      // Usar el ID de usuario del manager, no el ID del espacio
      const managerId = selectedSpace.userId || String(selectedSpace._id);
      console.log(`Cargando slots bloqueados detallados para manager ${managerId}`);
      
      // Agregamos un parámetro de timestamp para evitar caché del navegador
      const timestamp = new Date().getTime();
      console.log(`Haciendo petición a: ${BACKEND_URL}/api/spaces/blocked-slots-detailed/${managerId}?t=${timestamp}`);
      const response = await axios.get(`${BACKEND_URL}/api/spaces/blocked-slots-detailed/${managerId}?t=${timestamp}`);
      console.log('Respuesta detallada recibida:', response.data);
      
      if (response.data && response.data.success && response.data.blockedDates) {
        console.log(`Recibidos ${response.data.totalSlots} slots bloqueados detallados`);
        console.log('Fechas bloqueadas:', response.data.blockedDates);
        
        // Guardar en el estado
        setBlockedDates(response.data.blockedDates);
        
        // Forzar actualización de la UI
        setRefreshKey(prevKey => prevKey + 1);
        
        // Activar el modal automáticamente si hay slots bloqueados y se solicitó ver
        if (response.data.blockedDates.length > 0) {
          console.log('Hay franjas bloqueadas disponibles para mostrar');
        } else {
          console.log('No hay franjas bloqueadas para mostrar');
        }
      } else {
        console.log('No se encontraron slots bloqueados detallados');
        setBlockedDates([]);
      }
    } catch (error) {
      console.error('Error al cargar slots bloqueados detallados:', error);
      setBlockedDates([]);
    }
  };

  const resetConfiguration = async () => {
    try {
      setIsResetting(true);
      
      if (!selectedSpace || !selectedSpace._id) {
        console.error('Error: No hay espacio seleccionado o ID inválido');
        setIsResetting(false);
        return;
      }
      
      // Usar el ID de usuario del manager, no el ID del espacio
      const managerId = selectedSpace.userId || String(selectedSpace._id);
      console.log(`Restableciendo configuración para manager ${managerId}`);
      
      // Agregar timestamp para evitar caché
      const timestamp = new Date().getTime();
      const response = await axios.post(`${BACKEND_URL}/api/spaces/reset-configuration/${managerId}?t=${timestamp}`);
      
      if (response.data && response.data.success) {
        console.log(`Configuración restablecida. Se eliminaron ${response.data.deletedSlots} slots bloqueados.`);
        
        // Actualizar la UI
        setAllBlockedSlots([]);
        setBlockedSlots([]);
        setBlockedDates([]);
        setShowBlockedSlots(false);
        
        // Limpiar el almacenamiento local
        await AsyncStorage.removeItem(`blockedSlots_${managerId}`);
        
        // Forzar actualización de la UI
        setRefreshKey(prevKey => prevKey + 1);
        
        // Recargar datos después de un breve retraso
        setTimeout(() => {
          loadAllBlockedSlots();
        }, 500);
        
        Alert.alert(
          "Éxito",
          "La configuración ha sido restablecida correctamente."
        );
      } else {
        console.log('Error al restablecer la configuración');
        Alert.alert(
          "Error",
          "No se pudo restablecer la configuración. Intente nuevamente."
        );
      }
    } catch (error) {
      console.error('Error al restablecer configuración:', error);
      Alert.alert(
        "Error",
        "No se pudo restablecer la configuración. Intente nuevamente."
      );
    } finally {
      setIsResetting(false);
    }
  };

  const renderBlockedSlot = ({ item }) => {
    return (
      <View style={styles.blockedSlotItem}>
        <View style={styles.blockedSlotInfo}>
          <Text style={styles.blockedSlotHour}>{item.hour}:00</Text>
          <Text style={styles.blockedSlotId}>{item.id.substring(0, 8)}...</Text>
        </View>
        <TouchableOpacity 
          style={styles.unblockButton}
          onPress={() => handleUnblockSlot(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.unblockButtonText}>Desbloquear</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleUnblockSlot = (slot) => {
    Alert.alert(
      "Desbloquear franja",
      `¿Está seguro que desea desbloquear la franja de las ${slot.hour}:00?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Desbloquear",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.post(`${BACKEND_URL}/api/spaces/unblock-slot-by-id/${slot.id}`);
              
              if (response.data && response.data.success) {
                console.log('Franja desbloqueada correctamente');
                
                // Actualizar la UI
                loadBlockedSlotsDetailed();
                loadAllBlockedSlots();
                
                Alert.alert(
                  "Éxito",
                  "La franja ha sido desbloqueada correctamente."
                );
              } else {
                console.log('Error al desbloquear franja');
                Alert.alert(
                  "Error",
                  "No se pudo desbloquear la franja. Intente nuevamente."
                );
              }
            } catch (error) {
              console.error('Error al desbloquear franja:', error);
              Alert.alert(
                "Error",
                "No se pudo desbloquear la franja. Intente nuevamente."
              );
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF3A5E" />
      </View>
    );
  }

  return (
    <View style={styles.container} key={refreshKey}>
      <View style={styles.header}>
        <Text style={styles.title}>{selectMode ? 'Seleccionar Horario' : 'Administrar Disponibilidad'}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.selectionContainer}>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => setShowSpaceModal(true)}
        >
          <Text style={styles.selectionLabel}>Espacio:</Text>
          <Text style={styles.selectionValue}>
            {selectedSpace?.nombre || 'Seleccionar espacio'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => setShowDateModal(true)}
        >
          <Text style={styles.selectionLabel}>Fecha:</Text>
          <Text style={styles.selectionValue}>
            {selectedDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <InfoMessage />
        <Text style={styles.infoText}>
          Horario de operación: {selectedSpace?.horarioApertura || '08:00'} - {selectedSpace?.horarioCierre || '20:00'}
        </Text>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.colorAvailable]} />
            <Text style={styles.legendText}>Disponible</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.colorBooked]} />
            <Text style={styles.legendText}>Evento</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.colorBlocked]} />
            <Text style={styles.legendText}>Bloqueado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.colorClosed]} />
            <Text style={styles.legendText}>Cerrado</Text>
          </View>
        </View>

        {/* Botones para ver franjas bloqueadas y restablecer configuración */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              console.log('Botón Ver franjas bloqueadas presionado');
              // Recargar los datos antes de mostrar el modal
              loadBlockedSlotsDetailed();
              // Esperar un momento para que los datos se carguen
              setTimeout(() => {
                console.log('Mostrando modal de franjas bloqueadas');
                setShowBlockedSlots(true);
              }, 500);
            }}
          >
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Ver franjas bloqueadas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.resetButton]}
            onPress={() => {
              console.log('Botón Restablecer configuración presionado');
              // Mostrar confirmación antes de restablecer
              Alert.alert(
                "Restablecer configuración",
                "¿Está seguro que desea eliminar todas las franjas bloqueadas? Esta acción no se puede deshacer.",
                [
                  {
                    text: "Cancelar",
                    style: "cancel"
                  },
                  {
                    text: "Restablecer",
                    style: "destructive",
                    onPress: () => {
                      console.log('Confirmación para restablecer aceptada');
                      resetConfiguration();
                    }
                  }
                ]
              );
            }}
            disabled={isResetting}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>
              {isResetting ? 'Restableciendo...' : 'Restablecer configuración'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={timeSlots}
        renderItem={renderTimeSlot}
        keyExtractor={(item) => item.id.toString()}
        style={styles.timeSlotsList}
        contentContainerStyle={styles.timeSlotsContent}
      />

      {/* Modal para seleccionar espacio */}
      <Modal
        visible={showSpaceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSpaceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona un espacio</Text>
              <TouchableOpacity
                onPress={() => setShowSpaceModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {spaces.map((space) => (
                <TouchableOpacity
                  key={space._id}
                  style={[
                    styles.modalItem,
                    selectedSpace?._id === space._id && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setSelectedSpace(space);
                    setShowSpaceModal(false);
                  }}
                >
                  <Text style={styles.modalItemTitle}>{space.nombre}</Text>
                  <Text style={styles.modalItemSubtitle}>{space.direccion}</Text>
                  {selectedSpace?._id === space._id && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF3A5E" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar fecha */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una fecha</Text>
              <TouchableOpacity
                onPress={() => setShowDateModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList} horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.calendarContainer}>
                {availableDates.map((dateItem) => (
                  <TouchableOpacity
                    key={dateItem.id}
                    style={[
                      styles.calendarDay,
                      selectedDate.toDateString() === dateItem.date.toDateString() && styles.calendarDaySelected
                    ]}
                    onPress={() => {
                      setSelectedDate(dateItem.date);
                      setShowDateModal(false);
                    }}
                  >
                    <Text style={[
                      styles.calendarDayName,
                      selectedDate.toDateString() === dateItem.date.toDateString() && styles.calendarTextSelected
                    ]}>
                      {dateItem.date.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </Text>
                    <Text style={[
                      styles.calendarDayNumber,
                      selectedDate.toDateString() === dateItem.date.toDateString() && styles.calendarTextSelected
                    ]}>
                      {dateItem.date.getDate()}
                    </Text>
                    <Text style={[
                      styles.calendarDayMonth,
                      selectedDate.toDateString() === dateItem.date.toDateString() && styles.calendarTextSelected
                    ]}>
                      {dateItem.date.toLocaleDateString('es-ES', { month: 'short' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para mostrar franjas bloqueadas */}
      <Modal
        visible={showBlockedSlots}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBlockedSlots(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Franjas bloqueadas</Text>
              <TouchableOpacity
                onPress={() => setShowBlockedSlots(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {blockedDates.length > 0 ? (
                blockedDates.map((dateItem) => (
                  <View key={dateItem.date} style={styles.blockedDateContainer}>
                    <View style={styles.blockedDateHeader}>
                      <Text style={styles.blockedDateTitle}>
                        {dateItem.dayName} {new Date(dateItem.date).getDate()} de {
                          new Date(dateItem.date).toLocaleDateString('es-ES', { month: 'long' })
                        }
                      </Text>
                      <Text style={styles.blockedDateCount}>
                        {dateItem.slots.length} {dateItem.slots.length === 1 ? 'franja' : 'franjas'}
                      </Text>
                    </View>
                    
                    {dateItem.slots.map((slot) => (
                      <View key={slot.id} style={styles.blockedSlotItem}>
                        <View style={styles.blockedSlotInfo}>
                          <Text style={styles.blockedSlotHour}>{slot.hour}:00</Text>
                          <Text style={styles.blockedSlotId}>{slot.id.substring(0, 8)}...</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.unblockButton}
                          onPress={() => handleUnblockSlot(slot)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#fff" />
                          <Text style={styles.unblockButtonText}>Desbloquear</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={48} color="#666" />
                  <Text style={styles.emptyText}>No hay franjas bloqueadas</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  infoMessageContainer: {
    backgroundColor: '#151515',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
    marginHorizontal: 10,
  },
  infoMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoMessageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  infoMessageText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 20,
    paddingLeft: 5,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#151515',
  },
  selectionButton: {
    flex: 1,
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  selectionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  selectionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#151515',
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
  },
  colorAvailable: {
    backgroundColor: '#4CAF50',
  },
  colorBooked: {
    backgroundColor: '#FF3A5E',
  },
  colorBlocked: {
    backgroundColor: '#FF5733', 
  },
  colorClosed: {
    backgroundColor: '#9E9E9E',
  },
  legendText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  timeSlotsList: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  timeSlotsContent: {
    padding: 15,
  },
  timeSlotContainer: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSlotContent: {
    flex: 1,
  },
  timeSlotIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotClosed: {
    backgroundColor: '#333',
    opacity: 0.7,
  },
  timeSlotAvailable: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  timeSlotBooked: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  timeSlotBlocked: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF5733', 
  },
  timeSlotUnavailable: {
    borderLeftWidth: 3,
    borderLeftColor: '#9E9E9E',
    opacity: 0.6,
  },
  timeSlotSelectable: {
    borderLeftColor: '#FF3A5E',
    backgroundColor: 'rgba(255, 58, 94, 0.05)',
  },
  timeSlotTime: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  timeSlotStatus: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalList: {
    padding: 15,
  },
  modalItem: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    position: 'relative',
  },
  modalItemSelected: {
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  modalItemSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  checkIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  calendarContainer: {
    flexDirection: 'row',
    padding: 15,
  },
  calendarDay: {
    width: 70,
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  calendarDaySelected: {
    backgroundColor: '#FF3A5E',
  },
  calendarDayName: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  calendarDayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  calendarDayMonth: {
    fontSize: 12,
    color: '#CCCCCC',
    textTransform: 'uppercase',
  },
  calendarTextSelected: {
    color: '#FFFFFF',
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetButton: {
    backgroundColor: '#FF3A5E',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  blockedDateContainer: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  blockedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
  },
  blockedDateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  blockedDateCount: {
    fontSize: 14,
    color: '#FF3A5E',
  },
  blockedSlotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  blockedSlotInfo: {
    flexDirection: 'column',
  },
  blockedSlotHour: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  blockedSlotId: {
    fontSize: 12,
    color: '#999',
  },
  unblockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3A5E',
    borderRadius: 6,
    padding: 8,
    gap: 5,
  },
  unblockButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
});

export default SpaceAvailabilityManager;
