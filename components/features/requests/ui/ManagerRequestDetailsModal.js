import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/RequestModalStyles';
import { getStatusColor, getStatusIcon, formatDate, openLink, sendEmail, callPhone } from '../utils/requestManagerUtils';

const ManagerRequestDetailsModal = ({ 
  visible, 
  request, 
  onClose, 
  rejectionReason, 
  setRejectionReason, 
  processingRequest, 
  handleApproveRequest, 
  handleRejectRequest,
  getArtistContact
}) => {
  if (!request) return null;

  // Obtener información del artista
  const artistContact = getArtistContact(request);
  
  // Normalizar los datos de la solicitud para manejar diferentes formatos
  const normalizedRequest = {
    id: request.id,
    title: request.title || request.eventName || 'Sin título',
    description: request.description || 'Sin descripción',
    status: request.status || request.estado || 'pendiente',
    date: request.date || request.fecha || new Date(),
    startTime: request.startTime || request.horaInicio || '09:00',
    endTime: request.endTime || request.horaFin || '10:00',
    artistName: artistContact.nombreArtistico || 'Artista',
    artistEmail: artistContact.email || 'No disponible',
    createdAt: request.createdAt || new Date(),
    updatedAt: request.updatedAt,
    category: request.category || request.categoria || 'No especificada',
    artistId: request.artistId,
    rejectionReason: request.rejectionReason
  };

  // Formatear fechas para mostrar
  const formattedDate = formatDate(normalizedRequest.date);
  const formattedCreatedDate = formatDate(normalizedRequest.createdAt);
  const formattedUpdatedDate = normalizedRequest.updatedAt ? formatDate(normalizedRequest.updatedAt) : null;

  // Verificar si la solicitud está pendiente
  const isPending = normalizedRequest.status.toLowerCase() === 'pendiente';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.detailsModalContainer}>
        <View style={styles.detailsModalContent}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Detalles de la Solicitud</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close-outline" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.statusSection}>
              <View style={[
                styles.statusBadgeLarge, 
                { backgroundColor: getStatusColor(normalizedRequest.status) }
              ]}>
                <Ionicons 
                  name={getStatusIcon(normalizedRequest.status)} 
                  size={20} 
                  color="#FFFFFF" 
                  style={styles.statusIcon} 
                />
                <Text style={styles.statusTextLarge}>{normalizedRequest.status}</Text>
              </View>
              
              {normalizedRequest.rejectionReason && normalizedRequest.status.toLowerCase() === 'rechazada' && (
                <View style={styles.rejectionReasonContainer}>
                  <Text style={styles.rejectionReasonLabel}>Motivo del rechazo:</Text>
                  <Text style={styles.rejectionReasonText}>{normalizedRequest.rejectionReason}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Evento</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nombre:</Text>
                <Text style={styles.detailValue}>{normalizedRequest.title}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Descripción:</Text>
                <Text style={styles.detailValue}>{normalizedRequest.description}</Text>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Categoría:</Text>
                <Text style={styles.detailValue}>
                  {normalizedRequest.category.charAt(0).toUpperCase() + normalizedRequest.category.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Fecha y Horario</Text>
              <View style={styles.artistInfoContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha:</Text>
                  <Text style={styles.detailValue}>{formattedDate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Horario:</Text>
                  <Text style={styles.detailValue}>{normalizedRequest.startTime} - {normalizedRequest.endTime}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Artista</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nombre:</Text>
                <Text style={styles.detailValue}>{normalizedRequest.artistName}</Text>
              </View>
              <View style={{marginBottom: 8}}>
                <Text style={styles.detailLabel}>Email:</Text>
                <TouchableOpacity onPress={() => sendEmail(normalizedRequest.artistEmail)}>
                  <Text style={[styles.detailValue, {marginTop: 4}]}>{normalizedRequest.artistEmail}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Teléfono:</Text>
                <TouchableOpacity onPress={() => callPhone(artistContact.telefono)}>
                  <Text style={styles.detailValue}>{artistContact.telefono}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ciudad:</Text>
                <Text style={styles.detailValue}>{artistContact.ciudad}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Redes sociales:</Text>
                <View style={styles.socialMediaContainer}>
                  {artistContact.redes.facebook && (
                    <TouchableOpacity style={styles.socialMediaButton} onPress={() => openLink(artistContact.redes.facebook)}>
                      <Ionicons name="logo-facebook" size={20} color="#3B5998" />
                    </TouchableOpacity>
                  )}
                  {artistContact.redes.twitter && (
                    <TouchableOpacity style={styles.socialMediaButton} onPress={() => openLink(artistContact.redes.twitter)}>
                      <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                    </TouchableOpacity>
                  )}
                  {artistContact.redes.instagram && (
                    <TouchableOpacity style={styles.socialMediaButton} onPress={() => openLink(artistContact.redes.instagram)}>
                      <Ionicons name="logo-instagram" size={20} color="#FF69B4" />
                    </TouchableOpacity>
                  )}
                  {artistContact.redes.youtube && (
                    <TouchableOpacity style={styles.socialMediaButton} onPress={() => openLink(artistContact.redes.youtube)}>
                      <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Fechas</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Solicitado:</Text>
                <Text style={styles.detailValue}>{formattedCreatedDate}</Text>
              </View>
              {normalizedRequest.updatedAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Actualizado:</Text>
                  <Text style={styles.detailValue}>{formattedUpdatedDate}</Text>
                </View>
              )}
            </View>

            {isPending && (
              <View style={styles.actionSection}>
                <Text style={styles.actionTitle}>Acciones</Text>

                <TouchableOpacity 
                  style={styles.approveButton}
                  onPress={handleApproveRequest}
                  disabled={processingRequest}
                >
                  {processingRequest ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Aprobar Solicitud</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.rejectSection}>
                  <Text style={styles.rejectLabel}>Motivo del rechazo:</Text>
                  <TextInput
                    style={styles.rejectInput}
                    placeholder="Ingresa el motivo del rechazo"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                  />

                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={handleRejectRequest}
                    disabled={processingRequest}
                  >
                    {processingRequest ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Rechazar Solicitud</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ManagerRequestDetailsModal;
