/**
 * Este archivo maneja el dashboard del usuario
 * - UI
 * - Navegación
 * - Sesión
 * - Modales
 * - Roles
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../../../../constants/config';
import { styles } from '../../../../../styles/DashboardUserStyles';

import UserHeader from '../elements/UserHeader';
import UserOptionsContainer from '../elements/UserOptionsContainer';
import UserDashboardService from '../services/UserDashboardService';

import ArtistProfilesModal from '../../../artists/modals/ArtistProfilesModal';
import CulturalSpacesModal from '../../../spaces/views/CulturalSpacesModal';
import NotificationCenter from '../../../notifications/Views/NotificationCenter';
import RoleRequestForm from '../../../requests/views/RoleRequestForm';

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const params = navigation.getState().routes.find(route => route.name === 'Dashboard')?.params;
      
      if (params?.showArtistModal) {
        if (params.selectedArtistId) {
          console.log('ID de artista recibido:', params.selectedArtistId);
          setSelectedArtistId(params.selectedArtistId);
        }
        
        setShowArtistProfilesModal(true);
        
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

  const checkArtistProfile = async () => {
    if (!user?.id) return;
    
    const result = await UserDashboardService.checkArtistProfile(user.id);
    if (result.success) {
      setHasArtistProfile(result.hasProfile);
    }
  };

  const checkManagerProfile = async () => {
    if (!user?.id) return;
    
    const result = await UserDashboardService.checkManagerProfile(user.id);
    if (result.success) {
      setHasManagerProfile(result.hasProfile);
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    const result = await UserDashboardService.getNotifications(user.id);
    if (result.success) {
      setNotifications(result.notifications);
    }
  };

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

  const goToArtistDashboard = () => {
    navigation.replace('DashboardArtist');
  };
  const goToManagerDashboard = () => {
    navigation.replace('DashboardManager');
  };

  const handleArtistProfileNavigation = () => {
    if (hasArtistProfile) {
      navigation.navigate('DashboardArtist');
    } else {
      navigation.navigate('ArtistRegistration');
    }
  };

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

  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 35;

  return (
    <>
      <StatusBar backgroundColor="transparent" translucent={true} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <UserHeader 
            userName={user?.name || 'Usuario'}
            onLogout={handleLogoutAndNavigate}
            showRoleRequest={!user?.role}
            onRoleRequest={() => setShowRoleRequest(true)}
          />

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

          <UserOptionsContainer 
            onShowRoleRequest={() => setShowRoleRequest(true)}
            onShowArtistProfiles={() => setShowArtistProfilesModal(true)}
            onShowCulturalSpaces={() => setShowCulturalSpacesModal(true)}
            onShowNotifications={() => setShowNotifications(true)}
            hasArtistProfile={hasArtistProfile}
            hasManagerProfile={hasManagerProfile}
            notifications={notifications}
          />
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

      {showCulturalSpacesModal && (
        <CulturalSpacesModal 
          visible={showCulturalSpacesModal}
          onClose={() => setShowCulturalSpacesModal(false)} 
        />
      )}

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
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {notifications.length > 0 ? (
            <View style={styles.notificationsList}>
              <NotificationCenter 
                notifications={notifications} 
                onDismiss={handleNotificationDismiss}
                onArtistProfileClick={handleArtistProfileNavigation}
                onAction={handleShowRoleRequest}
              />
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.noNotificationsText}>No tienes notificaciones</Text>
            </View>
          )}
        </View>
      </Modal>

    </>
  );
};

export default DashboardUser;
