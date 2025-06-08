/**
 * Este archivo maneja la tarjeta de evento
 * - UI
 * - Datos
 * - Estado
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/EventAttendanceStyles';
import { formatDate } from '../services/EventAttendanceService';


const EventCard = ({ event, onViewAttendees }) => {
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.titulo}</Text>
        <Text style={[styles.eventStatus, 
          event.estado === 'programado' ? styles.statusScheduled : 
          event.estado === 'completado' ? styles.statusCompleted : 
          styles.statusCancelled
        ]}>
          {event.estado.toUpperCase()}
        </Text>
      </View>
      
      <Text style={styles.eventDate}>
        <Ionicons name="calendar-outline" size={16} color="#999" /> {formatDate(event.fechaProgramada)}
      </Text>
      
      <Text style={styles.eventDescription} numberOfLines={2}>
        {event.descripcion}
      </Text>
      
      <View style={styles.eventFooter}>
        <TouchableOpacity 
          style={styles.attendeesButton}
          onPress={() => onViewAttendees(event)}
        >
          <Ionicons name="people" size={18} color="#FFF" />
          <Text style={styles.buttonText}>Ver Asistentes Confirmados</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventCard;
