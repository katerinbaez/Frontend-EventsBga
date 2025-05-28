// Utilidades para el manejo de fechas en la búsqueda de eventos

/**
 * Ajusta la fecha para evitar problemas de zona horaria
 * @param {Date} date - Fecha a ajustar
 * @returns {Date} Fecha ajustada
 */
export const adjustDateForTimezone = (date) => {
  if (!date) return null;
  
  // Crear una nueva fecha usando el formato YYYY-MM-DD para evitar problemas de zona horaria
  const dateString = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  console.log('Fecha original:', dateString);
  
  // Crear una nueva fecha con la hora establecida a mediodía en UTC
  const adjustedDate = new Date(`${dateString}T12:00:00Z`);
  console.log('Fecha ajustada:', adjustedDate.toISOString());
  
  return adjustedDate;
};

/**
 * Formatea una fecha en formato legible
 * @param {string} dateString - Fecha en formato string
 * @returns {string} Fecha formateada
 */
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

/**
 * Formatea una hora en formato legible
 * @param {string} dateString - Fecha en formato string
 * @returns {string} Hora formateada
 */
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

/**
 * Obtiene solo la hora en formato de 24 horas
 * @param {string} dateString - Fecha en formato string
 * @returns {number|string} Hora en formato 24 horas
 */
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

/**
 * Calcula la hora de fin (sumando exactamente 1 hora)
 * @param {string} dateString - Fecha en formato string
 * @returns {string} Hora de fin formateada
 */
export const calculateEndTime = (dateString) => {
  if (!dateString) return 'Hora no disponible';
  try {
    // Crear una nueva fecha basada en la fecha de inicio
    const startDate = new Date(dateString);
    
    // Obtener componentes individuales de la hora
    const startHour = startDate.getHours();
    const startMinutes = startDate.getMinutes();
    
    console.log(`Fecha de inicio: ${dateString}`);
    console.log(`Hora de inicio: ${startHour}:${startMinutes}`);
    
    // Calcular la hora de fin (hora de inicio + 1)
    const endHour = (startHour + 1) % 24; // Usar módulo 24 para manejar el caso de 23:00 -> 00:00
    
    console.log(`Hora de fin calculada: ${endHour}:${startMinutes}`);
    
    // Formatear manualmente la hora de fin
    const formattedEndHour = endHour.toString().padStart(2, '0');
    const formattedEndMinutes = startMinutes.toString().padStart(2, '0');
    
    return `${formattedEndHour}:${formattedEndMinutes}`;
  } catch (error) {
    console.error('Error al calcular hora de fin:', error);
    return 'Hora no disponible';
  }
};
