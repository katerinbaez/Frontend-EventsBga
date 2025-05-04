import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Share,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const EventDetail = ({ route, navigation }) => {
  const { eventId } = route.params || {};
  const [event, setEvent] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (eventId) {
      loadEventDetails();
      if (user) {
        checkIfFavorite();
      }
    } else {
      setLoading(false);
      Alert.alert('Error', 'No se pudo identificar el evento');
    }
  }, [eventId, user]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      console.log('Cargando detalles del evento con ID:', eventId);
      console.log('Tipo de ID:', typeof eventId);
      
      // Intentar cargar desde la API unificada de eventos
      const url = `${BACKEND_URL}/api/events/${eventId}`;
      console.log('URL de la solicitud:', url);
      
      const response = await axios.get(url);
      
      console.log('Respuesta del servidor:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.success && response.data.event) {
        console.log('Evento cargado correctamente:', response.data.event);
        setEvent(response.data.event);
      } else {
        console.error('Respuesta incompleta del servidor:', response.data);
        Alert.alert(
          'Error', 
          'La información del evento está incompleta. Por favor, inténtelo de nuevo más tarde.'
        );
      }
    } catch (error) {
      console.error('Error al cargar detalles del evento:', error);
      
      // Mostrar mensaje de error más específico
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 404) {
          Alert.alert(
            'Evento no encontrado', 
            'El evento que estás buscando no existe o ha sido eliminado.'
          );
        } else {
          Alert.alert(
            'Error del servidor', 
            `Ocurrió un problema al cargar el evento (${error.response.status}). Por favor, inténtalo más tarde.`
          );
        }
      } else if (error.request) {
        // La solicitud se realizó pero no se recibió respuesta
        console.error('No se recibió respuesta:', error.request);
        Alert.alert(
          'Error de conexión', 
          'No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.'
        );
      } else {
        // Algo sucedió en la configuración de la solicitud que desencadenó un error
        console.error('Error de configuración:', error.message);
        Alert.alert(
          'Error', 
          'Ocurrió un problema al cargar el evento. Por favor, inténtalo más tarde.'
        );
      }
      
      // Navegar hacia atrás después de mostrar el error
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user || !eventId) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/favorites/check?userId=${user.id || user.sub}&eventId=${eventId}`);
      if (response.data && typeof response.data.isFavorite === 'boolean') {
        setIsFavorite(response.data.isFavorite);
      }
    } catch (error) {
      console.error('Error al verificar estado de favorito:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert(
        'Iniciar sesión',
        'Necesitas iniciar sesión para guardar favoritos',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${BACKEND_URL}/api/favorites?userId=${user.id || user.sub}&eventId=${eventId}`);
      } else {
        await axios.post(`${BACKEND_URL}/api/favorites`, {
          userId: user.id || user.sub,
          eventId: eventId
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado de favorito');
    }
  };

  const shareEvent = async () => {
    if (!event) return;
    
    try {
      await Share.share({
        message: `¡Mira este evento cultural! "${event.titulo}" - ${event.descripcion}`,
        title: event.titulo
      });
    } catch (error) {
      console.error('Error al compartir evento:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3A5E" />
        <Text style={styles.loadingText}>Cargando evento...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3A5E" />
        <Text style={styles.errorText}>No se pudo cargar el evento</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {event.imagenUrl ? (
        <Image 
          source={{ uri: event.imagenUrl }} 
          style={styles.eventImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={80} color="#CCC" />
        </View>
      )}
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.eventTitle}>{event.titulo}</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{event.categoria}</Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={toggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF3A5E" : "#666"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={shareEvent}
          >
            <Ionicons name="share-social-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            {event.isEventRequest && event.fechaInicio 
              ? new Date(event.fechaInicio).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : event.fechaProgramada 
                ? new Date(event.fechaProgramada).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Fecha por confirmar'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            {event.isEventRequest && event.fechaInicio 
              ? new Date(event.fechaInicio).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : event.fechaProgramada 
                ? new Date(event.fechaProgramada).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Hora por confirmar'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            {event.space?.nombre || 'Ubicación por confirmar'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            {event.isEventRequest 
              ? (event.artist?.nombreArtistico || 'Artista por confirmar')
              : (event.space?.nombre || 'Espacio cultural por confirmar')}
          </Text>
        </View>
      </View>
      
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.descriptionText}>{event.descripcion || 'Sin descripción disponible'}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('EventRegistration', { eventId: event.id })}
      >
        <Text style={styles.registerButtonText}>Registrarme</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF3A5E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  titleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#FF3A5E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#CCC',
  },
  descriptionSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#CCC',
  },
  registerButton: {
    backgroundColor: '#FF3A5E',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventDetail;
