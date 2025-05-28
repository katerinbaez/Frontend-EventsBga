import { StyleSheet, StatusBar, Platform } from 'react-native';
import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

// Colores de acento del tema
const ACCENT_COLOR = '#FF3A5E';
const DARK_BG = '#000000';
const MEDIUM_BG = '#000000';
const CARD_BG = '#000000';
const LIGHT_TEXT = '#FFFFFF';

// Exportar los colores para que puedan ser importados por los componentes
export { ACCENT_COLOR, DARK_BG, LIGHT_TEXT };

export const styles = ResponsiveStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  fullWidthContainer: {
    flex: 1, 
    backgroundColor: ACCENT_COLOR
  },

  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + verticalScale(10) : verticalScale(15),
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(15),
    backgroundColor: ACCENT_COLOR, // Color de acento rojo preferido por el usuario
    borderColor: '#ffffff',
    borderWidth: 1,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    marginHorizontal: 0,
    marginBottom: verticalScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: LIGHT_TEXT,
  },
  backButton: {
    padding: moderateScale(10),
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: moderateScale(50),
    width: moderateScale(44),
    height: moderateScale(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: moderateScale(15),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginBottom: verticalScale(15),
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: moderateScale(10),
  },
  portfolioItem: {
    width: '48%',
    marginHorizontal: '1%',
    marginVertical: verticalScale(10),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    backgroundColor: CARD_BG,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderStyle: 'solid',
  },
  itemImage: {
    width: '100%',
    height: verticalScale(150),
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  portfolioImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#333',
  },
  portfolioInfo: {
    padding: 12,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginBottom: 4,
  },
  portfolioDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  portfolioDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: 10,
    textAlign: 'center',
    maxWidth: '80%',
  },
  emptyStateButton: {
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
  },
  emptyStateButtonText: {
    color: LIGHT_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DARK_BG,
  },
  loadingText: {
    marginTop: 10,
    color: LIGHT_TEXT,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 50,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: LIGHT_TEXT,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  modalBody: {
    padding: 20,
    flex: 1,
  },
  
  // Estilos para el selector de imágenes
  imageSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
  },
  imageSelectorIcon: {
    alignSelf: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  imageSelectorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
  },
  imageSelectorSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  
  // Estilos para la cuadrícula de imágenes
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
  },
  imageGridItem: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    position: 'relative',
  },
  imageGridThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  addMoreImagesButton: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Estilos para los botones
  submitButton: {
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: LIGHT_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Estilos para la previsualización de proyectos
  previewContainer: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  previewImageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: '#111',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageNavButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    marginTop: -20,
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
  },
  noImageText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
  thumbnailsContainer: {
    height: 70,
    backgroundColor: '#111',
    paddingVertical: 10,
  },
  thumbnailWrapper: {
    width: 60,
    height: 50,
    marginHorizontal: 5,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: ACCENT_COLOR,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  previewInfo: {
    padding: 20,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginBottom: 8,
  },
  previewDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  previewDescription: {
    fontSize: 16,
    color: LIGHT_TEXT,
    lineHeight: 24,
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: ACCENT_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  deleteButtonText: {
    color: LIGHT_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // Estilos para la cuadrícula de portafolio
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  portfolioItem: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: CARD_BG,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#333',
  },
  itemImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#222',
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
  },
  
  // Estilos para el estado de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DARK_BG,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: LIGHT_TEXT,
  },
  
  // Estilos para el estado vacío
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: DARK_BG,
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStateButtonText: {
    color: LIGHT_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Estilos para el encabezado y botones de navegación
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  addButton: {
    padding: 10,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 50,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageSelector: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  imageGridItem: {
    width: '30%',
    height: 100,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: LIGHT_TEXT,
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  previewModalContent: {
    width: '90%',
    maxHeight: '90%',
    alignSelf: 'center',
    borderRadius: 15,
    overflow: 'hidden',
  },
  closePreviewButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  imageCarouselContainer: {
    backgroundColor: '#000',
    position: 'relative',
  },
  carouselControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
  },
  carouselButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  imageCounter: {
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  thumbnailsContainer: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#FF3A5E',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  previewInfo: {
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginBottom: 5,
  },
  previewDate: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 15,
  },
  previewDescription: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 24,
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: ACCENT_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  deleteButtonText: {
    color: LIGHT_TEXT,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACCENT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
