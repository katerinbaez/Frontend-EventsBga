import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
      backgroundColor: '#000000',
      borderBottomWidth: 1,
      borderBottomColor: '#222',
    },
    backButton: {
      marginRight: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      flex: 1,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FF3A5E',
      justifyContent: 'center',
      alignItems: 'center',
    },
    eventsList: {
      flex: 1,
      padding: 20,
    },
    eventCard: {
      backgroundColor: '#1a1a1a',
      borderRadius: 15,
      marginBottom: 20,
      overflow: 'hidden',
      borderLeftWidth: 3,
      borderLeftColor: '#FF3A5E',
    },
    eventImageContainer: {
      height: 180,
      position: 'relative',
    },
    eventImage: {
      width: '100%',
      height: '100%',
    },
    eventImagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: '#222',
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryTag: {
      position: 'absolute',
      right: 10,
      top: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    categoryTagText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 12,
    },
    eventContent: {
      padding: 15,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 10,
    },
    eventDate: {
      fontSize: 14,
      color: '#CCCCCC',
      marginBottom: 5,
    },
    eventTime: {
      fontSize: 14,
      color: '#CCCCCC',
      marginBottom: 15,
    },
    eventActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    eventButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      marginLeft: 10,
    },
    editButton: {
      backgroundColor: '#4A90E2',
    },
    deleteButton: {
      backgroundColor: '#FF3A5E',
    },
    eventButtonText: {
      color: '#FFFFFF',
      marginLeft: 5,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
      paddingBottom: 100,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginTop: 20,
    },
    emptyStateText: {
      fontSize: 16,
      color: '#CCCCCC',
      textAlign: 'center',
      marginTop: 10,
      paddingHorizontal: 40,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: '90%',
      backgroundColor: '#1a1a1a',
      borderRadius: 15,
      overflow: 'hidden',
    }
  });