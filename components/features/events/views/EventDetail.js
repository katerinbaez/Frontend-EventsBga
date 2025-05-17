import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import { styles } from '../../../../styles/EventDetailStyles';

// Componentes UI
import EventHeader from '../ui/EventHeader';
import EventInfo from '../ui/EventInfo';
import EventDescription from '../ui/EventDescription';
import AttendanceButton from '../ui/AttendanceButton';
import LoadingErrorState from '../ui/LoadingErrorState';

// Servicios
import {
  loadEventDetails,
  isEventExpired,
  shareEvent,
  toggleFavorite,
  checkIsFavorite,
  registerAttendance,
  cancelAttendance,
  checkAttendance
} from '../services/EventDetailService';

/**
 * Componente principal que muestra los detalles de un evento
 */
const EventDetail = ({ route, navigation }) => {
  // Extraer el eventId de los parámetros de la ruta y asegurarse de que sea un número
  const routeParams = route.params || {};
  const eventId = routeParams.eventId ? String(routeParams.eventId) : null;
  const eventType = routeParams.eventType || 'regular'; // Tipo de evento: 'regular' o 'request'
  
  // Estado
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  
  // Contexto de autenticación
  const { user, isAuthenticated } = useAuth();
  
  // Cargar detalles del evento al montar el componente
  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    } else {
      setError('No se proporcionó un ID de evento válido');
      setLoading(false);
    }
  }, [eventId, eventType]);
  
  // Verificar si el evento está en favoritos cuando cambia el evento
  useEffect(() => {
    if (event && event.id) {
      checkFavoriteStatus();
      if (isAuthenticated) {
        checkUserAttendance();
      }
    }
  }, [event, isAuthenticated]);
  
  // Registrar visitas al evento
  useEffect(() => {
    // Aquí se podría implementar la lógica para registrar visitas al evento
    console.log('EventDetail - Parámetros recibidos:', JSON.stringify(routeParams));
    console.log('EventDetail - ID procesado:', eventId, 'Tipo:', typeof eventId, 'EventType:', eventType);
  }, []);
  
  /**
   * Carga los detalles del evento desde el backend
   */
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const eventData = await loadEventDetails(eventId, eventType);
      setEvent(eventData);
    } catch (error) {
      console.error('Error al cargar detalles del evento:', error);
      setError('No se pudo cargar la información del evento. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Verifica si el evento está en favoritos
   */
  const checkFavoriteStatus = async () => {
    try {
      const favoriteStatus = await checkIsFavorite(eventId);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Error al verificar estado de favorito:', error);
    }
  };
  
  /**
   * Verifica si el usuario está asistiendo al evento
   */
  const checkUserAttendance = async () => {
    try {
      if (!isAuthenticated || !user) return;
      
      const attendingStatus = await checkAttendance(eventId, user);
      setIsAttending(attendingStatus);
    } catch (error) {
      console.error('Error al verificar asistencia:', error);
    }
  };
  
  /**
   * Maneja la acción de compartir el evento
   */
  const handleShare = () => {
    if (event) {
      shareEvent(event);
    }
  };
  
  /**
   * Maneja la acción de agregar/quitar de favoritos
   */
  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = await toggleFavorite(event, isFavorite);
      setIsFavorite(newFavoriteStatus);
      
      Alert.alert(
        isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos',
        isFavorite ? 'El evento ha sido eliminado de tus favoritos' : 'El evento ha sido agregado a tus favoritos'
      );
    } catch (error) {
      console.error('Error al gestionar favoritos:', error);
    }
  };
  
  /**
   * Maneja la acción de registrar asistencia
   */
  const handleRegisterAttendance = async () => {
    try {
      if (!isAuthenticated) {
        Alert.alert(
          'Inicio de sesión requerido',
          'Debes iniciar sesión para registrar tu asistencia a este evento.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Iniciar sesión', 
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        return;
      }
      
      const result = await registerAttendance(eventId, user);
      
      if (result.success) {
        setIsAttending(true);
        Alert.alert('Éxito', result.message);
      }
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Ocurrió un error al registrar tu asistencia'
      );
    }
  };
  
  /**
   * Maneja la acción de cancelar asistencia
   */
  const handleCancelAttendance = async () => {
    try {
      if (!isAuthenticated) return;
      
      const result = await cancelAttendance(eventId, user);
      
      if (result.success) {
        setIsAttending(false);
        Alert.alert('Éxito', result.message);
      }
    } catch (error) {
      console.error('Error al cancelar asistencia:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Ocurrió un error al cancelar tu asistencia'
      );
    }
  };
  
  // Mostrar estados de carga o error
  if (loading || error) {
    return (
      <LoadingErrorState 
        isLoading={loading} 
        error={error} 
        onRetry={fetchEventDetails} 
      />
    );
  }
  
  // Si no hay evento, no mostrar nada
  if (!event) {
    return null;
  }
  
  // Verificar si el evento ha expirado
  const expired = isEventExpired(event);
  
  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Encabezado del evento */}
        <EventHeader 
          event={event}
          isFavorite={isFavorite}
          onBack={() => navigation.goBack()}
          onShare={handleShare}
          onToggleFavorite={handleToggleFavorite}
        />
        
        {/* Información del evento */}
        <EventInfo event={event} />
        
        {/* Descripción del evento */}
        <EventDescription description={event.descripcion} />
        
        {/* Botón de asistencia */}
        <AttendanceButton 
          isExpired={expired}
          isAttending={isAttending}
          onRegister={handleRegisterAttendance}
          onCancel={handleCancelAttendance}
        />
      </ScrollView>
    </View>
  );
};

export default EventDetail;
