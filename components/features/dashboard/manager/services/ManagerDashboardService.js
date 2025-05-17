import axios from 'axios';
import { BACKEND_URL } from '../../../../../constants/config';

const ManagerDashboardService = {
  // Verificar si el usuario tiene un perfil de gestor
  checkManagerProfile: async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${userId}`);
      if (response.data.success) {
        return { success: true, manager: response.data.manager };
      }
      return { success: false, error: 'No se encontró el perfil' };
    } catch (error) {
      if (error.response?.status === 404) {
        // No existe perfil
        return { success: false, error: 'not_found' };
      } else {
        console.error('Error al verificar perfil:', error);
        return { success: false, error: error.message || 'Error desconocido' };
      }
    }
  },
};

export default ManagerDashboardService;
