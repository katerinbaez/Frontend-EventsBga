/**
 * Este archivo maneja las utilidades de fechas
 * - Utilidades
 * - Fechas
 * - Formato
 */

export const getDayName = (dayIndex) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayIndex];
  };
  
  export const formatDateToString = (date) => {
    return date.toISOString().split('T')[0];
  };