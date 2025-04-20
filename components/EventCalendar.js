import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Modal, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  TextInput 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const EventCalendar = ({ navigation, onClose }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedView, setSelectedView] = useState('timeGridWeek');
  const [showFilters, setShowFilters] = useState(false);
  const [showSpaceSelector, setShowSpaceSelector] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '11:00',
    category: null,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [calendarHtml, setCalendarHtml] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Estado para gestionar la disponibilidad del espacio cultural
  const [availability, setAvailability] = useState([]);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [newAvailabilitySlot, setNewAvailabilitySlot] = useState({
    dayOfWeek: 1, // Lunes
    startTime: '09:00',
    endTime: '18:00'
  });
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  const webViewRef = useRef(null);

  // Datos de demostración para modo offline
  const demoCategories = [
    { _id: 'cat1', nombre: 'Música', color: '#FF3A5E' },
    { _id: 'cat2', nombre: 'Teatro', color: '#4A90E2' },
    { _id: 'cat3', nombre: 'Danza', color: '#50E3C2' },
    { _id: 'cat4', nombre: 'Exposición', color: '#F5A623' },
    { _id: 'cat5', nombre: 'Literatura', color: '#B8E986' }
  ];

  const demoSpaces = [
    { 
      _id: 'space1', 
      nombre: 'Teatro Corfescu', 
      direccion: 'Calle 33 #23-45, Bucaramanga',
      descripcion: 'Espacio principal para eventos culturales'
    },
    { 
      _id: 'space2', 
      nombre: 'Centro Cultural del Oriente', 
      direccion: 'Carrera 19 #31-65, Bucaramanga',
      descripcion: 'Centro histórico para eventos culturales'
    },
    { 
      _id: 'space3', 
      nombre: 'Auditorio Luis A. Calvo', 
      direccion: 'UIS Campus Principal, Bucaramanga',
      descripcion: 'Auditorio universitario para presentaciones'
    }
  ];

  const demoEvents = [
    {
      id: 'event1',
      title: 'Concierto de Jazz',
      start: '2025-04-18T19:00:00',
      end: '2025-04-18T21:30:00',
      backgroundColor: '#FF3A5E',
      borderColor: '#FF3A5E',
      extendedProps: {
        description: 'Concierto de jazz con artistas locales',
        location: 'Teatro Corfescu',
        spaceId: 'space1',
        artist: 'Trío de Jazz BGA',
        artistId: 'art1',
        price: '25.000',
        category: 'cat1'
      }
    },
    {
      id: 'event2',
      title: 'Obra de Teatro: Romeo y Julieta',
      start: '2025-04-19T18:00:00',
      end: '2025-04-19T20:00:00',
      backgroundColor: '#4A90E2',
      borderColor: '#4A90E2',
      extendedProps: {
        description: 'Adaptación contemporánea de la obra clásica',
        location: 'Centro Cultural del Oriente',
        spaceId: 'space2',
        artist: 'Compañía Teatral Santander',
        artistId: 'art2',
        price: '30.000',
        category: 'cat2'
      }
    },
    {
      id: 'event3',
      title: 'Exhibición de Arte Moderno',
      start: '2025-04-20T10:00:00',
      end: '2025-04-20T18:00:00',
      backgroundColor: '#F5A623',
      borderColor: '#F5A623',
      extendedProps: {
        description: 'Exhibición de artistas emergentes de Santander',
        location: 'Auditorio Luis A. Calvo',
        spaceId: 'space3',
        artist: 'Colectivo Artístico BGA',
        artistId: 'art3',
        price: 'Entrada libre',
        category: 'cat4'
      }
    }
  ];

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setErrorMessage('');
      setShowError(false);
      
      try {
        // Cargar datos necesarios en secuencia para mejor manejo de errores
        const categoriesResult = await loadCategories();
        const spacesResult = await loadSpaces();
        const eventsResult = await loadEvents();
        
        // Verificar si obtuvimos datos válidos
        if (!categoriesResult || categoriesResult.length === 0) {
          console.warn('No se pudieron cargar las categorías');
        }
        
        if (!spacesResult || spacesResult.length === 0) {
          console.warn('No se pudieron cargar los espacios culturales');
        }
        
        if (!eventsResult || eventsResult.length === 0) {
          console.warn('No se pudieron cargar los eventos');
        }
        
        // Generar HTML del calendario solo si todo salió bien
        generateCalendarHtml();
      } catch (error) {
        console.error('Error al inicializar el calendario:', error);
        setErrorMessage('No se pudo cargar el calendario. Intente de nuevo más tarde.');
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, []);

  useEffect(() => {
    if (selectedSpace) {
      loadSpaceAvailability();
    }
  }, [selectedSpace]);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/categories`);
      // Asegurar que tenemos una respuesta válida
      if (response && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
        setIsOfflineMode(false);
        return response.data;
      } else {
        console.log('Formato de respuesta inesperado en categorías:', response);
        // Usar datos de demostración
        console.log('Usando categorías de demostración (modo offline)');
        setCategories(demoCategories);
        setIsOfflineMode(true);
        return demoCategories;
      }
    } catch (error) {
      console.error('Error loading categories:', error.message || 'Error desconocido');
      // Usar datos de demostración
      console.log('Usando categorías de demostración (modo offline)');
      setCategories(demoCategories);
      setIsOfflineMode(true);
      return demoCategories;
    }
  };

  const loadSpaces = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
      // Asegurar que tenemos una respuesta válida
      if (response && response.data) {
        setSpaces(Array.isArray(response.data) ? response.data : []);
        return response.data;
      } else {
        console.log('Formato de respuesta inesperado en espacios:', response);
        // Usar datos de demostración
        console.log('Usando espacios de demostración (modo offline)');
        setSpaces(demoSpaces);
        setIsOfflineMode(true);
        return demoSpaces;
      }
    } catch (error) {
      console.error('Error loading spaces:', error.message || 'Error desconocido');
      // Usar datos de demostración
      console.log('Usando espacios de demostración (modo offline)');
      setSpaces(demoSpaces);
      setIsOfflineMode(true);
      return demoSpaces;
    }
  };

  const loadEvents = async () => {
    try {
      // Envolvemos en un try/catch independiente con un timeout
      const eventsPromise = axios.get(`${BACKEND_URL}/api/events`);
      
      // Si la petición tarda más de 5 segundos, la cancelamos para evitar bloqueos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      // Usamos Promise.race para tomar la más rápida
      const response = await Promise.race([eventsPromise, timeoutPromise]);
      
      // Verificar que tenemos una respuesta válida y con la estructura esperada
      if (response && response.data) {
        const eventsData = Array.isArray(response.data) ? response.data : [];
        
        // Formatear los eventos de manera segura
        const formattedEvents = eventsData.map(event => ({
          id: event._id || `temp-${Math.random().toString(36).substring(7)}`,
          title: event.titulo || 'Sin título',
          start: event.fecha && event.horaInicio ? `${event.fecha}T${event.horaInicio}` : new Date().toISOString(),
          end: event.fecha && event.horaFin ? `${event.fecha}T${event.horaFin}` : new Date().toISOString(),
          backgroundColor: getCategoryColor(event.categoria),
          borderColor: getCategoryColor(event.categoria),
          extendedProps: {
            description: event.descripcion || '',
            location: event.space?.nombre || 'Sin espacio asignado',
            spaceId: event.space?._id || '',
            artist: event.artista?.nombreArtistico || 'Artista sin registrar',
            artistId: event.artista?._id || '',
            price: event.precio || 'Gratis',
            category: event.categoria || ''
          }
        }));

        setEvents(formattedEvents);
        return formattedEvents;
      } else {
        console.log('Formato de respuesta inesperado en eventos:', response);
        // Usar datos de demostración
        console.log('Usando eventos de demostración (modo offline)');
        setEvents(demoEvents);
        setIsOfflineMode(true);
        return demoEvents;
      }
    } catch (error) {
      console.error('Error loading events:', error.message || 'Error desconocido');
      // Usar datos de demostración
      console.log('Usando eventos de demostración (modo offline)');
      setEvents(demoEvents);
      setIsOfflineMode(true);
      return demoEvents;
    }
  };

  const loadSpaceAvailability = async () => {
    if (!selectedSpace) return;
    
    try {
      if (isOfflineMode) {
        // Datos de demostración para disponibilidad
        const demoAvailability = [
          { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }, // Lunes
          { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' }, // Martes
          { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' }, // Miércoles
          { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' }, // Jueves
          { dayOfWeek: 5, startTime: '08:00', endTime: '20:00' }  // Viernes
        ];
        setAvailability(demoAvailability);
        return;
      }
      
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces/${selectedSpace._id}/availability`);
      if (response && response.data) {
        setAvailability(response.data);
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      // Establecer datos de demostración
      const demoAvailability = [
        { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }, // Lunes
        { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' }, // Martes
        { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' }, // Miércoles
        { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' }, // Jueves
        { dayOfWeek: 5, startTime: '08:00', endTime: '20:00' }  // Viernes
      ];
      setAvailability(demoAvailability);
    }
  };

  const saveAvailability = async () => {
    if (!selectedSpace || !selectedSpace._id) return;
    
    try {
      if (isOfflineMode) {
        Alert.alert('Modo sin conexión', 'Los cambios serán guardados localmente hasta que haya conexión.');
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/cultural-spaces/${selectedSpace._id}/availability`,
        { availability }
      );
      
      if (response && response.data && response.data.success) {
        Alert.alert('Éxito', 'La disponibilidad ha sido actualizada correctamente');
      }
    } catch (error) {
      console.error('Error al guardar disponibilidad:', error);
      Alert.alert('Error', 'No se pudo guardar la disponibilidad. Intente nuevamente.');
    }
  };

  const addAvailabilitySlot = () => {
    // Validar que el nuevo slot no se superponga con otros
    const overlappingSlot = availability.find(slot => 
      slot.dayOfWeek === newAvailabilitySlot.dayOfWeek &&
      ((newAvailabilitySlot.startTime >= slot.startTime && newAvailabilitySlot.startTime < slot.endTime) ||
       (newAvailabilitySlot.endTime > slot.startTime && newAvailabilitySlot.endTime <= slot.endTime))
    );
    
    if (overlappingSlot) {
      Alert.alert('Error', 'El horario se superpone con otro existente');
      return;
    }
    
    // Añadir el nuevo slot
    setAvailability([...availability, { ...newAvailabilitySlot }]);
    setNewAvailabilitySlot({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '18:00'
    });
    setShowAvailabilityModal(false);
  };

  const removeAvailabilitySlot = (index) => {
    const updatedAvailability = [...availability];
    updatedAvailability.splice(index, 1);
    setAvailability(updatedAvailability);
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek % 7];
  };

  const isEventInAvailability = (start, end) => {
    if (!availability || availability.length === 0) return true;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dayOfWeek = startDate.getDay();
    
    // Convertir horas a formato HH:MM para comparación
    const startTimeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
    const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    // Buscar si hay disponibilidad para ese día y hora
    const availableSlot = availability.find(slot => 
      slot.dayOfWeek === dayOfWeek &&
      slot.startTime <= startTimeStr &&
      slot.endTime >= endTimeStr
    );
    
    return !!availableSlot;
  };

  const getCategoryColor = (category) => {
    if (!category) return '#95A5A6';
    // Asegurar que categories sea un array 
    const categoriesArray = Array.isArray(categories) ? categories : [];
    const foundCategory = categoriesArray.find(c => c && c._id === category);
    return foundCategory?.color || '#95A5A6';
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      if (isSelected) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });

    // Actualizar el calendario vía WebView
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        calendar.getEvents().forEach(event => {
          if (!event.extendedProps.type) {
            const shouldShow = ${JSON.stringify(selectedCategories)}.length === 0 || 
                          ${JSON.stringify(selectedCategories)}.includes(event.extendedProps.category);
            event.setProp('display', shouldShow ? 'auto' : 'none');
          }
        });
        true;
      `);
    }
  };

  const handleSelectSpace = (space) => {
    if (!space) {
      console.warn('Se intentó seleccionar un espacio inválido');
      return;
    }
    
    setSelectedSpace(space);
    
    // Filtrar eventos por espacio
    if (webViewRef.current) {
      try {
        const spaceId = space._id || '';
        webViewRef.current.injectJavaScript(`
          try {
            if (calendar) {
              calendar.getEvents().forEach(event => {
                if (event.extendedProps && event.extendedProps.spaceId === "${spaceId}") {
                  event.setProp('display', 'auto');
                } else {
                  event.setProp('display', 'none');
                }
              });
            }
          } catch (err) {
            console.error('Error al filtrar eventos:', err);
          }
          true;
        `);
      } catch (error) {
        console.error('Error al inyectar JavaScript:', error);
      }
    }
  };

  const handleCreateEvent = async () => {
    if (!selectedSpace) {
      Alert.alert("Error", "Por favor selecciona un espacio cultural");
      return;
    }
    
    if (!newEventData.title || !newEventData.category) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }
    
    try {
      setLoading(true);
      
      const eventDate = newEventData.date.toISOString().split('T')[0];
      
      const eventData = {
        titulo: newEventData.title,
        descripcion: newEventData.description || "Sin descripción",
        fecha: eventDate,
        horaInicio: newEventData.startTime,
        horaFin: newEventData.endTime,
        precio: newEventData.price || 0,
        categoria: newEventData.category,
        space: selectedSpace._id,
        artista: user.id
      };
      
      const response = await axios.post(`${BACKEND_URL}/api/events`, eventData);
      
      if (response.data.success) {
        Alert.alert("Éxito", "Evento creado correctamente");
        setShowCreateEvent(false);
        setNewEventData({
          title: '',
          date: new Date(),
          startTime: '09:00',
          endTime: '11:00',
          category: null,
        });
        
        // Recargar eventos
        await loadEvents();
      } else {
        Alert.alert("Error", response.data.message || "No se pudo crear el evento");
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert("Error", "No se pudo crear el evento");
      setLoading(false);
    }
  };

  // Función para generar el HTML del calendario
  const generateCalendarHtml = () => {
    try {
      // Convertir eventos al formato que espera FullCalendar
      const formattedEvents = Array.isArray(events) ? events : [];
      
      // Crear el HTML para el calendario usando FullCalendar
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body {
              margin: 0;
              padding: 10px;
              font-family: Arial, sans-serif;
              background-color: #121212;
              color: #FFFFFF;
            }
            #calendar {
              height: 100vh;
            }
            .fc-theme-standard th, .fc-theme-standard td {
              border-color: #333333;
            }
            .fc-theme-standard .fc-scrollgrid {
              border-color: #333333;
            }
            .fc-theme-standard {
              color: #FFFFFF;
            }
            .fc-col-header-cell {
              background-color: #1A1A1A;
            }
            .fc-day-today {
              background-color: rgba(255, 58, 94, 0.2) !important;
            }
            .fc-event {
              cursor: pointer;
              border-radius: 4px;
            }
            .fc-button-primary {
              background-color: #FF3A5E !important;
              border-color: #FF3A5E !important;
            }
            .fc-button-primary:disabled {
              background-color: #FF3A5E99 !important;
              border-color: #FF3A5E99 !important;
            }
            .fc-toolbar-title {
              color: #FFFFFF;
            }
            .fc-timegrid-slot, .fc-daygrid-day {
              background-color: #1A1A1A;
            }
          </style>
          <link href="https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.css" rel="stylesheet" />
          <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/locales/es.js"></script>
        </head>
        <body>
          <div id="calendar"></div>
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              const calendarEl = document.getElementById('calendar');
              
              // Crear el calendario
              window.calendar = new FullCalendar.Calendar(calendarEl, {
                locale: 'es',
                initialView: 'timeGridWeek',
                headerToolbar: {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                navLinks: true,
                selectable: true,
                selectMirror: true,
                editable: false,
                dayMaxEvents: true,
                events: ${JSON.stringify(formattedEvents)},
                eventClick: function(info) {
                  // Enviar información del evento al React Native
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'eventClick',
                    event: {
                      id: info.event.id,
                      title: info.event.title,
                      start: info.event.start?.toISOString(),
                      end: info.event.end?.toISOString(),
                      ...info.event.extendedProps
                    }
                  }));
                },
                select: function(info) {
                  // Enviar información de la selección a React Native
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'dateSelect',
                    selection: {
                      start: info.start?.toISOString(),
                      end: info.end?.toISOString(),
                      allDay: info.allDay
                    }
                  }));
                  calendar.unselect();
                }
              });
              
              // Mostrar el calendario
              calendar.render();
            });
          </script>
        </body>
        </html>
      `;
      
      // Establecer el HTML generado
      setCalendarHtml(html);
    } catch (error) {
      console.error('Error al generar HTML del calendario:', error);
      // Establecer un HTML básico de error
      setCalendarHtml(`
        <html>
          <body style="background-color: #121212; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; padding: 20px;">
            <div>
              <h2 style="color: #FF3A5E">Error al cargar el calendario</h2>
              <p>No se pudo generar el calendario. Por favor, intente nuevamente.</p>
            </div>
          </body>
        </html>
      `);
    }
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'eventClick') {
        setSelectedEvent(data.event);
        setShowEventDetails(true);
      } else if (data.type === 'dateSelect') {
        // Comprobar si la franja está disponible
        const slotStart = new Date(data.selection.start);
        const slotEnd = new Date(data.selection.end);
        
        // Convertir a formato local para el formulario
        const startTime = slotStart.toTimeString().substring(0, 5);
        const endTime = slotEnd.toTimeString().substring(0, 5);
        
        setNewEventData(prev => ({
          ...prev,
          date: slotStart,
          startTime,
          endTime
        }));
        
        setShowCreateEvent(true);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar por Categoría</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {categories.map(category => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryItem,
                selectedCategories.includes(category._id) && styles.selectedCategory
              ]}
              onPress={() => toggleCategory(category._id)}
            >
              <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
              <Text style={[
                styles.categoryText,
                selectedCategories.includes(category._id) && styles.selectedCategoryText
              ]}>
                {category.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const SpaceSelectorModal = () => (
    <Modal
      visible={showSpaceSelector}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSpaceSelector(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Espacio Cultural</Text>
            <TouchableOpacity onPress={() => setShowSpaceSelector(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.spaceList}>
            {Array.isArray(spaces) && spaces.length > 0 ? (
              spaces.map(space => (
                <TouchableOpacity
                  key={space._id || Math.random().toString()}
                  style={[
                    styles.spaceItem,
                    selectedSpace && selectedSpace._id === space._id && styles.selectedSpace
                  ]}
                  onPress={() => {
                    handleSelectSpace(space);
                    setShowSpaceSelector(false);
                  }}
                >
                  <Text style={styles.spaceName}>{space.nombre || 'Espacio sin nombre'}</Text>
                  <Text style={styles.spaceAddress}>{space.direccion || 'Sin dirección'}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle" size={40} color="#FF3A5E" />
                <Text style={styles.emptyStateText}>No hay espacios disponibles</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const EventDetailsModal = () => {
    if (!selectedEvent) return null;
    
    return (
      <Modal
        visible={showEventDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEventDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
              <TouchableOpacity onPress={() => setShowEventDetails(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.eventDetails}>
              <View style={styles.eventDetailItem}>
                <Ionicons name="calendar" size={20} color="#FF3A5E" />
                <Text style={styles.eventDetailText}>
                  {new Date(selectedEvent.start).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.eventDetailItem}>
                <Ionicons name="time" size={20} color="#FF3A5E" />
                <Text style={styles.eventDetailText}>
                  {new Date(selectedEvent.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                  {new Date(selectedEvent.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>
              
              <View style={styles.eventDetailItem}>
                <Ionicons name="location" size={20} color="#FF3A5E" />
                <Text style={styles.eventDetailText}>
                  {selectedEvent.extendedProps.location}
                </Text>
              </View>
              
              <View style={styles.eventDetailItem}>
                <Ionicons name="person" size={20} color="#FF3A5E" />
                <Text style={styles.eventDetailText}>
                  {selectedEvent.extendedProps.artist}
                </Text>
              </View>
              
              {selectedEvent.extendedProps.description && (
                <View style={styles.eventDetailItem}>
                  <Ionicons name="information-circle" size={20} color="#FF3A5E" />
                  <Text style={styles.eventDetailText}>
                    {selectedEvent.extendedProps.description}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const CreateEventModal = () => (
    <Modal
      visible={showCreateEvent}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCreateEvent(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear Nuevo Evento</Text>
            <TouchableOpacity onPress={() => setShowCreateEvent(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.createEventForm}>
            {/* Implementar formulario de creación de evento */}
            <Text style={styles.eventFormLabel}>Fecha seleccionada:</Text>
            <Text style={styles.eventFormValue}>
              {newEventData.date.toLocaleDateString()} | {newEventData.startTime} - {newEventData.endTime}
            </Text>
            
            <Text style={styles.eventFormLabel}>Espacio:</Text>
            <Text style={styles.eventFormValue}>{selectedSpace?.nombre}</Text>
            
            {/* Resto del formulario se implementaría aquí */}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.createEventButton}
            onPress={handleCreateEvent}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createEventButtonText}>Crear Evento</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const AvailabilityModal = () => (
    <Modal
      visible={isEditingAvailability}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsEditingAvailability(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Gestionar Disponibilidad</Text>
            <TouchableOpacity onPress={() => setIsEditingAvailability(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollContent}>
            <Text style={styles.sectionTitle}>Horarios disponibles</Text>
            
            {availability.length > 0 ? (
              availability.map((slot, index) => (
                <View key={index} style={styles.availabilityItem}>
                  <View style={styles.availabilityInfo}>
                    <Text style={styles.availabilityDay}>{getDayName(slot.dayOfWeek)}</Text>
                    <Text style={styles.availabilityTime}>{slot.startTime} - {slot.endTime}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeAvailabilitySlot(index)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3A5E" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color="#FF3A5E" />
                <Text style={styles.emptyStateText}>No hay horarios disponibles</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAvailabilityModal(true)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Agregar horario</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveAvailability}
            >
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const NewAvailabilityModal = () => (
    <Modal
      visible={showAvailabilityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAvailabilityModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nuevo Horario</Text>
            <TouchableOpacity onPress={() => setShowAvailabilityModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Día de la semana</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.dayPicker}
            >
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayOption,
                    newAvailabilitySlot.dayOfWeek === (index === 6 ? 0 : index + 1) && styles.dayOptionSelected
                  ]}
                  onPress={() => setNewAvailabilitySlot({
                    ...newAvailabilitySlot, 
                    dayOfWeek: index === 6 ? 0 : index + 1
                  })}
                >
                  <Text style={[
                    styles.dayOptionText,
                    newAvailabilitySlot.dayOfWeek === (index === 6 ? 0 : index + 1) && styles.dayOptionTextSelected
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.timeGroup}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hora inicio</Text>
              <TextInput
                style={styles.input}
                value={newAvailabilitySlot.startTime}
                onChangeText={(text) => 
                  setNewAvailabilitySlot({...newAvailabilitySlot, startTime: text})
                }
                placeholder="09:00"
                placeholderTextColor="#666"
                keyboardType="numbers-and-punctuation"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hora fin</Text>
              <TextInput
                style={styles.input}
                value={newAvailabilitySlot.endTime}
                onChangeText={(text) => 
                  setNewAvailabilitySlot({...newAvailabilitySlot, endTime: text})
                }
                placeholder="18:00"
                placeholderTextColor="#666"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addAvailabilitySlot}
          >
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF3A5E" />
        <Text style={styles.loadingText}>Cargando calendario...</Text>
      </View>
    );
  }
  
  if (showError) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={50} color="#FF3A5E" />
        <Text style={styles.errorText}>{errorMessage || 'Ha ocurrido un error inesperado'}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setShowError(false);
            // Intentar cargar datos nuevamente
            setTimeout(() => {
              const initialize = async () => {
                try {
                  await Promise.all([
                    loadCategories(),
                    loadSpaces(),
                    loadEvents()
                  ]);
                  generateCalendarHtml();
                  setLoading(false);
                } catch (error) {
                  console.error('Error al reintentar:', error);
                  setLoading(false);
                  setShowError(true);
                }
              };
              initialize();
            }, 1000);
          }}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado con botón de retroceso */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendario de Eventos</Text>
        
        {isOfflineMode && (
          <View style={styles.offlineIndicator}>
            <Ionicons name="cloud-offline" size={16} color="#FF3A5E" />
            <Text style={styles.offlineText}>Modo Offline</Text>
          </View>
        )}
      </View>

      <WebView
        ref={webViewRef}
        source={{ html: calendarHtml }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
      
      {/* Botón de seleccionar espacio */}
      <TouchableOpacity
        style={[styles.floatingButton, styles.spaceButton]}
        onPress={() => setShowSpaceSelector(true)}
      >
        <Ionicons name="business" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      {/* Botón de filtros */}
      <TouchableOpacity
        style={[styles.floatingButton, styles.filterButton]}
        onPress={() => setShowFilters(true)}
      >
        <Ionicons name="filter" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Botones específicos según rol de usuario */}
      {user?.role === 'artist' && selectedSpace && (
        <TouchableOpacity
          style={[styles.floatingButton, styles.createButton]}
          onPress={() => setShowCreateEvent(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {user?.role === 'manager' && selectedSpace && (
        <TouchableOpacity
          style={[styles.floatingButton, styles.availabilityButton]}
          onPress={() => setIsEditingAvailability(true)}
        >
          <Ionicons name="time" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <FilterModal />
      <SpaceSelectorModal />
      <EventDetailsModal />
      <CreateEventModal />
      <AvailabilityModal />
      <NewAvailabilityModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 15,
    fontSize: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF3A5E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  webview: {
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  spaceButton: {
    backgroundColor: '#FF3A5E',
    right: 16,
    bottom: 160,
  },
  filterButton: {
    backgroundColor: '#FF3A5E',
    right: 16,
    bottom: 88,
  },
  createButton: {
    backgroundColor: '#FF3A5E',
    right: 16,
    bottom: 16,
  },
  availabilityButton: {
    backgroundColor: '#FF3A5E',
    right: 16,
    bottom: 232,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#333333',
  },
  selectedCategory: {
    backgroundColor: '#FF3A5E',
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
  },
  spaceItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#333333',
  },
  selectedSpace: {
    backgroundColor: '#FF3A5E',
  },
  spaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  spaceAddress: {
    fontSize: 14,
    color: '#cccccc',
  },
  eventDetails: {
    marginTop: 10,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventDetailText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  createEventForm: {
    marginBottom: 16,
  },
  eventFormLabel: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 4,
  },
  eventFormValue: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  createEventButton: {
    backgroundColor: '#FF3A5E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createEventButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  offlineText: {
    color: '#FF3A5E',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 15,
  },
  availabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#292929',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  availabilityInfo: {
    flex: 1,
  },
  availabilityDay: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  availabilityTime: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: '#FF3A5E',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 15,
    marginVertical: 15,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#292929',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  dayPicker: {
    backgroundColor: '#292929',
    borderRadius: 8,
    padding: 8,
  },
  dayOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: '#444',
    borderRadius: 6,
  },
  dayOptionSelected: {
    backgroundColor: '#FF3A5E',
  },
  dayOptionText: {
    color: '#FFFFFF',
  },
  dayOptionTextSelected: {
    fontWeight: 'bold',
  },
  timeGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default EventCalendar;
