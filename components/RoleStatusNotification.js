import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RoleStatusNotification = ({ notification, onDismiss, onNavigate }) => {
  const { type, title, message, data } = notification;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {type === 'roleApproved' && (
        <TouchableOpacity 
          style={styles.navigationButton} 
          onPress={onNavigate}
        >
          <Text style={styles.buttonText}>
            {data?.roleType === 'manager' ? 'Ir a Mi Espacio Cultural' : 'Ir a Mi Perfil de Artista'}
          </Text>
        </TouchableOpacity>
      )}
      {type === 'roleRejected' && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onDismiss}
        >
          <Text style={styles.buttonText}>Aceptar</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        style={[styles.button, styles.dismissButton]} 
        onPress={onDismiss}
      >
        <Text style={styles.buttonText}>Descartar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  navigationButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: '#404040',
    marginTop: 10,
  },
});

export default RoleStatusNotification;
