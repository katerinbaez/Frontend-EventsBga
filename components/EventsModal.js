import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Modal,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const EventsModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [registering, setRegistering] = useState(false);
  
  useEffect(() => {
    if (visible && user) {
      loadEvents();
    }
  }, [visible, user]);
  
  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/events/approved`);
      console.log('Respuesta de eventos:', response.data);
      
      if (response.data.success) {
        // Ordenar por fecha, más próximos primero
        const sortedEvents = response.data.events.sort((a, b) => 
          new Date(a.fecha) - new Date(b.fecha)
        );
        
        // Filtrar eventos futuros
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureEvents = sortedEvents.filter(event => 
          new Date(event.fecha) >= today
        );
        
        setEvents(futureEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos. Intenta nuevamente.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  const showEventDetails = (event) => {
    setSelectedEvent(event);
    setDetailsModalVisible(true);
  };
  
  const registerForEvent = async () => {
    if (!selectedEvent || !user) return;
    
    setRegistering(true);
    try {
      const registration = {
        eventId: selectedEvent.id,
        artistId: user.id,
        artistName: user.name || user.nickname || 'Artista',
        artistEmail: user.email || '',
        status: 'confirmado'
      };
      
      const response = await axios.post(`${BACKEND_URL}/api/event-registrations`, registration);
      console.log('Respuesta de registro:', response.data);
      
      if (response.data.success) {
        Alert.alert(
          'Registro Exitoso', 
          'Te has registrado correctamente para este evento. Recibirás más información por correo electrónico.',
          [{ text: 'OK', onPress: () => {
            setDetailsModalVisible(false);
            setSelectedEvent(null);
          }}]
        );
      } else {
        Alert.alert('Error', response.data.message || 'No se pudo completar el registro');
      }
    } catch (error) {
      console.error('Error al registrarse para el evento:', error);
      
      // Verificar si es un error de duplicado
      if (error.response && error.response.status === 400 && error.response.data.message.includes('ya está registrado')) {
        Alert.alert('Información', 'Ya estás registrado para este evento');
      } else {
        Alert.alert('Error', 'No se pudo completar el registro. Intenta nuevamente.');
      }
    } finally {
      setRegistering(false);
    }
  };
  
  const renderEventItem = (event, index) => {
    return (
      <TouchableOpacity 
        key={event.id || index}
        style={styles.eventItem}
        onPress={() => showEventDetails(event)}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventName}>{event.nombre}</Text>
          <View style={styles.eventDate}>
            <Ionicons name="calendar-outline" size={14} color="#FF3A5E" />
            <Text style={styles.dateText}>{formatDate(event.fecha)}</Text>
          </View>
        </View>
        
        {event.imagenUrl && (
          <Image 
            source={{ uri: event.imagenUrl }} 
            style={styles.eventImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.eventDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="business-outline" size={16} color="#999" />
            <Text style={styles.detailText}>{event.nombreEspacio}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#999" />
            <Text style={styles.detailText}>{event.horaInicio} - {event.horaFin}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={16} color="#999" />
            <Text style={styles.detailText}>Organizado por {event.nombreArtista || 'Artista'}</Text>
          </View>
        </View>
        
        <View style={styles.eventFooter}>
          <Text style={styles.eventType}>{event.tipo || 'Evento Cultural'}</Text>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderDetailsModal = () => {
    if (!selectedEvent) return null;
    
    return (
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.detailsModalContainer}>
          <View style={styles.detailsModalContent}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Detalles del Evento</Text>
              <TouchableOpacity 
                onPress={() => setDetailsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close-outline" size={24} color="#FF3A5E" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.eventDetailName}>{selectedEvent.nombre}</Text>
              
              {selectedEvent.imagenUrl && (
                <Image 
                  source={{ uri: selectedEvent.imagenUrl }} 
                  style={styles.eventDetailImage}
                  resizeMode="cover"
                />
              )}
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Información del Evento</Text>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="calendar-outline" size={20} color="#FF3A5E" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Fecha</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedEvent.fecha)}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="time-outline" size={20} color="#FF3A5E" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Horario</Text>
                    <Text style={styles.detailValue}>{selectedEvent.horaInicio} - {selectedEvent.horaFin}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="business-outline" size={20} color="#FF3A5E" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Espacio Cultural</Text>
                    <Text style={styles.detailValue}>{selectedEvent.nombreEspacio}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="person-outline" size={20} color="#FF3A5E" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Organizador</Text>
                    <Text style={styles.detailValue}>{selectedEvent.nombreArtista || 'Artista'}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="pricetag-outline" size={20} color="#FF3A5E" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Tipo de Evento</Text>
                    <Text style={styles.detailValue}>{selectedEvent.tipo || 'Evento Cultural'}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Descripción</Text>
                <Text style={styles.descriptionText}>{selectedEvent.descripcion}</Text>
              </View>
              
              {selectedEvent.requerimientos && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Requerimientos</Text>
                  <Text style={styles.descriptionText}>{selectedEvent.requerimientos}</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={registerForEvent}
                disabled={registering}
              >
                {registering ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.registerButtonText}>Registrarme para este evento</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Eventos Disponibles</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF3A5E" />
              <Text style={styles.loadingText}>Cargando eventos...</Text>
            </View>
          ) : (
            <>
              {events.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {events.map(renderEventItem)}
                </ScrollView>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={64} color="#999" />
                  <Text style={styles.emptyText}>No hay eventos próximos</Text>
                  <Text style={styles.emptySubtext}>
                    Cuando haya nuevos eventos disponibles, aparecerán aquí
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
      
      {renderDetailsModal()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eventItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  eventDate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
  },
  dateText: {
    color: '#FF3A5E',
    fontSize: 12,
    marginLeft: 5,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventDetails: {
    padding: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#CCCCCC',
    fontSize: 14,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
  },
  eventType: {
    color: '#999999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
  },
  detailsModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  detailsModalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventDetailName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  eventDetailImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  detailIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: '#999999',
    marginBottom: 3,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  descriptionText: {
    color: '#FFFFFF',
    lineHeight: 22,
  },
  registerButton: {
    backgroundColor: '#FF3A5E',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default EventsModal;
