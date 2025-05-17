import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/RequestModalStyles';

const EmptyManagerRequestsList = () => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#999" />
      <Text style={styles.emptyText}>No hay solicitudes de eventos</Text>
      <Text style={styles.emptySubtext}>
        Cuando los artistas soliciten tu espacio cultural, las solicitudes aparecerán aquí
      </Text>
    </View>
  );
};

export default EmptyManagerRequestsList;
