import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/EventProgrammingStyles';

const AdditionalInfoSection = ({ 
  eventType, 
  expectedAttendees, 
  additionalRequirements,
  onEventTypeChange,
  onExpectedAttendeesChange,
  onAdditionalRequirementsChange
}) => {
  return (
    <View>
      <Text style={styles.label}>Tipo de Evento</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Concierto, Exposición, Taller..."
        value={eventType}
        onChangeText={onEventTypeChange}
      />
      
      <Text style={styles.label}>Asistentes Esperados</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de asistentes esperados"
        keyboardType="numeric"
        value={expectedAttendees}
        onChangeText={onExpectedAttendeesChange}
      />
      
      <Text style={styles.label}>Requerimientos Adicionales</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Especifica cualquier requerimiento adicional"
        multiline
        numberOfLines={4}
        value={additionalRequirements}
        onChangeText={onAdditionalRequirementsChange}
      />
    </View>
  );
};

export default AdditionalInfoSection;