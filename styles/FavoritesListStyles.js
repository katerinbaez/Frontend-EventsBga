import { StyleSheet, Dimensions } from 'react-native';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

const { width, height } = Dimensions.get('window');


export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#121212',
    },
    tabContainer: {
      flexDirection: 'row',
      padding: horizontalScale(16),
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: '#4A90E2',
    },
    tabText: {
      marginTop: verticalScale(4),
      fontSize: moderateScale(14),
      color: '#95A5A6',
    },
    activeTabText: {
      color: '#4A90E2',
      fontWeight: 'bold',
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: horizontalScale(16),
    },
    favoriteItem: {
      flexDirection: 'row',
      backgroundColor: '#1A1A1A',
      borderRadius: moderateScale(10),
      padding: moderateScale(12),
      marginBottom: verticalScale(10),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(2) },
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(4),
      elevation: 2,
      width: '100%',
    },
    itemImage: {
      width: horizontalScale(60),
      height: verticalScale(60),
      borderRadius: moderateScale(30), // Cambiado a circular para artistas
      marginRight: horizontalScale(12),
    },
    iconContainer: {
      width: horizontalScale(60),
      height: verticalScale(60),
      borderRadius: moderateScale(30), // Cambiado a circular para artistas
      marginRight: horizontalScale(12),
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemContent: {
      flex: 1,
      justifyContent: 'center',
    },
    itemTitle: {
      fontSize: moderateScale(16),
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: verticalScale(4),
    },
    itemDescription: {
      fontSize: moderateScale(14),
      color: '#AAA',
    },
    removeButton: {
      padding: moderateScale(8),
    },
    errorText: {
      fontSize: moderateScale(16),
      color: '#FF6B6B',
      textAlign: 'center',
      padding: horizontalScale(16),
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(20),
    },
    emptyText: {
      fontSize: moderateScale(16),
      color: '#95A5A6',
      textAlign: 'center',
      marginTop: verticalScale(16),
    },
    
    // Fin de los estilos
  });