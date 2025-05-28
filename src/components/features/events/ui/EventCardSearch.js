import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatTime } from '../utils/dateUtilsSearch';
import { isEventExpired } from '../utils/EventUtils';
import { styles } from '../../../../styles/EventSearchStyles';

/**
 * Componente para mostrar un evento individual
 */
const EventCardSearch = ({ 
  event, 
  navigation, 
  isFavorite, 
  onToggleFavorite 
}) => {
  // Determinar si el evento ha expirado (1 hora después de la hora de inicio)
  const expired = isEventExpired(event);
  
  // Obtener la fecha del evento (puede estar en diferentes propiedades)
  const eventDate = event.fechaInicio || event.fechaProgramada || event.fecha;
  
  // Manejar la navegación al detalle del evento
  const handleEventPress = () => {
    navigation.navigate('EventDetails', { 
      eventId: event.id || event._id,
    });
  };
  
  // Obtener la categoría del evento
  const getEventCategory = () => {
    if (typeof (event.categoria || event.category) === 'object') {
      return (event.categoria || event.category).nombre || 'Sin categoría';
    }
    return (event.categoria || event.category) || 'Sin categoría';
  };
  
  // Obtener la ubicación del evento
  const getEventLocation = () => {
    return event.space?.nombre || event.ubicacion || 'Centro del oriente';
  };
  
  // Obtener el organizador del evento
  const getEventOrganizer = () => {
    return event.organizador?.nombre || 'Centro del oriente';
  };
  
  return (
    <View style={[styles.eventCard, expired && styles.expiredEventCard]}>
      <TouchableOpacity
        style={styles.eventCardContent}
        onPress={handleEventPress}
      >
        <Text style={styles.eventTitle}>
          {event.titulo || 'Evento sin título'}
        </Text>
        
        <View style={styles.eventInfoContainer}>
          <View style={styles.eventInfoItem}>
            <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
            <Text style={styles.eventInfoText}>
              {formatDate(eventDate)}
            </Text>
          </View>
          
          <View style={styles.eventInfoItem}>
            <Ionicons name="time-outline" size={16} color="#FFFFFF" />
            <Text style={styles.eventInfoText}>
              {expired ? 'Terminado' : formatTime(eventDate)}
            </Text>
          </View>
          
          <View style={styles.eventInfoItem}>
            <Ionicons name="location-outline" size={16} color="#FFFFFF" />
            <Text style={styles.eventInfoText}>
              {getEventLocation()}
            </Text>
          </View>
          
          <View style={styles.eventInfoItem}>
            <Ionicons name="person-outline" size={16} color="#FFFFFF" />
            <Text style={styles.eventInfoText}>
              {getEventOrganizer()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.eventCategoryContainer}>
        {expired ? (
          <View style={styles.expiredEventBadge}>
            <Text style={styles.expiredEventBadgeText}>Terminado</Text>
          </View>
        ) : (
          <View style={styles.eventCategoryBadge}>
            <Text style={styles.eventCategoryBadgeText}>
              {getEventCategory()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default EventCardSearch;
