import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    statusBarSpace: {
      height: 40, // Espacio adicional para compensar la barra de estado
      backgroundColor: '#000000',
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: '#000000',
    },
    header: {
      padding: 20,
      paddingTop: 30, // Aumentar el padding superior para dar más espacio al título
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    title: {
      fontSize: 32, // Aumentar el tamaño de la fuente
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 15, // Aumentar el margen inferior
      marginTop: 10, // Agregar margen superior
    },
    subtitle: {
      fontSize: 16,
      color: '#888',
      lineHeight: 22,
    },
    form: {
      padding: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      color: '#FFFFFF',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#1A1A1A',
      borderRadius: 8,
      padding: 12,
      color: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#333',
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  
  export default styles;
  