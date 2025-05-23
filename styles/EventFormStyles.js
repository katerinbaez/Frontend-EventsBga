import { StyleSheet } from 'react-native';
;

export 
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center'
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  timeSeperator: {
    color: '#FFFFFF',
    fontSize: 16,
    marginHorizontal: 5,
    alignSelf: 'center'
  },
  helpText: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic'
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'flex-start'
  },
  timeSlot: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    margin: 5,
    minWidth: 80,
    alignItems: 'center'
  },
  timeSlotSelected: {
    backgroundColor: '#FF3A5E'
  },
  timeSlotText: {
    color: '#FFFFFF',
    fontSize: 14
  },
  timeSlotTextSelected: {
    fontWeight: 'bold'
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  loadingText: {
    color: '#CCCCCC',
    marginTop: 10
  },
  noSlotsText: {
    color: '#CCCCCC',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  datePickerButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  datePickerText: {
    color: '#FFFFFF',
    fontSize: 16
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  categoryList: {
    backgroundColor: '#333',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444'
  },
  selectedCategory: {
    backgroundColor: '#444'
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 16
  },
  submitButton: {
    backgroundColor: '#FF3A5E',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
