import React, { useState, useEffect, useCallback } from 'react';
import ArtistProfilesModal from '../artists/ArtistProfilesModal';
import CulturalSpacesModal from '../spaces/CulturalSpacesModal';
import NotificationCenter from '../notifications/NotificationCenter';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import RoleRequestForm from '../requests/RoleRequestForm';
import { StyleSheet } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';

const DashboardUser = () => {
  const { user, handleLogout } = useAuth();
  const navigation = useNavigation();
  const [showRoleRequest, setShowRoleRequest] = useState(false);
  const [showArtistProfilesModal, setShowArtistProfilesModal] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [showCulturalSpacesModal, setShowCulturalSpacesModal] = useState(false);
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

  // Verificar si hay parámetros de navegación para mostrar el modal de artistas
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Verificar si hay parámetros para mostrar el modal de artistas
      const params = navigation.getState().routes.find(route => route.name === 'Dashboard')?.params;
      
      if (params?.showArtistModal) {
        // Guardar el ID del artista seleccionado
        if (params.selectedArtistId) {
          console.log('ID de artista recibido:', params.selectedArtistId);
          setSelectedArtistId(params.selectedArtistId);
        }
        
        // Mostrar el modal de artistas
        setShowArtistProfilesModal(true);
        
        // Limpiar los parámetros para evitar que se muestre el modal nuevamente
        // al navegar a otra pantalla y volver
        navigation.setParams({ showArtistModal: undefined, selectedArtistId: undefined });
      }
    });
    
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (user?.id) {
      checkArtistProfile();
      checkManagerProfile();
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
      console.log('Respuesta de notificaciones:', response.data);
      
      // Verificamos la estructura de la respuesta y adaptamos según sea necesario
      if (response.data && response.data.success && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications);
        console.log('Notificaciones cargadas:', response.data.notifications.length);
      } else if (response.data && Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        setNotifications(response.data);
        console.log('Notificaciones cargadas (array directo):', response.data.length);
      } else {
        console.log('Formato de respuesta no reconocido:', response.data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setNotifications([]);
    }
  };

  // Función para eliminar perfil de artista
  const deleteArtistProfile = async () => {
    Alert.alert(
      'Eliminar Perfil de Artista',
      '¿Estás seguro que deseas eliminar tu perfil de artista? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${BACKEND_URL}/api/artists/profile/${user.id}`);
              if (response.data && response.data.success) {
                Alert.alert('Éxito', 'Tu perfil de artista ha sido eliminado correctamente');
                setHasArtistProfile(false);
              } else {
                Alert.alert('Error', 'No se pudo eliminar el perfil de artista');
              }
            } catch (error) {
              console.error('Error al eliminar perfil de artista:', error);
              Alert.alert('Error', 'Ocurrió un error al intentar eliminar el perfil');
            }
          }
        }
      ]
    );
  };

  // Función para eliminar perfil de gestor cultural
  const deleteManagerProfile = async () => {
    Alert.alert(
      'Eliminar Perfil de Espacio Cultural',
      '¿Estás seguro que deseas eliminar tu perfil de espacio cultural? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${BACKEND_URL}/api/managers/profile/${user.id}`);
              if (response.data && response.data.success) {
                Alert.alert('Éxito', 'Tu perfil de espacio cultural ha sido eliminado correctamente');
                setHasManagerProfile(false);
              } else {
                Alert.alert('Error', 'No se pudo eliminar el perfil de espacio cultural');
              }
            } catch (error) {
              console.error('Error al eliminar perfil de espacio cultural:', error);
              Alert.alert('Error', 'Ocurrió un error al intentar eliminar el perfil');
            }
          }
        }
      ]
    );
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
        <Text style={styles.optionTitle}>Buscar Eventos </Text>
        <Text style={styles.optionDescription}>Explorar eventos</Text>
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

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => setShowArtistProfilesModal(true)}
      >
        <Ionicons name="people" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Ver Perfiles de Artistas</Text>
        <Text style={styles.optionDescription}>Explorar perfiles de artistas</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => setShowCulturalSpacesModal(true)}
      >
        <Ionicons name="business" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Ver Espacios Culturales</Text>
        <Text style={styles.optionDescription}>Descubre espacios para eventos</Text>
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

  // Calcular el padding superior según la plataforma
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 35;

  return (
    <>
      <StatusBar backgroundColor="transparent" translucent={true} />
      <SafeAreaView style={styles.safeArea}>
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
            <View style={styles.profileSection}>
              <TouchableOpacity 
                onPress={goToArtistDashboard}
                style={styles.profileButton}
              >
                <Ionicons name="person-circle-outline" size={24} color="#fff" />
                <Text style={styles.profileButtonText}>Ir a Mi Perfil de Artista</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={deleteArtistProfile}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          
          {hasManagerProfile && (
            <View style={styles.profileSection}>
              <TouchableOpacity 
                onPress={goToManagerDashboard}
                style={[styles.profileButton, styles.managerButton]}
              >
                <Ionicons name="business-outline" size={24} color="#fff" />
                <Text style={styles.profileButtonText}>Ir a Mi Espacio Cultural</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={deleteManagerProfile}
                style={[styles.deleteButton, styles.deleteManagerButton]}
              >
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {renderVisitorOptions()}
      </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showRoleRequest}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRoleRequest(false)}
      >
        <RoleRequestForm 
          onClose={() => setShowRoleRequest(false)}
          onSubmit={handleRoleRequest}
        />
      </Modal>

      <Modal
        visible={showArtistProfilesModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowArtistProfilesModal(false)}
      >
        <ArtistProfilesModal 
          onClose={() => setShowArtistProfilesModal(false)} 
          initialSelectedArtistId={selectedArtistId}
        />
      </Modal>

      <Modal
        visible={showCulturalSpacesModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowCulturalSpacesModal(false)}
      >
        <CulturalSpacesModal 
          onClose={() => setShowCulturalSpacesModal(false)} 
        />
      </Modal>

      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle}>Centro de Notificaciones</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{notifications.length}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>

          {notifications.length > 0 ? (
            <View style={styles.notificationsList}>
              <NotificationCenter 
                notifications={notifications} 
                onDismiss={handleNotificationDismiss}
                onArtistProfileNavigation={handleArtistProfileNavigation}
              />
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.noNotificationsText}>No tienes notificaciones</Text>
            </View>
          )}
        </View>
      </Modal>

      <Modal
        visible={showRoleRequest}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRoleRequest(false)}
      >
        <RoleRequestForm 
          onClose={() => setShowRoleRequest(false)}
          onSubmit={handleRoleRequest}
        />
      </Modal>


    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 15,
    paddingTop: 35, // Margen para respetar la barra de estado
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    paddingTop: 35, // Margen para respetar la barra de estado
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 10,
  },
  notificationBadge: {
    backgroundColor: '#FF3A5E',
    borderRadius: 15,
    minWidth: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50, // Ajustado dinámicamente para respetar la barra de estado
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
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50, // Ajustado dinámicamente para alinearse con el header
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
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  managerButton: {
    backgroundColor: '#FF3A5E',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteManagerButton: {
    backgroundColor: '#C0392B',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
