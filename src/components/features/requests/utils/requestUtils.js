/**
 * Este archivo maneja las utilidades para las solicitudes
 * - Utilidades
 * - Solicitudes
 * - Formateo
 */

export const getStatusColor = (status) => {
  if (!status) return '#999999';
  
  switch (status.toLowerCase()) {
    case 'pendiente':
      return '#FFA500';
    case 'aprobada':
      return '#4CAF50';
    case 'rechazada':
      return '#FF3A5E';
    default:
      return '#999999';
  }
};

export const getStatusIcon = (status) => {
  if (!status) return 'help-circle-outline';
  
  switch (status.toLowerCase()) {
    case 'pendiente':
      return 'time-outline';
    case 'aprobada':
      return 'checkmark-circle-outline';
    case 'rechazada':
      return 'close-circle-outline';
    default:
      return 'help-circle-outline';
  }
};

export const formatDate = (dateString) => {
  console.log('Fecha recibida para formatear:', dateString);
  
  if (!dateString) {
    console.log('Fecha no disponible, usando fecha por defecto');
    return '29 de abril de 2025';
  }
  
  try {
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateString = `${dateString}T00:00:00`;
    }
    
    const date = new Date(dateString);
    console.log('Fecha parseada:', date);
    
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', dateString);
      return '29 de abril de 2025';
    }
    
    const day = date.getDate();
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    const formattedDate = `${day} de ${month} de ${year}`;
    console.log('Fecha formateada:', formattedDate);
    return formattedDate;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '29 de abril de 2025';
  }
};
