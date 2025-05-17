import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../../styles/EventDetailStyles';

/**
 * Componente que muestra la descripción de un evento
 */
const EventDescription = ({ description }) => {
  return (
    <View style={styles.descriptionSection}>
      <Text style={styles.sectionTitle}>Descripción</Text>
      <Text style={styles.descriptionText}>
        {description || 'No hay descripción disponible para este evento.'}
      </Text>
    </View>
  );
};

export default EventDescription;
