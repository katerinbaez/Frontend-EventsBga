/**
 * Este archivo maneja el encabezado del evento
 * - UI
 * - Datos
 * - Acciones
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/EventDetailStyles';

const EventHeader = ({ event, isFavorite, onBack, onShare, onToggleFavorite }) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.eventTitle}>
          {event.titulo || event.nombre || 'Evento sin título'}
        </Text>
        
        {event.categoria && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>
              {typeof event.categoria === 'object' ? event.categoria.nombre : event.categoria}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onShare}
        >
          <Ionicons name="share-social" size={24} color="#FF3A5E" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onToggleFavorite}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color="#FF3A5E" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onBack}
        >
          <Ionicons name="close" size={24} color="#FF3A5E" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventHeader;
