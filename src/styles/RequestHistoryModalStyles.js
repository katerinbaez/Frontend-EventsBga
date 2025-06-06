import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 15,
    },
    modalContent: {
      backgroundColor: '#1E1E1E',
      borderRadius: 15,
      padding: 20,
      width: '100%',
      maxWidth: 500,
      maxHeight: '90%',
      borderLeftWidth: 4,
      borderLeftColor: '#FF3A5E',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    closeButton: {
      padding: 5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#FFFFFF',
    },
    requestItem: {
      backgroundColor: '#2A2A2A',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      borderLeftWidth: 3,
      borderLeftColor: '#FF3A5E',
      overflow: 'hidden',
    },
    requestHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    requestName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      marginLeft: 10,
    },
    statusIcon: {
      marginRight: 5,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    requestDetails: {
      marginBottom: 10,
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      marginVertical: 10,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    detailText: {
      marginLeft: 8,
      color: '#CCCCCC',
      fontSize: 14,
    },
    requestFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 5,
    },
    requestDate: {
      color: '#999999',
      fontSize: 12,
      fontStyle: 'italic',
    },
    requestDateText: {
      color: '#999999',
      fontSize: 12,
      fontStyle: 'italic',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },
    emptyText: {
      color: '#FFFFFF',
      fontSize: 18,
      marginTop: 20,
      marginBottom: 10,
      textAlign: 'center',
    },
    emptySubtext: {
      color: '#999999',
      fontSize: 14,
      textAlign: 'center',
    },
    detailsModalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 15,
    },
    detailsModalContent: {
      backgroundColor: '#1E1E1E',
      borderRadius: 15,
      padding: 20,
      width: '100%',
      maxWidth: 500,
      maxHeight: '90%',
      borderLeftWidth: 4,
      borderLeftColor: '#FF3A5E',
    },
    detailsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    detailsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    statusSection: {
      alignItems: 'center',
      marginBottom: 20,
    },
    statusBadgeLarge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    statusTextLarge: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    rejectionReasonContainer: {
      marginTop: 15,
      padding: 15,
      backgroundColor: 'rgba(255, 58, 94, 0.1)',
      borderRadius: 10,
      width: '100%',
    },
    rejectionReasonLabel: {
      color: '#FF3A5E',
      fontWeight: 'bold',
      marginBottom: 5,
    },
    rejectionReasonText: {
      color: '#FFFFFF',
    },
    detailSection: {
      marginBottom: 20,
      padding: 15,
      backgroundColor: '#2A2A2A',
      borderRadius: 10,
    },
    detailSectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FF3A5E',
      marginBottom: 10,
    },
    detailRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    detailLabel: {
      color: '#999999',
      width: 120,
    },
    detailValue: {
      color: '#FFFFFF',
      flex: 1,
    },
  });
  