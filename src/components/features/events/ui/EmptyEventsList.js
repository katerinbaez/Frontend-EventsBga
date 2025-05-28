import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/EventAttendanceStyles';

/**
 * Componente que muestra un mensaje cuando no hay eventos
 */
const EmptyEventsList = () => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={80} color="#333" />
      <Text style={styles.emptyText}>No hay eventos programados</Text>
      <Text style={styles.emptySubtext}>
        Los eventos que programes aparecerán aquí
      </Text>
    </View>
  );
};

export default EmptyEventsList;
