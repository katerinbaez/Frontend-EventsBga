/**
 * Este archivo maneja la visualización de solicitudes de rol
 * - UI
 * - Roles
 * - Vista
 */

import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { styles } from '../../../../styles/ViewsRoleRequestStyles';
import useViewRoleRequests from '../hooks/useViewRoleRequests';
import RequestCard from '../ui/RequestCard';
import RequestDetailsModal from '../ui/RequestDetailsModal';

const ViewRoleRequests = () => {
  const {
    requests,
    error,
    selectedRequest,
    modalVisible,
    downloading,
    handleUpdateStatus,
    handleDocumentPress,
    handleRequestSelect,
    closeModal
  } = useViewRoleRequests();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Solicitudes de Rol</Text>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RequestCard 
              request={item} 
              onPress={handleRequestSelect}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
          }
        />
      )}

      <RequestDetailsModal 
        visible={modalVisible}
        request={selectedRequest}
        onClose={closeModal}
        onApprove={(id) => handleUpdateStatus(id, 'Aprobado')}
        onReject={(id) => handleUpdateStatus(id, 'Rechazado')}
        downloading={downloading}
        onDocumentPress={handleDocumentPress}
      />
    </View>
  );
};

export default ViewRoleRequests;
