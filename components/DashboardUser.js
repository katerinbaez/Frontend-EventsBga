import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import RoleRequestForm from './RoleRequestForm';
import { StyleSheet } from 'react-native';

const DashboardUser = () => {
  const { user, handleLogout } = useAuth();
  const navigation = useNavigation();
  const [showRoleRequest, setShowRoleRequest] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleLogoutAndNavigate = async () => {
    await handleLogout();
    navigation.replace('Home');
  };

  useEffect(() => {
    checkRoleStatus();
  }, [user]);

  const checkRoleStatus = () => {
    try {
      if (user?.role) {
        return;
      }

      setNotifications(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'roleInfo',
          mensaje: '¿Eres artista o gestor cultural? ¡Solicita tu rol especial para acceder a funciones exclusivas!',
          action: () => setShowRoleRequest(true),
          dismissable: true
        }
      ]);
    } catch (error) {
      console.error('Error al verificar estado de rol:', error);
    }
  };

  const handleNotificationDismiss = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleRoleRequest = async (formData) => {
    try {
      console.log('Enviando solicitud:', formData);
      setShowRoleRequest(false);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
    }
  };

  const renderUserWelcome = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcome}>¡Bienvenido,</Text>
      <Text style={styles.userName}>{user?.name}!</Text>
      {!user?.role && (
        <TouchableOpacity 
          style={styles.requestRoleButton}
          onPress={() => setShowRoleRequest(true)}
        >
          <Ionicons name="person-add" size={20} color="#FFF" />
          <Text style={styles.requestRoleText}>Solicitar Rol</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNotifications = () => (
    <View style={styles.notificationsContainer}>
      {notifications.map(notification => (
        <View key={notification.id} style={styles.notification}>
          <Text style={styles.notificationText}>{notification.mensaje}</Text>
          <View style={styles.notificationActions}>
            {notification.action && (
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={notification.action}
              >
                <Text style={styles.notificationButtonText}>Solicitar Rol</Text>
              </TouchableOpacity>
            )}
            {notification.dismissable && (
              <TouchableOpacity 
                style={[styles.notificationButton, styles.dismissButton]}
                onPress={() => handleNotificationDismiss(notification.id)}
              >
                <Text style={styles.notificationButtonText}>Descartar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderVisitorOptions = () => (
    <View style={styles.optionsContainer}>
      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => navigation.navigate('Calendar')}
      >
        <Ionicons name="calendar" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Calendario</Text>
        <Text style={styles.optionDescription}>Ver eventos próximos</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Buscar</Text>
        <Text style={styles.optionDescription}>Explorar eventos y artistas</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => navigation.navigate('Favorites')}
      >
        <Ionicons name="heart" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Favoritos</Text>
        <Text style={styles.optionDescription}>Tus eventos guardados</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => navigation.navigate('Notifications')}
      >
        <Ionicons name="notifications" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Notificaciones</Text>
        <Text style={styles.optionDescription}>Centro de notificaciones</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          {renderUserWelcome()}
          <TouchableOpacity 
            onPress={handleLogoutAndNavigate}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
        {renderNotifications()}
        {renderVisitorOptions()}
      </ScrollView>

      <Modal
        visible={showRoleRequest}
        animationType="slide"
        onRequestClose={() => setShowRoleRequest(false)}
      >
        <RoleRequestForm 
          onSubmit={handleRoleRequest}
          onCancel={() => setShowRoleRequest(false)}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  welcomeContainer: {
    marginRight: 50,
  },
  welcome: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  userName: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerButton: {
    position: 'absolute',
    right: 20,
    top: 50,
    backgroundColor: '#ff4757',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  notification: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  notificationButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dismissButton: {
    backgroundColor: '#404040',
  },
  notificationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationsContainer: {
    marginBottom: 20,
  },
  optionsContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '47%',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 5,
    textAlign: 'center',
  },
  requestRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  requestRoleText: {
    color: '#ffffff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardUser;
