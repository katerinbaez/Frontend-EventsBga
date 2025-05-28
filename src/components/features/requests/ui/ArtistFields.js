// c:\Users\123\EventsBga\components\features\requests\ui\ArtistFields.js
import React from 'react';
import { View, Text, TextInput } from 'react-native';
import styles from '../../../../styles/RoleRequestFormStyles';

const ArtistFields = ({ formData, errors, onInputChange, portfolioUrls, setPortfolioUrls }) => {
  return (
    <>
      <Text style={styles.fieldTitle}>Trayectoria Artística *</Text>
      <TextInput
        style={[
          styles.textArea,
          errors.trayectoriaArtistica && styles.textAreaError
        ]}
        multiline
        numberOfLines={4}
        placeholder="Describe tu experiencia y trayectoria artística"
        placeholderTextColor="#666666"
        value={formData.trayectoriaArtistica}
        onChangeText={(text) => onInputChange('trayectoriaArtistica', text)}
      />
      {errors.trayectoriaArtistica && (
        <Text style={styles.errorText}>Este campo es requerido</Text>
      )}

      <Text style={styles.fieldTitle}>Portafolio (URLs separadas por comas)</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={3}
        placeholder="Ingresa las URLs de tu portafolio separadas por comas (ejemplo: https://url1.com, https://url2.com)"
        value={portfolioUrls}
        onChangeText={setPortfolioUrls}
        autoCapitalize="none"
        keyboardType="url"
      />
    </>
  );
};

export default ArtistFields;