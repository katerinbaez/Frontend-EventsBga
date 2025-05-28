import { StyleSheet } from 'react-native';
;


export const styles = StyleSheet.create({
    container: {
      width: '100%',
      zIndex: 10,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2A2A2A',
      borderRadius: 20,
      paddingHorizontal: 10,
      height: 45,
    },
    searchIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      height: 45,
      color: '#FFFFFF',
      fontSize: 16,
    },
    clearButton: {
      padding: 5,
    },
    loadingContainer: {
      padding: 10,
      alignItems: 'center',
    },
    errorContainer: {
      padding: 10,
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      borderRadius: 5,
      marginTop: 5,
    },
    errorText: {
      color: '#FF3A5E',
      fontSize: 14,
    },
    currentLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2A2A2A',
      padding: 12,
      borderRadius: 10,
      marginTop: 10,
    },
    currentLocationText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
    categoriesTitle: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
      marginTop: 16,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    categoriesContainer: {
      flexDirection: 'row',
      paddingBottom: 12,
    },
    categoryButton: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2A2A2A',
      padding: 10,
      borderRadius: 10,
      marginRight: 10,
      minWidth: 80,
    },
    categoryText: {
      color: '#FFFFFF',
      fontSize: 12,
      marginTop: 5,
      textAlign: 'center',
    },
    predictionsList: {
      backgroundColor: 'transparent',
      borderRadius: 10,
      marginTop: 5,
      maxHeight: 400,
    },
    predictionItem: {
      padding: 15,
      backgroundColor: '#2A2A2A',
      marginBottom: 10,
      borderRadius: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    resultCardContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    resultIcon: {
      marginRight: 12,
      marginTop: 2,
      width: 24,
      textAlign: 'center',
    },
    resultTextContainer: {
      flex: 1,
      flexDirection: 'column',
    },
    resultTitle: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    resultRatingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    resultRating: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 4,
    },
    resultReviews: {
      color: '#CCCCCC',
      fontSize: 14,
      marginLeft: 4,
    },
    resultType: {
      color: '#FF3A5E',
      fontSize: 14,
      marginLeft: 8,
      fontWeight: '500',
    },
    resultDetailsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    resultStatus: {
      color: '#4CAF50',
      fontSize: 14,
      fontWeight: 'bold',
    },
    resultDot: {
      color: '#CCCCCC',
      fontSize: 14,
      marginHorizontal: 6,
    },
    resultDistance: {
      color: '#FF3A5E',
      fontSize: 14,
      fontWeight: 'bold',
      backgroundColor: 'rgba(255, 58, 94, 0.1)',
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 10,
    },
    resultAddress: {
      color: '#CCCCCC',
      fontSize: 14,
    },
    
    // Estilos para la vista detallada
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#1A1A1A',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 30,
      maxHeight: '90%',
      minHeight: '50%',
    },
    closeButton: {
      position: 'absolute',
      right: 15,
      top: 15,
      zIndex: 10,
      padding: 5,
    },
    detailsScrollView: {
      marginTop: 10,
      marginBottom: 20,
    },
    detailsHeader: {
      alignItems: 'center',
      marginBottom: 20,
      paddingTop: 10,
    },
    detailsIcon: {
      marginBottom: 10,
    },
    detailsTitle: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 5,
    },
    detailsTypeContainer: {
      backgroundColor: 'rgba(255, 58, 94, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 15,
    },
    detailsType: {
      color: '#FF3A5E',
      fontSize: 14,
      fontWeight: '500',
    },
    detailsInfoContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    detailsInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 8,
      marginVertical: 5,
    },
    detailsInfoText: {
      color: '#FFFFFF',
      fontSize: 14,
      marginLeft: 5,
    },
    detailsSection: {
      marginBottom: 20,
      backgroundColor: '#2A2A2A',
      padding: 15,
      borderRadius: 10,
    },
    detailsSectionTitle: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    detailsSectionText: {
      color: '#CCCCCC',
      fontSize: 14,
      lineHeight: 20,
    },
    detailsLink: {
      color: '#4285F4',
      textDecorationLine: 'underline',
    },
    detailsButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    detailsButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 5,
    },
    detailsButtonPrimary: {
      backgroundColor: '#FF3A5E',
    },
    detailsButtonSecondary: {
      backgroundColor: '#2A2A2A',
      borderWidth: 1,
      borderColor: '#444444',
    },
    detailsButtonTextPrimary: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 14,
    },
    detailsButtonTextSecondary: {
      color: '#FFFFFF',
      fontSize: 14,
    },
  });