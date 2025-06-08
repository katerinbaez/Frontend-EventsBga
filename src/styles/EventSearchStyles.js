import { Platform, StatusBar } from 'react-native';
import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

export const styles = ResponsiveStyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1A1A1A',
      paddingTop: 0,
      paddingBottom: 0,
    },
    header: {
      backgroundColor: '#1A1A1A',
      paddingVertical: verticalScale(12),
      borderBottomWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: horizontalScale(16),
    },
    backButton: {
      width: moderateScale(40),
      height: moderateScale(40),
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      color: '#FFF',
      fontSize: moderateScale(22),
      fontWeight: 'bold',
      textAlign: 'center',
      flex: 1,
    },
    headerRight: {
      width: moderateScale(40),
      alignItems: 'flex-end',
    },
    searchContainer: {
      flexDirection: 'row',
      paddingHorizontal: horizontalScale(16),
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(16),
      backgroundColor: '#1A1A1A',
      alignItems: 'center',
      marginTop: 0,
    },
    searchInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: '#333',
      borderRadius: moderateScale(25),
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(12),
      alignItems: 'center',
      marginRight: horizontalScale(12),
    },
    searchIcon: {
      marginRight: horizontalScale(10),
    },
    searchInput: {
      flex: 1,
      color: '#FFF',
      fontSize: moderateScale(16),
    },
    filterButton: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      backgroundColor: '#333',
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: '#FF3A5E',
    },
    categoriesContainer: {
      marginTop: verticalScale(5),
      marginBottom: verticalScale(15),
      maxHeight: verticalScale(40),
    },
    categoriesContentContainer: {
      paddingHorizontal: horizontalScale(16),
      alignItems: 'center',
    },
    categoryChip: {
      backgroundColor: '#2C2C2C',
      paddingVertical: verticalScale(5),
      paddingHorizontal: horizontalScale(16),
      borderRadius: moderateScale(20),
      marginRight: horizontalScale(10),
      borderWidth: 1,
      borderColor: '#3E3E3E',
      height: verticalScale(36),
      justifyContent: 'center',
    },
    selectedCategoryChip: {
      backgroundColor: '#FF3A5E',
      borderColor: '#FF3A5E',
    },
    categoryChipText: {
      color: '#FFF',
      fontSize: moderateScale(14),
      fontWeight: '500',
    },
    selectedCategoryChipText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    appliedFiltersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(12),
      backgroundColor: '#222',
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    appliedFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      borderRadius: moderateScale(20),
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(6),
      marginRight: horizontalScale(8),
      marginBottom: verticalScale(8),
    },
    appliedFilterText: {
      color: '#FFF',
      fontSize: moderateScale(12),
      marginRight: horizontalScale(4),
    },
    clearAllFiltersButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#333',
      borderRadius: moderateScale(20),
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(6),
      marginBottom: verticalScale(8),
    },
    clearAllFiltersText: {
      color: '#FFF',
      fontSize: moderateScale(12),
    },
    eventList: {
      flex: 1,
    },
    eventListContent: {
      paddingHorizontal: horizontalScale(16),
      paddingTop: verticalScale(16),
      paddingBottom: verticalScale(24),
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noEventsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(20),
    },
    noEventsTitle: {
      color: '#FFF',
      fontSize: moderateScale(20),
      fontWeight: 'bold',
      marginTop: verticalScale(16),
      marginBottom: verticalScale(8),
    },
    noEventsText: {
      color: '#95A5A6',
      fontSize: moderateScale(16),
      textAlign: 'center',
      maxWidth: '80%',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    keyboardAvoidingView: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#2C2C2C',
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      paddingBottom: verticalScale(20),
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: moderateScale(16),
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    modalTitle: {
      color: '#FFF',
      fontSize: moderateScale(18),
      fontWeight: 'bold',
    },
    modalBody: {
      padding: moderateScale(16),
      flexGrow: 1,
    },
    modalBodyContent: {
      paddingBottom: verticalScale(20),
    },
    dateFilterContainer: {
      marginBottom: verticalScale(15),
    },
    dateDisplay: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: verticalScale(10),
    },
    dateItem: {
      flex: 1,
      marginHorizontal: horizontalScale(5),
    },
    dateLabel: {
      color: '#FFF',
      fontSize: moderateScale(14),
      marginBottom: verticalScale(5),
    },
    dateButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#333',
      borderRadius: moderateScale(8),
      padding: moderateScale(10),
      borderWidth: 1,
      borderColor: '#444',
    },
    dateButtonText: {
      color: '#FFF',
      fontSize: moderateScale(14),
    },
    calendarContainer: {
      backgroundColor: '#2C2C2C',
      borderRadius: moderateScale(12),
      padding: moderateScale(10),
      marginTop: verticalScale(10),
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(10),
    },
    calendarTitle: {
      color: '#FFF',
      fontSize: moderateScale(16),
      fontWeight: 'bold',
    },
    categoriesContentContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: verticalScale(15),
    },
    filterLabel: {
      color: '#FFF',
      fontSize: moderateScale(16),
      fontWeight: 'bold',
      marginTop: verticalScale(16),
      marginBottom: verticalScale(8),
    },
    calendar: {
      height: verticalScale(300),
      borderRadius: moderateScale(12),
      marginBottom: verticalScale(16),
      backgroundColor: '#333',
    },
    locationsContainer: {
      marginBottom: verticalScale(16),
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    locationChip: {
      backgroundColor: '#333',
      borderRadius: moderateScale(25),
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(10),
      marginRight: horizontalScale(8),
      marginBottom: verticalScale(8),
      minWidth: horizontalScale(100),
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedLocationChip: {
      backgroundColor: '#FF3A5E',
    },
    locationChipText: {
      color: '#FFF',
      fontSize: moderateScale(14),
      textAlign: 'center',
    },
    selectedLocationChipText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: moderateScale(16),
      borderTopWidth: 1,
      borderTopColor: '#333',
    },
    clearButton: {
      backgroundColor: '#333',
      borderRadius: moderateScale(25),
      padding: moderateScale(12),
      flex: 1,
      marginRight: horizontalScale(8),
      alignItems: 'center',
    },
    clearButtonText: {
      color: '#FFF',
      fontSize: moderateScale(16),
    },
    applyButton: {
      backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      borderRadius: moderateScale(25),
      padding: moderateScale(12),
      flex: 1,
      marginLeft: horizontalScale(8),
      alignItems: 'center',
    },
    applyButtonText: {
      color: '#FFF',
      fontSize: moderateScale(16),
      fontWeight: 'bold',
    },
    eventCard: {
      backgroundColor: '#333',
      borderRadius: moderateScale(12),
      padding: moderateScale(16),
      marginHorizontal: horizontalScale(16),
      marginBottom: verticalScale(12),
      position: 'relative',
      borderWidth: 2,
      borderColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    },
    expiredEventCard: {
      borderColor: '#444',
      backgroundColor: '#2A2A2A',
    },
    eventCardContent: {
      flex: 1,
    },
    eventTitle: {
      color: '#FFFFFF',
      fontSize: moderateScale(20),
      fontWeight: 'bold',
      marginBottom: verticalScale(12),
    },
    eventInfoContainer: {
      marginTop: verticalScale(8),
    },
    eventInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    eventInfoText: {
      color: '#FFFFFF',
      fontSize: moderateScale(15),
      marginLeft: horizontalScale(10),
    },
    eventCategoryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'absolute',
      top: verticalScale(12),
      right: horizontalScale(12),
    },
    eventCategoryBadge: {
      backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      borderRadius: moderateScale(20),
      paddingHorizontal: horizontalScale(15),
      paddingVertical: verticalScale(5),
    },
    eventCategoryBadgeText: {
      color: '#FFFFFF',
      fontSize: moderateScale(13),
      fontWeight: 'bold',
    },
    expiredEventBadge: {
      backgroundColor: '#666',
      borderRadius: moderateScale(20),
      paddingHorizontal: horizontalScale(14),
      paddingVertical: verticalScale(5),
    },
    expiredEventBadgeText: {
      color: '#FFFFFF',
      fontSize: moderateScale(13),
    },
    favoriteButton: {
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    eventTitle: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    eventCategory: {
      backgroundColor: '#FF3A5E',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    eventCategoryText: {
      color: '#FFF',
      fontSize: 12,
    },
    eventInfo: {
      marginTop: 16,
    },
    eventInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    eventInfoText: {
      color: '#FFF',
      fontSize: 14,
      marginLeft: 8,
    },
    eventFooter: {
      marginTop: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(20),
    },
    emptyText: {
      color: '#FFF',
      fontSize: moderateScale(16),
      textAlign: 'center',
    },
    eventsContainer: {
      flex: 1,
      backgroundColor: '#1A1A1A',
    },
    eventsListContent: {
      paddingTop: verticalScale(5),
      paddingBottom: verticalScale(20),
    },
    // Estilos para eventos expirados
    expiredEventCard: {
      opacity: 0.8,
      borderColor: '#D0D0D0',
    },
    expiredEventText: {
      color: '#A0A0A0',
    },
    expiredEventCategory: {
      backgroundColor: '#D0D0D0',
    },
    expiredEventCategoryText: {
      color: '#505050',
      fontSize: moderateScale(12),
      fontWeight: 'bold',
    },
  });