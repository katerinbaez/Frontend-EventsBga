/**
 * Este archivo maneja las utilidades de fechas para búsqueda
 * - Utilidades
 * - Fechas
 * - Búsqueda
 */

export const adjustDateForTimezone = (date) => {
  if (!date) return null;
  
  const dateString = date.toISOString().split('T')[0];
  console.log('Fecha original:', dateString);
  
  const adjustedDate = new Date(`${dateString}T12:00:00Z`);
  console.log('Fecha ajustada:', adjustedDate.toISOString());
  
  return adjustedDate;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha no disponible';
  }
};

export const formatTime = (dateString) => {
  if (!dateString) return 'Hora no disponible';
  try {
    const date = new Date(dateString);
    console.log(`Formateando hora para: ${dateString}, hora obtenida: ${date.getHours()}:${date.getMinutes()}`);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return 'Hora no disponible';
  }
};

export const getHourOnly = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.getHours();
  } catch (error) {
    console.error('Error al obtener hora:', error);
    return 'N/A';
  }
};

export const calculateEndTime = (dateString) => {
  if (!dateString) return 'Hora no disponible';
  try {
    const startDate = new Date(dateString);
    
    const startHour = startDate.getHours();
    const startMinutes = startDate.getMinutes();
    
    console.log(`Fecha de inicio: ${dateString}`);
    console.log(`Hora de inicio: ${startHour}:${startMinutes}`);
    
    const endHour = (startHour + 1) % 24;
    
    console.log(`Hora de fin calculada: ${endHour}:${startMinutes}`);
    
    const formattedEndHour = endHour.toString().padStart(2, '0');
    const formattedEndMinutes = startMinutes.toString().padStart(2, '0');
    
    return `${formattedEndHour}:${formattedEndMinutes}`;
  } catch (error) {
    console.error('Error al calcular hora de fin:', error);
    return 'Hora no disponible';
  }
};
