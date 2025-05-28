import axios from 'axios';
import { BACKEND_URL } from '../../../../../constants/config';

const UserDashboardService = {
  // Verificar si el usuario tiene perfil de artista
  checkArtistProfile: async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${userId}`);
      return { success: true, hasProfile: response.data && response.data.success };
    } catch (error) {
      // Silenciamos el error 404 que es normal cuando no existe perfil
      if (error.response?.status !== 404) {
        console.error('Error al verificar perfil de artista:', error);
      }
      return { success: false, error };
    }
  },

  // Verificar si el usuario tiene perfil de gestor cultural
  checkManagerProfile: async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${userId}`);
      return { success: true, hasProfile: response.data && response.data.success };
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error al verificar perfil de gestor cultural:', error);
      }
      return { success: false, error };
    }
  },

  // Obtener notificaciones del usuario
  // La respuesta puede tener diferentes estructuras dependiendo del backend
  getNotifications: async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications/${userId}`);
      console.log('Respuesta de notificaciones:', response.data);
      
      // Verificamos la estructura de la respuesta y adaptamos según sea necesario
      if (response.data && response.data.success && Array.isArray(response.data.notifications)) {
        console.log('Notificaciones cargadas:', response.data.notifications.length);
        return { success: true, notifications: response.data.notifications };
      } else if (response.data && Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        console.log('Notificaciones cargadas (array):', response.data.length);
        return { success: true, notifications: response.data };
      } else if (response.data && response.data.notifications) {
        // Si la respuesta tiene un formato diferente pero contiene notificaciones
        console.log('Notificaciones cargadas (otro formato):', response.data.notifications.length);
        return { success: true, notifications: response.data.notifications };
      } else {
        console.log('No se encontraron notificaciones o formato desconocido');
        return { success: true, notifications: [] };
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      return { success: false, notifications: [], error };
    }
  },
};

export default UserDashboardService;
