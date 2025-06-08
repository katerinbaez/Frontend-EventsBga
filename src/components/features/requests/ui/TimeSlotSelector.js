/**
 * Este archivo maneja el selector de slots de tiempo
 * - UI
 * - Eventos
 * - Selector
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/EventRequestFormStyles';

const TimeSlotSelector = ({ 
  filteredTimeSlots,
  selectedTimeSlots,
  handleTimeSlotSelection,
  loadingSlots,
  calculateTotalDuration
}) => {
  const renderTimeSlot = (slot) => {
    const isSelected = selectedTimeSlots.some(s => s.hour === slot.hour);
    
    return (
      <TouchableOpacity
        key={`slot-${slot.hour}`}
        style={[
          styles.timeSlot,
          isSelected && styles.selectedTimeSlot,
          slot.isBlocked && styles.blockedTimeSlot
        ]}
        onPress={() => !slot.isBlocked && handleTimeSlotSelection(slot)}
        disabled={slot.isBlocked}
      >
        <Ionicons name="time-outline" size={16} color={isSelected ? "#FFFFFF" : "#999"} style={styles.timeIcon} />
        <Text style={[
          styles.timeSlotText, 
          isSelected && styles.selectedTimeSlotText,
          slot.isBlocked && styles.blockedTimeSlotText
        ]}>
          {slot.start}
        </Text>
        {slot.isBlocked && (
          <View style={styles.blockedIndicator}>
            <Ionicons name="close-circle" size={16} color="#999" />
            <Text style={styles.blockedText}>No disponible</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  const totalDuration = calculateTotalDuration();
  
  const getDayName = (date) => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return days[date.getDay()];
  };
  
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Horario *</Text>
      
      {loadingSlots ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3A5E" />
          <Text style={styles.loadingText}>Cargando horarios disponibles...</Text>
        </View>
      ) : filteredTimeSlots.length > 0 ? (
        <View>
          <Text style={styles.timeInstructions}>
            Selecciona uno o más horarios consecutivos para tu evento
          </Text>
          
          <View style={styles.dayHeaderContainer}>
            <Ionicons name="calendar-outline" size={18} color="#FF3A5E" />
            <Text style={styles.dayHeaderText}>{getDayName(new Date())} {new Date().getDate()}</Text>
            <View style={styles.slotCountBadge}>
              <Text style={styles.slotCountText}>{filteredTimeSlots.length} franjas</Text>
            </View>
          </View>
          
          <View style={styles.timeSlotsContainer}>
            {filteredTimeSlots.map(renderTimeSlot)}
          </View>
          
          {selectedTimeSlots.length > 0 && (
            <View style={styles.durationContainer}>
              <Ionicons name="time-outline" size={18} color="#FF3A5E" />
              <Text style={styles.durationText}>
                Duración total: {totalDuration} {totalDuration === 1 ? 'hora' : 'horas'}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noSlotsContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#999" />
          <Text style={styles.noSlotsText}>
            No hay horarios disponibles para esta fecha. Por favor, selecciona otra fecha.
          </Text>
          <Text style={styles.noSlotsSubtext}>
            No se encontraron franjas horarias disponibles para esta fecha. Por favor, intenta con otra fecha.
          </Text>
        </View>
      )}
    </View>
  );
};



export default TimeSlotSelector;
