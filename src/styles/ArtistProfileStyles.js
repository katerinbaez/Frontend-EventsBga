import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

// Colores de acento del tema
const ACCENT_COLOR = '#FF3A5E';
const DARK_BG = '#000000';
const DARK_CARD_BG = '#111111';
const LIGHT_TEXT = '#FFFFFF';
const SECONDARY_TEXT = '#CCCCCC';
const BORDER_COLOR = '#333333';

// Exportar los colores para que puedan ser importados por los componentes
export { ACCENT_COLOR, DARK_BG, LIGHT_TEXT, SECONDARY_TEXT };

export const styles = ResponsiveStyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    padding: moderateScale(20),
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: verticalScale(25),
    position: 'relative',
  },
  profileImage: {
    width: moderateScale(140),
    height: moderateScale(140),
    borderRadius: moderateScale(70),
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
    transform: [{ translateX: horizontalScale(60) }],
    backgroundColor: ACCENT_COLOR,
    borderRadius: moderateScale(25),
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(3),
  },
  changePhotoText: {
    color: LIGHT_TEXT,
    fontSize: moderateScale(14),
    marginLeft: horizontalScale(5),
    fontWeight: 'bold',
  },
  skillsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    fontSize: moderateScale(16),
    color: LIGHT_TEXT,
    marginRight: horizontalScale(10),
    backgroundColor: DARK_CARD_BG,
  },
  addSkillButton: {
    padding: moderateScale(8),
  },
  skillsScrollView: {
    maxHeight: verticalScale(100),
    marginBottom: verticalScale(10),
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(8),
  },
  skillChipText: {
    color: LIGHT_TEXT,
    fontSize: moderateScale(14),
    marginRight: horizontalScale(5),
    fontWeight: '500',
  },
  removeSkillButton: {
    padding: moderateScale(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    backgroundColor: ACCENT_COLOR,
    marginHorizontal: horizontalScale(-20),
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
    marginTop: verticalScale(-20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: LIGHT_TEXT,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(50),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: horizontalScale(15),
  },
  editButtonText: {
    marginLeft: horizontalScale(5),
    color: LIGHT_TEXT,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(10),
    borderRadius: moderateScale(50),
    backgroundColor: LIGHT_TEXT,
    paddingHorizontal: horizontalScale(15),
  },
  saveButtonText: {
    marginLeft: horizontalScale(5),
    color: ACCENT_COLOR,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: verticalScale(25),
    backgroundColor: DARK_CARD_BG,
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_COLOR,
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: LIGHT_TEXT,
    marginBottom: verticalScale(12),
  },
  text: {
    fontSize: moderateScale(16),
    color: SECONDARY_TEXT,
    lineHeight: verticalScale(24),
  },
  skillTag: {
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(8),
  },
  skillText: {
    color: LIGHT_TEXT,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: moderateScale(10),
    borderRadius: moderateScale(8),
  },
  socialText: {
    marginLeft: horizontalScale(10),
    color: LIGHT_TEXT,
    fontSize: moderateScale(16),
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: verticalScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: moderateScale(10),
    borderRadius: moderateScale(8),
  },
  contactLabel: {
    width: horizontalScale(100),
    fontSize: moderateScale(16),
    color: '#999999',
    fontWeight: '500',
  },
  contactValue: {
    flex: 1,
    fontSize: moderateScale(14),
    color: LIGHT_TEXT,
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(16),
    color: LIGHT_TEXT,
    marginBottom: verticalScale(8),
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    fontSize: moderateScale(16),
    color: LIGHT_TEXT,
    backgroundColor: DARK_CARD_BG,
  },
  textArea: {
    height: verticalScale(100),
    textAlignVertical: 'top',
  },
});
