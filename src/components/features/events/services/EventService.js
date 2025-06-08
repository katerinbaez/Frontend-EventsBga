/**
 * Este archivo maneja el servicio de eventos
 * - API
 * - Perfiles
 * - Carga
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

export const loadArtistProfile = async (artistId) => {
  try {
    console.log('Intentando cargar perfil de artista con ID:', artistId);
    
    if (!artistId) {
      console.error('No se pudo obtener el ID del artista');
      return null;
    }
    
    const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${artistId}`);
    console.log('Respuesta completa del perfil:', response.data);
    
    if (response.data && response.data.success) {
      console.log('Perfil de artista cargado:', response.data.artist);
      console.log('Nombre artístico:', response.data.artist?.nombreArtistico);
      return response.data.artist;
    } else {
      console.log('No se pudo cargar el perfil del artista:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error al cargar el perfil del artista:', error.response?.data || error.message);
    return null;
  }
};

export const loadAvailableEvents = async (artistId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/event-attendances/available-events`);
    
    if (response.data && response.data.success) {
      let events = response.data.events;
      
      events = events.sort((a, b) => {
        const dateA = new Date(a.fechaInicio || a.fechaProgramada || a.fecha || 0);
        const dateB = new Date(b.fechaInicio || b.fechaProgramada || b.fecha || 0);
        return dateB - dateA;
      });
      
      if (!artistId) {
        console.warn('No se pudo obtener el ID del artista para verificar asistencias');
        return { events, attendingEvents: {} };
      }
      
      console.warn('Verificando asistencias con artistId:', artistId);
      
      const attendanceMap = {};
      await Promise.all(events.map(async (event) => {
        try {
          const attendanceResponse = await axios.get(`${BACKEND_URL}/api/event-attendances/confirmed-artists/${event.id}`);
          if (attendanceResponse.data && attendanceResponse.data.success) {
            const isAttending = attendanceResponse.data.attendances.some(
              attendance => attendance.artistId === artistId
            );
            attendanceMap[event.id] = isAttending;
          }
        } catch (error) {
          console.warn(`Error al verificar asistencia para evento ${event.id}:`, error);
        }
      }));
      
      return { events, attendingEvents: attendanceMap };
    }
    
    return { events: [], attendingEvents: {} };
  } catch (error) {
    console.error('Error al cargar eventos disponibles:', error);
    throw error;
  }
};

export const attendEvent = async (eventId, artistId, artistProfile) => {
  try {
    if (!artistId) {
      throw new Error('No se pudo obtener el ID del artista');
    }
    
    if (!artistProfile || !artistProfile.nombreArtistico) {
      throw new Error('No se pudo obtener el nombre artístico. Por favor, completa tu perfil de artista primero.');
    }
    
    const attendanceData = {
      eventId: eventId,
      artistId: artistId,
      nombreArtista: artistProfile.nombreArtistico,
      estado: 'confirmado'
    };
    
    const response = await axios.post(`${BACKEND_URL}/api/event-attendances/confirm`, attendanceData);
    
    if (response.data && response.data.success) {
      return { success: true, message: 'Has confirmado tu asistencia al evento' };
    } else {
      throw new Error(response.data.message || 'No se pudo confirmar la asistencia');
    }
  } catch (error) {
    console.error('Error al confirmar asistencia:', error);
    throw error;
  }
};

export const cancelAttendance = async (eventId, artistId) => {
  try {
    if (!artistId) {
      throw new Error('No se pudo obtener el ID del artista');
    }
    
    const response = await axios.post(`${BACKEND_URL}/api/event-attendances/cancel`, {
      eventId,
      artistId
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

export const isEventExpired = (event) => {
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
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha no disponible';
  }
};
