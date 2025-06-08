/**
 * Este archivo maneja los campos del formulario
 * - UI
 * - Eventos
 * - Campos
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/EventRequestFormStyles';

const FormFields = ({ 
  eventName, 
  setEventName, 
  eventDescription, 
  setEventDescription, 
  eventType, 
  setEventType, 
  additionalRequirements, 
  setAdditionalRequirements,
  expectedAttendees,
  handleExpectedAttendeesChange,
  capacityExceeded,
  spaceCapacity
}) => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Nombre del evento</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del evento"
        value={eventName}
        onChangeText={setEventName}
      />
      
      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe tu evento"
        value={eventDescription}
        onChangeText={setEventDescription}
        multiline
        numberOfLines={4}
      />
      
      <Text style={styles.label}>Tipo de evento</Text>
      <TextInput
        style={styles.input}
        placeholder="Concierto, exposición, etc."
        value={eventType}
        onChangeText={setEventType}
      />
      
      <Text style={styles.label}>Asistentes esperados</Text>
      <TextInput
        style={[styles.input, capacityExceeded && styles.errorInput]}
        placeholder="Número de asistentes"
        value={expectedAttendees}
        onChangeText={handleExpectedAttendeesChange}
        keyboardType="numeric"
      />
      {capacityExceeded && (
        <Text style={styles.errorText}>
          El número de asistentes excede la capacidad del espacio ({spaceCapacity} personas).
        </Text>
      )}
      
      <Text style={styles.label}>Requerimientos adicionales</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Equipos de sonido, proyector, etc."
        value={additionalRequirements}
        onChangeText={setAdditionalRequirements}
        multiline
        numberOfLines={3}
      />
    </View>
  );
};



export default FormFields;
