/**
 * Este archivo maneja el servicio de programación de eventos
 * - API
 * - Creación
 * - Horarios
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

export const createEvent = async ({
  eventName,
  eventDescription,
  eventDate,
  selectedTimeSlots,
  eventCategory,
  eventType,
  expectedAttendees,
  additionalRequirements,
  managerId,
  spaceId,
  getDayName
}) => {
  try {
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    const formattedDate = eventDate.toISOString().split('T')[0];
    
    const eventData = {
      titulo: eventName,
      descripcion: eventDescription,
      fecha: formattedDate,
      horaInicio: firstSlot.start,
      horaFin: lastSlot.end,
      spaceId: spaceId || 1, 
      managerId: managerId,
      categoria: eventCategory,
      tipoEvento: eventType,
      asistentesEsperados: parseInt(expectedAttendees, 10) || 0,
      requerimientosAdicionales: additionalRequirements || 'Ninguno'
    };
    
    console.log('Enviando datos al endpoint para gestores:', eventData);
    
    const response = await axios.post(`${BACKEND_URL}/api/manager-events/create`, eventData);
    console.log('Respuesta del servidor:', response.data);
    
    if (response.data && (response.data.success || response.data.id || response.status === 200 || response.status === 201)) {
      console.log('Evento creado exitosamente:', response.data);
      
      const blockPromises = sortedSlots.map(slot => {
        return axios.post(`${BACKEND_URL}/api/spaces/block-slot/${managerId}`, {
          spaceId: spaceId || 1, 
          date: formattedDate,
          hour: slot.hour,
          day: new Date(eventDate).getDay(),
          dayName: getDayName(new Date(eventDate).getDay()),
          isRecurring: false
        });
      });
      
      await Promise.all(blockPromises);
      
      return true;
    } else {
      console.error('Error al crear evento:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error al crear evento:', error);
    throw error;
  }
};