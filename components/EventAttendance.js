import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import EventAttendeesModal from './EventAttendeesModal';

const EventAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { managerId } = route.params || {};

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/manager-events/manager/${managerId}`);
      
      if (response.data && response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
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

  const renderEventItem = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.titulo}</Text>
        <Text style={[styles.eventStatus, 
          item.estado === 'programado' ? styles.statusScheduled : 
          item.estado === 'completado' ? styles.statusCompleted : 
          styles.statusCancelled
        ]}>
          {item.estado.toUpperCase()}
        </Text>
      </View>
      
      <Text style={styles.eventDate}>
        <Ionicons name="calendar-outline" size={16} color="#999" /> {formatDate(item.fechaProgramada)}
      </Text>
      
      <Text style={styles.eventDescription} numberOfLines={2}>
        {item.descripcion}
      </Text>
      
      <View style={styles.eventFooter}>
        <TouchableOpacity 
          style={styles.attendeesButton}
          onPress={() => handleViewAttendees(item)}
        >
          <Ionicons name="people" size={18} color="#FFF" />
          <Text style={styles.buttonText}>Ver Artistas Confirmados</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.eventsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#333" />
          <Text style={styles.emptyText}>No hay eventos programados</Text>
          <Text style={styles.emptySubtext}>
            Los eventos que programes aparecerán aquí
          </Text>
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#121212',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsList: {
    padding: 15,
  },
  eventCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  eventStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusScheduled: {
    backgroundColor: '#3498db',
    color: '#FFFFFF',
  },
  statusCompleted: {
    backgroundColor: '#2ecc71',
    color: '#FFFFFF',
  },
  statusCancelled: {
    backgroundColor: '#e74c3c',
    color: '#FFFFFF',
  },
  eventDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  attendeesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A95FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default EventAttendance;
