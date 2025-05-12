import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const NotificationItem = ({ notification, onDismiss, onNavigate, onMarkAsRead }) => {
  const getStatusColor = (type) => {
    switch (type) {
      case 'roleApproved':
        return '#34C759';
      case 'roleRejected':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

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
          onPress={notification.action}
        >
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Solicitar Rol</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

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
      </View>
    </View>
  );
};

const NotificationCenter = ({ onAction, onProfileNavigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications/${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

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

      // Agregar notificación local de solicitud de rol si el usuario no tiene rol
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

  const handleDismissNotification = async (notificationId) => {
    try {
      if (notificationId === 'local-role-request') {
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
            // Si existe perfil, ir al dashboard
            navigation.replace('DashboardManager');
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // No existe perfil, ir a registro
            navigation.replace('ManagerRegistration');
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
            navigation.replace('DashboardArtist');
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // No existe perfil, ir a registro
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

  const renderNotification = ({ item }) => (
    <NotificationItem
      notification={item}
      onDismiss={handleDismissNotification}
      onNavigate={handleRoleNavigation}
      onMarkAsRead={handleMarkAsRead}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={50} color="#666" />
            <Text style={styles.emptyText}>No hay notificaciones</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#FFFFFF"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  readNotification: {
    backgroundColor: '#141414',
    opacity: 0.85,
    borderColor: '#1A1A1A',
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E0E0E0',
    flex: 1,
    letterSpacing: 0.3,
  },
  readTitle: {
    color: '#808080',
    fontWeight: '500',
  },
  message: {
    fontSize: 15,
    color: '#CCCCCC',
    marginBottom: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  readMessage: {
    color: '#666666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 90,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 90,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: '#808080',
    fontSize: 16,
    marginTop: 16,
    letterSpacing: 0.3,
  },
});

export default NotificationCenter;
