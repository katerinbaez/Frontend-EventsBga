import { StyleSheet } from 'react-native';

// Colores
export const ACCENT_COLOR = '#4A90E2';
export const BACKGROUND_COLOR = '#1A1A1A';
export const TEXT_COLOR = '#FFF';
export const SECONDARY_TEXT_COLOR = '#AAA';
export const TAG_BACKGROUND = '#333';
export const TAG_TEXT_COLOR = '#CCC';
export const ERROR_COLOR = '#FF6B6B';

export const styles = StyleSheet.create({
  loadingContainer: {
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: SECONDARY_TEXT_COLOR,
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: TAG_BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    color: TAG_TEXT_COLOR,
    fontSize: 10,
  },
  moreTag: {
    color: '#999',
    fontSize: 10,
    alignSelf: 'center',
    marginLeft: 5,
  },
  removeButton: {
    padding: 8,
  },
});

export default styles;
