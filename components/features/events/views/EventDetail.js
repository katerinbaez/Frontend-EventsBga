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
      
      // Solo verificar asistencia si el evento no ha expirado y el usuario está autenticado
      const expired = isEventExpired(event);
      if (isAuthenticated && !expired) {
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
      
      // Envolver en un try-catch adicional para evitar que errores 500 interrumpan la experiencia
      try {
        const attendingStatus = await checkAttendance(eventId, user);
        setIsAttending(attendingStatus);
      } catch (attendanceError) {
        // Simplemente registrar el error pero no mostrar nada al usuario
        console.error('Error interno al verificar asistencia:', attendanceError);
        // Asumir que no está asistiendo en caso de error
        setIsAttending(false);
      }
    } catch (error) {
      console.error('Error general al verificar asistencia:', error);
      // No mostrar ningún error al usuario
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
      // Verificar si el evento ha expirado
      if (event && isEventExpired(event)) {
        Alert.alert(
          'Evento finalizado',
          'No es posible registrar asistencia a un evento que ya ha finalizado.'
        );
        return;
      }
      
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
      
      try {
        const result = await registerAttendance(eventId, user);
        
        if (result.success) {
          setIsAttending(true);
          Alert.alert('Éxito', result.message);
        }
      } catch (attendanceError) {
        console.error('Error al registrar asistencia:', attendanceError);
        // Mostrar un mensaje de error más amigable
        Alert.alert(
          'Error',
          'No se pudo registrar tu asistencia. Por favor, intenta más tarde.'
        );
      }
    } catch (error) {
      console.error('Error general al registrar asistencia:', error);
      // No mostrar alerta para errores generales
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
          onRegister={expired ? null : handleRegisterAttendance}
          onCancel={expired ? null : handleCancelAttendance}
          showDetailsOnly={expired}
        />
      </ScrollView>
    </View>
  );
};

export default EventDetail;
