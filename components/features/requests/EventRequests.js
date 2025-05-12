import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';

const EventRequests = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilterActive, setStatusFilterActive] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Solicitar las solicitudes de eventos para el espacio cultural del gestor
      const response = await axios.get(`${BACKEND_URL}/api/events/requests/space/${user.id}`);
      
      if (response.data && response.data.requests) {
        setRequests(response.data.requests);
      } else {
        // Si no hay datos reales, usamos estos datos de demostración
        setRequests([
          {
            _id: '1',
            titulo: 'Concierto de Rock',
            descripcion: 'Un evento de rock con bandas locales',
            fecha: '2025-05-01',
            horaInicio: '19:00',
            horaFin: '22:00',
            estado: 'pendiente',
            artista: {
              _id: 'art1',
              nombreArtistico: 'Banda Rock City',
              email: 'rock@example.com'
            }
          },
          {
            _id: '2',
            titulo: 'Exposición de Arte',
            descripcion: 'Muestra de arte contemporáneo',
            fecha: '2025-05-05',
            horaInicio: '15:00',
            horaFin: '20:00',
            estado: 'aprobado',
            artista: {
              _id: 'art2',
              nombreArtistico: 'Galería Moderna',
              email: 'arte@example.com'
            }
          },
          {
            _id: '3',
            titulo: 'Teatro Infantil',
            descripcion: 'Obra de teatro para niños',
            fecha: '2025-04-29',
            horaInicio: '10:00',
            horaFin: '12:00',
            estado: 'rechazado',
            artista: {
              _id: 'art3',
              nombreArtistico: 'Compañía Teatral Kids',
              email: 'teatro@example.com'
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes de eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/events/requests/${requestId}/approve`);
      
      if (response.data.success) {
        Alert.alert('Éxito', 'Solicitud aprobada correctamente');
        
        // Actualizar el estado local
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req._id === requestId ? { ...req, estado: 'aprobado' } : req
          )
        );

        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      Alert.alert('Error', 'No se pudo aprobar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/events/requests/${requestId}/reject`);
      
      if (response.data.success) {
        Alert.alert('Éxito', 'Solicitud rechazada correctamente');
        
        // Actualizar el estado local
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req._id === requestId ? { ...req, estado: 'rechazado' } : req
          )
        );

        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      Alert.alert('Error', 'No se pudo rechazar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (statusFilterActive === 'all') return requests;
    
    const statusMap = {
      'pending': 'pendiente',
      'approved': 'aprobado',
      'rejected': 'rechazado'
    };
    
    return requests.filter(req => req.estado === statusMap[statusFilterActive]);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const renderRequestItem = ({ item }) => {
    // Determinar el color del borde según el estado
    let borderColor = '#FF3A5E'; // Color por defecto para pendiente
    
    if (item.estado === 'aprobado') {
      borderColor = '#4CAF50';
    } else if (item.estado === 'rechazado') {
      borderColor = '#F44336';
    }
    
    return (
      <TouchableOpacity
        style={[styles.requestCard, { borderLeftColor: borderColor }]}
        onPress={() => {
          setSelectedRequest(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>{item.titulo}</Text>
          <View style={[
            styles.statusBadge,
            item.estado === 'pendiente' ? styles.pendingBadge : 
            item.estado === 'aprobado' ? styles.approvedBadge : styles.rejectedBadge
          ]}>
            <Text style={styles.statusText}>
              {item.estado === 'pendiente' ? 'Pendiente' : 
               item.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.artistName}>
          <Ionicons name="person" size={16} color="#999" /> {item.artista.nombreArtistico}
        </Text>
        
        <Text style={styles.requestDate}>
          <Ionicons name="calendar" size={16} color="#999" /> {formatDate(item.fecha)}
        </Text>
        
        <Text style={styles.requestTime}>
          <Ionicons name="time" size={16} color="#999" /> {item.horaInicio} - {item.horaFin}
        </Text>
        
        <Text style={styles.requestDescription} numberOfLines={2}>
          {item.descripcion}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar" size={60} color="#444" />
      <Text style={styles.emptyText}>No hay solicitudes disponibles</Text>
      <Text style={styles.emptySubText}>Cuando los artistas soliciten eventos en tu espacio, aparecerán aquí</Text>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return '#FF3A5E';
      case 'aprobado': return '#4CAF50';
      case 'rechazado': return '#F44336';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF3A5E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitudes de Eventos</Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por estado:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              statusFilterActive === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilterActive('all')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilterActive === 'all' && styles.filterButtonTextActive
            ]}>Todos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              statusFilterActive === 'pending' && styles.filterButtonActive,
              statusFilterActive === 'pending' && { backgroundColor: 'rgba(255, 58, 94, 0.1)' }
            ]}
            onPress={() => setStatusFilterActive('pending')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilterActive === 'pending' && { color: '#FF3A5E' }
            ]}>Pendientes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              statusFilterActive === 'approved' && styles.filterButtonActive,
              statusFilterActive === 'approved' && { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
            ]}
            onPress={() => setStatusFilterActive('approved')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilterActive === 'approved' && { color: '#4CAF50' }
            ]}>Aprobados</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              statusFilterActive === 'rejected' && styles.filterButtonActive,
              statusFilterActive === 'rejected' && { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
            ]}
            onPress={() => setStatusFilterActive('rejected')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilterActive === 'rejected' && { color: '#F44336' }
            ]}>Rechazados</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={getFilteredRequests()}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.requestsList}
        ListEmptyComponent={renderEmptyList}
      />

      {/* Modal de detalles de solicitud */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            
            {selectedRequest && (
              <>
                <View style={[
                  styles.modalStatusBar,
                  { backgroundColor: getStatusColor(selectedRequest.estado) }
                ]}>
                  <Text style={styles.modalStatusText}>
                    {selectedRequest.estado === 'pendiente' ? 'PENDIENTE' : 
                     selectedRequest.estado === 'aprobado' ? 'APROBADO' : 'RECHAZADO'}
                  </Text>
                </View>
                
                <Text style={styles.modalTitle}>{selectedRequest.titulo}</Text>
                
                <View style={styles.modalInfoRow}>
                  <Ionicons name="person" size={20} color="#FF3A5E" />
                  <Text style={styles.modalInfoText}>{selectedRequest.artista.nombreArtistico}</Text>
                </View>
                
                <View style={styles.modalInfoRow}>
                  <Ionicons name="mail" size={20} color="#FF3A5E" />
                  <Text style={styles.modalInfoText}>{selectedRequest.artista.email}</Text>
                </View>
                
                <View style={styles.modalInfoRow}>
                  <Ionicons name="calendar" size={20} color="#FF3A5E" />
                  <Text style={styles.modalInfoText}>{formatDate(selectedRequest.fecha)}</Text>
                </View>
                
                <View style={styles.modalInfoRow}>
                  <Ionicons name="time" size={20} color="#FF3A5E" />
                  <Text style={styles.modalInfoText}>{selectedRequest.horaInicio} - {selectedRequest.horaFin}</Text>
                </View>
                
                <Text style={styles.descriptionLabel}>Descripción del evento:</Text>
                <ScrollView style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>{selectedRequest.descripcion}</Text>
                </ScrollView>
                
                {selectedRequest.estado === 'pendiente' && (
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApproveRequest(selectedRequest._id)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Aprobar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectRequest(selectedRequest._id)}
                    >
                      <Ionicons name="close-circle" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterContainer: {
    padding: 15,
    backgroundColor: '#1a1a1a',
  },
  filterLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
  },
  filterButtonText: {
    color: '#CCCCCC',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FF3A5E',
  },
  requestsList: {
    padding: 15,
    paddingBottom: 30,
  },
  requestCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 10,
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
  },
  approvedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  rejectedBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  artistName: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  requestDate: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  requestTime: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  requestDescription: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    width: '100%',
    maxHeight: '80%',
    padding: 0,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStatusBar: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalStatusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    margin: 20,
    marginTop: 15,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  modalInfoText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginLeft: 10,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    margin: 20,
    marginBottom: 10,
  },
  descriptionContainer: {
    maxHeight: 150,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 5,
    flex: 0.48,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default EventRequests;
