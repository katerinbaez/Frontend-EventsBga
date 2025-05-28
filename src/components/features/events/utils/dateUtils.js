// Función auxiliar para obtener el nombre del día a partir de su ID
export const getDayName = (dayIndex) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayIndex];
  };
  
  // Función para formatear una fecha como string YYYY-MM-DD
  export const formatDateToString = (date) => {
    return date.toISOString().split('T')[0];
  };