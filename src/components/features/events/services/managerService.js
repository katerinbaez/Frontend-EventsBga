/**
 * Este archivo maneja el servicio del gestor
 * - API
 * - Perfil
 * - Carga
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

export const loadManagerProfile = async (userId) => {
  if (!userId) {
    console.error('No se puede cargar perfil sin userId');
    return null;
  }
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${userId}`);
    if (response.data && response.data.manager) {
      return response.data.manager;
    }
    return null;
  } catch (error) {
    console.error('Error al cargar perfil del gestor:', error);
    throw error;
  }
};