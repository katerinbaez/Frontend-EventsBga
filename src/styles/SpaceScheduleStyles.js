import { StyleSheet, Dimensions } from 'react-native';
import { horizontalScale, verticalScale, moderateScale } from '../utils/ResponsiveUtils';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: horizontalScale(15),
      paddingVertical: verticalScale(15),
      backgroundColor: '#FF3A5E',
      marginTop: verticalScale(35),         // Margen superior para respetar la barra de estado
    },
    headerTitle: {
      fontSize: moderateScale(22),
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      flex: 1,
      textShadowColor: '#000000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    closeButton: {
      padding: moderateScale(5),
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingVertical: verticalScale(20),
    },
    contentContainer: {
      padding: moderateScale(15),
    },
    weekDaysContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: verticalScale(20),
      paddingHorizontal: horizontalScale(5),
      flexWrap: 'nowrap',
    },
    dayButton: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      backgroundColor: '#333333',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: horizontalScale(1),
      paddingBottom: verticalScale(1),
      flex: 1,
      maxWidth: '25%', // Para asegurar que todos los 7 días quepan en la pantalla
    },
    selectedDayButton: {
      backgroundColor: '#FF3A5E',
    },
    dayText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: moderateScale(9),
      textAlign: 'center',
    },
    selectedDayText: {
      color: '#FFFFFF',
    },
    dayDate: {
      fontSize: moderateScale(8),
      color: '#FFFFFF',
      textAlign: 'center',
      marginTop: verticalScale(1),
      flexWrap: 'nowrap',
    },
    scheduleContainer: {
      marginBottom: verticalScale(20),
    },
    scheduleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(15),
      flexWrap: 'wrap',
    },
    scheduleDayTitle: {
      fontSize: moderateScale(18),
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: verticalScale(5),
    },
    scheduleActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    actionButton: {
      paddingHorizontal: horizontalScale(2),
      paddingVertical: verticalScale(10),
      borderRadius: moderateScale(25),
      marginLeft: horizontalScale(8),
      marginBottom: verticalScale(5),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF3A5E',
      minWidth: horizontalScale(110),
      maxWidth: '45%',
      flex: 1,
    },
    actionButtonText: {
      color: '#FFFFFF',
      marginLeft: horizontalScale(5),
      fontSize: moderateScale(13),
      fontWeight: '600',
      textShadowColor: '#000000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    timeSlot: {
      padding: moderateScale(15),
      borderRadius: moderateScale(10),
      marginBottom: verticalScale(10),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: horizontalScale(5),
    },
    availableSlot: {
      backgroundColor: '#1E3A2E', // Verde oscuro para slots disponibles
    },
    unavailableSlot: {
      backgroundColor: '#3A1E1E', // Marrón rojizo para slots no disponibles
    },
    eventSlot: {
      backgroundColor: '#1E2A3A',
    },
    blockedSlot: {
      backgroundColor: '#3A1E1E', // Color marrón rojizo para slots bloqueados
    },
    timeText: {
      color: '#FFFFFF',
      fontSize: moderateScale(20),
      fontWeight: '500',
    },
    eventText: {
      color: '#4A90E2',
      fontSize: moderateScale(14),
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'right',
      marginRight: horizontalScale(10),
    },
    lockIcon: {
      marginLeft: horizontalScale(5),
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
      height: '75%',
      backgroundColor: '#222222',
      borderRadius: moderateScale(12),
      overflow: 'hidden',
    },
    modalBody: {
      padding: moderateScale(18),
      height: '80%',
    },
    modalLabel: {
      fontSize: moderateScale(18),
      color: '#FFFFFF',
      marginBottom: verticalScale(15),
      fontWeight: '500',
    },
    timeSlotItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: moderateScale(12),
      borderRadius: moderateScale(8),
      marginVertical: verticalScale(4),
      backgroundColor: '#333333',
    },
    selectedTimeSlotItem: {
      backgroundColor: '#1E3A3A',
      borderWidth: moderateScale(1),
      borderColor: '#4A90E2',
    },
    timeSlotText: {
      color: '#FFFFFF',
      fontSize: moderateScale(16),
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: verticalScale(15),
      marginBottom: verticalScale(5),
      paddingHorizontal: horizontalScale(11),
      backgroundColor: '#333333',
      borderRadius: moderateScale(10),
    },
    switchLabel: {
      color: '#FFFFFF',
      fontSize: moderateScale(16),
    },
    availabilityContainer: {
      marginBottom: verticalScale(10),
    },
    availabilityText: {
      fontSize: moderateScale(18),
      color: '#FFFFFF',
      marginBottom: verticalScale(15),
      fontWeight: '500',
    },
    availabilityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: moderateScale(15),
      marginBottom: verticalScale(10),
      borderRadius: moderateScale(10),
      backgroundColor: '#333333',
    },
    availableItem: {
      backgroundColor: '#1E3A2E', // Verde oscuro para disponible
    },
    unavailableItem: {
      backgroundColor: '#3A1E1E', // Rojo oscuro para no disponible
    },
    availabilityItemText: {
      color: '#FFFFFF',
      fontSize: moderateScale(20),
      fontWeight: '500',
    },
    eventInfoContainer: {
      padding: moderateScale(10),
      backgroundColor: '#1E2A3A',
      borderRadius: moderateScale(8),
    },
    eventTitle: {
      fontSize: moderateScale(18),
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: verticalScale(10),
    },
    eventDescription: {
      fontSize: moderateScale(16),
      color: '#CCCCCC',
    },
    noEventText: {
      fontSize: moderateScale(16),
      color: '#CCCCCC',
      fontStyle: 'italic',
      paddingBottom: verticalScale(20),
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: moderateScale(10),
      borderTopWidth: moderateScale(1),
      borderTopColor: '#444444',
      backgroundColor: '#222222',
      marginTop: 'auto',
    },
    modalScrollView: {
      height: verticalScale(200),
    },
    modalScrollViewContent: {
      paddingBottom: verticalScale(20),
    },
    modalScrollSpacer: {
      height: verticalScale(100),
    },
    slotsListContainer: {
      height: '65%',
      marginBottom: verticalScale(10),
    },
    timeSlotContainer: {
      height: verticalScale(220),
      marginBottom: verticalScale(0),
    },
    modalButton: {
      flex: 1,
      padding: moderateScale(10),
      height: '1%',
      borderRadius: moderateScale(25),
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: horizontalScale(5),
      backgroundColor: '#FF3A5E',
      minHeight: verticalScale(40),
      maxWidth: '45%',
    },
    blockButton: {
      backgroundColor: '#333333',
    },
    unblockButton: {
      backgroundColor: '#267F8C',
    },
    resetButton: {
      backgroundColor: '#FF3A5E',
      padding: moderateScale(15),
      borderRadius: moderateScale(10),
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: horizontalScale(5),
      marginTop: verticalScale(10),
      marginBottom: verticalScale(10),
      width: '100%',
    },
    resetButtonText: {
      color: '#FFFFFF',
      fontSize: moderateScale(18),
      fontWeight: '600',
      textShadowColor: '#000000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    modalButtonText: {
      color: '#FFFFFF',
      fontSize: moderateScale(12),
      fontWeight: 'bold',
      textShadowColor: '#000000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
      textAlign: 'center',
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
      paddingHorizontal: horizontalScale(1),
      paddingBottom: verticalScale(20),
      width: '100%',
    },
    button: {
      padding: moderateScale(12),
      borderRadius: moderateScale(15),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF3A5E',
      width: '100%',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: moderateScale(12),
      fontWeight: '600',
      textShadowColor: '#000000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    // Estilos adicionales para el selector de fechas
    datePickerContainer: {
      marginBottom: verticalScale(85),
      marginBottom: horizontalScale(5),

      borderBottomWidth: 1,
      borderBottomColor: '#444',
      paddingBottom: verticalScale(15),
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
      backgroundColor: '#3A1E1E', // Color marrón rojizo para slots bloqueados
      borderColor: '#3A1E1E'
    },
    blockedText: {
      color: '#FFFFFF',
    }
  });
  