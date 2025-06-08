/**
 * Este archivo maneja el ítem de notificación
 * - UI
 * - Notificaciones
 * - Elementos
 */

import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../../styles/NotificationCenterStyles';
import NotificationActionButtons from './NotificationActionButtons';
import { getStatusColor } from '../utils/notificationUtils';

const NotificationItem = ({ notification, onDismiss, onNavigate, onMarkAsRead, onRequestRole }) => {
  return (
    <View style={[styles.notificationItem, notification.read && styles.readNotification]}>
      <View style={[styles.notificationContent, { borderLeftColor: getStatusColor(notification.type), borderLeftWidth: 4 }]}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.title, notification.read && styles.readTitle]}>
            {notification.titulo || notification.title || 'Notificación'}
          </Text>
          {!notification.read && (
            <View style={styles.unreadDot} />
          )}
        </View>
        <Text style={[styles.message, notification.read && styles.readMessage]}>
          {notification.mensaje || notification.message}
        </Text>
        <NotificationActionButtons 
          notification={notification}
          onDismiss={onDismiss}
          onNavigate={onNavigate}
          onMarkAsRead={onMarkAsRead}
          onRequestRole={onRequestRole}
        />
      </View>
    </View>
  );
};

export default NotificationItem;