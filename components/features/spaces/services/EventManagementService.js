import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

// Función para cargar eventos de un espacio cultural
export const loadSpaceEvents = async (managerId) => {
  try {
    // Usar el ID decodificado para manejar correctamente los IDs de OAuth
    const managerIdDecoded = decodeURIComponent(managerId);
    console.log('Cargando eventos para el manager:', managerIdDecoded);
    
    // Usar la ruta exacta que encontramos en el backend
    const eventsResponse = await axios.get(`${BACKEND_URL}/api/manager-events/manager/${managerIdDecoded}`);
    
    // El controlador devuelve { success: true, events: [...] }
    if (eventsResponse.data && eventsResponse.data.success) {
      const loadedEvents = eventsResponse.data.events || [];
      console.log('Eventos cargados:', loadedEvents.length);
      
      // Procesar eventos para asegurar que tengan horaInicio
      loadedEvents.forEach(event => {
        if (event.fechaProgramada && !event.horaInicio) {
          try {
            const fecha = new Date(event.fechaProgramada);
            event.horaInicio = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
          } catch (e) {
            console.error(`Error al extraer hora de fechaProgramada: ${e.message}`);
          }
        }
      });
      
      return loadedEvents;
    } else {
      console.log('No se encontraron eventos para este gestor');
      return [];
    }
  } catch (error) {
    console.error('Error al cargar eventos:', error.response?.data || error.message);
    throw error;
  }
};

// Función para cargar categorías
export const loadCategories = async () => {
  try {
    const categoriesResponse = await axios.get(`${BACKEND_URL}/api/categories`);
    return categoriesResponse.data || [];
  } catch (error) {
    console.log('Error al cargar categorías:', error.message);
    return [];
  }
};
