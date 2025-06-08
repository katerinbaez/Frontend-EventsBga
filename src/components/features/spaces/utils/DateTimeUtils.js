/**
 * Este archivo maneja las utilidades de fecha y hora
 * - UI
 * - Espacios
 * - Fecha
 * - Hora
 * - Utilidades
 */

export const formatDate = (date) => {
  if (!date) return 'Seleccionar fecha';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return 'Hora no disponible';
  
  if (typeof dateString === 'string' && (dateString.length <= 5 || dateString.includes(':') && !dateString.includes('-'))) {
    return dateString;
  }
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString || 'Hora no disponible';
    }
    
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (error) {
    return 'Hora no disponible';
  }
};
