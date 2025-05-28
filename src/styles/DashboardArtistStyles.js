import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: verticalScale(30),
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(20),
    backgroundColor: '#000000',
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    marginBottom: verticalScale(25),
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  welcomeContainer: {
    marginRight: horizontalScale(80),
    marginBottom: verticalScale(10),
  },
  welcome: {
    fontSize: moderateScale(26),
    color: '#ffffff',
    fontWeight: '400',
    lineHeight: moderateScale(32),
  },
  userName: {
    fontSize: moderateScale(34),
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: verticalScale(5),
  },
  headerButton: {
    position: 'absolute',
    right: horizontalScale(18),
    top: verticalScale(70),
    backgroundColor: '#865FF4',
    paddingHorizontal: horizontalScale(11),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(25),
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: verticalScale(3) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(5),
    elevation: 5,
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
    borderRadius: moderateScale(18),
    borderColor:'#865FF4',
    borderWidth: 1,
    padding: moderateScale(10),
    width: width < 600 ? '47%' : '30%',
    marginBottom: verticalScale(20),
    elevation: 5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: verticalScale(12),
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  optionDescription: {
    fontSize: moderateScale(13),
    color: '#cccccc',
    marginTop: verticalScale(6),
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});