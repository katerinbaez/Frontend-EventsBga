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
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFF',
    },
    closeButton: {
      padding: 5,
    },
    loader: {
      marginVertical: 20,
    },
    eventsList: {
      paddingBottom: 20,
    },
    eventItem: {
      backgroundColor: '#2A2A2A',
      borderRadius: 8,
      padding: 15,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: '#FF3A5E',
    },
    expiredEventItem: {
      borderLeftColor: '#A0A0A0',
      opacity: 0.8,
    },
    eventInfo: {
      marginBottom: 10,
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 5,
    },
    expiredBadge: {
      backgroundColor: '#A0A0A0',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    expiredBadgeText: {
      color: '#333',
      fontSize: 10,
      fontWeight: 'bold',
    },
    eventDate: {
      fontSize: 14,
      color: '#FF3A5E',
      marginBottom: 8,
    },
    eventDescription: {
      fontSize: 14,
      color: '#CCC',
      marginBottom: 8,
    },
    eventCategory: {
      fontSize: 12,
      color: '#999',
    },
    expiredText: {
      color: '#A0A0A0',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attendButton: {
      backgroundColor: '#FF3A5E',
    },
    cancelButton: {
      backgroundColor: '#555',
    },
    buttonText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 14,
    },
    expiredNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#333',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 5,
    },
    expiredNoticeText: {
      color: '#A0A0A0',
      marginLeft: 5,
      fontSize: 14,
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
  });
  