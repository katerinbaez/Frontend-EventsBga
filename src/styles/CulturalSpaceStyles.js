import { StyleSheet } from 'react-native';
import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

export const styles = ResponsiveStyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
      paddingHorizontal: horizontalScale(20),
      paddingTop: verticalScale(40), // Añadir espacio en la parte superior para que no llegue a la barra de estado
      paddingBottom: verticalScale(20),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    title: {
      fontSize: moderateScale(24),
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    imageGallery: {
      height: verticalScale(200),
      marginBottom: verticalScale(20),
    },
    spaceImage: {
      width: horizontalScale(300),
      height: verticalScale(200),
      borderRadius: moderateScale(10),
      marginRight: horizontalScale(10),
    },
    section: {
      marginBottom: verticalScale(20),
    },
    sectionTitle: {
      fontSize: moderateScale(18),
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: verticalScale(10),
    },
    text: {
      fontSize: moderateScale(16),
      color: '#FFFFFF',
      lineHeight: verticalScale(24),
    },
    facilitiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    facilityTag: {
      backgroundColor: '#F0F7FF',
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(6),
      borderRadius: moderateScale(15),
      marginRight: horizontalScale(8),
      marginBottom: verticalScale(8),
    },
    facilityTagEditable: {
      backgroundColor: '#F0F7FF',
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(6),
      borderRadius: moderateScale(15),
      marginRight: horizontalScale(8),
      marginBottom: verticalScale(8),
      flexDirection: 'row',
      alignItems: 'center',
    },
    facilityText: {
      color: '#4A90E2',
      fontSize: moderateScale(14),
      marginRight: horizontalScale(5),
    },
    facilitiesInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(10),
    },
    facilitiesInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      fontSize: moderateScale(16),
      color: '#2C3E50',
      marginRight: horizontalScale(10),
    },
    addFacilityButton: {
      backgroundColor: '#FF3A5E', // Mantener el color de acento rojo
      width: moderateScale(44),
      height: moderateScale(44),
      borderRadius: moderateScale(22),
      justifyContent: 'center',
      alignItems: 'center',
    },
    facilitiesTagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: verticalScale(15),
    },
    scheduleItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(8),
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    dayText: {
      fontSize: moderateScale(16),
      color: '#FFFFFF',
      fontWeight: '500',
    },
    timeText: {
      fontSize: moderateScale(14),
      color: '#FFFFFF',
    },
    contactCard: {
      backgroundColor: '#000000',
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: '#ffffff',
      padding: moderateScale(16),
      marginTop: verticalScale(8),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(2) },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(8),
    },
    contactIconContainer: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      backgroundColor: '#FFF0F3',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: horizontalScale(16),
    },
    contactTextContainer: {
      flex: 1,
    },
    contactLabel: {
      fontSize: moderateScale(14),
      color: '#FFFFFF',
      marginBottom: verticalScale(4),
    },
    contactValue: {
      fontSize: moderateScale(16),
      color: '#FFFFFF',
      fontWeight: '500',
    },
    contactDivider: {
      height: 1,
      backgroundColor: '#F0F0F0',
      marginVertical: verticalScale(12),
    },
    socialCardContainer: {
      backgroundColor: '#000000',
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: '#ffffff',
      padding: moderateScale(16),
      marginTop: verticalScale(8),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(2) },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    socialScrollContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(8),
    },
    socialButton: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
      backgroundColor: '#F8F9FA',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: horizontalScale(16),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(1) },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    noSocialText: {
      fontSize: moderateScale(16),
      color: '#FFFFFF',
      fontStyle: 'italic',
      marginTop: verticalScale(8),
    },
    editButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      backgroundColor: 'rgb(255, 255, 255)',
    },
    editButtonText: {
      marginLeft: horizontalScale(2),
      color: '#FFFFFF',
      fontSize: moderateScale(16),
      fontWeight: 'bold',
    },
    saveButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      backgroundColor: '#FF3A5E',
    },
    saveButtonText: {
      marginLeft: horizontalScale(5),
      color: '#FFFFFF',
      fontSize: moderateScale(16),
      fontWeight: 'bold',
    },
    inputGroup: {
      marginBottom: verticalScale(20),
    },
    label: {
      fontSize: moderateScale(16),
      color: '#FFFFFF',
      marginBottom: verticalScale(8),
    },
    input: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      fontSize: moderateScale(16),
      color: '#FFFFFF',
    },
    contactContainer: {
      marginBottom: verticalScale(10),
    },
    contactField: {
      marginBottom: verticalScale(12),
    },
    contactLabel: {
      fontSize: moderateScale(14),
      color: '#FFFFFF',
      marginBottom: verticalScale(5),
    },
    socialContainer: {
      marginBottom: verticalScale(10),
    },
    socialField: {
      marginBottom: verticalScale(12),
    },
    socialLabel: {
      fontSize: moderateScale(14),
      color: '#FFFFFF',
      marginBottom: verticalScale(5),
    },
    textArea: {
      height: verticalScale(100),
      textAlignVertical: 'top',
    },
    inputError: {
      borderColor: '#FF3A5E',
      borderWidth: 1,
    },
    errorText: {
      color: '#FF3A5E',
      fontSize: moderateScale(12),
      marginTop: verticalScale(5),
    },
    imagePickerButton: {
      backgroundColor: '#FF3A5E', // Mantener el color de acento rojo
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: verticalScale(8),
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: '#4A90E2',
      marginBottom: verticalScale(10),
    },
    imagePickerText: {
      marginLeft: horizontalScale(10),
      fontSize: moderateScale(16),
      color: '#FFFFFF',
    },
    imagePreviewContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: verticalScale(16),
    },
    imagePreview: {
      width: horizontalScale(100),
      height: verticalScale(100),
      borderRadius: moderateScale(8),
      marginRight: horizontalScale(8),
      marginBottom: verticalScale(8),
    },
    removeImageButton: {
      position: 'absolute',
      top: verticalScale(-10),
      right: horizontalScale(-10),
      backgroundColor: '#FFF',
      borderRadius: moderateScale(12),
    },
    dayContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: verticalScale(10),
      paddingRight: horizontalScale(10),
      width: '100%',
    },
    toggleButton: {
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(6),
      borderRadius: moderateScale(15),
      marginLeft: horizontalScale(10),
    },
    toggleActive: {
      backgroundColor: '#FF3A5E', // Mantener el color de acento rojo
    },
    toggleInactive: {
      backgroundColor: '#34495E',
    },
    toggleText: {
      color: '#FFFFFF',
      fontSize: moderateScale(12),
      fontWeight: 'bold',
    },
    timeSlotContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(10),
      paddingLeft: horizontalScale(20),
    },
    addSlotButton: {
      marginLeft: horizontalScale(10),
      padding: moderateScale(5),
    },
    removeSlotButton: {
      marginLeft: horizontalScale(10),
      padding: moderateScale(5),
    },
    scheduleInputContainer: {
      marginBottom: verticalScale(15),
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      paddingBottom: verticalScale(10),
    },
    timePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: moderateScale(8),
      padding: moderateScale(10),
      width: horizontalScale(100),
      backgroundColor: '#F8F9FA',
    },
    timePickerButtonText: {
      fontSize: moderateScale(16),
      color: '#000000',
    },
    timeInput: {
      width: horizontalScale(100),
      height: verticalScale(50),
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      fontSize: moderateScale(16),
      color: '#000000',
      backgroundColor: '#F8F9FA',
    },
    dayLabel: {
      width: horizontalScale(100),
      fontSize: moderateScale(16),
      color: '#000000',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    timePickerModal: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      padding: moderateScale(20),
      maxHeight: '70%',
    },
    timePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(20),
      paddingBottom: verticalScale(10),
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    timePickerTitle: {
      fontSize: moderateScale(18),
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    timeList: {
      maxHeight: verticalScale(300),
    },
    timeItem: {
      paddingVertical: verticalScale(15),
      paddingHorizontal: horizontalScale(20),
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    timeItemText: {
      fontSize: moderateScale(18),
      color: '#000000',
    },
    backButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTitle: {
      fontSize: moderateScale(20),
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginLeft: horizontalScale(10),
    },
    detailsContainer: {
      backgroundColor: '#000000',
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: '#ffffff',
      padding: moderateScale(16),
      marginVertical: verticalScale(8),
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(10),
    },
    descriptionContainer: {
      marginTop: verticalScale(10),
      paddingTop: verticalScale(10),
      borderTopWidth: 0.5,
      borderTopColor: '#555555',
    },
  });
  