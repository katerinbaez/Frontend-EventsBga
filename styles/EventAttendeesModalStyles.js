import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: '#1E1E1E',
      borderRadius: 10,
      padding: 20,
      borderWidth: 1,
      borderColor: '#333',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFF',
    },
    eventTitle: {
      fontSize: 16,
      color: '#FF3A5E',
      marginBottom: 20,
    },
    closeButton: {
      padding: 5,
    },
    loader: {
      marginVertical: 20,
    },
    attendeesList: {
      paddingBottom: 20,
    },
    attendeeItem: {
      backgroundColor: '#2A2A2A',
      borderRadius: 8,
      padding: 15,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: '#3A95FF',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    attendeeInfo: {
      flex: 1,
    },
    attendeeName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 5,
    },
    confirmationDate: {
      fontSize: 14,
      color: '#999',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },
    emptyText: {
      color: '#999',
      fontSize: 16,
      textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: '#FF3A5E',
    },
    tabText: {
      color: '#AAA',
      fontSize: 16,
    },
    activeTabText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
  });