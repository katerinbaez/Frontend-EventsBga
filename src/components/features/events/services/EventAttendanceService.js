/**
 * Este archivo maneja el servicio de asistencia a eventos
 * - API
 * - Eventos
 * - Gestión
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

export const loadManagerEvents = async (managerId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/manager-events/manager/${managerId}`);
    
    if (response.data && response.data.success) {
      return response.data.events;
    }
    return [];
  } catch (error) {
    console.error('Error al cargar eventos:', error);
    throw error;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha no disponible';
  }
};
