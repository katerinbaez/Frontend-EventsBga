import { StyleSheet } from 'react-native';

// Colores de acento del tema
const ACCENT_COLOR = '#FF3A5E';
const DARK_BG = '#000000';
const DARK_CARD_BG = '#111111';
const LIGHT_TEXT = '#FFFFFF';
const SECONDARY_TEXT = '#CCCCCC';
const BORDER_COLOR = '#333333';

// Exportar los colores para que puedan ser importados por los componentes
export { ACCENT_COLOR, DARK_BG, LIGHT_TEXT, SECONDARY_TEXT };

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    padding: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 25,
    position: 'relative',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: ACCENT_COLOR,
  },
  profileImagePlaceholder: {
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '50%',
    transform: [{ translateX: 60 }],
    backgroundColor: ACCENT_COLOR,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  changePhotoText: {
    color: LIGHT_TEXT,
    fontSize: 14,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  skillsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: LIGHT_TEXT,
    marginRight: 10,
    backgroundColor: DARK_CARD_BG,
  },
  addSkillButton: {
    padding: 8,
  },
  skillsScrollView: {
    maxHeight: 100,
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipText: {
    color: LIGHT_TEXT,
    fontSize: 14,
    marginRight: 5,
    fontWeight: '500',
  },
  removeSkillButton: {
    padding: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: ACCENT_COLOR,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
  },
  editButtonText: {
    marginLeft: 5,
    color: LIGHT_TEXT,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 50,
    backgroundColor: LIGHT_TEXT,
    paddingHorizontal: 15,
  },
  saveButtonText: {
    marginLeft: 5,
    color: ACCENT_COLOR,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
    backgroundColor: DARK_CARD_BG,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_COLOR,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: SECONDARY_TEXT,
    lineHeight: 24,
  },
  skillTag: {
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: LIGHT_TEXT,
    fontSize: 14,
    fontWeight: '500',
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
  },
  socialText: {
    marginLeft: 10,
    color: LIGHT_TEXT,
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
  },
  contactLabel: {
    width: 80,
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },
  contactValue: {
    flex: 1,
    fontSize: 16,
    color: LIGHT_TEXT,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: LIGHT_TEXT,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: LIGHT_TEXT,
    backgroundColor: DARK_CARD_BG,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
