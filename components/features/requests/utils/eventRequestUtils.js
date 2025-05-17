// Función auxiliar para obtener el nombre del día a partir de su ID
export const getDayName = (dayId) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayId] || 'Desconocido';
  };
  
  // Función para convertir el valor de la categoría a un texto más legible
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
  
  // Función para calcular la duración del evento
  export const calculateEventDuration = (startTime, endTime) => {
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinutes = endTime.getMinutes();
    
    const durationHours = endHour - startHour;
    const durationMinutes = endMinutes - startMinutes;
    
    return `${durationHours} horas y ${durationMinutes} minutos`;
  };
  
  // Función para formatear la fecha
  export const formatDate = (date) => {
    if (!date) return '';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };