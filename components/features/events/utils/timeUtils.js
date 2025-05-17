// Obtener el rango de tiempo para mostrar en el resumen
export const getTimeRange = (selectedTimeSlots) => {
    if (!selectedTimeSlots || selectedTimeSlots.length === 0) {
      return { start: '', end: '' };
    }
    
    // Ordenar los slots por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    return {
      start: sortedSlots[0].start,
      end: sortedSlots[sortedSlots.length - 1].end
    };
  };
  
  // Calcular la duración total del evento en horas
  export const calculateTotalDuration = (selectedTimeSlots) => {
    if (!selectedTimeSlots || selectedTimeSlots.length === 0) {
      return 0;
    }
    
    // Ordenar los slots por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    // Calcular la duración total
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    return (lastSlot.hour + 1) - firstSlot.hour;
  };