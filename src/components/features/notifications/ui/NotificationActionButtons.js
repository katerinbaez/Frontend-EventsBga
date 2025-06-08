/**
 * Este archivo maneja los botones de acción de notificación
 * - UI
 * - Notificaciones
 * - Acciones
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/NotificationCenterStyles';

const NotificationActionButtons = ({ notification, onDismiss, onNavigate, onMarkAsRead, onRequestRole }) => {
  const getActionButton = () => {
    if (notification.type === 'roleApproved') {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#34C759' }]}
          onPress={() => onNavigate(notification.data?.roleType)}
        >
          <Ionicons name="arrow-forward-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {notification.data?.roleType === 'manager' 
              ? 'Ir a Mi Espacio Cultural' 
              : 'Ir a Mi Perfil de Artista'}
          </Text>
        </TouchableOpacity>
      );
    } else if (notification.type === 'roleInfo') {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#4A90E2' }]}
          onPress={onRequestRole}
        >
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Solicitar Rol</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.buttonContainer}>
      {!notification.read && (notification.type === 'roleApproved' || notification.type === 'roleRejected') && (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => onMarkAsRead(notification.id)}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Marcar como leído</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        style={[styles.deleteButton, { backgroundColor: '#FF3B30' }]}
        onPress={() => onDismiss(notification.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Eliminar</Text>
      </TouchableOpacity>
      {getActionButton()}
    </View>
  );
};

export default NotificationActionButtons;