import { StyleSheet, Platform, StatusBar } from "react-native";

export const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#000000',
      // Aseguramos que haya espacio suficiente en la parte superior
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 15,
      backgroundColor: '#000000',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      marginBottom: 20,
    },
    welcomeContainer: {
      marginRight: 70,
      marginBottom: 10,
      width: '80%',
    },
    welcome: {
      fontSize: 26,
      color: '#ffffff',
      fontWeight: '400',
      lineHeight: 32,
    },
    userName: {
      fontSize: 24,
      color: '#00EA01',
      fontWeight: 'bold',
      marginTop: 5,
      width: '100%',
      maxWidth: 250,
    },
    headerButton: {
      position: 'absolute',
      right: 15,
      top: 50,
      backgroundColor: '#00EA01',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    headerButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    optionsContainer: {
      padding: 20,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    optionCard: {
      backgroundColor: '#1a1a1a',
      borderRadius: 15,
      borderColor:'#00EA01',
      borderWidth:1,
      padding: 20,
      width: '47%',
      marginBottom: 20,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      alignItems: 'center',
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
      marginTop: 10,
      textAlign: 'center',
    },
    optionDescription: {
      fontSize: 12,
      color: '#cccccc',
      marginTop: 5,
      textAlign: 'center',
    },
  
  });