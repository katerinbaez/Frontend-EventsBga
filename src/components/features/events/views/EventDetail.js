/**
 * Este archivo maneja los detalles del evento
 * - UI
 * - Eventos
 * - Detalles
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import { styles } from '../../../../styles/EventDetailStyles';

import EventHeader from '../ui/EventHeader';
import EventInfo from '../ui/EventInfo';
import EventDescription from '../ui/EventDescription';
import AttendanceButton from '../ui/AttendanceButton';
import LoadingErrorState from '../ui/LoadingErrorState';

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

const EventDetail = ({ route, navigation }) => {
  const routeParams = route.params || {};
  const eventId = routeParams.eventId ? String(routeParams.eventId) : null;
  const eventType = routeParams.eventType || 'regular';
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    } else {
      setError('No se proporcionó un ID de evento válido');
      setLoading(false);
    }
  }, [eventId, eventType]);
  
  useEffect(() => {
    if (event && event.id) {
      checkFavoriteStatus();
      
      const expired = isEventExpired(event);
      if (isAuthenticated && !expired) {
        checkUserAttendance();
      }
    }
  }, [event, isAuthenticated]);
  
  useEffect(() => {
    console.log('EventDetail - Parámetros recibidos:', JSON.stringify(routeParams));
    console.log('EventDetail - ID procesado:', eventId, 'Tipo:', typeof eventId, 'EventType:', eventType);
  }, []);
  
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
  
  const checkFavoriteStatus = async () => {
    try {
      const favoriteStatus = await checkIsFavorite(eventId);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Error al verificar estado de favorito:', error);
    }
  };
  
  const checkUserAttendance = async () => {
    try {
      if (!isAuthenticated || !user) return;
      
      try {
        const attendingStatus = await checkAttendance(eventId, user);
        setIsAttending(attendingStatus);
      } catch (attendanceError) {
        console.error('Error interno al verificar asistencia:', attendanceError);
        setIsAttending(false);
      }
    } catch (error) {
      console.error('Error general al verificar asistencia:', error);
    }
  };
  
  
  const handleShare = () => {
    if (event) {
      shareEvent(event);
    }
  };
  
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
  
  const handleRegisterAttendance = async () => {
    try {
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
        Alert.alert(
          'Error',
          'No se pudo registrar tu asistencia. Por favor, intenta más tarde.'
        );
      }
    } catch (error) {
      console.error('Error general al registrar asistencia:', error);
    }
  };
  
 
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
  
  if (loading || error) {
    return (
      <LoadingErrorState 
        isLoading={loading} 
        error={error} 
        onRetry={fetchEventDetails} 
      />
    );
  }
  
  if (!event) {
    return null;
  }
  const expired = isEventExpired(event);
  
  return (
    <View style={styles.container}>
      <ScrollView>
        <EventHeader 
          event={event}
          isFavorite={isFavorite}
          onBack={() => navigation.goBack()}
          onShare={handleShare}
          onToggleFavorite={handleToggleFavorite}
        />
        
        <EventInfo event={event} />
        
        
        <EventDescription description={event.descripcion} />
        
        
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
