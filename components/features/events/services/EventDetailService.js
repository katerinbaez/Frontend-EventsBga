import axios from 'axios';
import { Alert, Share } from 'react-native';
import { BACKEND_URL } from '../../../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Carga los detalles de un evento específico
 * @param {string} eventId - ID del evento a cargar
 * @param {string} eventType - Tipo de evento ('regular' o 'request')
 * @returns {Promise<Object>} - Detalles del evento
 */
export const loadEventDetails = async (eventId, eventType) => {
  try {
    if (!eventId) {
      throw new Error('ID de evento no proporcionado');
    }

    console.log(`Cargando detalles del evento ${eventId} (tipo: ${eventType})`);
    
    // Determinar la URL del endpoint según el tipo de evento
    const endpoint = eventType === 'request' 
      ? `${BACKEND_URL}/api/event-requests/${eventId}`
      : `${BACKEND_URL}/api/events/${eventId}`;
    
    const response = await axios.get(endpoint);
    let eventData = null;
    
    if (eventType === 'request') {
      // Para solicitudes de eventos, el evento está en response.data.request
      if (response.data && response.data.success && response.data.request) {
        eventData = response.data.request;
      }
    } else {
      // Para eventos regulares, el evento está en response.data.event
      if (response.data && response.data.success && response.data.event) {
        eventData = response.data.event;
      }
    }
    
    if (!eventData) {
      throw new Error('No se pudo cargar la información del evento');
    }
    
    // Si el evento tiene un espacioId o spaceId pero no tiene la información completa del espacio,
    // intentamos cargar los detalles del espacio
    if ((eventData.espacioId || eventData.spaceId) && !eventData.space?.nombre) {
      try {
        const spaceId = eventData.espacioId || eventData.spaceId;
        console.log(`Cargando detalles del espacio ${spaceId}`);
        
        const spaceResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/${spaceId}`);
        
        if (spaceResponse.data && spaceResponse.data.success && spaceResponse.data.space) {
          eventData.space = spaceResponse.data.space;
          console.log('Detalles del espacio cargados correctamente');
        }
      } catch (spaceError) {
        console.error('Error al cargar detalles del espacio:', spaceError);
        // No lanzamos error aquí, solo registramos el problema
      }
    }
    
    // Asegurarnos de que la ubicación esté disponible
    if (eventData.space?.nombre && !eventData.ubicacion) {
      eventData.ubicacion = eventData.space.nombre;
    }
    
    console.log('Evento cargado:', eventData);
    return eventData;
  } catch (error) {
    console.error('Error al cargar detalles del evento:', error);
    throw error;
  }
};

/**
 * Verifica si un evento ha expirado (hora exacta vencida, incluso en la fecha actual)
 * @param {Object} event - Evento a verificar
 * @returns {boolean} - true si el evento ha expirado
 */
export const isEventExpired = (event) => {
  if (!event) return false;
  
  const now = new Date(); // Hora actual
  
  // Extraer la hora y minutos actuales
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  
  // Si el evento tiene fecha de fin específica
  if (event.fechaFin) {
    const fechaFinDate = new Date(event.fechaFin);
    
    // Si la fecha es anterior a hoy, el evento ya terminó
    if (new Date(fechaFinDate.setHours(0,0,0,0)) < new Date(now.setHours(0,0,0,0))) {
      return true;
    }
    
    // Reiniciar las fechas porque setHours modifica el objeto original
    now.setHours(currentHours, currentMinutes);
    fechaFinDate.setHours(0,0,0,0);
    
    // Si la fecha es hoy, verificar si la hora ya pasó
    const fechaFinSoloFecha = new Date(fechaFinDate).setHours(0,0,0,0);
    const nowSoloFecha = new Date(now).setHours(0,0,0,0);
    
    if (fechaFinSoloFecha === nowSoloFecha) {
      const finHours = new Date(event.fechaFin).getHours();
      const finMinutes = new Date(event.fechaFin).getMinutes();
      const finTotalMinutes = finHours * 60 + finMinutes;
      
      return currentTotalMinutes >= finTotalMinutes;
    }
    
    return false; // La fecha es futura
  }
  
  // Si el evento tiene fecha de inicio
  if (event.fechaInicio) {
    const fechaInicioDate = new Date(event.fechaInicio);
    
    // Calcular la hora de fin (1 hora después si no hay duración especificada)
    const duracionMinutos = event.duracion || 60; // 1 hora por defecto
    
    // Si la fecha es anterior a hoy, el evento ya terminó
    if (new Date(fechaInicioDate.setHours(0,0,0,0)) < new Date(now.setHours(0,0,0,0))) {
      return true;
    }
    
    // Reiniciar las fechas porque setHours modifica el objeto original
    now.setHours(currentHours, currentMinutes);
    fechaInicioDate.setHours(0,0,0,0);
    
    // Si la fecha es hoy, verificar si la hora de fin ya pasó
    const fechaInicioSoloFecha = new Date(fechaInicioDate).setHours(0,0,0,0);
    const nowSoloFecha = new Date(now).setHours(0,0,0,0);
    
    if (fechaInicioSoloFecha === nowSoloFecha) {
      const inicioHours = new Date(event.fechaInicio).getHours();
      const inicioMinutes = new Date(event.fechaInicio).getMinutes();
      const inicioTotalMinutes = inicioHours * 60 + inicioMinutes;
      const finTotalMinutes = inicioTotalMinutes + duracionMinutos;
      
      return currentTotalMinutes >= finTotalMinutes;
    }
    
    return false; // La fecha es futura
  }
  
  // Si hay fecha programada (para solicitudes de eventos)
  if (event.fechaProgramada) {
    const fechaProgramadaDate = new Date(event.fechaProgramada);
    
    // Si la fecha es anterior a hoy, el evento ya terminó
    if (new Date(fechaProgramadaDate.setHours(0,0,0,0)) < new Date(now.setHours(0,0,0,0))) {
      return true;
    }
    
    // Reiniciar las fechas porque setHours modifica el objeto original
    now.setHours(currentHours, currentMinutes);
    fechaProgramadaDate.setHours(0,0,0,0);
    
    // Si la fecha es hoy, verificar si la hora de fin (1 hora después) ya pasó
    const fechaProgramadaSoloFecha = new Date(fechaProgramadaDate).setHours(0,0,0,0);
    const nowSoloFecha = new Date(now).setHours(0,0,0,0);
    
    if (fechaProgramadaSoloFecha === nowSoloFecha) {
      const programadaHours = new Date(event.fechaProgramada).getHours();
      const programadaMinutes = new Date(event.fechaProgramada).getMinutes();
      const programadaTotalMinutes = programadaHours * 60 + programadaMinutes;
      const finTotalMinutes = programadaTotalMinutes + 60; // 1 hora por defecto
      
      return currentTotalMinutes >= finTotalMinutes;
    }
    
    return false; // La fecha es futura
  }
  
  // Si no hay ninguna fecha, asumimos que no ha expirado
  return false;
};

/**
 * Formatea una fecha en formato legible
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha no disponible';
  }
};

/**
 * Comparte un evento a través de las opciones de compartir del dispositivo
 * @param {Object} event - Evento a compartir
 */
export const shareEvent = async (event) => {
  try {
    if (!event) return;
    
    const eventTitle = event.titulo || event.nombre || 'Evento cultural';
    const eventDate = formatDate(event.fechaProgramada || event.fechaInicio);
    const eventLocation = event.ubicacion || event.lugar || 'Ubicación no especificada';
    
    const shareMessage = `¡Te invito a este evento cultural!\n\n${eventTitle}\n\nFecha: ${eventDate}\nLugar: ${eventLocation}\n\nDescripción: ${event.descripcion || 'Sin descripción'}\n\nCompartido desde la app EventosBGA`;
    
    await Share.share({
      message: shareMessage,
      title: eventTitle
    });
  } catch (error) {
    console.error('Error al compartir evento:', error);
    Alert.alert('Error', 'No se pudo compartir el evento');
  }
};

/**
 * Guarda o elimina un evento de favoritos
 * @param {Object} event - Evento a guardar/eliminar
 * @param {boolean} isFavorite - Si el evento ya es favorito
 * @returns {Promise<boolean>} - Nuevo estado de favorito
 */
export const toggleFavorite = async (event, isFavorite) => {
  try {
    if (!event) {
      console.error('toggleFavorite: Evento no proporcionado');
      Alert.alert('Error', 'No se pudo actualizar favoritos: Evento no válido');
      return isFavorite;
    }
    
    console.log(`toggleFavorite: ${isFavorite ? 'Eliminando de' : 'Agregando a'} favoritos el evento:`, event.id);
    
    // Obtener favoritos actuales
    const favoritesJson = await AsyncStorage.getItem('favoriteEvents');
    let favorites = [];
    
    if (favoritesJson) {
      try {
        favorites = JSON.parse(favoritesJson);
        console.log(`toggleFavorite: Favoritos actuales: ${favorites.length}`);
      } catch (parseError) {
        console.error('toggleFavorite: Error al analizar favoritos:', parseError);
        favorites = [];
      }
    }
    
    // Asegurarse de que favorites sea un array
    if (!Array.isArray(favorites)) {
      console.error('toggleFavorite: favorites no es un array, reiniciando');
      favorites = [];
    }
    
    if (isFavorite) {
      // Eliminar de favoritos
      const newFavorites = favorites.filter(fav => String(fav.id) !== String(event.id));
      console.log(`toggleFavorite: Eliminado. Nuevos favoritos: ${newFavorites.length}`);
      await AsyncStorage.setItem('favoriteEvents', JSON.stringify(newFavorites));
      return false;
    } else {
      // Agregar a favoritos
      const eventToSave = {
        id: event.id,
        titulo: event.titulo || event.nombre || 'Evento sin título',
        descripcion: event.descripcion || '',
        fechaProgramada: event.fechaProgramada || event.fechaInicio || new Date().toISOString(),
        categoria: event.categoria || { nombre: 'General' },
        ubicacion: event.ubicacion || event.lugar || 'Sin ubicación'
      };
      
      console.log('toggleFavorite: Guardando evento:', eventToSave);
      favorites.push(eventToSave);
      await AsyncStorage.setItem('favoriteEvents', JSON.stringify(favorites));
      console.log(`toggleFavorite: Agregado. Total favoritos: ${favorites.length}`);
      return true;
    }
  } catch (error) {
    console.error('toggleFavorite: Error general al gestionar favoritos:', error);
    Alert.alert('Error', 'No se pudo actualizar favoritos. Intenta de nuevo más tarde.');
    return isFavorite;
  }
};

/**
 * Verifica si un evento está en favoritos
 * @param {string} eventId - ID del evento
 * @returns {Promise<boolean>} - true si el evento es favorito
 */
export const checkIsFavorite = async (eventId) => {
  try {
    if (!eventId) return false;
    
    const favoritesJson = await AsyncStorage.getItem('favoriteEvents');
    if (!favoritesJson) return false;
    
    const favorites = JSON.parse(favoritesJson);
    return favorites.some(fav => String(fav.id) === String(eventId));
  } catch (error) {
    console.error('Error al verificar favoritos:', error);
    return false;
  }
};

/**
 * Registra asistencia a un evento
 * @param {string} eventId - ID del evento
 * @param {Object} user - Usuario actual
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const registerAttendance = async (eventId, user) => {
  try {
    if (!eventId || !user) {
      throw new Error('Faltan datos para registrar asistencia');
    }
    
    const userId = user.sub || user.id;
    
    const response = await axios.post(`${BACKEND_URL}/api/event-attendances/confirm-user`, {
      eventId,
      userId,
      userName: user.name || user.nickname || user.email,
      estado: 'confirmado'
    });
    
    if (response.data && response.data.success) {
      return { success: true, message: 'Has confirmado tu asistencia al evento' };
    } else {
      throw new Error(response.data.message || 'No se pudo confirmar la asistencia');
    }
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    throw error;
  }
};

/**
 * Cancela asistencia a un evento
 * @param {string} eventId - ID del evento
 * @param {Object} user - Usuario actual
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const cancelAttendance = async (eventId, user) => {
  try {
    if (!eventId || !user) {
      throw new Error('Faltan datos para cancelar asistencia');
    }
    
    const userId = user.sub || user.id;
    
    const response = await axios.post(`${BACKEND_URL}/api/event-attendances/cancel-user`, {
      eventId,
      userId
    });
    
    if (response.data && response.data.success) {
      return { success: true, message: 'Has cancelado tu asistencia al evento' };
    } else {
      throw new Error(response.data.message || 'No se pudo cancelar la asistencia');
    }
  } catch (error) {
    console.error('Error al cancelar asistencia:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario está asistiendo a un evento
 * @param {string} eventId - ID del evento
 * @param {Object} user - Usuario actual
 * @returns {Promise<boolean>} - true si el usuario está asistiendo
 */
export const checkAttendance = async (eventId, user) => {
  // Evitar que cualquier error se propague
  try {
    // Validaciones básicas
    if (!eventId || !user) {
      console.log('checkAttendance: No hay eventId o user');
      return false;
    }
    
    const userId = user.sub || user.id;
    console.log(`checkAttendance: Verificando asistencia para evento ${eventId} y usuario ${userId}`);
    
    // Intentar usar AsyncStorage primero como alternativa más segura
    try {
      const attendancesJson = await AsyncStorage.getItem('eventAttendances');
      if (attendancesJson) {
        const attendances = JSON.parse(attendancesJson);
        const isAttending = attendances.some(att => 
          String(att.eventId) === String(eventId) && 
          String(att.userId) === String(userId)
        );
        console.log(`checkAttendance (local): Usuario asistiendo: ${isAttending}`);
        return isAttending;
      }
    } catch (storageError) {
      console.log('No se pudo verificar asistencia local:', storageError);
      // Continuar con el intento de API
    }
    
    // Intentar con la API, pero con un timeout para evitar bloqueos
    try {
      // Crear una promesa con timeout para evitar esperas largas
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout al verificar asistencia')), 3000);
      });
      
      // Crear la promesa de la petición API
      const apiPromise = axios.get(`${BACKEND_URL}/api/event-attendances/confirmed-users/${eventId}`);
      
      // Usar Promise.race para tomar la que se resuelva primero
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      if (response.data && response.data.success && response.data.attendances) {
        console.log(`checkAttendance: Asistentes encontrados: ${response.data.attendances.length}`);
        
        // Verificar si el usuario está en la lista de asistentes
        const isAttending = response.data.attendances.some(attendance => 
          String(attendance.userId) === String(userId)
        );
        
        // Guardar en AsyncStorage para futuras referencias
        try {
          const attendancesJson = await AsyncStorage.getItem('eventAttendances');
          let attendances = attendancesJson ? JSON.parse(attendancesJson) : [];
          
          // Si está asistiendo y no está en la lista local, agregarlo
          if (isAttending && !attendances.some(att => 
            String(att.eventId) === String(eventId) && 
            String(att.userId) === String(userId)
          )) {
            attendances.push({ eventId, userId, date: new Date().toISOString() });
            await AsyncStorage.setItem('eventAttendances', JSON.stringify(attendances));
          }
        } catch (saveError) {
          console.log('Error al guardar asistencia local:', saveError);
        }
        
        console.log(`checkAttendance: Usuario asistiendo: ${isAttending}`);
        return isAttending;
      }
      
      console.log('checkAttendance: No hay datos de asistencia en la respuesta');
      return false;
    } catch (requestError) {
      // Capturar cualquier error de la API y simplemente devolver false
      console.error('Error al verificar asistencia con API:', requestError.message);
      return false;
    }
  } catch (error) {
    // Capturar cualquier error inesperado
    console.error('Error general al verificar asistencia:', error);
    return false;
  }
};
