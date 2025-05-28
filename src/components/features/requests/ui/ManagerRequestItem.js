import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/RequestModalStyles';
import { getStatusColor, getStatusIcon, formatDate } from '../utils/requestManagerUtils';

const ManagerRequestItem = ({ request, onPress }) => {
  // Normalizar los datos de la solicitud para manejar diferentes formatos
  const normalizedRequest = {
    id: request.id,
    title: request.title || request.eventName || request.titulo || 'Sin título',
    status: request.status || request.estado || 'pendiente',
    date: request.date || request.fecha || new Date(),
    startTime: request.startTime || request.horaInicio || '09:00',
    endTime: request.endTime || request.horaFin || '10:00',
    artistName: request.artistName || 'Artista',
    artistEmail: request.artistEmail || 'No disponible',
    createdAt: request.createdAt || new Date(),
    updatedAt: request.updatedAt,
    category: request.category || request.categoria || 'No especificada'
  };

  // Formatear fechas para mostrar
  const formattedDate = formatDate(normalizedRequest.date);
  const formattedCreatedDate = formatDate(normalizedRequest.createdAt);

  return (
    <TouchableOpacity 
      key={normalizedRequest.id}
      style={styles.requestItem}
      onPress={onPress}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestName}>{normalizedRequest.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(normalizedRequest.status) }]}>
          <Ionicons name={getStatusIcon(normalizedRequest.status)} size={14} color="#FFFFFF" style={styles.statusIcon} />
          <Text style={styles.statusText}>{normalizedRequest.status}</Text>
        </View>
      </View>
      
      <View style={styles.requestDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#999" />
          <Text style={styles.detailText}>{formattedDate}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#999" />
          <Text style={styles.detailText}>{normalizedRequest.startTime} - {normalizedRequest.endTime}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={16} color="#999" />
          <Text style={styles.detailText}>Artista</Text>
        </View>
      </View>
      
      <View style={styles.requestFooter}>
        <Text style={styles.categoryText}>
          {normalizedRequest.category.charAt(0).toUpperCase() + normalizedRequest.category.slice(1)}
        </Text>
        <Text style={styles.dateText}>Solicitado: {formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ManagerRequestItem;
