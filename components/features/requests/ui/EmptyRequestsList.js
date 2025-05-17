import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/RequestHistoryModalStyles';

const EmptyRequestsList = () => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#999" />
      <Text style={styles.emptyText}>No tienes solicitudes de eventos</Text>
      <Text style={styles.emptySubtext}>
        Cuando solicites un espacio cultural, tus solicitudes aparecerán aquí
      </Text>
    </View>
  );
};

export default EmptyRequestsList;
