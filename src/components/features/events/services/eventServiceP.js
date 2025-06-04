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
    // Ordenar los slots seleccionados por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    // Formatear la fecha para la API
    const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Validar el spaceId - asegurarse de que sea un número entero
    let validSpaceId = 1; // Valor predeterminado si no hay un spaceId válido
    
    if (spaceId) {
      // Si es un UUID (contiene guiones), no lo usamos directamente
      if (typeof spaceId === 'string' && spaceId.includes('-')) {
        console.log('spaceId es un UUID, usando valor predeterminado');
        // Mantenemos el valor predeterminado
      } else {
        // Intentar convertir a número si no es ya un número
        const parsedId = parseInt(spaceId, 10);
        if (!isNaN(parsedId)) {
          validSpaceId = parsedId;
          console.log('spaceId convertido a número:', validSpaceId);
        }
      }
    }
    
    // Preparar los datos para la solicitud
    const eventData = {
      titulo: eventName,
      descripcion: eventDescription,
      fecha: formattedDate,
      horaInicio: firstSlot.start,
      horaFin: lastSlot.end,
      spaceId: validSpaceId, // Usar el ID validado
      managerId: managerId,
      categoria: eventCategory,
      tipoEvento: eventType,
      asistentesEsperados: parseInt(expectedAttendees, 10) || 0,
      requerimientosAdicionales: additionalRequirements || 'Ninguno'
    };
    
    console.log('Enviando datos al endpoint para gestores:', eventData);
    
    // Enviar la solicitud a la ruta específica para gestores
    const response = await axios.post(`${BACKEND_URL}/api/manager-events/create`, eventData);
    console.log('Respuesta del servidor:', response.data);
    
    // Verificar si la respuesta indica éxito
    if (response.data && (response.data.success || response.data.id || response.status === 200 || response.status === 201)) {
      console.log('Evento creado exitosamente:', response.data);
      
      // Bloquear los slots utilizados
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
      
      // Esperar a que se bloqueen todos los slots
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