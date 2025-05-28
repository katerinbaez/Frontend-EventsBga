import { StyleSheet } from 'react-native';
import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';


export const styles = ResponsiveStyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: '#1E1E1E',
      borderRadius: moderateScale(10),
      padding: moderateScale(20),
      borderWidth: 1,
      borderColor: '#333',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    title: {
      fontSize: moderateScale(22),
      fontWeight: 'bold',
      color: '#FFF',
    },
    closeButton: {
      padding: moderateScale(5),
    },
    loader: {
      marginVertical: verticalScale(20),
    },
    eventsList: {
      paddingBottom: verticalScale(20),
    },
    eventItem: {
      backgroundColor: '#2A2A2A',
      borderRadius: moderateScale(8),
      padding: moderateScale(15),
      marginBottom: verticalScale(15),
      borderLeftWidth: moderateScale(4),
      borderLeftColor: '#FF3A5E',
    },
    expiredEventItem: {
      borderLeftColor: '#A0A0A0',
      opacity: 0.8,
    },
    eventInfo: {
      marginBottom: verticalScale(10),
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(5),
    },
    eventTitle: {
      fontSize: moderateScale(18),
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: verticalScale(5),
    },
    expiredBadge: {
      backgroundColor: '#A0A0A0',
      paddingHorizontal: horizontalScale(8),
      paddingVertical: verticalScale(2),
      borderRadius: moderateScale(4),
    },
    expiredBadgeText: {
      color: '#333',
      fontSize: moderateScale(10),
      fontWeight: 'bold',
    },
    dateTimeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(8),
    },
    eventDate: {
      fontSize: moderateScale(14),
      color: '#FF3A5E',
      flex: 1,
    },
    eventTime: {
      fontSize: moderateScale(14),
      color: '#FFF',
      fontWeight: 'bold',
    },
    eventDescription: {
      fontSize: moderateScale(14),
      color: '#CCC',
      marginBottom: verticalScale(8),
    },
    eventCategory: {
      fontSize: moderateScale(12),
      color: '#999',
    },
    expiredText: {
      color: '#A0A0A0',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    button: {
      paddingVertical: verticalScale(8),
      paddingHorizontal: horizontalScale(15),
      borderRadius: moderateScale(5),
      alignItems: 'center',
      justifyContent: 'center',
    },
    attendButton: {
      backgroundColor: '#FF3A5E',
    },
    cancelButton: {
      backgroundColor: '#555',
    },
    buttonText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: moderateScale(14),
    },
    expiredNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#333',
      paddingVertical: verticalScale(8),
      paddingHorizontal: horizontalScale(12),
      borderRadius: moderateScale(5),
    },
    expiredNoticeText: {
      color: '#A0A0A0',
      marginLeft: horizontalScale(5),
      fontSize: moderateScale(14),
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: moderateScale(30),
    },
    emptyText: {
      color: '#999',
      fontSize: moderateScale(16),
      textAlign: 'center',
    },
  });
  