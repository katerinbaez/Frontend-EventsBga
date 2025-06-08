/**
 * Este archivo maneja el servicio del dashboard del artista
 * - Perfil
 * - Verificación
 * - API
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../../constants/config';

const ArtistDashboardService = {
  checkArtistProfile: async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${userId}`);
      if (response.data.success) {
        return { success: true, artist: response.data.artist };
      }
      return { success: false, error: 'No se encontró el perfil' };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: false, error: 'not_found' };
      } else {
        console.error('Error al verificar perfil:', error);
        return { success: false, error: error.message || 'Error desconocido' };
      }
    }
  },
};

export default ArtistDashboardService;
