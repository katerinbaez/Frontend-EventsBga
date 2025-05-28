import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../../styles/AvaiableEventsModalStyles';

const EmptyEvents = () => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No hay eventos disponibles en este momento</Text>
    </View>
  );
};

export default EmptyEvents;
