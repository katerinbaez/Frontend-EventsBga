import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 50,
      paddingBottom: 15,
      paddingHorizontal: 20,
      backgroundColor: '#121212',
    },
    backButton: {
      marginRight: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    eventsList: {
      padding: 15,
    },
    eventCard: {
      backgroundColor: '#1E1E1E',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: '#FF3A5E',
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
      flex: 1,
    },
    eventStatus: {
      fontSize: 12,
      fontWeight: 'bold',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      overflow: 'hidden',
    },
    statusScheduled: {
      backgroundColor: '#3498db',
      color: '#FFFFFF',
    },
    statusCompleted: {
      backgroundColor: '#2ecc71',
      color: '#FFFFFF',
    },
    statusCancelled: {
      backgroundColor: '#e74c3c',
      color: '#FFFFFF',
    },
    eventDate: {
      fontSize: 14,
      color: '#999',
      marginBottom: 10,
    },
    eventDescription: {
      fontSize: 14,
      color: '#CCCCCC',
      marginBottom: 15,
    },
    eventFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    attendeesButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#9D0A00',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 5,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 5,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginTop: 20,
    },
    emptySubtext: {
      fontSize: 14,
      color: '#999',
      textAlign: 'center',
      marginTop: 10,
    },
  });