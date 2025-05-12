import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { BACKEND_URL } from '../../../constants/config';

const AvailableEventsModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendingEvents, setAttendingEvents] = useState({});
  const [artistProfile, setArtistProfile] = useState(null);

  // Cargar eventos disponibles y perfil del artista
  useEffect(() => {
    if (visible) {
      loadArtistProfile();
      loadAvailableEvents();
    }
  }, [visible]);

  // Cargar el perfil del artista para obtener el nombre artístico
  const loadArtistProfile = async () => {
    try {
      const artistId = user.sub || user.id;
      
      console.log('Intentando cargar perfil de artista con ID:', artistId);
      console.log('Datos del usuario:', user);
      
      if (!artistId) {
        console.error('No se pudo obtener el ID del artista');
        return;
      }
      
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${artistId}`);
      console.log('Respuesta completa del perfil:', response.data);
      
      if (response.data && response.data.success) {
        setArtistProfile(response.data.artist);
        console.log('Perfil de artista cargado:', response.data.artist);
        console.log('Nombre artístico:', response.data.artist?.nombreArtistico);
      } else {
        console.log('No se pudo cargar el perfil del artista:', response.data);
      }
    } catch (error) {
      console.error('Error al cargar el perfil del artista:', error.response?.data || error.message);
    }
  };

  const loadAvailableEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/event-attendances/available-events`);
      
      if (response.data && response.data.success) {
        setEvents(response.data.events);
        
        // Obtener el ID del artista
        const artistId = user.sub || user.id;
        
        if (!artistId) {
          console.error('No se pudo obtener el ID del artista para verificar asistencias');
          setLoading(false);
          return;
        }
        
        console.log('Verificando asistencias con artistId:', artistId);
        
        // Verificar a cuáles eventos ya ha confirmado asistencia el artista
        const attendanceMap = {};
        await Promise.all(response.data.events.map(async (event) => {
          try {
            const attendanceResponse = await axios.get(`${BACKEND_URL}/api/event-attendances/confirmed-artists/${event.id}`);
            if (attendanceResponse.data && attendanceResponse.data.success) {
              const isAttending = attendanceResponse.data.attendances.some(
                attendance => attendance.artistId === artistId
              );
              attendanceMap[event.id] = isAttending;
            }
          } catch (error) {
            console.error(`Error al verificar asistencia para evento ${event.id}:`, error);
          }
        }));
        
        setAttendingEvents(attendanceMap);
      }
    } catch (error) {
      console.error('Error al cargar eventos disponibles:', error);
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
      
      // Asegurarse de que tenemos el ID del artista
      const artistId = user.sub || user.id;
      
      if (!artistId) {
        console.error('No se pudo obtener el ID del artista');
        Alert.alert(
          'Error',
          'No se pudo identificar tu perfil de artista. Por favor, intenta iniciar sesión nuevamente.'
        );
        setLoading(false);
        return;
      }
      
      console.log('Enviando solicitud de asistencia:', {
        eventId,
        artistId
      });
      
      // Ahora solo enviamos el ID del artista, el backend se encarga de buscar el nombre artístico
      const response = await axios.post(`${BACKEND_URL}/api/event-attendances/confirm`, {
        eventId,
        artistId
      });
      
      if (response.data && response.data.success) {
        // Actualizar el estado local
        setAttendingEvents(prev => ({
          ...prev,
          [eventId]: true
        }));
        
        Alert.alert(
          'Éxito',
          'Has confirmado tu asistencia al evento correctamente.'
        );
      }
    } catch (error) {
      console.error('Error al confirmar asistencia:', error);
      Alert.alert(
        'Error',
        'No se pudo confirmar tu asistencia. Por favor, intenta de nuevo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAttendance = async (eventId) => {
    try {
      setLoading(true);
      
      // Asegurarse de que tenemos el ID del artista
      const artistId = user.sub || user.id;
      
      if (!artistId) {
        console.error('No se pudo obtener el ID del artista');
        Alert.alert(
          'Error',
          'No se pudo identificar tu perfil de artista. Por favor, intenta iniciar sesión nuevamente.'
        );
        setLoading(false);
        return;
      }
      
      console.log('Enviando solicitud de cancelación:', {
        eventId,
        artistId
      });
      
      // Ahora solo enviamos el ID del artista, el backend se encarga del resto
      const response = await axios.post(`${BACKEND_URL}/api/event-attendances/cancel`, {
        eventId,
        artistId
      });
      
      if (response.data && response.data.success) {
        // Actualizar el estado local
        setAttendingEvents(prev => ({
          ...prev,
          [eventId]: false
        }));
        
        Alert.alert(
          'Éxito',
          'Has cancelado tu asistencia al evento correctamente.'
        );
      }
    } catch (error) {
      console.error('Error al cancelar asistencia:', error);
      Alert.alert(
        'Error',
        'No se pudo cancelar tu asistencia. Por favor, intenta de nuevo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si un evento ha terminado (fecha vencida)
  const isEventExpired = (event) => {
    if (!event) return false;
    
    const currentDate = new Date();
    
    // Si hay fecha de fin, verificamos si ya pasó
    if (event.fechaFin) {
      return new Date(event.fechaFin) < currentDate;
    }
    
    // Si no hay fecha de fin, verificamos si la fecha de inicio ya pasó
    if (event.fechaInicio) {
      return new Date(event.fechaInicio) < currentDate;
    }
    
    // Si hay fecha programada (para solicitudes de eventos), verificamos si ya pasó
    if (event.fechaProgramada) {
      return new Date(event.fechaProgramada) < currentDate;
    }
    
    // Si no hay ninguna fecha, asumimos que no ha expirado
    return false;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  };

  const renderEventItem = ({ item }) => {
    const expired = isEventExpired(item);
    
    return (
      <View style={[
        styles.eventItem,
        expired ? styles.expiredEventItem : {}
      ]}>
        <View style={styles.eventInfo}>
          <View style={styles.titleContainer}>
            <Text style={[
              styles.eventTitle,
              expired ? styles.expiredText : {}
            ]}>
              {item.titulo}
            </Text>
            
            {expired && (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredBadgeText}>Terminado</Text>
              </View>
            )}
          </View>
          
          <Text style={[
            styles.eventDate,
            expired ? styles.expiredText : {}
          ]}>
            {formatDate(item.fechaProgramada)}
          </Text>
          
          <Text style={[
            styles.eventDescription,
            expired ? styles.expiredText : {}
          ]}>
            {item.descripcion}
          </Text>
          
          <Text style={[
            styles.eventCategory,
            expired ? styles.expiredText : {}
          ]}>
            Categoría: {item.categoria}
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          {expired ? (
            <View style={styles.expiredNotice}>
              <Ionicons name="time-outline" size={16} color="#A0A0A0" />
              <Text style={styles.expiredNoticeText}>Evento terminado</Text>
            </View>
          ) : attendingEvents[item.id] ? (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => handleCancelAttendance(item.id)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.attendButton]}
              onPress={() => handleAttendEvent(item.id)}
            >
              <Text style={styles.buttonText}>Asistir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
          <View style={styles.header}>
            <Text style={styles.title}>Eventos Disponibles</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>

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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay eventos disponibles en este momento</Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 5,
  },
  loader: {
    marginVertical: 20,
  },
  eventsList: {
    paddingBottom: 20,
  },
  eventItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
  },
  expiredEventItem: {
    borderLeftColor: '#A0A0A0',
    opacity: 0.8,
  },
  eventInfo: {
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  expiredBadge: {
    backgroundColor: '#A0A0A0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiredBadgeText: {
    color: '#333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 14,
    color: '#FF3A5E',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 8,
  },
  eventCategory: {
    fontSize: 12,
    color: '#999',
  },
  expiredText: {
    color: '#A0A0A0',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendButton: {
    backgroundColor: '#FF3A5E',
  },
  cancelButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  expiredNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  expiredNoticeText: {
    color: '#A0A0A0',
    marginLeft: 5,
    fontSize: 14,
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

export default AvailableEventsModal;
