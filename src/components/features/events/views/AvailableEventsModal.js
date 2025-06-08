/**
 * Este archivo maneja el modal de eventos disponibles
 * - UI
 * - Eventos
 * - Estado
 */

import React, { useState, useEffect } from 'react';
import { View, Modal, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import { styles } from '../../../../styles/AvaiableEventsModalStyles';

import EventItem from '../ui/EventItem';
import EmptyEvents from '../ui/EmptyEvents';
import ModalHeader from '../ui/ModalHeader';

import { 
  loadArtistProfile, 
  loadAvailableEvents, 
  attendEvent, 
  cancelAttendance, 
  isEventExpired,
  formatDate 
} from '../services/EventService';

const AvailableEventsModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendingEvents, setAttendingEvents] = useState({});
  const [artistProfile, setArtistProfile] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchArtistProfile();
      fetchAvailableEvents();
    }
  }, [visible]);

  const fetchArtistProfile = async () => {
    const artistId = user.sub || user.id;
    const profile = await loadArtistProfile(artistId);
    if (profile) {
      setArtistProfile(profile);
    }
  };

  const fetchAvailableEvents = async () => {
    try {
      setLoading(true);
      const artistId = user.sub || user.id;
      const { events: availableEvents, attendingEvents: attendingMap } = await loadAvailableEvents(artistId);
      setEvents(availableEvents);
      setAttendingEvents(attendingMap);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudieron cargar los eventos disponibles. Por favor, intenta de nuevo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAttendEvent = async (eventId) => {
    try {
      setLoading(true);
      const artistId = user.sub || user.id;
      
      if (!artistId) {
        Alert.alert('Error', 'No se pudo obtener tu identificación de artista.');
        return;
      }
      
      if (!artistProfile || !artistProfile.nombreArtistico) {
        Alert.alert(
          'Perfil Incompleto',
          'No se pudo obtener tu nombre artístico. Por favor, completa tu perfil de artista primero.'
        );
        return;
      }
      
      const result = await attendEvent(eventId, artistId, artistProfile);
      
      if (result.success) {
        Alert.alert('Éxito', result.message);
        
        setAttendingEvents(prev => ({
          ...prev,
          [eventId]: true
        }));
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Ocurrió un error al confirmar la asistencia'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAttendance = async (eventId) => {
    try {
      setLoading(true);
      const artistId = user.sub || user.id;
      
      if (!artistId) {
        Alert.alert('Error', 'No se pudo obtener tu identificación de artista.');
        return;
      }
      
      const result = await cancelAttendance(eventId, artistId);
      
      if (result.success) {
        Alert.alert('Éxito', result.message);
        
        setAttendingEvents(prev => ({
          ...prev,
          [eventId]: false
        }));
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Ocurrió un error al cancelar la asistencia'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderEventItem = ({ item }) => {
    const expired = isEventExpired(item);
    return (
      <EventItem 
        event={item}
        isExpired={expired}
        isAttending={attendingEvents[item.id]}
        formatDate={formatDate}
        onAttend={handleAttendEvent}
        onCancel={handleCancelAttendance}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ModalHeader title="Eventos Disponibles" onClose={onClose} />

          {loading ? (
            <ActivityIndicator size="large" color="#FF3A5E" style={styles.loader} />
          ) : events.length > 0 ? (
            <FlatList
              data={events}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.eventsList}
            />
          ) : (
            <EmptyEvents />
          )}
        </View>
      </View>
    </Modal>
  );
};


export default AvailableEventsModal;
