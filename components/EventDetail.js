import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Share,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EventDetail = ({ route, navigation, user }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadEventDetails();
    checkIfFavorite();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('Error loading event details:', error);
      Alert.alert('Error', 'No se pudo cargar el evento');
    }
  };

  const checkIfFavorite = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/favorites/check?userId=${user.id}&eventId=${eventId}`);
      const { isFavorite } = await response.json();
      setIsFavorite(isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
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
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId: eventId
        }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'No se pudo actualizar favoritos');
    }
  };

  const shareEvent = async () => {
    try {
      await Share.share({
        message: `¡Mira este evento en EventsBga!\n\n${event.titulo}\n${event.descripcion}\n\nFecha: ${new Date(event.fechaInicio).toLocaleDateString()}\nLugar: ${event.space?.nombre || 'Por confirmar'}\n\nDescarga la app para más información.`,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: event.imagen || 'https://via.placeholder.com/400x200' }}
        style={styles.eventImage}
      />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{event.titulo}</Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{event.categoria}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={toggleFavorite}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#FF6B6B' : '#7F8C8D'}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={shareEvent}
          >
            <Ionicons name="share-social" size={24} color="#7F8C8D" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={20} color="#4A90E2" />
          <Text style={styles.infoText}>
            {new Date(event.fechaInicio).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="time" size={20} color="#4A90E2" />
          <Text style={styles.infoText}>
            {new Date(event.fechaInicio).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
            {' - '}
            {new Date(event.fechaFin).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="location" size={20} color="#4A90E2" />
          <Text 
            style={[styles.infoText, styles.locationText]}
            onPress={() => navigation.navigate('CulturalSpace', { 
              spaceId: event.space?.id 
            })}
          >
            {event.space?.nombre || 'Ubicación por confirmar'}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="person" size={20} color="#4A90E2" />
          <Text 
            style={[styles.infoText, styles.artistText]}
            onPress={() => navigation.navigate('ArtistProfile', { 
              artistId: event.artist?.id 
            })}
          >
            {event.artist?.nombreArtistico || 'Artista por confirmar'}
          </Text>
        </View>

        {event.precio > 0 ? (
          <View style={styles.infoItem}>
            <Ionicons name="ticket" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>${event.precio}</Text>
          </View>
        ) : (
          <View style={styles.infoItem}>
            <Ionicons name="ticket" size={20} color="#2ECC71" />
            <Text style={[styles.infoText, styles.freeText]}>Entrada Libre</Text>
          </View>
        )}
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Descripción</Text>
        <Text style={styles.description}>{event.descripcion}</Text>
      </View>

      {event.precio > 0 && (
        <TouchableOpacity 
          style={styles.reserveButton}
          onPress={() => navigation.navigate('EventReservation', { eventId })}
        >
          <Text style={styles.reserveButtonText}>Reservar Entrada</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  category: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  infoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  locationText: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  artistText: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  freeText: {
    color: '#2ECC71',
    fontWeight: '500',
  },
  descriptionContainer: {
    padding: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
  },
  reserveButton: {
    margin: 16,
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventDetail;
