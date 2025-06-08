/**
 * Este archivo maneja el modal de asistentes
 * - UI
 * - Asistentes
 * - Eventos
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { styles } from '../../../../styles/EventAttendeesModalStyles';
import { formatDate } from '../services/EventAttendanceService';

const EventAttendeesModal = ({ visible, onClose, eventId, eventTitle }) => {
  const [artistAttendees, setArtistAttendees] = useState([]);
  const [userAttendees, setUserAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('artists');

  useEffect(() => {
    if (visible && eventId) {
      loadConfirmedAttendees();
    }
  }, [visible, eventId]);

  const loadConfirmedAttendees = async () => {
    try {
      setLoading(true);
      
      const artistsResponse = await axios.get(`${BACKEND_URL}/api/event-attendances/confirmed-artists/${eventId}`);
      
      if (artistsResponse.data && artistsResponse.data.success) {
        setArtistAttendees(artistsResponse.data.attendances);
      }
      
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

export default EventAttendeesModal;
