import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../../../styles/ViewsRoleRequestStyles';

const PortfolioLinks = ({ portafolio, onDocumentPress }) => {
  if (!portafolio || portafolio.length === 0) {
    return null;
  }

  return (
    <View>
      <Text style={styles.modalSubHeader}>Portafolio:</Text>
      {portafolio.map((url, index) => (
        <TouchableOpacity 
          key={index} 
          onPress={() => onDocumentPress(url)}
        >
          <Text style={styles.link}>Ver Portafolio {index + 1}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default PortfolioLinks;
