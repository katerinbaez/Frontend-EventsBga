import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

// Colores
export const ACCENT_COLOR = '#FF3A5E'; // Color de acento rojo preferido por el usuario
export const BACKGROUND_COLOR = '#1A1A1A';
export const TEXT_COLOR = '#FFF';
export const SECONDARY_TEXT_COLOR = '#AAA';
export const TAG_BACKGROUND = '#333';
export const TAG_TEXT_COLOR = '#CCC';
export const ERROR_COLOR = '#FF6B6B';

export const styles = ResponsiveStyleSheet.create({
  loadingContainer: {
    height: verticalScale(84),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: verticalScale(10),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    marginRight: horizontalScale(12),
  },
  iconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    marginRight: horizontalScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: verticalScale(4),
  },
  itemDescription: {
    fontSize: moderateScale(14),
    color: SECONDARY_TEXT_COLOR,
    marginBottom: verticalScale(6),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: TAG_BACKGROUND,
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    marginRight: horizontalScale(5),
    marginBottom: verticalScale(5),
  },
  tagText: {
    color: TAG_TEXT_COLOR,
    fontSize: moderateScale(10),
  },
  moreTag: {
    color: '#999',
    fontSize: moderateScale(10),
    alignSelf: 'center',
    marginLeft: horizontalScale(5),
  },
  removeButton: {
    padding: moderateScale(8),
  },
});

export default styles;
