import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RoleApprovalNotification = ({ notification, onAccept, onDismiss }) => {
  const getIcon = () => {
    switch (notification.rolAprobado) {
      case 'Artista':
        return 'brush';
      case 'GestorEventos':
        return 'business';
      default:
        return 'person';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon()} size={32} color="#4A90E2" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>¡Rol Aprobado!</Text>
        <Text style={styles.message}>
          Tu solicitud para ser {notification.rolAprobado} ha sido aprobada.
          {'\n'}Ya puedes acceder a tu nueva dashboard.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={onAccept}
          >
            <Text style={styles.buttonText}>Ir a Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={styles.dismissText}>Descartar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  acceptButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dismissText: {
    color: '#95A5A6',
  },
});

export default RoleApprovalNotification;
