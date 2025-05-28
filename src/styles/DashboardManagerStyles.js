import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#000000',
      // Aseguramos que haya espacio suficiente en la parte superior
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      paddingTop: verticalScale(50),
      paddingHorizontal: horizontalScale(20),
      paddingBottom: verticalScale(15),
      backgroundColor: '#000000',
      borderBottomLeftRadius: moderateScale(30),
      borderBottomRightRadius: moderateScale(30),
      marginBottom: verticalScale(20),
    },
    welcomeContainer: {
      marginRight: horizontalScale(70),
      marginBottom: verticalScale(10),
      width: '80%',
    },
    welcome: {
      fontSize: moderateScale(26),
      color: '#ffffff',
      fontWeight: '400',
      lineHeight: moderateScale(32),
    },
    userName: {
      fontSize: moderateScale(24),
      color: '#FFFFFF',
      fontWeight: 'bold',
      marginTop: verticalScale(5),
      width: '100%',
      maxWidth: horizontalScale(250),
    },
    headerButton: {
      position: 'absolute',
      right: horizontalScale(15),
      top: verticalScale(70),
      backgroundColor: '#00EA01',
      paddingHorizontal: horizontalScale(7),
      paddingVertical: verticalScale(8),
      borderRadius: moderateScale(20),
    },
    headerButtonText: {
      color: '#ffffff',
      fontSize: moderateScale(12),
      fontWeight: '600',
      textShadowColor: '#000000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    optionsContainer: {
      padding: moderateScale(2),
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingRight: moderateScale(2),
      paddingLeft: moderateScale(3),


    },
    optionCard: {
      backgroundColor: '#1a1a1a',
      borderRadius: moderateScale(18),
      borderColor:'#00EA01',
      borderWidth: moderateScale(1),
      padding: moderateScale(15),      
      width: width < 600 ? '48%' : '30%',
      marginBottom: verticalScale(20),
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(2) },
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(4),
      alignItems: 'center',
    },
    optionTitle: {
      fontSize: moderateScale(15),
      fontWeight: 'bold',
      color: '#ffffff',
      marginTop: verticalScale(12),
      textAlign: 'center',
    },
    optionDescription: {
      fontSize: moderateScale(12),
      color: '#cccccc',
      marginTop: verticalScale(5),
      textAlign: 'center',
    },
  
  });