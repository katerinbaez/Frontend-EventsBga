import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

// Cargar el perfil del artista
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

// Cargar eventos disponibles
export const loadAvailableEvents = async (artistId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/event-attendances/available-events`);
    
    if (response.data && response.data.success) {
      const events = response.data.events;
      
      if (!artistId) {
        console.error('No se pudo obtener el ID del artista para verificar asistencias');
        return { events, attendingEvents: {} };
      }
      
      console.log('Verificando asistencias con artistId:', artistId);
      
      // Verificar a cuáles eventos ya ha confirmado asistencia el artista
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
          console.error(`Error al verificar asistencia para evento ${event.id}:`, error);
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

// Confirmar asistencia a un evento
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

// Cancelar asistencia a un evento
export const cancelAttendance = async (eventId, artistId) => {
  try {
    if (!artistId) {
      throw new Error('No se pudo obtener el ID del artista');
    }
    
    // Usamos POST en lugar de DELETE ya que es lo que espera el backend
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

// Verificar si un evento ha expirado
export const isEventExpired = (event) => {
  const currentDate = new Date();
  
  // Si hay fecha de finalización, verificamos si ya pasó
  if (event.fechaFin) {
    return new Date(event.fechaFin) < currentDate;
  }
  
  // Si hay fecha de inicio, verificamos si ya pasó
  if (event.fechaInicio) {
    return new Date(event.fechaInicio) < currentDate;
  }
  
  // Si hay fecha programada (para solicitudes de eventos), verificamos si ya pasó
  if (event.fechaProgramada) {
    return new Date(event.fechaProgramada) < currentDate;
  }
  
  // Si no hay ninguna fecha, asumimos que no ha expirado
  return false;
};

// Formatear fecha
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
