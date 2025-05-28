import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';


export const styles = ResponsiveStyleSheet.create({
    // Contenedor principal con fondo negro
    container: {
      flex: 1,
      backgroundColor: '#121212', // Fondo negro más suave
    },
    // Encabezado con gradiente visual
    header: {
      backgroundColor: '#1E1E1E',
      paddingTop: verticalScale(45),
      paddingBottom: verticalScale(18),
      paddingHorizontal: horizontalScale(20),
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    },
    backButton: {
      marginRight: horizontalScale(15),
      backgroundColor: 'rgba(255, 58, 94, 0.2)', // Color de acento rojo con transparencia
      padding: moderateScale(8),
      borderRadius: moderateScale(20),
    },
    headerTitle: {
      color: '#fff',
      fontSize: moderateScale(22),
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    // Contenido principal
    content: {
      flex: 1,
      padding: moderateScale(20),
    },
    sectionTitle: {
      fontSize: moderateScale(24),
      fontWeight: 'bold',
      marginBottom: verticalScale(15),
      color: '#FFF',
      textShadowColor: 'rgba(255, 58, 94, 0.3)', // Color de acento rojo con transparencia
      textShadowOffset: { width: 0, height: verticalScale(2) },
      textShadowRadius: 3,
    },
    spaceInfo: {
      fontSize: moderateScale(16),
      marginBottom: verticalScale(20),
      color: '#FFF',
      fontStyle: 'italic',
    },
    // Contenedor del formulario con fondo oscuro
    formContainer: {
      backgroundColor: '#1E1E1E',
      borderRadius: moderateScale(12),
      padding: moderateScale(20),
      marginBottom: verticalScale(20),
      shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      shadowOffset: { width: 0, height: verticalScale(4) },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 1,
      borderColor: '#333',
    },
    label: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      marginBottom: verticalScale(8),
      color: '#FFF',
      letterSpacing: 0.5,
    },
    // Campos de entrada con estilo oscuro
    input: {
      borderWidth: 1,
      borderColor: '#444',
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      fontSize: moderateScale(16),
      marginBottom: verticalScale(15),
      backgroundColor: '#2A2A2A',
      color: '#FFF',
    },
    textArea: {
      height: verticalScale(100),
      textAlignVertical: 'top',
    },
    // Selector de fecha estilizado
    dateSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#444',
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      marginBottom: verticalScale(15),
      backgroundColor: '#2A2A2A',
    },
    dateText: {
      fontSize: moderateScale(16),
      color: '#FFF',
    },
    // Contenedor de categorías
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: verticalScale(15),
    },
    // Botones de categoría con estilo moderno
    categoryButton: {
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(8),
      borderRadius: moderateScale(20),
      backgroundColor: '#2A2A2A',
      marginRight: horizontalScale(8),
      marginBottom: verticalScale(8),
      borderWidth: 1,
      borderColor: '#444',
    },
    categoryButtonSelected: {
      backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      borderColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    },
    categoryButtonText: {
      fontSize: moderateScale(14),
      color: '#FFF',
    },
    categoryButtonTextSelected: {
      color: '#fff',
      fontWeight: 'bold',
    },
    // Contenedor de slots de tiempo
    timeSlotsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: verticalScale(20),
    },
    // Slots de tiempo con estilo moderno
    timeSlot: {
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(8),
      borderRadius: moderateScale(20),
      backgroundColor: '#2A2A2A',
      marginRight: horizontalScale(8),
      marginBottom: verticalScale(8),
      borderWidth: 1,
      borderColor: '#444',
    },
    timeSlotSelected: {
      backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      borderColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    },
    timeSlotText: {
      fontSize: moderateScale(14),
      color: '#FFF',
    },
    timeSlotTextSelected: {
      color: '#fff',
      fontWeight: 'bold',
    },
    noSlotsText: {
      fontSize: moderateScale(16),
      color: '#FFF',
      fontStyle: 'italic',
      marginBottom: verticalScale(20),
      textAlign: 'center',
      padding: moderateScale(15),
    },
    loader: {
      marginVertical: verticalScale(20),
    },
    // Botón de envío con efecto de brillo
    submitButton: {
      backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      paddingVertical: verticalScale(15),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      marginTop: verticalScale(20),
      marginBottom: verticalScale(30),
      shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      shadowOffset: { width: 0, height: verticalScale(2) },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 5,
    },
    submitButtonDisabled: {
      backgroundColor: 'rgba(255, 58, 94, 0.4)', // Color de acento rojo con transparencia
      shadowOpacity: 0.2,
    },
    submitButtonText: {
      color: '#FFF',
      fontSize: moderateScale(16),
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    // Modal con estilo oscuro
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(20),
    },
    modalContainer: {
      backgroundColor: '#1E1E1E',
      borderRadius: moderateScale(12),
      padding: moderateScale(20),
      width: '100%',
      maxWidth: horizontalScale(500),
      shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      shadowOffset: { width: 0, height: verticalScale(4) },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
      borderWidth: 1,
      borderColor: '#333',
    },
    modalTitle: {
      fontSize: moderateScale(18),
      fontWeight: 'bold',
      marginBottom: verticalScale(15),
      color: '#FFF',
      textAlign: 'center',
      textShadowColor: 'rgba(255, 58, 94, 0.3)', // Color de acento rojo con transparencia
      textShadowOffset: { width: 0, height: verticalScale(1) },
      textShadowRadius: 2,
    },
    modalContent: {
      marginBottom: verticalScale(20),
    },
    modalLabel: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: '#FFF',
      marginTop: verticalScale(10),
    },
    modalValue: {
      fontSize: moderateScale(14),
      color: '#FFF',
      marginBottom: verticalScale(5),
    },
    modalWarning: {
      fontSize: moderateScale(12),
      color: '#FF3A5E', // Color de acento rojo preferido por el usuario
      fontStyle: 'italic',
      marginTop: verticalScale(15),
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: verticalScale(20),
    },
    cancelButton: {
      backgroundColor: '#333',
      paddingVertical: verticalScale(12),
      paddingHorizontal: horizontalScale(20),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
      flex: 0.48,
      borderWidth: 1,
      borderColor: '#444',
    },
    cancelButtonText: {
      fontSize: moderateScale(14),
      color: '#FFF',
      fontWeight: '600',
    },
    confirmButton: {
      backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      paddingVertical: verticalScale(12),
      paddingHorizontal: horizontalScale(20),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
      flex: 0.48,
      shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      shadowOffset: { width: 0, height: verticalScale(2) },
      shadowOpacity: 0.5,
      shadowRadius: 3,
      elevation: 3,
    },
    confirmButtonText: {
      fontSize: moderateScale(14),
      color: '#fff',
      fontWeight: '600',
    },
  });
  