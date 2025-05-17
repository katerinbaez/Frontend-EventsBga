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
import { styles } from '../../../../styles/RequestModalStyles';

// Componentes UI
import CategoryFilter from '../ui/CategoryFilter';
import EmptyManagerRequestsList from '../ui/EmptyManagerRequestsList';
import ManagerRequestItem from '../ui/ManagerRequestItem';
import ManagerRequestDetailsModal from '../ui/ManagerRequestDetailsModal';

// Hooks
import useRequestsManager from '../hooks/useRequestsManager';

const RequestsModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const {
    loading,
    filteredRequests,
    selectedRequest,
    detailsModalVisible,
    rejectionReason,
    processingRequest,
    selectedCategory,
    categories,
    setRejectionReason,
    handleCategoryChange,
    showRequestDetails,
    setDetailsModalVisible,
    handleApproveRequest,
    handleRejectRequest,
    getArtistContact
  } = useRequestsManager(visible, user);

  const renderRequestItem = (request, index) => {
    return (
      <ManagerRequestItem
        key={request.id || index}
        request={request}
        onPress={() => showRequestDetails(request)}
      />
    );
  };

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
            <Text style={styles.title}>Solicitudes de Eventos</Text>
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
              {filteredRequests.length > 0 || categories.length > 0 ? (
                <>
                  <CategoryFilter 
                    categories={categories}
                    selectedCategory={selectedCategory}
                    handleCategoryChange={handleCategoryChange}
                  />

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map(renderRequestItem)
                    ) : (
                      <View style={styles.emptyFilterContainer}>
                        <Ionicons name="filter-outline" size={40} color="#999" />
                        <Text style={styles.emptyFilterText}>No hay solicitudes en esta categoría</Text>
                      </View>
                    )}
                  </ScrollView>
                </>
              ) : (
                <EmptyManagerRequestsList />
              )}
            </>
          )}
        </View>
      </View>

      <ManagerRequestDetailsModal
        visible={detailsModalVisible}
        request={selectedRequest}
        onClose={() => setDetailsModalVisible(false)}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        processingRequest={processingRequest}
        handleApproveRequest={handleApproveRequest}
        handleRejectRequest={handleRejectRequest}
        getArtistContact={getArtistContact}
      />
    </Modal>
  );
};

export default RequestsModal;
