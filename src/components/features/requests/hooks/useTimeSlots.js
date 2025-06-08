/**
 * Este archivo maneja el hook de slots de tiempo
 * - Hooks
 * - Tiempo
 * - Slots
 */

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

const useTimeSlots = () => {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
const [error, setError] = useState(null);
  const handleTimeSlotSelection = (slot) => {
    if (selectedTimeSlots.length === 0) {
      setSelectedTimeSlots([slot]);
      setSelectedTimeSlot(slot);
      return;
    }
    
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => {
      return a.hour - b.hour;
    });
    
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    if (slot.hour === firstSlot.hour - 1) {
      const newSlots = [slot, ...sortedSlots];
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]);
      return;
    }
    
    if (slot.hour === lastSlot.hour + 1) {
      const newSlots = [...sortedSlots, slot];
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]);
      return;
    }
    
    if (selectedTimeSlots.some(s => s.hour === slot.hour)) {
      if (selectedTimeSlots.length === 1) {
        setSelectedTimeSlots([]);
        setSelectedTimeSlot(null);
        return;
      }
      
      if (slot.hour !== firstSlot.hour && slot.hour !== lastSlot.hour) {
        Alert.alert(
          'Selección no válida', 
          'Solo puedes deseleccionar el primer o último slot de la secuencia.',
          [{ text: 'Entendido', style: 'cancel' }]
        );
        return;
      }
      
      const newSlots = selectedTimeSlots.filter(s => s.hour !== slot.hour);
      setSelectedTimeSlots(newSlots);
      setSelectedTimeSlot(newSlots[0]);
      return;
    }
    
    Alert.alert(
      'Selección no válida', 
      'Solo puedes seleccionar slots consecutivos. Si necesitas más tiempo, selecciona un slot que sea consecutivo con los ya seleccionados.',
      [{ text: 'Entendido', style: 'cancel' }]
    );
  };
  
  const calculateTotalDuration = () => {
    if (selectedTimeSlots.length === 0) return 0;
    
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    return (lastSlot.hour + 1) - firstSlot.hour;
  };
  
  const getTimeRange = () => {
    if (selectedTimeSlots.length === 0) return { start: '', end: '' };
    
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
    
    return {
      start: sortedSlots[0].start,
      end: sortedSlots[sortedSlots.length - 1].end
    };
  };

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