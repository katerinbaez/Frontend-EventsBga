import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000000',
    
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF0000',
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 90,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  documentViewer: {
    flex: 1,
    backgroundColor: '#000000'
    
  },
  documentHeader: {
    height: 60,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 15
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5
  },
  text: {
    color: '#FFFFFF',
    marginBottom: 5
  },
  fecha: {
    color: '#999999',
    fontSize: 12,
    marginTop: 5
  },
  emptyText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20
  },
  errorText: {
    color: '#ff4757',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    padding: 10
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(208, 9, 9, 0.9)',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxHeight: '90%'
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalSubHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5
  },
  modalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10
  },
  modalText: {
    color: '#FFFFFF',
    marginBottom: 8,
    fontSize: 16
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
    marginVertical: 5
  },
  approveButton: {
    backgroundColor: '#4CAF50'
  },
  rejectButton: {
    backgroundColor: '#f44336'
  },
  closeButton: {
    backgroundColor: '#757575',
    marginTop: 10
  },
});