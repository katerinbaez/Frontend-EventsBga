import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Modal, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const EventProgramming = ({ navigation, route }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [spaceId, setSpaceId] = useState(route?.params?.spaceId || '');
  const [spaceName, setSpaceName] = useState(route?.params?.spaceName || 'Mi Espacio Cultural');
  const [managerId, setManagerId] = useState(route?.params?.managerId || '');
  
  // Estados para el formulario
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // Mantener para compatibilidad
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventCategory, setEventCategory] = useState('otro');
  const [customCategory, setCustomCategory] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  
  // Función auxiliar para obtener el nombre del día a partir de su ID
  const getDayName = (dayIndex) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayIndex];
  };
  
  // Función para convertir el valor de la categoría a un texto más legible
  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'musica': 'Música',
      'danza': 'Danza',
      'teatro': 'Teatro',
      'artes_visuales': 'Artes Visuales',
      'literatura': 'Literatura',
      'cine': 'Cine',
      'fotografia': 'Fotografía',
      'otro': 'Otro'
    };
    return categoryLabels[category] || (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'No especificada');
  };

  // Cargar datos del gestor cultural al iniciar
  useEffect(() => {
    // Si ya tenemos el managerId de los parámetros de la ruta, cargar disponibilidad inmediatamente
    if (route?.params?.managerId) {
      console.log(`Usando managerId de parámetros: ${route.params.managerId}`);
      setManagerId(route.params.managerId);
      setSpaceId(route.params.spaceId || '');
      setSpaceName(route.params.spaceName || 'Mi Espacio Cultural');
      loadAvailability();
      return;
    }
    
    const loadManagerData = async () => {
      try {
        if (user && user.sub) {
          const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${user.sub}`);
          if (response.data && response.data.manager) {
            const manager = response.data.manager;
            setManagerId(manager.userId || manager.id);
            setSpaceId(manager.id);
            setSpaceName(manager.spaceName || manager.name || 'Mi Espacio Cultural');
            
            // Cargar disponibilidad inicial
            loadAvailability();
          } else {
            Alert.alert(
              'Perfil no encontrado', 
              'No se encontró información de tu espacio cultural. Por favor, completa tu perfil primero.',
              [
                { 
                  text: 'Ir a registro', 
                  onPress: () => navigation.navigate('ManagerRegistration') 
                }
              ]
            );
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del gestor:', error);
        Alert.alert(
          'Error', 
          'No se pudo cargar la información de tu espacio cultural.',
          [{ text: 'OK' }]
        );
      }
    };
    
    loadManagerData();
  }, [user, navigation, route?.params?.managerId]);

  // Cargar disponibilidad para la fecha seleccionada
  const loadAvailability = async (selectedDate = eventDate) => {
    if (!managerId) {
      console.error('No se puede cargar disponibilidad sin managerId');
      return;
    }
    
    // Reiniciar estados relacionados con slots
    setFilteredTimeSlots([]);
    setAvailableSlots([]);
    setBlockedSlots([]);
    setSelectedTimeSlots([]);
    setSelectedTimeSlot(null);
    
    setLoadingSlots(true);
    try {
      // Usar la fecha específica si se proporciona, o la fecha del evento seleccionada
      const dateToUse = selectedDate;
      const date = dateToUse.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const dayOfWeek = dateToUse.getDay(); // Día de la semana (0-6)
      
      console.log(`Cargando disponibilidad para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
      
      // 1. Cargar los slots disponibles configurados por el gestor para la fecha específica
      const availabilityUrl = `${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${date}`;
      console.log(`Solicitando disponibilidad desde URL: ${availabilityUrl}`);
      
      const availabilityResponse = await axios.get(availabilityUrl);
      
      if (availabilityResponse.data) {
        console.log('Respuesta de disponibilidad recibida:', availabilityResponse.data);
        
        // Procesar los datos recibidos para asegurar que están en el formato correcto
        const formattedAvailabilities = [];
        
        // Verificar si tenemos disponibilidad específica para la fecha
        const availabilityData = availabilityResponse.data.availability || availabilityResponse.data;
        
        console.log('Datos de disponibilidad recibidos:', JSON.stringify(availabilityData, null, 2));
        
        // Si la respuesta tiene la estructura esperada
        if (typeof availabilityData === 'object') {
          // Verificar si hay configuración específica para la fecha seleccionada
          if (Object.keys(availabilityData).length === 0) {
            console.log(`No hay configuración específica para la fecha ${date}`);
            // No hay configuración específica, no mostramos franjas
            setAvailableSlots([]);
            return;
          }
          
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
        
        console.log(`Disponibilidad cargada: ${formattedAvailabilities.length} días configurados`);
        formattedAvailabilities.forEach(day => {
          console.log(`Día ${day.day}: ${day.timeSlots.length} franjas disponibles`);
        });
        
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
        
        console.log(`Disponibilidad final: ${formattedAvailabilities.length} días configurados`);
        setAvailableSlots(formattedAvailabilities);
      }
      
      // 2. Cargar slots bloqueados
      try {
        const blockedResponse = await axios.get(`${BACKEND_URL}/api/spaces/blocked-slots/${managerId}`);
        
        if (blockedResponse.data.blockedSlots || blockedResponse.data) {
          const blockedSlots = blockedResponse.data.blockedSlots || blockedResponse.data;
          console.log(`Slots bloqueados cargados: ${blockedSlots.length}`);
          
          // Mostrar información detallada sobre los slots bloqueados
          blockedSlots.forEach(slot => {
            const slotDay = slot.day !== undefined ? getDayName(slot.day) : 'No especificado';
            const slotDate = slot.date || 'No especificada';
            console.log(`Slot bloqueado: Día ${slotDay}, Hora ${slot.hour}:00, Fecha ${slotDate}, Recurrente: ${slot.isRecurring ? 'Sí' : 'No'}`);
          });
          
          setBlockedSlots(blockedSlots);
        } else {
          console.log('No hay slots bloqueados configurados');
          setBlockedSlots([]);
        }
      } catch (blockedError) {
        console.error('Error al cargar slots bloqueados:', blockedError);
        setBlockedSlots([]);
      }
      
      // Actualizar los horarios filtrados después de cargar todos los datos
      setTimeout(() => {
        filterAvailableTimeSlots();
      }, 100);
      
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      Alert.alert(
        'Error', 
        'No se pudo cargar la disponibilidad del espacio. Por favor, inténtelo de nuevo más tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  // Filtrar horarios disponibles para el día seleccionado
  const filterAvailableTimeSlots = (dateToFilter = null) => {
    // Usar la fecha proporcionada o la fecha actual del estado
    const dateToUse = dateToFilter || eventDate;
    if (!dateToUse) {
      console.log('No hay fecha seleccionada');
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
      return;
    }
    
    // Obtener el día de la semana (0-6) de la fecha seleccionada
    const dayOfWeek = dateToUse.getDay();
    
    // Formatear la fecha seleccionada para comparaciones
    const date = dateToUse.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    console.log(`Filtrando slots para fecha: ${date}, día: ${getDayName(dayOfWeek)}`);
    console.log(`Total slots bloqueados: ${blockedSlots.length}`);
    
    // Verificar si hay configuración de disponibilidad cargada
    if (availableSlots.length === 0) {
      console.log('No hay configuración de disponibilidad cargada para esta fecha');
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
      return;
    }
    
    // Buscar configuración de disponibilidad para este día
    const dayAvailability = availableSlots.find(slot => slot.dayOfWeek === dayOfWeek);
    
    if (!dayAvailability || !dayAvailability.timeSlots || dayAvailability.timeSlots.length === 0) {
      console.log(`No hay franjas configuradas para el día ${getDayName(dayOfWeek)}`);
      setFilteredTimeSlots([]);
      setLoadingSlots(false);
      return;
    }
    
    // Verificar si es una configuración específica para esta fecha
    if (dayAvailability.isSpecificDate) {
      console.log(`Usando configuración ESPECÍFICA para fecha ${date}`);
    } else {
      console.log(`Usando configuración general para día ${getDayName(dayOfWeek)}`);
    }
    
    console.log(`Encontradas ${dayAvailability.timeSlots.length} franjas configuradas para ${getDayName(dayOfWeek)}`);
    
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
      
      // Calcular la duración en horas
      const duration = (hourNum + 1) - hourNum;
      
      return {
        hour: hourNum,
        formattedHour,
        displayTime,
        start: startHour,
        end: endHour,
        duration: duration // Añadir la duración para filtrar después
      };
    });
    
    // Filtrar slots para asegurar que solo se muestren los que duran exactamente 1 hora
    const validDurationSlots = availableHours.filter(slot => slot.duration === 1);
    
    // Filtrar slots que ya están bloqueados para esta fecha
    const filteredHours = validDurationSlots.filter(slot => {
      // Verificar si este slot está bloqueado
      const isBlocked = blockedSlots.some(blockedSlot => {
        // Verificar si el slot bloqueado coincide con la hora actual
        const hourMatches = blockedSlot.hour === slot.hour;
        if (!hourMatches) return false;
        
        // Si el slot bloqueado es recurrente, verificar día de la semana
        if (blockedSlot.isRecurring) {
          // Verificar si el día coincide (usando day en lugar de dayOfWeek para compatibilidad)
          const dayMatches = blockedSlot.day === dayOfWeek;
          if (dayMatches) {
            console.log(`Slot ${slot.displayTime} bloqueado recurrentemente para ${getDayName(dayOfWeek)}`);
            return true;
          }
        }
        
        // Si no es recurrente, verificar fecha específica
        if (blockedSlot.date) {
          // Asegurar que estamos comparando el mismo formato de fecha
          const blockedDate = blockedSlot.date;
          const dateMatches = blockedDate === date;
          
          if (dateMatches) {
            console.log(`Slot ${slot.displayTime} bloqueado específicamente para la fecha ${date}`);
            return true;
          }
        }
        
        return false;
      });
      
      // Solo incluir slots que no estén bloqueados
      return !isBlocked;
    });
    
    console.log(`Slots disponibles después de filtrar bloqueados: ${filteredHours.length}`);
    setFilteredTimeSlots(filteredHours);
  };

  // Función para manejar la selección de múltiples slots de tiempo
  const handleTimeSlotSelection = (slot) => {
    // Si no hay slots seleccionados, simplemente añadir el slot
    if (selectedTimeSlots.length === 0) {
      setSelectedTimeSlots([slot]);
      setSelectedTimeSlot(slot); // Mantener para compatibilidad
      return;
    }
    
    // Ordenar los slots seleccionados por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => {
      return a.hour - b.hour;
    });
    
    // Verificar si el slot seleccionado es consecutivo con los ya seleccionados
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    // Si el slot es una hora antes del primer slot seleccionado
    if (slot.hour === firstSlot.hour - 1) {
      const newSlots = [slot, ...sortedSlots];
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]); // Actualizar para compatibilidad
      return;
    }
    
    // Si el slot es una hora después del último slot seleccionado
    if (slot.hour === lastSlot.hour + 1) {
      const newSlots = [...sortedSlots, slot];
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]); // Mantener el primer slot para compatibilidad
      return;
    }
    
    // Si el slot ya está seleccionado, deseleccionarlo
    if (selectedTimeSlots.some(s => s.hour === slot.hour)) {
      // Si solo hay un slot seleccionado, deseleccionar todo
      if (selectedTimeSlots.length === 1) {
        setSelectedTimeSlots([]);
        setSelectedTimeSlot(null);
        return;
      }
      
      // Si hay múltiples slots, verificar si el slot a deseleccionar rompe la secuencia
      if (slot.hour !== firstSlot.hour && slot.hour !== lastSlot.hour) {
        // No permitir deseleccionar slots intermedios
        Alert.alert(
          'Selección no válida', 
          'Solo puedes deseleccionar el primer o último slot de la secuencia.',
          [{ text: 'Entendido', style: 'cancel' }]
        );
        return;
      }
      
      // Deseleccionar el primer o último slot
      const newSlots = selectedTimeSlots.filter(s => s.hour !== slot.hour);
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]); // Actualizar para compatibilidad
      return;
    }
    
    // Si el slot no es consecutivo, mostrar un mensaje
    Alert.alert(
      'Selección no válida', 
      'Solo puedes seleccionar slots consecutivos. Si necesitas más tiempo, selecciona un slot que sea consecutivo con los ya seleccionados.',
      [{ text: 'Entendido', style: 'cancel' }]
    );
  };

  // Obtener el rango de tiempo para mostrar en el resumen
  const getTimeRange = () => {
    if (selectedTimeSlots.length === 0) return { start: '', end: '' };
    
    // Ordenar los slots por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    return {
      start: sortedSlots[0].start,
      end: sortedSlots[sortedSlots.length - 1].end
    };
  };

  // Calcular la duración total del evento en horas
  const calculateTotalDuration = () => {
    if (selectedTimeSlots.length === 0) return 0;
    
    // Ordenar los slots por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    // Calcular la duración total
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    return (lastSlot.hour + 1) - firstSlot.hour;
  };

  // Crear evento
  const createEvent = async () => {
    if (!eventName || !eventDescription || selectedTimeSlots.length === 0) {
      Alert.alert('Datos incompletos', 'Por favor, completa todos los campos obligatorios.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Ordenar los slots seleccionados por hora
      const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
      const firstSlot = sortedSlots[0];
      const lastSlot = sortedSlots[sortedSlots.length - 1];
      
      // Formatear la fecha para la API
      const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Preparar los datos para la solicitud en el formato correcto para la nueva ruta de gestores
      const eventData = {
        titulo: eventName,
        descripcion: eventDescription,
        fecha: formattedDate,
        horaInicio: firstSlot.start,
        horaFin: lastSlot.end,
        spaceId: 1, 
        managerId: managerId,
        categoria: eventCategory === 'otro' && customCategory ? customCategory : eventCategory,
        tipoEvento: eventType,
        asistentesEsperados: parseInt(expectedAttendees, 10) || 0,
        requerimientosAdicionales: additionalRequirements || 'Ninguno'
      };
      
      console.log('Enviando datos al endpoint para gestores:', eventData);
      
      // Enviar la solicitud a la nueva ruta específica para gestores
      const response = await axios.post(`${BACKEND_URL}/api/manager-events/create`, eventData);
      console.log('Respuesta del servidor:', response.data);
      
      // Verificar si la respuesta indica éxito (más flexible con diferentes formatos de respuesta)
      if (response.data && (response.data.success || response.data.id || response.status === 200 || response.status === 201)) {
        console.log('Evento creado exitosamente:', response.data);
        
        // Bloquear los slots utilizados
        const blockPromises = sortedSlots.map(slot => {
          return axios.post(`${BACKEND_URL}/api/spaces/block-slot/${managerId}`, {
            spaceId: 1, 
            date: formattedDate,
            hour: slot.hour,
            day: new Date(eventDate).getDay(),
            dayName: getDayName(new Date(eventDate).getDay()),
            isRecurring: false
          });
        });
        
        // Esperar a que se bloqueen todos los slots
        await Promise.all(blockPromises);
        
        // Mostrar mensaje de éxito
        Alert.alert(
          'Evento Programado', 
          'El evento ha sido programado exitosamente.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Limpiar el formulario
                setEventName('');
                setEventDescription('');
                setEventDate(new Date());
                setSelectedTimeSlots([]);
                setSelectedTimeSlot(null);
                setExpectedAttendees('');
                setEventType('');
                setEventCategory('otro');
                setCustomCategory('');
                setAdditionalRequirements('');
                
                // Cerrar el modal de confirmación
                setConfirmModalVisible(false);
                
                // Navegar de vuelta al dashboard
                navigation.navigate('DashboardManager');
              }
            }
          ]
        );
      } else {
        console.error('Error al crear evento:', response.data);
        Alert.alert(
          'Error', 
          'No se pudo crear el evento. Por favor, inténtelo de nuevo más tarde.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      Alert.alert(
        'Error', 
        'No se pudo crear el evento. Por favor, inténtelo de nuevo más tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programar Evento</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Programación de Eventos</Text>
        <Text style={[styles.spaceInfo, { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' }]}>
          Espacio: {spaceName}
        </Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nombre del Evento</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el nombre del evento"
            value={eventName}
            onChangeText={setEventName}
          />
          
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe tu evento"
            multiline
            numberOfLines={4}
            value={eventDescription}
            onChangeText={setEventDescription}
          />
          
          <Text style={styles.label}>Fecha del Evento</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {eventDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <Ionicons name="calendar" size={24} color="#FF3A5E" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setEventDate(selectedDate);
                  // Aquí cargaremos la disponibilidad para la fecha seleccionada
                  loadAvailability(selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}
          
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.categoryContainer}>
            {['musica', 'danza', 'teatro', 'artes visuales', 'literatura', 'cine', 'fotografia', 'otro'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  eventCategory === category && styles.categoryButtonSelected
                ]}
                onPress={() => setEventCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    eventCategory === category && styles.categoryButtonTextSelected
                  ]}
                >
                  {getCategoryLabel(category)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.label}>Tipo de Evento</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Concierto, Exposición, Taller..."
            value={eventType}
            onChangeText={setEventType}
          />
          
          <Text style={styles.label}>Asistentes Esperados</Text>
          <TextInput
            style={styles.input}
            placeholder="Número de asistentes esperados"
            keyboardType="numeric"
            value={expectedAttendees}
            onChangeText={setExpectedAttendees}
          />
          
          <Text style={styles.label}>Requerimientos Adicionales</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Especifica cualquier requerimiento adicional"
            multiline
            numberOfLines={4}
            value={additionalRequirements}
            onChangeText={setAdditionalRequirements}
          />
          
          <Text style={styles.sectionTitle}>Horarios Disponibles</Text>
          {loadingSlots ? (
            <ActivityIndicator size="large" color="#FF3A5E" style={styles.loader} />
          ) : filteredTimeSlots.length > 0 ? (
            <View style={styles.timeSlotsContainer}>
              {filteredTimeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.hour}
                  style={[
                    styles.timeSlot,
                    selectedTimeSlots.some(s => s.hour === slot.hour) && styles.timeSlotSelected
                  ]}
                  onPress={() => handleTimeSlotSelection(slot)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTimeSlots.some(s => s.hour === slot.hour) && styles.timeSlotTextSelected
                    ]}
                  >
                    {slot.displayTime}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noSlotsText}>
              No hay horarios disponibles para la fecha seleccionada
            </Text>
          )}
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!eventName || !eventDescription || selectedTimeSlots.length === 0) && styles.submitButtonDisabled
            ]}
            disabled={!eventName || !eventDescription || selectedTimeSlots.length === 0}
            onPress={() => {
              setConfirmModalVisible(true);
            }}
          >
            <Text style={styles.submitButtonText}>Programar Evento</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Modal de confirmación */}
      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Programación</Text>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Nombre del Evento:</Text>
              <Text style={styles.modalValue}>{eventName}</Text>
              
              <Text style={styles.modalLabel}>Fecha:</Text>
              <Text style={styles.modalValue}>
                {eventDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              
              <Text style={styles.modalLabel}>Horario:</Text>
              <Text style={styles.modalValue}>
                {selectedTimeSlots.length > 0 ? 
                  `${getTimeRange().start.substring(0, 5)} - ${getTimeRange().end.substring(0, 5)} (${calculateTotalDuration()} horas)` : 
                  'No seleccionado'}
              </Text>
              
              <Text style={styles.modalLabel}>Categoría:</Text>
              <Text style={styles.modalValue}>{getCategoryLabel(eventCategory)}</Text>
              
              <Text style={styles.modalLabel}>Tipo de Evento:</Text>
              <Text style={styles.modalValue}>{eventType || 'No especificado'}</Text>
              
              <Text style={styles.modalLabel}>Asistentes Esperados:</Text>
              <Text style={styles.modalValue}>{expectedAttendees || '0'}</Text>
              
              <Text style={styles.modalWarning}>
                Al programar este evento, los horarios seleccionados quedarán bloqueados automáticamente.
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={createEvent}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#000',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  spaceInfo: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#FF3A5E',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  timeSlot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  timeSlotSelected: {
    backgroundColor: '#FF3A5E',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  noSlotsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  submitButton: {
    backgroundColor: '#FF3A5E',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ffb3c0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalContent: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  modalWarning: {
    fontSize: 14,
    color: '#FF3A5E',
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF3A5E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default EventProgramming;
