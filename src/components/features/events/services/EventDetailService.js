/**
 * Este archivo maneja el servicio de detalles del evento
 * - API
 * - Carga
 * - Datos
 */

import axios from 'axios';
import { Alert, Share } from 'react-native';
import { BACKEND_URL } from '../../../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadEventDetails = async (eventId, eventType) => {
  try {
    if (!eventId) {
      throw new Error('ID de evento no proporcionado');
    }

    console.log(`Cargando detalles del evento ${eventId} (tipo: ${eventType})`);
    
    const endpoint = eventType === 'request' 
      ? `${BACKEND_URL}/api/event-requests/${eventId}`
      : `${BACKEND_URL}/api/events/${eventId}`;
    
    const response = await axios.get(endpoint);
    let eventData = null;
    
    if (eventType === 'request') {
      if (response.data && response.data.success && response.data.request) {
        eventData = response.data.request;
      }
    } else {
      if (response.data && response.data.success && response.data.event) {
        eventData = response.data.event;
      }
    }
    
    if (!eventData) {
      throw new Error('No se pudo cargar la información del evento');
    }
    
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
      }
    }
    
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


export const isEventExpired = (event) => {
  if (!event) return false;
  
  const currentDate = new Date();
  
  const eventDate = event.fechaInicio || event.fechaProgramada || event.fecha;
  
  if (eventDate) {
    const eventDateTime = new Date(eventDate);
    
    const endDateTime = new Date(eventDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1);
    
    return currentDate > endDateTime;
  }
  
  if (event.fechaFin) {
    return new Date(event.fechaFin) < currentDate;
  }
  return false;
};

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
export const toggleFavorite = async (event, isFavorite) => {
  try {
    if (!event) {
      console.error('toggleFavorite: Evento no proporcionado');
      Alert.alert('Error', 'No se pudo actualizar favoritos: Evento no válido');
      return isFavorite;
    }
    
    console.log(`toggleFavorite: ${isFavorite ? 'Eliminando de' : 'Agregando a'} favoritos el evento:`, event.id);
    
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
    
    if (!Array.isArray(favorites)) {
      console.error('toggleFavorite: favorites no es un array, reiniciando');
      favorites = [];
    }
    
    if (isFavorite) {
      const newFavorites = favorites.filter(fav => String(fav.id) !== String(event.id));
      console.log(`toggleFavorite: Eliminado. Nuevos favoritos: ${newFavorites.length}`);
      await AsyncStorage.setItem('favoriteEvents', JSON.stringify(newFavorites));
      return false;
    } else {
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

export const checkAttendance = async (eventId, user) => {
  try {
    if (!eventId || !user) {
      console.log('checkAttendance: No hay eventId o user');
      return false;
    }
    
    const userId = user.sub || user.id;
    console.log(`checkAttendance: Verificando asistencia para evento ${eventId} y usuario ${userId}`);
    
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
    }
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout al verificar asistencia')), 3000);
      });
      
      const apiPromise = axios.get(`${BACKEND_URL}/api/event-attendances/confirmed-users/${eventId}`);
      
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      if (response.data && response.data.success && response.data.attendances) {
        console.log(`checkAttendance: Asistentes encontrados: ${response.data.attendances.length}`);
        
        const isAttending = response.data.attendances.some(attendance => 
          String(attendance.userId) === String(userId)
        );
        
        try {
          const attendancesJson = await AsyncStorage.getItem('eventAttendances');
          let attendances = attendancesJson ? JSON.parse(attendancesJson) : [];
          
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
      console.error('Error al verificar asistencia con API:', requestError.message);
      return false;
    }
  } catch (error) {
    console.error('Error general al verificar asistencia:', error);
    return false;
  }
};
