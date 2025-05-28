import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/ArtistProfileStyles';

const BiographyForm = ({ biography, onBiographyChange }) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Biografía</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={biography}
        onChangeText={onBiographyChange}
        placeholder="Cuéntanos sobre ti"
        multiline
        numberOfLines={4}
        placeholderTextColor="#666"
      />
    </View>
  );
};

export default BiographyForm;
