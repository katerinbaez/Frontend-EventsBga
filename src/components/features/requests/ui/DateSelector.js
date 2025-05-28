import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/EventRequestFormStyles';
import { formatDate } from '../utils/eventRequestUtils';

const DateSelector = ({ 
  eventDate, 
  showDatePicker, 
  handleDateChange
}) => {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Fecha *</Text>
      <View style={styles.dateContainer}>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => handleDateChange(null, null, true)}
        >
          <Ionicons name="calendar" size={20} color="#FF3A5E" style={styles.dateIcon} />
          <Text style={styles.dateText}>
            {formatDate(eventDate)}
          </Text>
          <View style={styles.dateIndicator}>
            <Ionicons name="chevron-down" size={16} color="#FF3A5E" />
          </View>
        </TouchableOpacity>
        <Text style={styles.dateHint}>Selecciona una fecha para ver los horarios disponibles</Text>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};



export default DateSelector;
