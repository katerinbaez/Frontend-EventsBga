import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingVertical: 15,
      backgroundColor: '#FF3A5E',
      marginTop: 35,         // Margen superior para respetar la barra de estado
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      flex: 1,
    },
    closeButton: {
      padding: 5,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingVertical: 20,
    },
    contentContainer: {
      padding: 15,
    },
    weekDaysContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    dayButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#333333',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedDayButton: {
      backgroundColor: '#FF3A5E',
    },
    dayText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    selectedDayText: {
      color: '#FFFFFF',
    },
    dayDate: {
      fontSize: 12,
      color: '#FFFFFF',
      textAlign: 'center',
      marginTop: 5,
    },
    scheduleContainer: {
      marginBottom: 20,
    },
    scheduleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    scheduleDayTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    scheduleActions: {
      flexDirection: 'row',
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 5,
      marginLeft: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButtonText: {
      color: '#FFFFFF',
      marginLeft: 5,
      fontSize: 14,
    },
    timeSlot: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    availableSlot: {
      backgroundColor: '#1E3A2E',
    },
    unavailableSlot: {
      backgroundColor: '#3A1E1E',
    },
    eventSlot: {
      backgroundColor: '#1E2A3A',
    },
    timeText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    eventText: {
      color: '#4A90E2',
      fontSize: 14,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'right',
      marginRight: 10,
    },
    lockIcon: {
      marginLeft: 5,
    },
    // Estilos para el modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxHeight: '85%',
      backgroundColor: '#222222',
      borderRadius: 12,
      overflow: 'hidden',
    },
    modalBody: {
      padding: 15,
    },
    modalLabel: {
      fontSize: 16,
      color: '#FFFFFF',
      marginBottom: 15,
    },
    timeSlotItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: '#333333',
    },
    selectedTimeSlotItem: {
      backgroundColor: '#1E3A3A',
      borderWidth: 1,
      borderColor: '#4A90E2',
    },
    timeSlotText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: '#333333',
      borderRadius: 8,
    },
    switchLabel: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    availabilityContainer: {
      marginBottom: 10,
    },
    availabilityText: {
      fontSize: 16,
      color: '#FFFFFF',
      marginBottom: 15,
    },
    availabilityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: '#333333',
    },
    availableItem: {
      backgroundColor: '#1E3A2E',
    },
    unavailableItem: {
      backgroundColor: '#3A1E1E',
    },
    availabilityItemText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    eventInfoContainer: {
      padding: 10,
      backgroundColor: '#1E2A3A',
      borderRadius: 8,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 10,
    },
    eventDescription: {
      fontSize: 16,
      color: '#CCCCCC',
    },
    noEventText: {
      fontSize: 16,
      color: '#CCCCCC',
      fontStyle: 'italic',
    },
    modalFooter: {
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: '#444444',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    blockButton: {
      backgroundColor: '#8C2626',
    },
    unblockButton: {
      backgroundColor: '#267F8C',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: '#FFFFFF',
      marginTop: 10,
      fontSize: 16,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
    },
    button: {
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    // Estilos adicionales para el selector de fechas
    datePickerContainer: {
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#444',
      paddingBottom: 15,
    },
    datePickerWrapper: {
      marginTop: 10,
    },
    datePickerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#333',
      padding: 12,
      borderRadius: 8,
    },
    datePickerButtonText: {
      color: '#FFF',
      fontSize: 16,
    },
    blockedSlot: {
      backgroundColor: '#990000', // Rojo más oscuro
      borderColor: '#990000'
    },
    blockedText: {
      color: '#FFFFFF',
    }
  });
  