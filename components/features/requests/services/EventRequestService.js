import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

const EventRequestService = {
  // Cargar disponibilidad para una fecha específica
  getAvailability: async (managerId, date) => {
    return await axios.get(`${BACKEND_URL}/api/cultural-spaces/availability/${managerId}?date=${date}`);
  },
  
  // Cargar slots bloqueados para una fecha específica
  getBlockedSlots: async (managerId, date) => {
    return await axios.get(`${BACKEND_URL}/api/spaces/blocked-slots/${managerId}?date=${date}`);
  },
  
  // Cargar información del espacio cultural
  getSpaceInfo: async (managerId, spaceId) => {
    try {
      // Intentar con la ruta del espacio por ID de gestor
      const culturalSpaceResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/space/manager/${managerId}`);
      if (culturalSpaceResponse.data.success && culturalSpaceResponse.data.space) {
        return culturalSpaceResponse.data.space;
      }
    } catch (error) {
      console.log('No se pudo obtener el espacio por ID de gestor, intentando con ID de espacio');
    }
    
    // Si no funcionó, intentar con la ruta directa del espacio
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
  
  // Enviar solicitud de evento
  submitEventRequest: async (requestData) => {
    return await axios.post(`${BACKEND_URL}/api/event-requests/artist-submit`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export default EventRequestService;