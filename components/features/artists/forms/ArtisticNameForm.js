import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/ArtistProfileStyles';

const ArtisticNameForm = ({ artisticName, onArtisticNameChange }) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Nombre Artístico</Text>
      <TextInput
        style={styles.input}
        value={artisticName}
        onChangeText={onArtisticNameChange}
        placeholder="Tu nombre artístico"
        placeholderTextColor="#666"
      />
    </View>
  );
};

export default ArtisticNameForm;
