/**
 * Este archivo maneja el modal de detalles de solicitud
 * - UI
 * - Roles
 * - Modal
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../../../../styles/ViewsRoleRequestStyles';
import DocumentsList from './DocumentsList';
import PortfolioLinks from './PortfolioLinks';

const RequestDetailsModal = ({ 
  visible, 
  request, 
  onClose, 
  onApprove, 
  onReject, 
  downloading,
  onDocumentPress 
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalHeader}>Detalles de la Solicitud</Text>
          
          {request && (
            <>
              <Text style={styles.modalName}>Usuario: {request.userName || request.userId}</Text>
              <Text style={styles.modalText}>Rol: {request.rolSolicitado}</Text>
              <Text style={styles.modalText}>Estado: {request.estado}</Text>
              <Text style={styles.modalText}>Justificación: {request.justificacion}</Text>
              
              {request.rolSolicitado === 'Artista' ? (
                <>
                  <Text style={styles.modalText}>Trayectoria: {request.trayectoriaArtistica}</Text>
                  <PortfolioLinks 
                    portafolio={request.portafolio} 
                    onDocumentPress={onDocumentPress} 
                  />
                </>
              ) : (
                <>
                  <Text style={styles.modalText}>Experiencia: {request.experienciaGestion}</Text>
                  <Text style={styles.modalText}>Espacio Cultural: {request.espacioCultural}</Text>
                  <Text style={styles.modalText}>Licencias: {request.licencias}</Text>
                </>
              )}
              <DocumentsList 
                documentos={request.documentos} 
                onDocumentPress={onDocumentPress} 
                downloading={downloading} 
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.approveButton]}
                  onPress={() => onApprove(request.id)}
                >
                  <Text style={styles.buttonText}>Aprobar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => onReject(request.id)}
                >
                  <Text style={styles.buttonText}>Rechazar</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, styles.closeButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default RequestDetailsModal;
