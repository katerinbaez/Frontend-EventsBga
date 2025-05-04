import React, { useState, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import RoleRequestForm from './RoleRequestForm';
import { StyleSheet } from 'react-native';
import axios from 'axios';

const BACKEND_URL = "http://192.168.1.7:5000";

const DashboardUser = () => {
  const { user, handleLogout } = useAuth();
  const navigation = useNavigation();
  const [showRoleRequest, setShowRoleRequest] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasArtistProfile, setHasArtistProfile] = useState(false);
  const [hasManagerProfile, setHasManagerProfile] = useState(false);

  const handleLogoutAndNavigate = async () => {
    await handleLogout();
    navigation.replace('Home');
  };

  useEffect(() => {
    if (user?.id) {
      setShowRoleRequest(false);
      checkArtistProfile();
      checkManagerProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  // Verificar si el usuario ya tiene perfil de artista
  const checkArtistProfile = async () => {
    if (user?.id) {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${user.id}`);
        if (response.data && response.data.success) {
          setHasArtistProfile(true);
        } else {
          setHasArtistProfile(false);
        }
      } catch (error) {
        // Silenciamos el error 404 que es normal cuando no existe perfil
        if (error.response?.status !== 404) {
          console.error('Error al verificar perfil de artista:', error);
        }
        setHasArtistProfile(false);
      }
    }
  };

  // Verificar si el usuario ya tiene perfil de gestor cultural
  const checkManagerProfile = async () => {
    if (user?.id) {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${user.id}`);
        if (response.data && response.data.success) {
          setHasManagerProfile(true);
        } else {
          setHasManagerProfile(false);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error al verificar perfil de gestor cultural:', error);
        }
        setHasManagerProfile(false);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications/${user.id}`);
      setNotifications(prev => [...prev, ...response.data]);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    }
  };

  const handleRoleRequest = async (formData) => {
    try {
      setShowRoleRequest(false);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
    }
  };

  const handleShowRoleRequest = () => {
    setShowNotifications(false);
    setShowRoleRequest(true);
  };

  // Función para ir al perfil de artista
  const goToArtistDashboard = () => {
    navigation.replace('DashboardArtist');
  };

  // Función para ir al perfil de gestor cultural
  const goToManagerDashboard = () => {
    navigation.replace('DashboardManager');
  };

  // Función para manejar el clic en 'Ir a Mi Perfil de Artista' desde notificaciones
  const handleArtistProfileNavigation = () => {
    if (hasArtistProfile) {
      navigation.navigate('DashboardArtist');
    } else {
      // Redirigir directamente al registro sin mensaje
      navigation.navigate('ArtistRegistration');
    }
  };

  const renderUserWelcome = () => {
    if (!user) return null;
    
    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcome}>¡Bienvenido,</Text>
        <Text style={styles.userName}>{user.name}!</Text>
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
  };

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
        onPress={() => setShowNotifications(true)}
      >
        <Ionicons name="notifications" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Notificaciones</Text>
        <Text style={styles.optionDescription}>Centro de notificaciones {notifications.length > 0 ? `(${notifications.length})` : ''}</Text>
      </TouchableOpacity>
    </View>
  );

  const handleNotificationDismiss = async (notificationId, isLocal = false) => {
    try {
      console.log('Descartando notificación:', notificationId, 'Local:', isLocal);
      
      if (!isLocal) {
        await axios.delete(`${BACKEND_URL}/api/notifications/${notificationId}`);
      }
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error al descartar notificación:', error);
    }
  };



  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          {renderUserWelcome()}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleLogoutAndNavigate}
          >
            <Text style={styles.headerButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Botones de acceso rápido a perfiles (solo se muestran si existen) */}
        <View style={styles.profileButtonsContainer}>
          {hasArtistProfile && (
            <TouchableOpacity 
              onPress={goToArtistDashboard}
              style={styles.profileButton}
            >
              <Ionicons name="person-circle-outline" size={24} color="#fff" />
              <Text style={styles.profileButtonText}>Ir a Mi Perfil de Artista</Text>
            </TouchableOpacity>
          )}
          
          {hasManagerProfile && (
            <TouchableOpacity 
              onPress={goToManagerDashboard}
              style={[styles.profileButton, styles.managerButton]}
            >
              <Ionicons name="business-outline" size={24} color="#fff" />
              <Text style={styles.profileButtonText}>Ir a Mi Espacio Cultural</Text>
            </TouchableOpacity>
          )}
        </View>

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

      <Modal
        visible={showNotifications}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notificaciones</Text>
            <TouchableOpacity 
              onPress={() => setShowNotifications(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <NotificationCenter onAction={handleShowRoleRequest} onProfileNavigation={handleArtistProfileNavigation} />
        </View>
      </Modal>


    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  notificationsList: {
    flex: 1,
  },
  noNotificationsText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
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
  notificationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artistButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileButtonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
  },
  managerButton: {
    backgroundColor: '#00b894',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  dismissButton: {
    backgroundColor: '#404040',
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
