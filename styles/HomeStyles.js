import { Dimensions, Platform } from 'react-native';
import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';
import { COLORS, SIZES } from './theme';

const { width } = Dimensions.get('window');

export const styles = ResponsiveStyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: verticalScale(15), // Reducido porque ya estamos usando SafeAreaView con paddingTop
    paddingBottom: verticalScale(20),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: verticalScale(20),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    textShadowOffset: { width: 0, height: verticalScale(1) },
    textShadowRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(15),
    marginLeft: horizontalScale(20),
  },
  headerButton: {
    backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: horizontalScale(140),
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  headerButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: moderateScale(16),
    textAlign: 'center',
  },
  viewAllText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: moderateScale(16),
  },
  section: {
    padding: moderateScale(20),
    marginBottom: verticalScale(15),
  },
  sectionTitle: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(15),
    letterSpacing: 0.5,
  },
  cardScroll: {
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(20),
  },
  loadingContainer: {
    height: verticalScale(200),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: moderateScale(15),
    marginHorizontal: horizontalScale(20),
    marginBottom: verticalScale(20),
  },
  errorText: {
    color: '#FF3A5E',
    fontSize: moderateScale(16),
    textAlign: 'center',
    padding: moderateScale(20),
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: moderateScale(16),
    textAlign: 'center',
    padding: moderateScale(20),
  },
  card: {
    width: width * 0.85,
    marginRight: horizontalScale(15),
    backgroundColor: '#000000',
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: verticalScale(200),
    resizeMode: 'cover',
  },
  cardContent: {
    padding: moderateScale(20),
  },
  cardTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(8),
  },
  cardSubtitle: {
    fontSize: moderateScale(16),
    color: '#FF3A5E', // Color de acento rojo preferido por el usuario
    marginBottom: verticalScale(12),
  },
  cardDescription: {
    fontSize: moderateScale(15),
    color: '#FFFFFF',
    lineHeight: verticalScale(22),
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(15),
    padding: moderateScale(20),
  },
  categoryCard: {
    flex: 1,
    minWidth: width * 0.4,
    aspectRatio: 1,
    backgroundColor: '#000000',
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryIcon: {
    marginBottom: verticalScale(12),
  },
  categoryText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: verticalScale(10), // Equivalente a SIZES.padding.sm
    borderTopWidth: 1,
    borderTopColor: '#333333', // Usando un color específico en lugar de COLORS.border
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(5), // Equivalente a SIZES.padding.xs
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
  },
  tabButtonText: {
    fontSize: moderateScale(12), // Equivalente a SIZES.caption
    color: '#AAAAAA', // Equivalente a COLORS.text.secondary
    marginTop: verticalScale(4),
  },
  activeTabButtonText: {
    color: '#FF3A5E', // Color de acento rojo preferido por el usuario
  },
  content: {
    flex: 1,
  },
  eventCard: {
    width: width * 0.8,
    height: verticalScale(200),
    marginRight: horizontalScale(15), // Equivalente a SIZES.margin.md
    borderRadius: moderateScale(15), // Equivalente a SIZES.radius.lg
    backgroundColor: '#000000', // Equivalente a COLORS.surface
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  eventCardContent: {
    flex: 1,
    padding: moderateScale(15), // Equivalente a SIZES.padding.md
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: moderateScale(20), // Equivalente a SIZES.h2
    fontWeight: 'bold',
    color: '#FFFFFF', // Equivalente a COLORS.text.primary
  },
  eventDate: {
    fontSize: moderateScale(14), // Equivalente a SIZES.body
    color: '#FF3A5E', // Color de acento rojo preferido por el usuario
  },
  eventDescription: {
    fontSize: moderateScale(14), // Equivalente a SIZES.body
    color: '#AAAAAA', // Equivalente a COLORS.text.secondary
  },
  artistCard: {
    backgroundColor: '#000000', // Equivalente a COLORS.surface
    borderRadius: moderateScale(10), // Equivalente a SIZES.radius.md
    marginBottom: verticalScale(15), // Equivalente a SIZES.margin.md
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  artistCardContent: {
    padding: moderateScale(15), // Equivalente a SIZES.padding.md
  },
  artistName: {
    fontSize: moderateScale(18), // Equivalente a SIZES.h3
    fontWeight: 'bold',
    color: '#FFFFFF', // Equivalente a COLORS.text.primary
    marginBottom: verticalScale(5), // Equivalente a SIZES.margin.xs
  },
  artistSpecialty: {
    fontSize: moderateScale(14), // Equivalente a SIZES.body
    color: '#FF3A5E', // Color de acento rojo preferido por el usuario
    marginBottom: verticalScale(5), // Equivalente a SIZES.margin.xs
  },
  artistDescription: {
    fontSize: moderateScale(14), // Equivalente a SIZES.body
    color: '#AAAAAA', // Equivalente a COLORS.text.secondary
  },
  spaceCard: {
    backgroundColor: '#000000', // Equivalente a COLORS.surface
    borderRadius: moderateScale(10), // Equivalente a SIZES.radius.md
    marginBottom: verticalScale(15), // Equivalente a SIZES.margin.md
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  spaceCardContent: {
    padding: moderateScale(15), // Equivalente a SIZES.padding.md
  },
  spaceName: {
    fontSize: moderateScale(18), // Equivalente a SIZES.h3
    fontWeight: 'bold',
    color: '#FFFFFF', // Equivalente a COLORS.text.primary
    marginBottom: verticalScale(5), // Equivalente a SIZES.margin.xs
  },
  spaceType: {
    fontSize: moderateScale(14), // Equivalente a SIZES.body
    color: '#FF3A5E', // Color de acento rojo preferido por el usuario
    marginBottom: verticalScale(5), // Equivalente a SIZES.margin.xs
  },
  spaceDescription: {
    fontSize: moderateScale(14), // Equivalente a SIZES.body
    color: '#AAAAAA', // Equivalente a COLORS.text.secondary
  },
  fab: {
    position: 'absolute',
    right: horizontalScale(20), // Equivalente a SIZES.margin.lg
    bottom: verticalScale(20), // Equivalente a SIZES.margin.lg
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  snackbar: {
    position: 'absolute',
    bottom: verticalScale(30), // Equivalente a SIZES.margin.xl
    left: horizontalScale(20), // Equivalente a SIZES.margin.lg
    right: horizontalScale(20), // Equivalente a SIZES.margin.lg
    backgroundColor: '#000000', // Equivalente a COLORS.surface
    borderRadius: moderateScale(10), // Equivalente a SIZES.radius.md
    padding: moderateScale(15), // Equivalente a SIZES.padding.md
    elevation: 5,
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  snackbarText: {
    color: '#FFFFFF', // Equivalente a COLORS.text.primary
    fontSize: moderateScale(14), // Equivalente a SIZES.body
    textAlign: 'center',
  },
  viewAllButton: {
    backgroundColor: '#000000', // Equivalente a COLORS.surface
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginHorizontal: horizontalScale(20),
  },
  viewAllText: {
    color: '#FF3A5E', // Color de acento rojo preferido por el usuario
    fontWeight: '600',
    fontSize: moderateScale(16),
    letterSpacing: 0.5,
  },
  continueButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(25),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(10),
    borderWidth: moderateScale(2),
    borderColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
  },
  
  // Estilos para la sección de conexión cultural
  culturalHeroSection: {
    marginVertical: verticalScale(0),
    marginHorizontal: horizontalScale(15),
    borderRadius: moderateScale(10),
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  culturalHeroBackground: {
    width: '100%',
    height: verticalScale(390), // Reducimos más la altura para que todo quepa
    justifyContent: 'flex-start',
    borderRadius: moderateScale(20),
    overflow: 'hidden',
  },
  culturalHeroBackgroundImage: {
    opacity: 0.4, // Opacidad como en la imagen 1
    borderRadius: moderateScale(20),
  },
  culturalHeroContent: {
    padding: moderateScale(14),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(4),
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(30, 20, 50, 0.65)', // Color de fondo más oscuro y púrpura como en la imagen 1
  },
  culturalHeroTitle: {
    fontSize: moderateScale(20), // Reducimos más el tamaño para que quepa en una línea
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(10),
    textShadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    textShadowOffset: { width: 0, height: verticalScale(1) },
    textShadowRadius: 5,
    letterSpacing: 0.3, // Menor espaciado entre letras
  },
  culturalHeroSubtitle: {
    fontSize: moderateScale(13), // Reducimos el tamaño
    color: '#FFFFFF',
    marginBottom: verticalScale(10), // Menos espacio
    opacity: 0.9,
    letterSpacing: 0.3,
    fontWeight: '500',
  },
  culturalHeroDescription: {
    fontSize: moderateScale(13), // Reducimos el tamaño
    color: '#FFFFFF',
    marginBottom: verticalScale(15), // Menos espacio
    opacity: 0.85,
    lineHeight: verticalScale(18), // Menor altura de línea
    letterSpacing: 0.2,
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: verticalScale(1),
    marginBottom: verticalScale(2),
    paddingHorizontal: horizontalScale(5),
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: horizontalScale(2),
  },
  statIconContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario para el primer ícono
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  statCount: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(2),
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Estilos para los íconos
  iconLarge: {
    fontSize: moderateScale(24),
  },
  iconMedium: {
    fontSize: moderateScale(20),
  },
  iconSmall: {
    fontSize: moderateScale(16),
  },
  statLabel: {
    fontSize: moderateScale(14),
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '40',
  },
  
  // Estilos para la sección de destacados
  featuredSection: {
    padding: moderateScale(20),
    marginBottom: verticalScale(25),
  },
  featuredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: verticalScale(20),
  },
  featuredCard: {
    width: width * 0.38,
    height: verticalScale(180),
    borderRadius: moderateScale(15),
    overflow: 'hidden',
    backgroundColor: '#000000',
    elevation: 5,
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(3) },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: moderateScale(10),
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  featuredIconContainer: {
    position: 'absolute',
    top: verticalScale(-20),
    left: horizontalScale(10),
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  featuredTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: verticalScale(5),
  },
  featuredSubtitle: {
    fontSize: moderateScale(12),
    color: '#FFFFFF',
    opacity: 0.8,
  },
  connectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.14,
  },
  connectionLine: {
    flex: 1,
    height: verticalScale(2),
    backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
  },
  connectionCircle: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: horizontalScale(5),
  },
  connectionText: {
    fontSize: moderateScale(14),
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    marginVertical: verticalScale(15),
    fontStyle: 'italic',
  },
  exploreButton: {
    backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    paddingHorizontal: horizontalScale(25),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: verticalScale(10),
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(3) },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: moderateScale(16),
    marginRight: horizontalScale(8),
  },
  
  // Estilo para la sección del calendario
  calendarSection: {
    padding: moderateScale(20),
    marginBottom: verticalScale(15),
    backgroundColor: '#121212',
    borderRadius: moderateScale(15),
    marginHorizontal: horizontalScale(15),
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(3) },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  calendarWrapper: {
    height: verticalScale(600), // Altura fija para el calendario, ahora responsiva
    overflow: 'hidden',
    borderRadius: moderateScale(10),
  },
  calendarContainer: {
    backgroundColor: '#121212',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(15),
    paddingBottom: 0,
    marginTop: verticalScale(15),
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(-3) },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  calendarTitle: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(15),
    textAlign: 'center',
  },
  // Estilos para la sección del calendario
  calendarSection: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
    paddingHorizontal: horizontalScale(15),
  },
  calendarWrapper: {
    backgroundColor: '#111111',
    borderRadius: moderateScale(12),
    padding: moderateScale(10),
    paddingHorizontal: horizontalScale(5),
    width: '100%',
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  calendarContainer: {
    width: '100%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
    paddingHorizontal: horizontalScale(5),
  },
  calendarTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventItem: {
    marginVertical: verticalScale(8),
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    borderLeftWidth: horizontalScale(3),
    borderLeftColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    backgroundColor: '#222222',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  eventName: {
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    flex: 1,
  },
  eventBadge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(12),
    backgroundColor: '#FF3A5E66', // Color de acento rojo preferido por el usuario con transparencia
  },
  eventBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventDescription: {
    color: '#CCCCCC',
    marginBottom: verticalScale(8),
  },
  eventDetails: {
    marginTop: verticalScale(5),
    backgroundColor: '#333333',
    borderRadius: moderateScale(6),
    padding: moderateScale(8),
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(3),
    marginBottom: verticalScale(3),
  },
  eventDetailText: {
    fontSize: moderateScale(13),
    color: '#DDDDDD',
    marginLeft: horizontalScale(8),
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(15),
    paddingVertical: verticalScale(10),
  },
  viewMoreText: {
    color: '#FF3A5E', // Color de acento rojo preferido por el usuario
    fontWeight: '600',
    marginRight: horizontalScale(5),
  },
  
  // Estilos para el banner de invitación a iniciar sesión
  loginBanner: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
    marginHorizontal: horizontalScale(15),
    backgroundColor: '#1E1E1E',
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
    borderLeftWidth: horizontalScale(4),
    borderLeftColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loginBannerTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(10),
  },
  loginBannerText: {
    fontSize: moderateScale(14),
    color: '#CCCCCC',
    marginBottom: verticalScale(15),
    lineHeight: moderateScale(20),
  },
  loginBannerButton: {
    backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(25),
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBannerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: moderateScale(15),
    marginRight: horizontalScale(8),
  },
  loginButton: {
    minWidth: horizontalScale(120),
  },
  // Tamaños de iconos responsivos
  iconSmall: {
    fontSize: moderateScale(16),
  },
  iconMedium: {
    fontSize: moderateScale(20),
  },
  iconLarge: {
    fontSize: moderateScale(24),
  },
});
