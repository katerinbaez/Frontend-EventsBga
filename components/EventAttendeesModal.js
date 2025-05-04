import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const EventAttendeesModal = ({ visible, onClose, eventId, eventTitle }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar artistas confirmados cuando se abre el modal
  useEffect(() => {
    if (visible && eventId) {
      loadConfirmedArtists();
    }
  }, [visible, eventId]);

  const loadConfirmedArtists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/event-attendances/confirmed-artists/${eventId}`);
      
      if (response.data && response.data.success) {
        setAttendees(response.data.attendances);
      }
    } catch (error) {
      console.error('Error al cargar artistas confirmados:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los artistas confirmados. Por favor, intenta de nuevo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAttendeeItem = ({ item }) => (
    <View style={styles.attendeeItem}>
      <View style={styles.attendeeInfo}>
        <Text style={styles.attendeeName}>{item.artistName}</Text>
        <Text style={styles.confirmationDate}>
          Confirmado el: {formatDate(item.confirmationDate)}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Artistas Confirmados</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>

          <Text style={styles.eventTitle}>{eventTitle}</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#FF3A5E" style={styles.loader} />
          ) : attendees.length > 0 ? (
            <FlatList
              data={attendees}
              renderItem={renderAttendeeItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.attendeesList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay artistas confirmados para este evento</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  eventTitle: {
    fontSize: 16,
    color: '#FF3A5E',
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  loader: {
    marginVertical: 20,
  },
  attendeesList: {
    paddingBottom: 20,
  },
  attendeeItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3A95FF',
  },
  attendeeInfo: {
    marginBottom: 5,
  },
  attendeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  confirmationDate: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EventAttendeesModal;
