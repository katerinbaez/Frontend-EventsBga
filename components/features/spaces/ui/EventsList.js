import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/ManageSpaceEventsStyles';
import EventCard from './EventCard';

const EventsList = ({ 
  events, 
  loading, 
  getCategoryColor, 
  getCategoryName, 
  formatDate, 
  formatTime, 
  onEditEvent, 
  onDeleteEvent 
}) => {
  if (loading) {
    return (
      <View style={[styles.eventsList, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF3A5E" />
        <Text style={{color: '#FFFFFF', marginTop: 20}}>Cargando eventos...</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={[styles.eventsList, styles.emptyState]}>
        <Ionicons name="calendar-outline" size={80} color="#444" />
        <Text style={styles.emptyStateTitle}>No hay eventos</Text>
        <Text style={styles.emptyStateText}>
          No se encontraron eventos para este espacio cultural. 
          Puedes crear nuevos eventos desde el panel de administración.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.eventsList}>
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          getCategoryColor={getCategoryColor}
          getCategoryName={getCategoryName}
          formatDate={formatDate}
          formatTime={formatTime}
          onEdit={onEditEvent}
          onDelete={onDeleteEvent}
        />
      ))}
    </ScrollView>
  );
};

export default EventsList;
