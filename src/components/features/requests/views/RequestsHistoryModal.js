import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../context/AuthContext';
import { styles } from '../../../../styles/RequestHistoryModalStyles';

// Componentes UI
import RequestItem from '../ui/RequestItem';
import EmptyRequestsList from '../ui/EmptyRequestsList';
import RequestDetailsModal from '../ui/RequestDetailsModal';

// Hooks
import useRequestsHistory from '../hooks/useRequestsHistory';

const RequestsHistoryModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const {
    loading,
    requests,
    selectedRequest,
    detailsModalVisible,
    setDetailsModalVisible,
    showRequestDetails
  } = useRequestsHistory(visible, user);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Historial de Solicitudes</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF3A5E" />
              <Text style={styles.loadingText}>Cargando solicitudes...</Text>
            </View>
          ) : (
            <>
              {requests.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {requests.map(request => (
                    <RequestItem 
                      key={request.id}
                      request={request}
                      onPress={() => {/* No hacer nada al presionar */}}
                    />
                  ))}
                </ScrollView>
              ) : (
                <EmptyRequestsList />
              )}
            </>
          )}
        </View>
      </View>
      
      <RequestDetailsModal
        visible={detailsModalVisible}
        request={selectedRequest}
        onClose={() => setDetailsModalVisible(false)}
      />
    </Modal>
  );
};

export default RequestsHistoryModal;
