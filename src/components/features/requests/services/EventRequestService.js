/**
 * Este archivo maneja el servicio de solicitud de evento
 * - Servicios
 * - Eventos
 * - Solicitud
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

const EventRequestService = {
  getAvailability: async (managerId, date) => {
    return await axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${date}`);
  },
  
  getBlockedSlots: async (managerId, date) => {
    return await axios.get(`${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?date=${date}`);
  },
  
  getSpaceInfo: async (managerId, spaceId) => {
    try {
      const culturalSpaceResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/space/manager/${managerId}`);
      if (culturalSpaceResponse.data.success && culturalSpaceResponse.data.space) {
        return culturalSpaceResponse.data.space;
      }
    } catch (error) {
      console.log('No se pudo obtener el espacio por ID de gestor, intentando con ID de espacio');
    }
    
    if (spaceId) {
      try {
        const directSpaceResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/${spaceId}`);
        if (directSpaceResponse.data.success && directSpaceResponse.data.space) {
          return directSpaceResponse.data.space;
        }
      } catch (error) {
        console.log('No se pudo obtener el espacio por ID directo');
      }
    }
    
    return null;
  },
  
  submitEventRequest: async (requestData) => {
    return await axios.post(`${BACKEND_URL}/api/event-requests/artist-submit`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export default EventRequestService;