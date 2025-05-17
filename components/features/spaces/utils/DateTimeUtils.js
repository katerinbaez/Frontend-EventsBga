// Función para formatear una fecha
export const formatDate = (date) => {
  if (!date) return 'Seleccionar fecha';
  
  // Si es un string, convertir a objeto Date
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Formatear como DD/MM/YYYY
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Función para extraer la hora de una fecha
export const formatTime = (dateString) => {
  if (!dateString) return 'Hora no disponible';
  
  // Si es solo una hora (formato HH:MM), devolverla directamente
  if (typeof dateString === 'string' && (dateString.length <= 5 || dateString.includes(':') && !dateString.includes('-'))) {
    return dateString;
  }
  
  try {
    // Si es una fecha completa, extraer la hora
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return dateString || 'Hora no disponible';
    }
    
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (error) {
    return 'Hora no disponible';
  }
};
