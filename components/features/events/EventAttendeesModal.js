import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';

const EventAttendeesModal = ({ visible, onClose, eventId, eventTitle }) => {
  const [artistAttendees, setArtistAttendees] = useState([]);
  const [userAttendees, setUserAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('artists'); // 'artists' o 'users'

  // Cargar asistentes cuando se abre el modal
  useEffect(() => {
    if (visible && eventId) {
      loadConfirmedAttendees();
    }
  }, [visible, eventId]);

  const loadConfirmedAttendees = async () => {
    try {
      setLoading(true);
      
      // Cargar artistas confirmados
      const artistsResponse = await axios.get(`${BACKEND_URL}/api/event-attendances/confirmed-artists/${eventId}`);
      
      if (artistsResponse.data && artistsResponse.data.success) {
        setArtistAttendees(artistsResponse.data.attendances);
      }
      
      // Cargar usuarios confirmados
      const usersResponse = await axios.get(`${BACKEND_URL}/api/event-attendances/confirmed-users/${eventId}`);
      
      if (usersResponse.data && usersResponse.data.success) {
        setUserAttendees(usersResponse.data.attendances);
      }
    } catch (error) {
      console.error('Error al cargar asistentes confirmados:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los asistentes confirmados. Por favor, intenta de nuevo más tarde.'
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
        <Text style={styles.attendeeName}>
          {activeTab === 'artists' ? item.artistName : item.userName}
        </Text>
        <Text style={styles.confirmationDate}>
          Confirmado el: {formatDate(item.confirmationDate || item.createdAt)}
        </Text>
      </View>
    </View>
  );



  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'artists' && styles.activeTab]}
        onPress={() => setActiveTab('artists')}
      >
        <Text style={[styles.tabText, activeTab === 'artists' && styles.activeTabText]}>
          Artistas ({artistAttendees.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'users' && styles.activeTab]}
        onPress={() => setActiveTab('users')}
      >
        <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
          Usuarios ({userAttendees.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Asistentes Confirmados</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>

          <Text style={styles.eventTitle}>{eventTitle}</Text>
          
          {renderTabs()}
          
          {loading ? (
            <ActivityIndicator size="large" color="#FF3A5E" style={styles.loader} />
          ) : (activeTab === 'artists' ? artistAttendees.length > 0 : userAttendees.length > 0) ? (
            <FlatList
              data={activeTab === 'artists' ? artistAttendees : userAttendees}
              renderItem={renderAttendeeItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.attendeesList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay {activeTab === 'artists' ? 'artistas' : 'usuarios'} confirmados para este evento
              </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeeInfo: {
    flex: 1,
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF3A5E',
  },
  tabText: {
    color: '#AAA',
    fontSize: 16,
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default EventAttendeesModal;
