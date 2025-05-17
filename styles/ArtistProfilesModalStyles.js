import { StyleSheet, Dimensions } from 'react-native';

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

const styles = StyleSheet.create({
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
    paddingTop: 35, // Margen para respetar la barra de estado
  },
  modalContent: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 5,
  },
  loader: {
    marginVertical: 20,
  },
  artistsList: {
    paddingBottom: 20,
  },
  artistItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    height: 70,
  },
  detailButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3A5E',
    textShadowColor: 'rgba(255, 58, 94, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  closeDetailsButton: {
    padding: 5,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsScrollView: {
    maxHeight: undefined, // Eliminar la restricción de altura máxima
    flex: 1,
  },
  detailsScrollViewContent: {
    paddingBottom: 50, // Más espacio adicional al final para mejor experiencia de desplazamiento
    flexGrow: 1, // Asegurar que el contenido pueda crecer
  },
  detailsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FF3A5E', // Mantener el color de acento rojo que prefiere el usuario
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: '80%', // Limitar la altura del contenedor de detalles al 80% de la pantalla
    flex: 1, // Permitir que el contenedor crezca
  },
  detailSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  biographyText: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    color: '#CCC',
    marginLeft: 10,
    fontSize: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailTag: {
    backgroundColor: '#333',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  detailTagText: {
    color: '#FFF',
    fontSize: 13,
  },
  experienceText: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  socialUrlsContainer: {
    marginTop: 10,
  },
  socialUrlText: {
    color: '#CCC',
    fontSize: 12,
    marginBottom: 5,
  },
  socialUrlLabel: {
    fontWeight: 'bold',
    color: '#FF3A5E',
  },
  portfolioSection: {
    marginTop: 10,
  },
  portfolioSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DDD',
    marginBottom: 8,
  },
  portfolioItemContainer: {
    marginBottom: 12,
  },
  portfolioItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
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
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  portfolioLinkText: {
    fontSize: 12,
    color: '#FF3A5E',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  portfolioImagesSection: {
    marginTop: 10,
  },
  portfolioImagesCount: {
    fontSize: 12,
    color: '#CCC',
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
    marginTop: 10,
  },
  imageContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    width: '100%',
    borderLeftWidth: 2,
    borderLeftColor: '#FF3A5E',
  },
  imageIndex: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  imageUrl: {
    color: '#CCC',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  portfolioImageContainer: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  portfolioImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#222',
  },
  portfolioTitleContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FF3A5E',
    paddingBottom: 8,
  },
  portfolioDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  profileStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  profileStatusText: {
    fontSize: 14,
    color: '#CCC',
  },
  noDataText: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#CCC',
    marginTop: 10,
    fontSize: 14,
  },
  bottomSpace: {
    height: 20,
  },
  artistImageContainer: {
    marginRight: 15,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3A5E',
    overflow: 'hidden',
  },
  artistImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  artistImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
    textShadowColor: 'rgba(255, 58, 94, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  artistBio: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 8,
    lineHeight: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#555',
  },
  tagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  moreTag: {
    color: '#999',
    fontSize: 12,
    marginLeft: 5,
    alignSelf: 'center',
  },
  favoriteButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default styles;
