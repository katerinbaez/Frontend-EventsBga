import { StyleSheet } from 'react-native';
;

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
    scrollContent: {
      paddingBottom: 20, // Añadir espacio adicional al final del contenido
      paddingHorizontal: 5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 5,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 58, 94, 0.1)',
    },
    spaceName: {
      fontSize: 16,
      fontWeight: '500',
      color: '#FF3A5E',
    },
    headerDivider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      marginBottom: 20,
    },
    formGroup: {
      marginBottom: 15,
    },
    label: {
      fontSize: 14,
      color: '#FFFFFF',
      marginBottom: 5,
      fontWeight: 'bold',
    },
    input: {
      backgroundColor: '#2A2A2A',
      borderRadius: 8,
      padding: 12,
      color: '#FFFFFF',
      borderWidth: 1,
      borderColor: 'rgba(255, 58, 94, 0.3)',
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    dateContainer: {
      marginBottom: 5,
    },
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2A2A2A',
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 58, 94, 0.3)',
    },
    dateIcon: {
      marginRight: 10,
    },
    dateText: {
      color: '#FFFFFF',
      flex: 1,
    },
    dateIndicator: {
      backgroundColor: 'rgba(255, 58, 94, 0.1)',
      borderRadius: 12,
      padding: 4,
    },
    dateHint: {
      fontSize: 12,
      color: '#999',
      fontStyle: 'italic',
      marginTop: 5,
      marginLeft: 5,
    },
    timeSlotListContainer: {
      marginTop: 10,
      marginBottom: 15,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 58, 94, 0.3)',
    },
    timeSlotHeader: {
      backgroundColor: 'rgba(255, 58, 94, 0.1)',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 58, 94, 0.3)',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timeSlotHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeSlotHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 58, 94, 0.2)',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    timeSlotHeaderText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 14,
    },
    timeSlotCount: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    timeSlotListContent: {
      paddingBottom: 5,
    },
    timeSlotScrollContainer: {
      height: 200,
      flexGrow: 0,
    },
    timeSlotContentContainer: {
      flexGrow: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
    },
    badgeContainer: {
      backgroundColor: '#FF3A5E',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    badgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    infoText: {
      fontSize: 13,
      color: '#999',
      marginBottom: 10,
      fontStyle: 'italic',
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#2A2A2A',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 58, 94, 0.3)',
      marginTop: 10,
    },
    loadingText: {
      color: '#FFFFFF',
      marginTop: 10,
      fontSize: 14,
    },
    timeSlot: {
      backgroundColor: '#2A2A2A',
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 58, 94, 0.2)',
      flexDirection: 'row',
      alignItems: 'center'
    },
    timeSlotIconContainer: {
      width: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedTimeSlot: {
      backgroundColor: '#FF3A5E'
    },
    timeSlotText: {
      fontSize: 15,
      color: '#FFFFFF',
      marginLeft: 10,
      flex: 1,
    },
    selectedTimeSlotText: {
      color: 'white',
      fontWeight: 'bold'
    },
    noSlotsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: 'rgba(255, 58, 94, 0.05)',
      borderRadius: 8,
      padding: 15,
      marginTop: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 58, 94, 0.3)',
    },
    noSlotsTextContainer: {
      flex: 1,
      marginLeft: 10,
    },
    
    // Estilos para la información de selección múltiple
    multiSelectInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF0F3',
      borderRadius: 8,
      padding: 10,
      marginTop: 8,
      marginBottom: 12,
      borderLeftWidth: 3,
      borderLeftColor: '#FF3A5E',
    },
    multiSelectText: {
      fontSize: 13,
      color: '#333',
      flex: 1,
      flexWrap: 'wrap',
    },
    noSlotsTitle: {
      color: '#FF3A5E',
      fontWeight: 'bold',
      fontSize: 14,
      marginBottom: 5,
    },
    noSlotsText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    submitButton: {
      backgroundColor: '#FF3A5E',
      borderRadius: 25,
      padding: 15,
      marginTop: 20,
      marginBottom: 20,
      elevation: 3,
      shadowColor: '#FF3A5E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    submitButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonIcon: {
      marginRight: 8,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      marginBottom: 8,
    },
    categoryButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    categoryButtonActive: {
      backgroundColor: 'rgba(255, 58, 94, 0.2)',
      borderColor: '#FF3A5E',
    },
    categoryButtonText: {
      color: '#CCCCCC',
      fontSize: 14,
    },
    categoryButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    customCategoryContainer: {
      marginTop: 10,
    },
    errorText: {
      color: '#FF3A5E',
      fontSize: 12,
      fontStyle: 'italic',
      marginTop: 5,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 58, 94, 0.1)',
      borderRadius: 8,
      padding: 10,
      marginTop: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#FF3A5E',
    },
    warningText: {
      fontSize: 13,
      color: '#FF3A5E',
      flex: 1,
      marginLeft: 8,
    },
  });