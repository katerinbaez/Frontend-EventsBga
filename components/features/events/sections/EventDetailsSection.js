import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/EventProgrammingStyles';

const EventDetailsSection = ({ 
  spaceName, 
  eventName, 
  eventDescription, 
  onChangeEventName, 
  onChangeEventDescription 
}) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Programación de Eventos</Text>
      <Text style={[styles.spaceInfo, { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#FFF' }]}>
        Espacio: {spaceName}
      </Text>
      
      <Text style={styles.label}>Nombre del Evento</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa el nombre del evento"
        placeholderTextColor="#FFF"
        value={eventName}
        onChangeText={onChangeEventName}
      />
      
      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe tu evento"
        placeholderTextColor="#FFF"
        multiline
        numberOfLines={4}
        value={eventDescription}
        onChangeText={onChangeEventDescription}
      />
    </View>
  );
};

export default EventDetailsSection;