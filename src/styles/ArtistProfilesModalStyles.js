import { Dimensions } from 'react-native';
import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

// Dimensiones de la pantalla
const { width, height } = Dimensions.get('window');

// Colores
export const ACCENT_COLOR = '#FF3A5E';
export const BACKGROUND_COLOR = '#1A1A1A';
export const MODAL_BACKGROUND = 'rgba(0, 0, 0, 0.8)';
export const TEXT_COLOR = '#FFF';
export const SECONDARY_TEXT_COLOR = '#CCC';
export const TERTIARY_TEXT_COLOR = '#999';
export const BORDER_COLOR = '#444';
export const ITEM_BACKGROUND = '#2A2A2A';
export const TAG_BACKGROUND = '#444';
export const TAG_BORDER_COLOR = '#555';

const styles = ResponsiveStyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.95)', // Fondo negro casi opaco
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // Mayor prioridad para estar por encima de todo
    paddingTop: verticalScale(35), // Margen para respetar la barra de estado
  },
  modalContent: {
    width: '95%',
    maxHeight: '90%',
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
  artistsList: {
    paddingBottom: verticalScale(20),
  },
  artistItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
    marginBottom: verticalScale(5),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#333',
    // Añadir efecto de presión para indicar que es presionable
    activeOpacity: 0.7,
  },
  selectedArtistItem: {
    borderColor: '#FF3A5E',
    borderWidth: 2,
    backgroundColor: '#2D2D2D',
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: verticalScale(70),
  },
  detailButton: {
    padding: moderateScale(8),
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: moderateScale(20),
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
    paddingBottom: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailsTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#FF3A5E',
    textShadowColor: 'rgba(255, 58, 94, 0.3)',
    textShadowOffset: { width: 0, height: verticalScale(1) },
    textShadowRadius: 3,
  },
  closeDetailsButton: {
    padding: moderateScale(5),
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: moderateScale(15),
    width: moderateScale(30),
    height: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsScrollView: {
    maxHeight: undefined, // Eliminar la restricción de altura máxima
    flex: 1,
  },
  detailsScrollViewContent: {
    paddingBottom: verticalScale(50), // Más espacio adicional al final para mejor experiencia de desplazamiento
    flexGrow: 1, // Asegurar que el contenido pueda crecer
  },
  detailsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: moderateScale(10),
    padding: moderateScale(15),
    marginBottom: verticalScale(15),
    borderWidth: 1,
    borderColor: '#FF3A5E', // Mantener el color de acento rojo que prefiere el usuario
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(3) },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: '80%', // Limitar la altura del contenedor de detalles al 80% de la pantalla
    flex: 1, // Permitir que el contenedor crezca
  },
  detailSection: {
    marginBottom: verticalScale(15),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: verticalScale(8),
  },
  biographyText: {
    color: '#CCC',
    fontSize: moderateScale(14),
    lineHeight: verticalScale(20),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  contactText: {
    color: '#CCC',
    marginLeft: horizontalScale(10),
    fontSize: moderateScale(14),
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailTag: {
    backgroundColor: '#333',
    borderRadius: moderateScale(15),
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: '#444',
  },
  detailTagText: {
    color: '#FFF',
    fontSize: moderateScale(13),
  },
  experienceText: {
    color: '#CCC',
    fontSize: moderateScale(14),
    lineHeight: verticalScale(20),
  },
  socialLinksContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(5),
  },
  socialButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(10),
    borderWidth: 1,
    borderColor: '#444',
  },
  socialUrlsContainer: {
    marginTop: verticalScale(10),
  },
  socialUrlText: {
    color: '#CCC',
    fontSize: moderateScale(12),
    marginBottom: verticalScale(5),
  },
  socialUrlLabel: {
    fontWeight: 'bold',
    color: '#FF3A5E',
  },
  portfolioSection: {
    marginTop: verticalScale(10),
  },
  portfolioSubtitle: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: '#DDD',
    marginBottom: verticalScale(8),
  },
  portfolioItemContainer: {
    marginBottom: verticalScale(12),
  },
  portfolioItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  portfolioItemExpanded: {
    backgroundColor: '#333',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  portfolioItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  portfolioItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  portfolioItemDescription: {
    fontSize: 12,
    color: '#CCC',
    marginBottom: 4,
  },
  portfolioItemDate: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  portfolioItemPreview: {
    fontSize: 12,
    color: '#CCC',
    marginTop: 4,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  portfolioItemDetails: {
    padding: 12,
    backgroundColor: '#222',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#333',
    borderBottomColor: '#333',
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 10,
  },
  detailRow: {
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    color: '#CCC',
  },
  portfolioLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 6,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: moderateScale(4),
    alignSelf: 'flex-start',
  },
  portfolioLinkText: {
    fontSize: moderateScale(12),
    color: '#FF3A5E',
    marginLeft: horizontalScale(6),
    fontWeight: 'bold',
  },
  eventTitle: {
    color: '#FFF',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  portfolioImagesSection: {
    marginTop: verticalScale(10),
  },
  portfolioImagesCount: {
    fontStyle: 'italic',
  },
  debugSection: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  debugText: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: moderateScale(10),
  },
  imageContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    marginRight: horizontalScale(10),
    marginBottom: moderateScale(10),
    width: '100%',
    borderLeftWidth: moderateScale(2),
    borderLeftColor: '#FF3A5E',
  },
  imageIndex: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: moderateScale(14),
    marginBottom: moderateScale(5),
  },
  imageUrl: {
    color: '#CCC',
    fontSize: moderateScale(12),
    fontFamily: 'monospace',
  },
  portfolioImageContainer: {
    marginBottom: moderateScale(15),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    borderWidth: moderateScale(1),
    borderColor: '#444',
    position: 'relative',
    height: moderateScale(140),
    backgroundColor: '#222',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
  carouselContainer: {
    marginBottom: moderateScale(15),
    position: 'relative',
    width: '100%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: moderateScale(10),
    right: moderateScale(10),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#FFFFFF',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(10),
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  portfolioTitleContainer: {
    marginBottom: moderateScale(15),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#FF3A5E',
    paddingBottom: moderateScale(8),
  },
  portfolioDetailTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  profileStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    marginRight: horizontalScale(8),
  },
  profileStatusText: {
    fontSize: moderateScale(14),
    color: '#CCC',
  },
  noDataText: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: moderateScale(14),
  },
  loadingContainer: {
    padding: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#CCC',
    marginTop: moderateScale(10),
    fontSize: moderateScale(14),
  },
  bottomSpace: {
    height: moderateScale(20),
  },
  artistImageContainer: {
    marginRight: horizontalScale(15),
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(2),
    borderColor: '#FF3A5E',
    overflow: 'hidden',
  },
  artistImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(35),
  },
  artistImagePlaceholder: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistInfo: {
    flex: 1,
    marginLeft: horizontalScale(10),
  },
  artistName: {
    color: '#FFF',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginBottom: verticalScale(2),
  },
  artistBio: {
    fontSize: moderateScale(14),
    color: '#CCC',
    marginBottom: verticalScale(8),
    lineHeight: verticalScale(18),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    marginRight: horizontalScale(5),
    marginBottom: verticalScale(5),
    borderWidth: 1,
    borderColor: '#FF3A5E',
  },
  tagText: {
    color: '#FF3A5E',
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  moreTag: {
    color: '#999',
    fontSize: moderateScale(12),
    marginLeft: horizontalScale(5),
    alignSelf: 'center',
  },
  favoriteButton: {
    padding: moderateScale(10),
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: moderateScale(20),
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(30),
  },
  noArtistsText: {
    color: '#CCC',
    fontSize: moderateScale(16),
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
});

export default styles;
