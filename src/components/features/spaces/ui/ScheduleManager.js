import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpaceStyles';

const ScheduleManager = ({ 
  disponibilidad, 
  isEditing, 
  onToggleDayOpen, 
  onAddTimeSlot, 
  onRemoveTimeSlot, 
  onOpenTimePicker 
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Horarios</Text>
      
      {isEditing ? (
        disponibilidad.map((day, dayIndex) => (
          <View key={dayIndex} style={styles.scheduleInputContainer}>
            <View style={styles.dayContainer}>
              <Text style={styles.dayText}>{day.dayOfWeek}</Text>
              <TouchableOpacity 
                style={[
                  styles.toggleButton,
                  day.isOpen ? styles.toggleActive : styles.toggleInactive
                ]}
                onPress={() => onToggleDayOpen(dayIndex)}
              >
                <Text style={styles.toggleText}>
                  {day.isOpen ? 'Abierto' : 'Cerrado'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {day.isOpen && day.timeSlots.map((slot, slotIndex) => (
              <View key={slotIndex} style={styles.timeSlotContainer}>
                <TouchableOpacity 
                  style={styles.timePickerButton}
                  onPress={() => onOpenTimePicker(dayIndex, slotIndex, true)}
                >
                  <Text style={styles.timePickerButtonText}>{slot.start}</Text>
                  <Ionicons name="time-outline" size={16} color="#4A90E2" />
                </TouchableOpacity>
                
                <Text style={{ marginHorizontal: 10 }}>a</Text>
                
                <TouchableOpacity 
                  style={styles.timePickerButton}
                  onPress={() => onOpenTimePicker(dayIndex, slotIndex, false)}
                >
                  <Text style={styles.timePickerButtonText}>{slot.end}</Text>
                  <Ionicons name="time-outline" size={16} color="#4A90E2" />
                </TouchableOpacity>
                
                {slotIndex === day.timeSlots.length - 1 ? (
                  <TouchableOpacity 
                    style={styles.addSlotButton}
                    onPress={() => onAddTimeSlot(dayIndex)}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#4A90E2" />
                  </TouchableOpacity>
                ) : null}
                
                {day.timeSlots.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeSlotButton}
                    onPress={() => onRemoveTimeSlot(dayIndex, slotIndex)}
                  >
                    <Ionicons name="remove-circle-outline" size={24} color="#FF3A5E" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))
      ) : (
        disponibilidad.map((day, index) => (
          <View key={index} style={styles.scheduleItem}>
            <Text style={styles.dayText}>{day.dayOfWeek}</Text>
            <Text style={styles.timeText}>
              {day.isOpen 
                ? day.timeSlots.map(slot => `${slot.start} - ${slot.end}`).join(', ')
                : 'Cerrado'}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

export default ScheduleManager;
