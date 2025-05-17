import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#121212',
    },
    tabContainer: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: '#4A90E2',
    },
    tabText: {
      marginTop: 4,
      fontSize: 14,
      color: '#95A5A6',
    },
    activeTabText: {
      color: '#4A90E2',
      fontWeight: 'bold',
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: 16,
    },
    favoriteItem: {
      flexDirection: 'row',
      backgroundColor: '#1A1A1A',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 30, // Cambiado a circular para artistas
      marginRight: 12,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30, // Cambiado a circular para artistas
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemContent: {
      flex: 1,
      justifyContent: 'center',
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 4,
    },
    itemDescription: {
      fontSize: 14,
      color: '#AAA',
    },
    removeButton: {
      padding: 8,
    },
    errorText: {
      fontSize: 16,
      color: '#FF6B6B',
      textAlign: 'center',
      padding: 16,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: '#95A5A6',
      textAlign: 'center',
      marginTop: 16,
    },
    
    // Fin de los estilos
  });