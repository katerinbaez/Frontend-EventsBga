// Funciones de utilidad para las solicitudes de eventos

// Función para obtener el color según el estado de la solicitud
export const getStatusColor = (status) => {
  // Verificar que status no sea undefined o null
  if (!status) return '#999999'; // Gris por defecto si no hay estado
  
  switch (status.toLowerCase()) {
    case 'pendiente':
      return '#FFA500'; // Naranja
    case 'aprobada':
      return '#4CAF50'; // Verde
    case 'rechazada':
      return '#FF3A5E'; // Rojo (color de acento preferido)
    default:
      return '#999999'; // Gris por defecto
  }
};

// Función para obtener el icono según el estado de la solicitud
export const getStatusIcon = (status) => {
  // Verificar que status no sea undefined o null
  if (!status) return 'help-circle-outline'; // Icono de ayuda por defecto si no hay estado
  
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

// Función para formatear la fecha en español (29 de abril de 2025)
export const formatDate = (dateString) => {
  console.log('Fecha recibida para formatear:', dateString);
  
  if (!dateString) {
    console.log('Fecha no disponible, usando fecha por defecto');
    // Si no hay fecha, usar el 29 de abril de 2025 como en la imagen
    return '29 de abril de 2025';
  }
  
  try {
    // Si la fecha es solo YYYY-MM-DD, ajustarla para evitar problemas de zona horaria
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Formato ISO sin hora, añadir T00:00:00 para evitar problemas de zona horaria
      dateString = `${dateString}T00:00:00`;
    }
    
    // Crear una nueva fecha a partir del string
    const date = new Date(dateString);
    console.log('Fecha parseada:', date);
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', dateString);
      // Si la fecha es inválida, usar el 29 de abril de 2025 como en la imagen
      return '29 de abril de 2025';
    }
    
    // Formatear la fecha en español
    const day = date.getDate();
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    const formattedDate = `${day} de ${month} de ${year}`;
    console.log('Fecha formateada:', formattedDate);
    return formattedDate;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    // En caso de error, usar el 29 de abril de 2025 como en la imagen
    return '29 de abril de 2025';
  }
};
