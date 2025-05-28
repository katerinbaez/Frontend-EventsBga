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
      let events = response.data.events;
      
      // Ordenar eventos del más reciente al más antiguo
      events = events.sort((a, b) => {
        // Usar la fecha más relevante para cada evento (fechaInicio, fechaProgramada o fecha)
        const dateA = new Date(a.fechaInicio || a.fechaProgramada || a.fecha || 0);
        const dateB = new Date(b.fechaInicio || b.fechaProgramada || b.fecha || 0);
        // Ordenar de más reciente a más antiguo (descendente)
        return dateB - dateA;
      });
      
      if (!artistId) {
        console.warn('No se pudo obtener el ID del artista para verificar asistencias');
        return { events, attendingEvents: {} };
      }
      
      console.warn('Verificando asistencias con artistId:', artistId);
      
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

// Verificar si un evento ha expirado (1 hora después de la hora de inicio)
export const isEventExpired = (event) => {
  const currentDate = new Date();
  
  // Obtener la fecha del evento (puede estar en diferentes propiedades)
  const eventDate = event.fechaInicio || event.fechaProgramada || event.fecha;
  
  if (eventDate) {
    const eventDateTime = new Date(eventDate);
    
    // Calcular la hora de fin (1 hora después del inicio)
    const endDateTime = new Date(eventDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1);
    
    // El evento ha expirado si la hora actual es mayor que la hora de inicio + 1 hora
    return currentDate > endDateTime;
  }
  
  // Si hay fecha de finalización específica, la usamos
  if (event.fechaFin) {
    return new Date(event.fechaFin) < currentDate;
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
