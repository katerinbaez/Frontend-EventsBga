/**
 * Este archivo maneja el servicio del dashboard del usuario
 * - Perfiles
 * - Verificación
 * - API
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../../constants/config';

const UserDashboardService = {
  checkArtistProfile: async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${userId}`);
      return { success: true, hasProfile: response.data && response.data.success };
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error al verificar perfil de artista:', error);
      }
      return { success: false, error };
    }
  },

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

  getNotifications: async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications/${userId}`);
      console.log('Respuesta de notificaciones:', response.data);
      
      if (response.data && response.data.success && Array.isArray(response.data.notifications)) {
        console.log('Notificaciones cargadas:', response.data.notifications.length);
        return { success: true, notifications: response.data.notifications };
      } else if (response.data && Array.isArray(response.data)) {
        console.log('Notificaciones cargadas (array):', response.data.length);
        return { success: true, notifications: response.data };
      } else if (response.data && response.data.notifications) {
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
