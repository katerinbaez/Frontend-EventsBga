/**
 * Este archivo maneja la sección de fecha del evento
 * - UI
 * - Fecha
 * - Selección
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../../../../styles/EventProgrammingStyles';

const EventDateSection = ({ 
  eventDate, 
  showDatePicker, 
  setShowDatePicker, 
  onDateChange 
}) => {
  return (
    <View>
      <Text style={styles.label}>Fecha del Evento</Text>
      <TouchableOpacity
        style={styles.dateSelector}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>
          {eventDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        <Ionicons name="calendar" size={24} color="#FF3A5E" />
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              onDateChange(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};

export default EventDateSection;