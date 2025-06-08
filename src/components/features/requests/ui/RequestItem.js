/**
 * Este archivo maneja el ítem de solicitud
 * - UI
 * - Solicitudes
 * - Ítem
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/RequestHistoryModalStyles';
import { getStatusColor, getStatusIcon, formatDate } from '../utils/requestUtils';

const RequestItem = ({ request, onPress }) => {
  console.log('Renderizando solicitud de artista:', request);
  return (
    <TouchableOpacity 
      key={request.id}
      style={styles.requestItem}
      onPress={onPress}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestName}>{request.spaceName !== 'Espacio Cultural' ? request.spaceName : 'Centro del oriente'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
          <Ionicons name={getStatusIcon(request.status)} size={14} color="#FFFFFF" style={styles.statusIcon} />
          <Text style={styles.statusText}>{request.status || 'Pendiente'}</Text>
        </View>
      </View>
      
      <View style={styles.requestDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#999" />
          <Text style={styles.detailText}>{formatDate(request.date)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#999" />
          <Text style={styles.detailText}>{request.startTime || '09:00'} - {request.endTime || '10:00'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RequestItem;
