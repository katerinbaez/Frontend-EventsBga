import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
    // Contenedor principal con fondo negro
    container: {
      flex: 1,
      backgroundColor: '#121212', // Fondo negro más suave
    },
    // Encabezado con gradiente visual
    header: {
      backgroundColor: '#1E1E1E',
      paddingTop: 45,
      paddingBottom: 18,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#FF3A5E',
    },
    backButton: {
      marginRight: 15,
      backgroundColor: 'rgba(255, 58, 94, 0.2)',
      padding: 8,
      borderRadius: 20,
    },
    headerTitle: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    // Contenido principal
    content: {
      flex: 1,
      padding: 20,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#FFF',
      textShadowColor: 'rgba(255, 58, 94, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 3,
    },
    spaceInfo: {
      fontSize: 16,
      marginBottom: 20,
      color: '#CCC',
      fontStyle: 'italic',
    },
    // Contenedor del formulario con fondo oscuro
    formContainer: {
      backgroundColor: '#1E1E1E',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#FF3A5E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 1,
      borderColor: '#333',
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: '#FFF',
      letterSpacing: 0.5,
    },
    // Campos de entrada con estilo oscuro
    input: {
      borderWidth: 1,
      borderColor: '#444',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 15,
      backgroundColor: '#2A2A2A',
      color: '#FFF',
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    // Selector de fecha estilizado
    dateSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#444',
      borderRadius: 8,
      padding: 12,
      marginBottom: 15,
      backgroundColor: '#2A2A2A',
    },
    dateText: {
      fontSize: 16,
      color: '#FFF',
    },
    // Contenedor de categorías
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 15,
    },
    // Botones de categoría con estilo moderno
    categoryButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#2A2A2A',
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#444',
    },
    categoryButtonSelected: {
      backgroundColor: '#FF3A5E',
      borderColor: '#FF3A5E',
    },
    categoryButtonText: {
      fontSize: 14,
      color: '#CCC',
    },
    categoryButtonTextSelected: {
      color: '#fff',
      fontWeight: 'bold',
    },
    // Contenedor de slots de tiempo
    timeSlotsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
    },
    // Slots de tiempo con estilo moderno
    timeSlot: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#2A2A2A',
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#444',
    },
    timeSlotSelected: {
      backgroundColor: '#FF3A5E',
      borderColor: '#FF3A5E',
    },
    timeSlotText: {
      fontSize: 14,
      color: '#CCC',
    },
    timeSlotTextSelected: {
      color: '#fff',
      fontWeight: 'bold',
    },
    noSlotsText: {
      fontSize: 16,
      color: '#AAA',
      fontStyle: 'italic',
      marginBottom: 20,
      textAlign: 'center',
      padding: 15,
    },
    loader: {
      marginVertical: 20,
    },
    // Botón de envío con efecto de brillo
    submitButton: {
      backgroundColor: '#FF3A5E',
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
      shadowColor: '#FF3A5E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 5,
    },
    submitButtonDisabled: {
      backgroundColor: 'rgba(255, 58, 94, 0.4)',
      shadowOpacity: 0.2,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    // Modal con estilo oscuro
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: '#1E1E1E',
      borderRadius: 12,
      padding: 20,
      width: '100%',
      maxWidth: 500,
      shadowColor: '#FF3A5E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
      borderWidth: 1,
      borderColor: '#333',
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#FFF',
      textAlign: 'center',
      textShadowColor: 'rgba(255, 58, 94, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    modalContent: {
      marginBottom: 20,
    },
    modalLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#AAA',
      marginTop: 10,
    },
    modalValue: {
      fontSize: 16,
      color: '#FFF',
      marginBottom: 5,
    },
    modalWarning: {
      fontSize: 14,
      color: '#FF3A5E',
      fontStyle: 'italic',
      marginTop: 15,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: '#333',
      padding: 12,
      borderRadius: 8,
      marginRight: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#444',
    },
    cancelButtonText: {
      fontSize: 16,
      color: '#FFF',
      fontWeight: '600',
    },
    confirmButton: {
      flex: 1,
      backgroundColor: '#FF3A5E',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      shadowColor: '#FF3A5E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 3,
      elevation: 3,
    },
    confirmButtonText: {
      fontSize: 16,
      color: '#fff',
      fontWeight: '600',
    },
  });
  