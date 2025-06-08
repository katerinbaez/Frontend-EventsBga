/**
 * Este archivo maneja la vista de asistencia a eventos
 * - UI
 * - Eventos
 * - Asistentes
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from '../../../../styles/EventAttendanceStyles';

import EventCard from '../ui/EventCard';
import EmptyEventsList from '../ui/EmptyEventsList';
import EventAttendeesModal from './EventAttendeesModal';

import { loadManagerEvents } from '../services/EventAttendanceService';

const EventAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { managerId } = route.params || {};
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await loadManagerEvents(managerId);
      setEvents(eventsData);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudieron cargar los eventos. Por favor, intenta de nuevo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttendees = (event) => {
    setSelectedEvent(event);
    setAttendeesModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asistencia a Eventos</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF3A5E" />
        </View>
      ) : events.length > 0 ? (
        <FlatList
          data={events}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onViewAttendees={handleViewAttendees} 
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.eventsList}
        />
      ) : (
        <EmptyEventsList />
      )}

      <EventAttendeesModal
        visible={attendeesModalVisible}
        onClose={() => setAttendeesModalVisible(false)}
        eventId={selectedEvent?.id}
        eventTitle={selectedEvent?.titulo}
      />
    </View>
  );
};

export default EventAttendance;
