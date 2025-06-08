/**
 * Este archivo maneja la información del evento
 * - UI
 * - Datos
 * - Formato
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/EventDetailStyles';
import { formatDate } from '../services/EventDetailService';

const EventInfo = ({ event }) => {
  return (
    <View style={styles.infoSection}>
      <View style={styles.infoItem}>
        <Ionicons name="calendar" size={20} color="#FF3A5E" />
        <Text style={styles.infoText}>
          {formatDate(event.fechaProgramada || event.fechaInicio)}
        </Text>
      </View>
      
      <View style={styles.infoItem}>
        <Ionicons name="location" size={20} color="#FF3A5E" />
        <Text style={styles.infoText}>
          {event.space?.nombre || event.ubicacion || event.lugar || 'Ubicación no especificada'}
        </Text>
      </View>
      
      {(event.space?.direccion || event.direccion) && (
        <View style={styles.infoItem}>
          <Ionicons name="navigate" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            {event.space?.direccion || event.direccion}
          </Text>
        </View>
      )}
      
      {event.organizador && (
        <View style={styles.infoItem}>
          <Ionicons name="person" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            {typeof event.organizador === 'object' 
              ? event.organizador.nombre || 'Organizador desconocido'
              : event.organizador}
          </Text>
        </View>
      )}
      
      {event.estado && (
        <View style={styles.infoItem}>
          <Ionicons name="information-circle" size={20} color="#FF3A5E" />
          <Text style={styles.infoText}>
            Estado: {event.estado.charAt(0).toUpperCase() + event.estado.slice(1)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default EventInfo;
