/**
 * Este archivo maneja el modal de confirmación
 * - UI
 * - Eventos
 * - Modal
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { styles } from '../../../../styles/EventRequestFormStyles';
import { formatDate } from '../utils/eventRequestUtils';

const ConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  loading,
  formData,
  timeRange
}) => {
  const {
    eventName,
    eventDescription,
    eventDate,
    expectedAttendees,
    eventType,
    eventCategory,
    customCategory,
    additionalRequirements,
    totalDuration,
    spaceName
  } = formData;
  
  const getCategoryDisplay = () => {
    if (eventCategory === 'otro' && customCategory) {
      return customCategory;
    }
    
    const categoryLabels = {
      'musica': 'Música',
      'danza': 'Danza',
      'teatro': 'Teatro',
      'artes_visuales': 'Artes Visuales',
      'literatura': 'Literatura',
      'cine': 'Cine',
      'fotografia': 'Fotografía',
      'otro': 'Otro'
    };
    
    return categoryLabels[eventCategory] || eventCategory;
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.confirmModalContainer}>
        <View style={styles.confirmModalContent}>
          <Text style={styles.confirmModalTitle}>Confirmar solicitud</Text>
          <Text style={styles.confirmModalSubtitle}>Por favor, verifica los detalles de tu solicitud:</Text>
          
          <View style={styles.confirmModalDetails}>
            <Text style={styles.confirmModalDetailItem}>Nombre del evento: {eventName}</Text>
            <Text style={styles.confirmModalDetailItem}>Fecha: {formatDate(eventDate)}</Text>
            <Text style={styles.confirmModalDetailItem}>Horario: {timeRange.start} - {timeRange.end}</Text>
            <Text style={styles.confirmModalDetailItem}>Duración: {totalDuration} {totalDuration === 1 ? 'hora' : 'horas'}</Text>
            <Text style={styles.confirmModalDetailItem}>Asistentes esperados: {expectedAttendees}</Text>
            <Text style={styles.confirmModalDetailItem}>Tipo de evento: {eventType}</Text>
            <Text style={styles.confirmModalDetailItem}>Categoría: {getCategoryDisplay()}</Text>
          </View>
          
          <Text style={styles.confirmModalQuestion}>¿Deseas enviar esta solicitud?</Text>
          
          <View style={styles.confirmModalButtons}>
            <TouchableOpacity
              style={styles.confirmModalCancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.confirmModalCancelText}>CANCELAR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmModalConfirmButton}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmModalConfirmText}>ENVIAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};



export default ConfirmationModal;
