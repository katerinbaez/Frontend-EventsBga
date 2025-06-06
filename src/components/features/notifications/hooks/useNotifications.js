import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import NotificationService from '../services/NotificationService';

const useNotifications = (onAction) => {
  // Crear la notificación de solicitud de rol que siempre estará presente
  const roleRequestNotification = {
    id: 'local-role-request',
    type: 'roleInfo',
    title: 'Solicitud de rol',
    message: '¿Eres artista o gestor cultural? ¡Solicita tu rol especial para acceder a funciones exclusivas!',
    read: false,
    action: onAction,
    isLocal: true
  };
  
  // Inicializar el estado con la notificación de solicitud de rol
  const [notifications, setNotifications] = useState([roleRequestNotification]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  const loadNotifications = async () => {
    if (!user?.id) return;

    // Crear la notificación de solicitud de rol que siempre estará presente
    const roleRequestNotification = {
      id: 'local-role-request',
      type: 'roleInfo',
      title: 'Solicitud de rol',
      message: '¿Eres artista o gestor cultural? ¡Solicita tu rol especial para acceder a funciones exclusivas!',
      read: false,
      action: onAction,
      isLocal: true
    };

    try {
      // Obtener las notificaciones del servidor
      const response = await NotificationService.getNotifications(user);
      
      // Procesar las notificaciones del servidor
      let serverNotifications = [];
      if (response.data && response.data.length > 0) {
        serverNotifications = response.data
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
      }
      
      // Filtrar cualquier notificación local existente para evitar duplicados
      const filteredNotifications = serverNotifications.filter(n => n.id !== 'local-role-request');
      
      // Actualizar el estado con la notificación de solicitud de rol al principio
      setNotifications([roleRequestNotification, ...filteredNotifications]);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      // Si hay error al obtener notificaciones del servidor, asegurarse de que al menos
      // tengamos la notificación de solicitud de rol
      setNotifications([roleRequestNotification]);
      
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
      // Si es una notificación local, solo actualizamos el estado
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
        // Verificar si existe perfil de gestor
        try {
          const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${user.id}`);
          if (response.data.success) {
            // Si existe perfil, ir al dashboard de gestor
            // Usar reset para asegurar que la navegación funcione correctamente
            navigation.reset({
              index: 0,
              routes: [{ name: 'DashboardManager' }],
            });
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // No existe perfil, ir a registro
            // Usar reset para asegurar que la navegación funcione correctamente
            navigation.reset({
              index: 0,
              routes: [{ name: 'ManagerRegistration' }],
            });
          } else {
            console.error('Error al verificar perfil de gestor:', error);
            Alert.alert('Error', 'No se pudo verificar el perfil de gestor cultural');
          }
        }
      } else if (roleType === 'artist') {
        // Verificar si existe perfil de artista
        try {
          const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${user.id}`);
          if (response.data.success) {
            // Si existe perfil, ir al dashboard
            // Usar reset para asegurar que la navegación funcione correctamente
            navigation.reset({
              index: 0,
              routes: [{ name: 'DashboardArtist' }],
            });
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // No existe perfil, ir a registro
            // Usar reset para asegurar que la navegación funcione correctamente
            navigation.reset({
              index: 0,
              routes: [{ name: 'ArtistRegistration' }],
            });
          } else {
            console.error('Error al verificar perfil de artista:', error);
            Alert.alert('Error', 'No se pudo verificar el perfil de artista');
          }
        }
      }
    } catch (error) {
      console.error('Error en navegación de rol:', error);
      Alert.alert('Error de navegación', 'No se pudo navegar al destino seleccionado');
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