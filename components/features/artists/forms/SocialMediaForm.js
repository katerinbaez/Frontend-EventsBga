import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/ArtistProfileStyles';

const SocialMediaForm = ({ socialMedia, onSocialMediaChange }) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Redes Sociales</Text>
      {Object.keys(socialMedia).map((network) => (
        <TextInput
          key={network}
          style={styles.input}
          value={socialMedia[network]}
          onChangeText={(text) => onSocialMediaChange(network, text)}
          placeholder={`URL de ${network}`}
          placeholderTextColor="#666"
        />
      ))}
    </View>
  );
};

export default SocialMediaForm;
