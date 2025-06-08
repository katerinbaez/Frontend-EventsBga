/**
 * Este archivo maneja las utilidades para solicitudes de eventos
 * - Utilidades
 * - Eventos
 * - Formateo
 */

export const getDayName = (dayId) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayId] || 'Desconocido';
  };
  
  export const getCategoryLabel = (category) => {
    const categoryLabels = {
      'musica': 'Música',
      'danza': 'Danza',
      'teatro': 'Teatro',
      'artes_visuales': 'Artes Visuales',
      'literatura': 'Literatura',
      'cine': 'Cine',
      'fotografia': 'Fotografía',
      'otro': 'Otro'
    };
    return categoryLabels[category] || (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'No especificada');
  };
  
  export const calculateEventDuration = (startTime, endTime) => {
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinutes = endTime.getMinutes();
    
    const durationHours = endHour - startHour;
    const durationMinutes = endMinutes - startMinutes;
    
    return `${durationHours} horas y ${durationMinutes} minutos`;
  };
  
  export const formatDate = (date) => {
    if (!date) return '';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };