import { COLORS, COMMON_STYLES, SIZES } from './theme';
import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = ResponsiveStyleSheet.create({
  adminButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    padding: 0,
    backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  iconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: 'transparent',
    borderWidth: moderateScale(2),
    borderColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(15),
  },
  modalTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(20),
    textAlign: 'center',
    textShadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    textShadowOffset: { width: 0, height: verticalScale(1) },
    textShadowRadius: 10,
  },
  welcomeText: {
    fontSize: moderateScale(20), // Equivalente a COMMON_STYLES.fonts.h2
    fontWeight: 'bold',
    color: '#FFFFFF', // Equivalente a COLORS.text.primary
    marginBottom: verticalScale(10), // Equivalente a SIZES.margin.sm
  },
  instructionText: {
    fontSize: moderateScale(14), // Equivalente a COMMON_STYLES.fonts.body
    color: '#AAAAAA', // Equivalente a COLORS.text.secondary
    marginBottom: verticalScale(20), // Equivalente a SIZES.margin.lg
  },
  modalContent: {
    backgroundColor: '#000000',
    padding: moderateScale(20),
    borderRadius: moderateScale(20),
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: moderateScale(2),
    borderColor: '#FF0000',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  input: {
    width: '100%',
    height: verticalScale(50),
    backgroundColor: '#2A2A2A',
    borderWidth: moderateScale(2),
    borderColor: '#FF0000',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(15),
    marginBottom: verticalScale(20),
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: horizontalScale(10),
    marginTop: verticalScale(10),
  },
  
  // Estilos específicos para los botones del modal de acceso administrativo
  adminActionButton: {
    width: '48%',
    height: verticalScale(45),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#333333',
  },
  
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginLeft: horizontalScale(5),
  },
});
