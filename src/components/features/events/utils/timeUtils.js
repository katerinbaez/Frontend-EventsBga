/**
 * Este archivo maneja las utilidades de tiempo
 * - Utilidades
 * - Tiempo
 * - Rangos
 */

export const getTimeRange = (selectedTimeSlots) => {
    if (!selectedTimeSlots || selectedTimeSlots.length === 0) {
      return { start: '', end: '' };
    }
    
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    return {  
      start: sortedSlots[0].start,
      end: sortedSlots[sortedSlots.length - 1].end
    };
  };
  
  export const calculateTotalDuration = (selectedTimeSlots) => {
    if (!selectedTimeSlots || selectedTimeSlots.length === 0) {
      return 0;
    }
    
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    return (lastSlot.hour + 1) - firstSlot.hour;
  };