import { StyleSheet, Dimensions } from 'react-native';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Estilos para la sección de calendario
  calendarContainer: {
    flex: 1,
    backgroundColor: '#000000',
    paddingBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: verticalScale(10),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(8),
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    marginLeft: horizontalScale(5),
  },
  calendarTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    marginLeft: horizontalScale(20),
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000000',
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
    marginRight: horizontalScale(50),
  },
  welcome: {
    fontSize: moderateScale(23),
    color: '#ffffff',
    fontWeight: '300',
  },
  userName: {
    fontSize: moderateScale(28),
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerButton: {
    position: 'absolute',
    right: horizontalScale(12),
    top: verticalScale(40),
    backgroundColor: '#ff4757',
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  optionsContainer: {
    padding: moderateScale(20),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: moderateScale(15),
    padding: moderateScale(2),
    width: '49%',
    height: verticalScale(200), // Altura fija para mantener consistencia
    marginBottom: verticalScale(20),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center', // Centrar contenido verticalmente
    borderWidth: 2,
    borderColor: '#ff4757',
  },
  adminCard: {
    backgroundColor: '#1a1a1a',
  },
  optionTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: verticalScale(1),
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: moderateScale(12),
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: verticalScale(5),
    paddingHorizontal: horizontalScale(5),
  },
  // Estilos para el mensaje de bienvenida
  welcomeMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
    marginHorizontal: horizontalScale(15),
    marginBottom: verticalScale(20),
    borderLeftWidth: moderateScale(3),
    borderLeftColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(4),
    elevation: 4,
  },
  welcomeMessageTextContainer: {
    flex: 1,
    marginLeft: horizontalScale(10),
  },
  welcomeMessageTitle: {
    color: '#FFD700',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginBottom: verticalScale(5),
  },
  welcomeMessage: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    lineHeight: verticalScale(20),
  },
});
