/**
 * Este archivo maneja las utilidades de notificación
 * - Utilidades
 * - Notificaciones
 * - Colores
 */

export const getStatusColor = (type) => {
    switch (type) {
      case 'roleApproved':
        return '#34C759';
      case 'roleRejected':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };