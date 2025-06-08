/**
 * Este archivo maneja el modal de confirmación
 * - UI
 * - Datos
 * - Acciones
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '../../../../styles/EventProgrammingStyles';
import { getCategoryLabel } from '../utils/categoryUtils';

const ConfirmationModal = ({ 
  visible, 
  eventName, 
  eventDate, 
  eventCategory, 
  eventType, 
  expectedAttendees, 
  selectedTimeSlots,
  getTimeRange,
  calculateTotalDuration,
  loading, 
  onCancel, 
  onConfirm 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirmar Programación</Text>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Nombre del Evento:</Text>
            <Text style={styles.modalValue}>{eventName}</Text>
            
            <Text style={styles.modalLabel}>Fecha:</Text>
            <Text style={styles.modalValue}>
              {eventDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            
            <Text style={styles.modalLabel}>Horario:</Text>
            <Text style={styles.modalValue}>
              {selectedTimeSlots.length > 0 ? 
                `${getTimeRange().start.substring(0, 5)} - ${getTimeRange().end.substring(0, 5)} (${calculateTotalDuration()} horas)` : 
                'No seleccionado'}
            </Text>
            
            <Text style={styles.modalLabel}>Categoría:</Text>
            <Text style={styles.modalValue}>{getCategoryLabel(eventCategory)}</Text>
            
            <Text style={styles.modalLabel}>Tipo de Evento:</Text>
            <Text style={styles.modalValue}>{eventType || 'No especificado'}</Text>
            
            <Text style={styles.modalLabel}>Asistentes Esperados:</Text>
            <Text style={styles.modalValue}>{expectedAttendees || '0'}</Text>
            
            <Text style={styles.modalWarning}>
              Al programar este evento, los horarios seleccionados quedarán bloqueados automáticamente.
            </Text>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;