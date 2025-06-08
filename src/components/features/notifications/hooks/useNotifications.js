/**
 * Este archivo maneja el hook de notificaciones
 * - Hooks
 * - Notificaciones
 * - Estado
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import NotificationService from '../services/NotificationService';

const useNotifications = (onAction) => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      const response = await NotificationService.getNotifications(user);

      let transformedNotifications = response.data
        .filter(notification => notification && notification.type)
        .map(notification => ({
          ...notification,
          id: notification.id,
          type: notification.type,
          title: notification.titulo || notification.title || 'Notificación',
          message: notification.mensaje || notification.message,
          read: notification.read || false,
          data: {
            ...notification.data,
            roleType: notification.data?.roleType || 
                     (notification.type === 'roleApproved' || notification.type === 'roleRejected' 
                      ? notification.roleType 
                      : null)
          }
        }));

      if (!user.role) {
        transformedNotifications = [
          {
            id: 'local-role-request',
            type: 'roleInfo',
            title: 'Solicitud de rol',
            message: '¿Eres artista o gestor cultural? ¡Solicita tu rol especial para acceder a funciones exclusivas!',
            read: false,
            action: onAction,
            isLocal: true
          },
          ...transformedNotifications
        ];
      }

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      if (!error.response || error.response.status !== 404) {
        Alert.alert('Error', 'No se pudieron cargar las notificaciones');
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications().finally(() => setRefreshing(false));
  }, [user?.id]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      if (notificationId === 'local-role-request') {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, read: true }
              : n
          )
        );
        return;
      }

      const response = await axios.patch(
        `${BACKEND_URL}/api/notifications/${notificationId}/read`,
        { read: true },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 200) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, read: true }
              : n
          )
        );
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      Alert.alert('Error', 'No se pudo marcar la notificación como leída');
    }
  };

  const handleDismissNotification = async (notificationId, isLocal = false) => {
    try {
      if (isLocal) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } else {
        await axios.delete(`${BACKEND_URL}/api/notifications/${notificationId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
        });
      }
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      Alert.alert('Error', 'No se pudo eliminar la notificación');
    }
  };

  const handleRoleNavigation = async (roleType) => {
    if (!roleType) return;
    
    try {
      if (roleType === 'manager') {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${user.id}`);
          if (response.data.success) {
            navigation.replace('DashboardManager');
          }
        } catch (error) {
          if (error.response?.status === 404) {
            navigation.replace('ManagerRegistration');
          } else {
            console.error('Error al verificar perfil de gestor:', error);
            Alert.alert('Error', 'No se pudo verificar el perfil de gestor cultural');
          }
        }
      } else if (roleType === 'artist') {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${user.id}`);
          if (response.data.success) {
            navigation.replace('DashboardArtist');
          }
        } catch (error) {
          if (error.response?.status === 404) {
            navigation.replace('ArtistRegistration');
          } else {
            console.error('Error al verificar perfil de artista:', error);
            Alert.alert('Error', 'No se pudo verificar el perfil de artista');
          }
        }
      }
    } catch (error) {
      console.error('Error en navegación de rol:', error);
    }
  };

  return {
    notifications,
    refreshing,
    onRefresh,
    handleMarkAsRead,
    handleDismissNotification,
    handleRoleNavigation
  };
};

export default useNotifications;