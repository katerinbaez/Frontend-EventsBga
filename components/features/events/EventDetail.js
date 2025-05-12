import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';
import { useAuth } from '../../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EventDetail = ({ route, navigation }) => {
  // Extraer el eventId de los parámetros de la ruta y asegurarse de que sea un número
  const routeParams = route.params || {};
  const eventId = routeParams.eventId ? String(routeParams.eventId) : null;
  const eventType = routeParams.eventType || 'regular'; // Tipo de evento: 'regular' o 'request'
  
  const [event, setEvent] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const { user, token } = useAuth();

  // Función para verificar si un evento ha terminado (fecha vencida)
  const isEventExpired = () => {
    if (!event) return false;
    
    const currentDate = new Date();
    
    // Si hay fecha de fin, verificamos si ya pasó
    if (event.fechaFin) {
      return new Date(event.fechaFin) < currentDate;
    }
    
    // Si no hay fecha de fin, verificamos si la fecha de inicio ya pasó
    if (event.fechaInicio) {
      return new Date(event.fechaInicio) < currentDate;
    }
    
    // Si hay fecha programada (para solicitudes de eventos), verificamos si ya pasó
    if (event.fechaProgramada || event.fecha) {
      const fechaEvento = event.fechaProgramada || event.fecha;
      const horaFin = event.horaFin;
      
      if (horaFin && fechaEvento) {
        // Si tenemos hora de fin, combinar con la fecha
        return new Date(`${fechaEvento}T${horaFin}`) < currentDate;
      }
      
      return new Date(fechaEvento) < currentDate;
    }
    
    // Si no hay ninguna fecha, asumimos que no ha expirado
    return false;
  };

  // Función para verificar si un ID es un UUID
  const isUUID = (id) => {
    // Verificar si es un string y tiene el formato de UUID
    if (typeof id !== 'string') return false;
    
    // Patrón simple para detectar UUIDs (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(id);
  };

  useEffect(() => {
    console.log('EventDetail - Parámetros recibidos:', JSON.stringify(routeParams));
    console.log('EventDetail - ID procesado:', eventId, 'Tipo:', typeof eventId, 'EventType:', eventType);
    
    if (eventId) {
      loadEventDetails();
      if (user) {
        checkIfFavorite();
        checkIfAttending();
      }
    } else {
      setLoading(false);
      console.error('ID de evento no válido:', routeParams);
      Alert.alert('Error', 'No se pudo identificar el evento');
    }
  }, [eventId, eventType, user]);

  useEffect(() => {
    if (eventId && user) {
      checkIfAttending();
    }
  }, [eventId, user]);

  useEffect(() => {
    if (event && user) {
      checkIfAttending();
    }
  }, [event]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      console.log('Cargando detalles del evento con ID:', eventId);
      console.log('Tipo de ID:', typeof eventId);
      console.log('Tipo de evento:', eventType);
      
      let url;
      
      // Determinar la URL según el tipo de evento
      if (eventType === 'request') {
        // Para solicitudes de eventos aprobadas
        url = `${BACKEND_URL}/api/event-requests/${eventId}`;
      } else {
        // Para eventos regulares
        url = `${BACKEND_URL}/api/events/${eventId}`;
      }
      
      console.log('URL de la solicitud:', url);
      
      const response = await axios.get(url);
      
      console.log('Respuesta del servidor:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.success) {
        let eventData;
        
        if (eventType === 'request') {
          // Procesar datos de solicitud de evento
          eventData = response.data.eventRequest;
          
          // Adaptar el formato de los datos para que coincida con el de un evento regular
          if (eventData) {
            eventData = {
              ...eventData,
              fechaInicio: eventData.fecha ? `${eventData.fecha}T${eventData.horaInicio || '00:00:00'}` : null,
              fechaFin: eventData.fecha ? `${eventData.fecha}T${eventData.horaFin || '00:00:00'}` : null,
              fechaProgramada: eventData.fecha,
              space: {
                nombre: eventData.spaceName || 'Espacio Cultural',
                direccion: eventData.spaceAddress || 'Dirección no disponible'
              },
              artist: {
                nombreArtistico: eventData.artistName || 'Artista'
              }
            };
          }
        } else {
          // Evento regular
          eventData = response.data.event;
        }
        
        if (eventData) {
          console.log('Evento cargado correctamente:', eventData);
          setEvent(eventData);
        } else {
          console.error('Datos del evento no encontrados en la respuesta:', response.data);
          Alert.alert(
            'Error', 
            'La información del evento está incompleta. Por favor, inténtelo de nuevo más tarde.'
          );
        }
      } else {
        console.error('Respuesta incompleta del servidor:', response.data);
        Alert.alert(
          'Error', 
          'La información del evento está incompleta. Por favor, inténtelo de nuevo más tarde.'
        );
      }
    } catch (error) {
      console.error('Error al cargar detalles del evento:', error);
      
      // Mostrar mensaje de error más específico
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 404) {
          Alert.alert('Error', 'El evento solicitado no existe o ha sido eliminado.');
        } else {
          Alert.alert(
            'Error', 
            `No se pudieron cargar los detalles del evento. ${error.response.data?.message || 'Intente de nuevo más tarde.'}`
          );
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        Alert.alert(
          'Error de conexión', 
          'No se pudo conectar con el servidor. Verifique su conexión a internet e intente de nuevo.'
        );
      } else {
        // Error al configurar la solicitud
        Alert.alert('Error', 'Ocurrió un error al procesar la solicitud. Intente de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user || !eventId) return;
    
    try {
      const userId = user.id || user.sub || user._id;
      
      // Usar el endpoint correcto según la implementación del backend
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        params: {
          userId: userId,
          targetType: 'event',
          targetId: eventId
        }
      });
      
      // Verificar si el evento está en la lista de favoritos
      if (response.data && Array.isArray(response.data)) {
        const isFav = response.data.some(fav => 
          fav.targetType === 'event' && fav.targetId === eventId
        );
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Error al verificar estado de favorito:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert(
        'Iniciar sesión',
        'Necesitas iniciar sesión para guardar favoritos',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      console.log('Toggle favorito para evento:', eventId);
      const userId = user.id || user.sub || user._id;
      
      if (isFavorite) {
        // Para eliminar un favorito
        console.log('Eliminando de favoritos...');
        await axios.delete(`${BACKEND_URL}/api/favorites`, { 
          data: { 
            userId: userId,
            targetType: 'event',
            targetId: eventId 
          }
        });
      } else {
        // Para agregar un favorito
        console.log('Agregando a favoritos...');
        await axios.post(`${BACKEND_URL}/api/favorites`, {
          userId: userId,
          targetType: 'event',
          targetId: eventId
        });
      }
      
      // Actualizar el estado local
      setIsFavorite(!isFavorite);
      
      // Mostrar confirmación al usuario de manera no intrusiva
      console.log(isFavorite ? 'Evento eliminado de favoritos' : 'Evento agregado a favoritos');
      
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.status, error.response.data);
      }
      
      // Mostrar un mensaje de error más discreto
      Alert.alert(
        'No se pudo actualizar', 
        'Hubo un problema al actualizar tus favoritos'
      );
    }
  };

  const shareEvent = async () => {
    if (!event) return;
    
    try {
      // Crear un enlace profundo para el evento
      const eventLink = `eventsbga://event/${eventId}`;
      
      // Crear un enlace web para el evento (para usuarios que no tienen la app)
      const webLink = `https://eventsbga.com/events/${eventId}`;
      
      // Mensaje de compartir mejorado con enlaces
      const shareMessage = `¡Mira este evento cultural! "${event.titulo}" - ${event.descripcion}\n\nVer detalles: ${webLink}\n\nAbrir en la app: ${eventLink}`;
      
      await Share.share({
        message: shareMessage,
        title: event.titulo,
        url: webLink // Este parámetro funciona en iOS
      });
    } catch (error) {
      console.error('Error al compartir evento:', error);
    }
  };

  const checkIfAttending = async () => {
    if (!user || !eventId) return;
    
    try {
      // Obtener el ID del usuario (asegurar formato Auth0)
      const userId = user.sub || user.id || user._id;
      console.log('ID de usuario para verificar asistencia:', userId);
      
      // Verificar si el evento es una solicitud de evento (con ID UUID)
      const isEventRequestId = eventType === 'request' || isUUID(eventId);
      
      // Si es una solicitud de evento, verificar asistencia en AsyncStorage
      if (isEventRequestId) {
        console.log('Evento con ID UUID, verificando asistencia en AsyncStorage');
        try {
          // Obtener la lista de eventos a los que asiste el usuario desde AsyncStorage
          const attendingEventsJSON = await AsyncStorage.getItem(`@attending_events_${userId}`);
          if (attendingEventsJSON) {
            const attendingEvents = JSON.parse(attendingEventsJSON);
            // Verificar si el evento actual está en la lista
            const isAttending = attendingEvents.includes(eventId);
            console.log(`Usuario ${isAttending ? 'está' : 'no está'} asistiendo al evento UUID ${eventId}`);
            setIsAttending(isAttending);
          } else {
            console.log('No hay eventos guardados en AsyncStorage');
            setIsAttending(false);
          }
        } catch (storageError) {
          console.error('Error al leer de AsyncStorage:', storageError);
          setIsAttending(false);
        }
        return;
      }
      
      // Para eventos regulares, verificar asistencia en el backend
      console.log('Verificando asistencia para evento regular:', eventId);
      
      // Intentar verificar asistencia sin autenticación si no hay token
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } : {};
      
      try {
        // Verificar asistencia usando la ruta check-user
        const response = await axios.get(`${BACKEND_URL}/api/event-attendances/check`, {
          params: {
            eventId: eventId,
            userId: userId
          },
          ...config
        });
        
        if (response.data && response.data.success) {
          console.log('Respuesta de verificación de asistencia:', response.data);
          setIsAttending(response.data.isAttending);
        } else {
          console.log('No se pudo verificar la asistencia, respuesta sin éxito');
          setIsAttending(false);
        }
      } catch (error) {
        console.error('Error al verificar asistencia con la API:', error);
        
        // Si hay un error de autenticación o la API falla, intentar verificar localmente
        try {
          const attendingEventsJSON = await AsyncStorage.getItem(`@attending_events_${userId}`);
          if (attendingEventsJSON) {
            const attendingEvents = JSON.parse(attendingEventsJSON);
            // Verificar si el evento actual está en la lista
            const isAttending = attendingEvents.includes(eventId);
            console.log(`Verificación local: Usuario ${isAttending ? 'está' : 'no está'} asistiendo al evento ${eventId}`);
            setIsAttending(isAttending);
          } else {
            setIsAttending(false);
          }
        } catch (storageError) {
          console.error('Error al leer de AsyncStorage (respaldo):', storageError);
          setIsAttending(false);
        }
      }
    } catch (error) {
      console.error('Error general al verificar asistencia:', error);
      // No mostrar alerta para no interrumpir la experiencia del usuario
      setIsAttending(false);
    }
  };

  const handleAttendEvent = async () => {
    if (!user || !eventId) return;
    
    // Verificar si el evento ha expirado
    if (isEventExpired()) {
      Alert.alert(
        'Evento Finalizado',
        'No es posible registrar asistencia a un evento que ya ha terminado.'
      );
      return;
    }
    
    try {
      // Obtener el ID del usuario
      const userId = user.sub || user.id || user._id;
      
      // Imprimir información de depuración
      console.log('Usuario actual:', user);
      console.log('Token disponible:', token ? 'Sí' : 'No');
      console.log('Longitud del token:', token ? token.length : 0);
      
      // Si no hay token, intentar continuar sin autenticación
      // Esto es solo para depuración, en producción debería requerir autenticación
      if (!token) {
        console.log('No hay token disponible, intentando continuar sin autenticación');
      }
      
      // Configurar los headers con el token (si está disponible)
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } : {};
      
      // Verificar si el evento es una solicitud de evento (con ID UUID)
      const isEventRequestId = eventType === 'request' || isUUID(eventId);
      
      // Si es una solicitud de evento, manejar localmente con AsyncStorage
      if (isEventRequestId) {
        console.log('Evento con ID UUID, se manejará localmente con AsyncStorage');
        
        try {
          // Obtener la lista actual de eventos a los que asiste el usuario
          const attendingEventsJSON = await AsyncStorage.getItem(`@attending_events_${userId}`);
          let attendingEvents = attendingEventsJSON ? JSON.parse(attendingEventsJSON) : [];
          
          if (isAttending) {
            // Cancelar asistencia: eliminar el evento de la lista
            attendingEvents = attendingEvents.filter(id => id !== eventId);
            await AsyncStorage.setItem(`@attending_events_${userId}`, JSON.stringify(attendingEvents));
            
            // Actualizar estado local
            setIsAttending(false);
            Alert.alert(
              'Asistencia Cancelada',
              'Has cancelado tu asistencia al evento exitosamente.'
            );
          } else {
            // Verificar capacidad del evento antes de confirmar asistencia
            if (event && event.asistentesEsperados) {
              // Intentar obtener el conteo actual de asistentes
              try {
                const countResponse = await axios.get(`${BACKEND_URL}/api/event-attendances/count/${eventId}`);
                const currentAttendees = countResponse.data?.count || 0;
                
                // Verificar si se excede la capacidad
                if (currentAttendees >= event.asistentesEsperados) {
                  Alert.alert(
                    'Capacidad Excedida',
                    'Lo sentimos, este evento ha alcanzado su capacidad máxima de asistentes.'
                  );
                  return;
                }
              } catch (countError) {
                console.error('Error al verificar capacidad:', countError);
                // Continuar si no se puede verificar la capacidad
              }
            }
            
            // Confirmar asistencia: añadir el evento a la lista
            if (!attendingEvents.includes(eventId)) {
              attendingEvents.push(eventId);
            }
            await AsyncStorage.setItem(`@attending_events_${userId}`, JSON.stringify(attendingEvents));
            
            // También enviar al backend para mantener un registro (aunque sea virtual)
            try {
              console.log('Enviando solicitud de asistencia al backend para evento UUID:', eventId);
              const response = await axios.post(
                `${BACKEND_URL}/api/event-attendances/confirm`, 
                {
                  eventId: eventId,
                  userId: userId,
                  isRegularUser: true,
                  userName: user.name || user.email || 'Usuario'
                },
                config
              );
              console.log('Respuesta del backend:', response.data);
            } catch (apiError) {
              console.error('Error al registrar asistencia en el backend:', apiError);
              // Continuar incluso si falla la API, ya que tenemos el registro local
            }
            
            // Actualizar estado local
            setIsAttending(true);
            Alert.alert(
              'Asistencia Confirmada',
              'Has confirmado tu asistencia al evento exitosamente.'
            );
          }
        } catch (storageError) {
          console.error('Error al acceder a AsyncStorage:', storageError);
          Alert.alert(
            'Error',
            'No se pudo procesar tu solicitud. Por favor, intenta de nuevo más tarde.'
          );
        }
        
        return;
      }
      
      // Para eventos regulares, usar el backend
      if (isAttending) {
        // Cancelar asistencia
        console.log('Cancelando asistencia para evento regular:', eventId);
        console.log('Configuración de la solicitud:', config);
        
        // Intentar hacer la solicitud sin autenticación si no hay token
        const response = await axios.post(
          `${BACKEND_URL}/api/event-attendances/cancel-user`, 
          {
            eventId: eventId,
            userId: userId
          },
          config
        );
        
        if (response.data && response.data.success) {
          setIsAttending(false);
          Alert.alert(
            'Asistencia Cancelada',
            'Has cancelado tu asistencia al evento exitosamente.'
          );
        } else {
          Alert.alert(
            'Error',
            'No se pudo cancelar tu asistencia. Por favor, intenta de nuevo más tarde.'
          );
        }
      } else {
        // Verificar capacidad del evento antes de confirmar asistencia
        if (event && event.asistentesEsperados) {
          try {
            const countResponse = await axios.get(`${BACKEND_URL}/api/event-attendances/count/${eventId}`);
            const currentAttendees = countResponse.data?.count || 0;
            
            // Verificar si se excede la capacidad
            if (currentAttendees >= event.asistentesEsperados) {
              Alert.alert(
                'Capacidad Excedida',
                'Lo sentimos, este evento ha alcanzado su capacidad máxima de asistentes.'
              );
              return;
            }
          } catch (countError) {
            console.error('Error al verificar capacidad:', countError);
            // Continuar si no se puede verificar la capacidad
          }
        }
        
        // Confirmar asistencia
        console.log('Confirmando asistencia para evento regular:', eventId);
        console.log('Configuración de la solicitud:', config);
        
        // Intentar hacer la solicitud sin autenticación si no hay token
        const response = await axios.post(
          `${BACKEND_URL}/api/event-attendances/confirm-user`, 
          {
            eventId: eventId,
            userId: userId,
            userName: user.name || user.email || 'Usuario',
            isRegularUser: true
          },
          config
        );
        
        if (response.data && response.data.success) {
          setIsAttending(true);
          Alert.alert(
            'Asistencia Confirmada',
            'Has confirmado tu asistencia al evento exitosamente.'
          );
        } else {
          Alert.alert(
            'Error',
            'No se pudo confirmar tu asistencia. Por favor, intenta de nuevo más tarde.'
          );
        }
      }
    } catch (error) {
      console.error('Error al gestionar asistencia:', error);
      console.error('Detalles del error:', error.response?.data || 'No hay detalles disponibles');
      
      // Manejar error de capacidad excedida
      if (error.response && error.response.data && error.response.data.capacityExceeded) {
        Alert.alert(
          'Capacidad Excedida',
          'Lo sentimos, este evento ha alcanzado su capacidad máxima de asistentes.'
        );
      } else if (error.response && error.response.status === 401) {
        Alert.alert(
          'Problema de Autenticación',
          'No se pudo verificar tu identidad. Por favor, cierra sesión y vuelve a iniciar sesión.'
        );
      } else {
        Alert.alert(
          'Error',
          'No se pudo procesar tu solicitud. Por favor, intenta de nuevo más tarde.'
        );
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3A5E" />
        <Text style={styles.loadingText}>Cargando evento...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3A5E" />
        <Text style={styles.errorText}>No se pudo cargar el evento</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.eventTitle}>{event.titulo}</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{event.categoria}</Text>
          </View>
        </View>
        
        {/* Se ha eliminado el contenedor de acciones con el botón de favorito 
            ya que esta funcionalidad ahora está disponible en la lista de eventos */}
      </View>
      
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            {event.isEventRequest && event.fechaInicio 
              ? new Date(event.fechaInicio).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : event.fechaProgramada 
                ? new Date(event.fechaProgramada).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Fecha por confirmar'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            {event.isEventRequest && event.fechaInicio 
              ? new Date(event.fechaInicio).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : event.fechaProgramada 
                ? new Date(event.fechaProgramada).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Hora por confirmar'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            {event.space?.nombre || 'Ubicación por confirmar'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            {event.isEventRequest 
              ? (event.artist?.nombreArtistico || 'Artista por confirmar')
              : (event.space?.nombre || 'Espacio cultural por confirmar')}
          </Text>
        </View>
      </View>
      
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.descriptionText}>{event.descripcion || 'Sin descripción disponible'}</Text>
      </View>
      
      {isEventExpired() ? (
        <View style={styles.expiredEventNotice}>
          <Ionicons name="time" size={24} color="#A0A0A0" />
          <Text style={styles.expiredEventText}>Este evento ya ha terminado</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.registerButton,
            isAttending && styles.attendingButton
          ]}
          onPress={handleAttendEvent}
        >
          <Text style={styles.registerButtonText}>
            {isAttending ? 'Cancelar Asistencia' : 'Asistir'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF3A5E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  titleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#FF3A5E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#CCC',
  },
  descriptionSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#CCC',
  },
  registerButton: {
    backgroundColor: '#FF3A5E',
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  attendingButton: {
    backgroundColor: '#4A90E2',
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expiredEventNotice: {
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  expiredEventText: {
    color: '#A0A0A0',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default EventDetail;
