/**
 * Este archivo maneja el servicio de perfil de gestor
 * - Servicios
 * - Espacios
 * - Gestor
 * - Perfil
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

export const ManagerProfileService = {
  getManagerProfile: async (managerId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${managerId}`);
      return response.data.manager;
    } catch (error) {
      console.error('Error al cargar perfil del gestor:', error);
      throw error;
    }
  },

  updateManagerProfile: async (managerId, profileData) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/managers/profile/${managerId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar perfil del gestor:', error);
      throw error;
    }
  }
};

export default ManagerProfileService;
