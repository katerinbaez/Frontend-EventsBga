import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  welcomeContainer: {
    marginRight: 50,
  },
  welcome: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  userName: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerButton: {
    position: 'absolute',
    right: 20,
    top: 50,
    backgroundColor: '#ff4757',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '47%',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  adminCard: {
    backgroundColor: '#1a1a1a',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 5,
    textAlign: 'center',
    opacity: 0.8,
  },
});
