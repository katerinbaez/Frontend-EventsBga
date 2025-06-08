/**
 * Este archivo maneja el ítem de evento
 * - UI
 * - Estado
 * - Acciones
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/AvaiableEventsModalStyles';
import { formatTime } from '../utils/dateUtilsSearch';

const EventItem = ({ 
  event, 
  isExpired, 
  isAttending, 
  formatDate, 
  onAttend, 
  onCancel 
}) => {
  return (
    <View style={[
      styles.eventItem,
      isExpired ? styles.expiredEventItem : {}
    ]}>
      <View style={styles.eventInfo}>
        <View style={styles.titleContainer}>
          <Text style={[
            styles.eventTitle,
            isExpired ? styles.expiredText : {}
          ]}>
            {event.titulo}
          </Text>
          
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredBadgeText}>Terminado</Text>
            </View>
          )}
        </View>
        
        <View style={styles.dateTimeContainer}>
          <Text style={[
            styles.eventDate,
            isExpired ? styles.expiredText : {}
          ]}>
            {formatDate(event.fechaProgramada || event.fechaInicio || event.fecha)}
          </Text>
          <Text style={[
            styles.eventTime,
            isExpired ? styles.expiredText : {}
          ]}>
            {isExpired ? 'Terminado' : formatTime(event.fechaProgramada || event.fechaInicio || event.fecha)}
          </Text>
        </View>
        
        <Text style={[
          styles.eventDescription,
          isExpired ? styles.expiredText : {}
        ]}>
          {event.descripcion}
        </Text>
        
        <Text style={[
          styles.eventCategory,
          isExpired ? styles.expiredText : {}
        ]}>
          Categoría: {event.categoria}
        </Text>
      </View>
      
      <View style={styles.actionButtons}>
        {isExpired ? (
          <View style={styles.expiredNotice}>
            <Ionicons name="time-outline" size={16} color="#A0A0A0" />
            <Text style={styles.expiredNoticeText}>Evento terminado</Text>
          </View>
        ) : isAttending ? (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => onCancel(event.id)}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.attendButton]}
            onPress={() => onAttend(event.id)}
          >
            <Text style={styles.buttonText}>Asistir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default EventItem;
