import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

const useTimeSlots = () => {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // Mantener para compatibilidad
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  // Función para manejar la selección de múltiples slots de tiempo
  const handleTimeSlotSelection = (slot) => {
    // Si no hay slots seleccionados, simplemente añadir el slot
    if (selectedTimeSlots.length === 0) {
      setSelectedTimeSlots([slot]);
      setSelectedTimeSlot(slot); // Mantener para compatibilidad
      return;
    }
    
    // Ordenar los slots seleccionados por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => {
      return a.hour - b.hour;
    });
    
    // Verificar si el slot seleccionado es consecutivo con los ya seleccionados
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    // Si el slot es una hora antes del primer slot seleccionado
    if (slot.hour === firstSlot.hour - 1) {
      const newSlots = [slot, ...sortedSlots];
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]); // Actualizar para compatibilidad
      return;
    }
    
    // Si el slot es una hora después del último slot seleccionado
    if (slot.hour === lastSlot.hour + 1) {
      const newSlots = [...sortedSlots, slot];
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]); // Mantener el primer slot para compatibilidad
      return;
    }
    
    // Si el slot ya está seleccionado, deseleccionarlo
    if (selectedTimeSlots.some(s => s.hour === slot.hour)) {
      // Si solo hay un slot seleccionado, deseleccionar todo
      if (selectedTimeSlots.length === 1) {
        setSelectedTimeSlots([]);
        setSelectedTimeSlot(null);
        return;
      }
      
      // Si hay múltiples slots, verificar si el slot a deseleccionar rompe la secuencia
      if (slot.hour !== firstSlot.hour && slot.hour !== lastSlot.hour) {
        // No permitir deseleccionar slots intermedios
        Alert.alert(
          'Selección no válida', 
          'Solo puedes deseleccionar el primer o último slot de la secuencia.',
          [{ text: 'Entendido', style: 'cancel' }]
        );
        return;
      }
      
      // Deseleccionar el primer o último slot
      const newSlots = selectedTimeSlots.filter(s => s.hour !== slot.hour);
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]); // Actualizar para compatibilidad
      return;
    }
    
    // Si el slot no es consecutivo, mostrar un mensaje
    Alert.alert(
      'Selección no válida', 
      'Solo puedes seleccionar slots consecutivos. Si necesitas más tiempo, selecciona un slot que sea consecutivo con los ya seleccionados.',
      [{ text: 'Entendido', style: 'cancel' }]
    );
  };
  
  // Calcular la duración total del evento en horas
  const calculateTotalDuration = () => {
    if (selectedTimeSlots.length === 0) return 0;
    
    // Ordenar los slots por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    // Calcular la duración total
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    return (lastSlot.hour + 1) - firstSlot.hour;
  };
  
  // Obtener el slot de inicio y fin para mostrar en el resumen
  const getTimeRange = () => {
    if (selectedTimeSlots.length === 0) return { start: '', end: '' };
    
    // Ordenar los slots por hora
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    return {
      start: sortedSlots[0].start,
      end: sortedSlots[sortedSlots.length - 1].end
    };
  };

  // Resetear los slots
  const resetTimeSlots = () => {
    setSelectedTimeSlots([]);
    setSelectedTimeSlot(null);
    setFilteredTimeSlots([]);
    setLoadingSlots(true);
  };

  return {
    selectedTimeSlots,
    selectedTimeSlot,
    filteredTimeSlots,
    loadingSlots,
    setSelectedTimeSlots,
    setSelectedTimeSlot,
    setFilteredTimeSlots,
    setLoadingSlots,
    handleTimeSlotSelection,
    calculateTotalDuration,
    getTimeRange,
    resetTimeSlots
  };
};

export default useTimeSlots;