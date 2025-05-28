import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../../styles/ArtistProfileStyles';

const BiographySection = ({ biography }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Biografía</Text>
      <Text style={styles.text}>{biography || 'Sin biografía'}</Text>
    </View>
  );
};

export default BiographySection;
