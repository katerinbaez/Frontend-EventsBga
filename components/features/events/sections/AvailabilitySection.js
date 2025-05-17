import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '../../../../styles/EventProgrammingStyles';
import TimeSlotSelector from '../ui/TimeSlotSelector';

const AvailabilitySection = ({ 
  filteredTimeSlots, 
  selectedTimeSlots, 
  loadingSlots, 
  onTimeSlotSelect,
  onProgramEvent,
  isFormValid
}) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Horarios Disponibles</Text>
      
      {loadingSlots ? (
        <ActivityIndicator size="large" color="#FF3A5E" style={styles.loader} />
      ) : (
        <TimeSlotSelector 
          filteredTimeSlots={filteredTimeSlots}
          selectedTimeSlots={selectedTimeSlots}
          onTimeSlotSelect={onTimeSlotSelect}
        />
      )}
      
      <TouchableOpacity
        style={[
          styles.submitButton,
          !isFormValid && styles.submitButtonDisabled
        ]}
        disabled={!isFormValid}
        onPress={onProgramEvent}
      >
        <Text style={styles.submitButtonText}>Programar Evento</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AvailabilitySection;