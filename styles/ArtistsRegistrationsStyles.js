import { StyleSheet } from 'react-native';
import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

const styles = ResponsiveStyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    statusBarSpace: {
      height: verticalScale(40), // Espacio adicional para compensar la barra de estado
      backgroundColor: '#000000',
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: '#000000',
    },
    header: {
      padding: moderateScale(20),
      paddingTop: verticalScale(30), // Aumentar el padding superior para dar más espacio al título
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    title: {
      fontSize: moderateScale(32), // Aumentar el tamaño de la fuente
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: verticalScale(15), // Aumentar el margen inferior
      marginTop: verticalScale(10), // Agregar margen superior
    },
    subtitle: {
      fontSize: moderateScale(16),
      color: '#888',
      lineHeight: verticalScale(22),
    },
    form: {
      padding: moderateScale(20),
    },
    inputContainer: {
      marginBottom: verticalScale(20),
    },
    label: {
      fontSize: moderateScale(16),
      color: '#FFFFFF',
      marginBottom: verticalScale(8),
    },
    input: {
      backgroundColor: '#1A1A1A',
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      color: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#333',
    },
    textArea: {
      height: verticalScale(100),
      textAlignVertical: 'top',
    },
    button: {
      backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
      padding: moderateScale(15),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      marginTop: verticalScale(20),
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: moderateScale(16),
      fontWeight: 'bold',
    },
  });
  
  export default styles;
  