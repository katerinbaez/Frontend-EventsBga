/**
 * Este archivo maneja la vista de notificaciones vacías
 * - UI
 * - Notificaciones
 * - Mensajes
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/NotificationCenterStyles';

const EmptyNotificationView = () => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={50} color="#666" />
      <Text style={styles.emptyText}>No hay notificaciones</Text>
    </View>
  );
};

export default EmptyNotificationView;