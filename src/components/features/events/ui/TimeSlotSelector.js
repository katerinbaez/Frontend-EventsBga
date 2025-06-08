/**
 * Este archivo maneja el selector de ranuras horarias
 * - UI
 * - Selección
 * - Horarios
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../../../styles/EventProgrammingStyles';

const TimeSlotSelector = ({ 
  filteredTimeSlots, 
  selectedTimeSlots, 
  onTimeSlotSelect 
}) => {
  return (
    <View style={styles.timeSlotsContainer}>
      {filteredTimeSlots.length > 0 ? (
        filteredTimeSlots.map((slot) => (
          <TouchableOpacity
            key={slot.hour}
            style={[
              styles.timeSlot,
              selectedTimeSlots.some(s => s.hour === slot.hour) && styles.timeSlotSelected
            ]}
            onPress={() => onTimeSlotSelect(slot)}
          >
            <Text
              style={[
                styles.timeSlotText,
                selectedTimeSlots.some(s => s.hour === slot.hour) && styles.timeSlotTextSelected
              ]}
            >
              {slot.displayTime}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noSlotsText}>
          No hay horarios disponibles para la fecha seleccionada
        </Text>
      )}
    </View>
  );
};

export default TimeSlotSelector;
