import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

// Función para actualizar un evento
export const updateEvent = async (formData, managerId) => {
  try {
    // Verificar que el evento tenga un ID válido
    const eventId = formData.id;
    if (!eventId) {
      throw new Error('No se pudo identificar el evento a actualizar');
    }
    
    // Preparar los datos para actualización
    const datosActualizacion = {
      titulo: formData.titulo || '',
      descripcion: formData.descripcion || '',
      asistentesEsperados: parseInt(formData.asistentesEsperados) || 0,
      fechaProgramada: formData.fechaProgramada,
      managerId: formData.managerId || managerId
    };
    
    // Intentar con la primera ruta
    const updateUrl = `${BACKEND_URL}/api/events/${eventId}/update`;
    const response = await axios.post(updateUrl, datosActualizacion);
    
    if (response.data && response.data.success) {
      return { success: true, data: response.data };
    }
    
    throw new Error('No se pudo actualizar el evento');
  } catch (error) {
    // Intentar con ruta alternativa
    try {
      const alternativeUrl = `${BACKEND_URL}/api/manager-events/update/${formData.id}`;
      const alternativeResponse = await axios.post(alternativeUrl, formData);
      
      if (alternativeResponse.data && alternativeResponse.data.success) {
        return { success: true, data: alternativeResponse.data };
      }
    } catch (alternativeError) {
      console.error('Error con la ruta alternativa:', alternativeError.message);
    }
    
    throw new Error('No se pudo actualizar el evento');
  }
};
