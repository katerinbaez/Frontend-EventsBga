import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/ManageSpaceEventsStyles';

const EventCard = ({ 
  event, 
  getCategoryColor, 
  getCategoryName, 
  formatDate, 
  formatTime, 
  onEdit, 
  onDelete 
}) => {
  return (
    <View key={event.id} style={[styles.eventCard, {borderLeftColor: getCategoryColor(event.categoria)}]}>
      <View style={[styles.categoryTag, {backgroundColor: getCategoryColor(event.categoria)}]}>
        <Text style={styles.categoryTagText}>{getCategoryName(event.categoria)}</Text>
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.titulo}</Text>
        <Text style={styles.eventDescription}>{event.descripcion}</Text>
        <Text style={styles.eventDate}>Fecha: {formatDate(event.fechaProgramada)}</Text>
        <Text style={styles.eventTime}>Hora: {formatTime(event.fechaProgramada)}</Text>
        <Text style={styles.eventAttendance}>Asistentes esperados: {event.asistentesEsperados || 0}</Text>
        
        <View style={styles.eventActions}>
          <TouchableOpacity 
            style={[styles.eventButton, styles.editButton]}
            onPress={() => onEdit(event)}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            <Text style={styles.eventButtonText}>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.eventButton, styles.deleteButton]}
            onPress={() => onDelete(event)}
          >
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
            <Text style={styles.eventButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default EventCard;
