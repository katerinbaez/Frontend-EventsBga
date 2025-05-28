import { Platform, StatusBar, Dimensions } from 'react-native';
import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { horizontalScale, verticalScale, moderateScale, adaptiveFontSize } from '../utils/ResponsiveUtils';

// Obtener dimensiones de la pantalla
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Colores de la aplicación
export const COLORS = {
  primary: '#FF3A5E',       // Color de acento rojo
  primaryLight: 'rgba(255, 58, 94, 0.1)',
  secondary: '#333333',     // Texto oscuro
  background: '#FFFFFF',    // Fondo blanco
  card: '#F8F8F8',          // Fondo de tarjetas
  border: '#E0E0E0',        // Bordes
  text: '#333333',          // Texto principal
  textSecondary: '#666666', // Texto secundario
  textLight: '#999999',     // Texto claro
  success: '#4CAF50',       // Verde para éxito
  warning: '#FFC107',       // Amarillo para advertencias
  error: '#FF3A5E',         // Rojo para errores (mismo que primary)
  disabled: '#CCCCCC',      // Color para elementos deshabilitados
};

// Tipografía responsiva
export const TYPOGRAPHY = {
  h1: {
    fontSize: adaptiveFontSize(24),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  h2: {
    fontSize: adaptiveFontSize(20),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  h3: {
    fontSize: adaptiveFontSize(18),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  body: {
    fontSize: adaptiveFontSize(14),
    color: COLORS.text,
  },
  bodySmall: {
    fontSize: adaptiveFontSize(12),
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: adaptiveFontSize(10),
    color: COLORS.textLight,
  },
  button: {
    fontSize: adaptiveFontSize(16),
    fontWeight: 'bold',
    color: COLORS.background,
  },
};

// Espaciado responsivo
export const SPACING = {
  tiny: verticalScale(4),
  small: verticalScale(8),
  medium: verticalScale(16),
  large: verticalScale(24),
  extraLarge: verticalScale(32),
};

// Estilos globales para toda la aplicación
export const GlobalStyles = ResponsiveStyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    width: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(24),
  },
  
  // Tarjetas y secciones
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: moderateScale(16),
    marginVertical: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  section: {
    marginBottom: verticalScale(24),
    width: '100%',
  },
  
  // Encabezados
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    width: '100%',
  },
  
  // Inputs
  input: {
    width: '100%',
    height: verticalScale(45),
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: horizontalScale(12),
    fontSize: adaptiveFontSize(14),
    color: COLORS.text,
    marginBottom: verticalScale(12),
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(255, 58, 94, 0.05)',
  },
  inputLabel: {
    fontSize: adaptiveFontSize(14),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: verticalScale(6),
  },
  errorText: {
    color: COLORS.error,
    fontSize: adaptiveFontSize(12),
    marginTop: verticalScale(-8),
    marginBottom: verticalScale(8),
  },
  
  // Botones
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: COLORS.background,
    fontSize: adaptiveFontSize(16),
    fontWeight: 'bold',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonOutlineText: {
    color: COLORS.primary,
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  
  // Listas
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  // Flexbox helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Márgenes y paddings responsivos
  mt: { marginTop: verticalScale(8) },
  mb: { marginBottom: verticalScale(8) },
  ml: { marginLeft: horizontalScale(8) },
  mr: { marginRight: horizontalScale(8) },
  mx: { marginHorizontal: horizontalScale(8) },
  my: { marginVertical: verticalScale(8) },
  m: { margin: moderateScale(8) },
  
  pt: { paddingTop: verticalScale(8) },
  pb: { paddingBottom: verticalScale(8) },
  pl: { paddingLeft: horizontalScale(8) },
  pr: { paddingRight: horizontalScale(8) },
  px: { paddingHorizontal: horizontalScale(8) },
  py: { paddingVertical: verticalScale(8) },
  p: { padding: moderateScale(8) },
  
  // Espaciado específico
  mt1: { marginTop: verticalScale(4) },
  mt2: { marginTop: verticalScale(8) },
  mt3: { marginTop: verticalScale(16) },
  mt4: { marginTop: verticalScale(24) },
  mt5: { marginTop: verticalScale(32) },
  
  mb1: { marginBottom: verticalScale(4) },
  mb2: { marginBottom: verticalScale(8) },
  mb3: { marginBottom: verticalScale(16) },
  mb4: { marginBottom: verticalScale(24) },
  mb5: { marginBottom: verticalScale(32) },
  
  // Sombras
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
});

export default GlobalStyles;
