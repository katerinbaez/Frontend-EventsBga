import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpaceStyles';

const SocialLinks = ({ redesSociales, isEditing, onInputChange }) => {
  const handleOpenLink = (url) => {
    if (url && url.trim() !== '') {
      // Asegurarse de que la URL tenga el formato correcto
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(formattedUrl);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Redes Sociales</Text>
      
      {isEditing ? (
        <View style={styles.socialContainer}>
          <View style={styles.socialField}>
            <Text style={styles.socialLabel}>Facebook</Text>
            <TextInput
              style={styles.input}
              value={redesSociales.facebook}
              onChangeText={(text) => onInputChange('redesSociales.facebook', text)}
              placeholder="URL de Facebook"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.socialField}>
            <Text style={styles.socialLabel}>Instagram</Text>
            <TextInput
              style={styles.input}
              value={redesSociales.instagram}
              onChangeText={(text) => onInputChange('redesSociales.instagram', text)}
              placeholder="URL de Instagram"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.socialField}>
            <Text style={styles.socialLabel}>Twitter</Text>
            <TextInput
              style={styles.input}
              value={redesSociales.twitter}
              onChangeText={(text) => onInputChange('redesSociales.twitter', text)}
              placeholder="URL de Twitter"
              autoCapitalize="none"
            />
          </View>
        </View>
      ) : (
        <View style={styles.socialCardContainer}>
          {(redesSociales.facebook || redesSociales.instagram || redesSociales.twitter) ? (
            <View style={styles.socialScrollContainer}>
              {redesSociales.facebook && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(redesSociales.facebook)}
                >
                  <Ionicons name="logo-facebook" size={30} color="#4267B2" />
                </TouchableOpacity>
              )}
              
              {redesSociales.instagram && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(redesSociales.instagram)}
                >
                  <Ionicons name="logo-instagram" size={30} color="#C13584" />
                </TouchableOpacity>
              )}
              
              {redesSociales.twitter && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(redesSociales.twitter)}
                >
                  <Ionicons name="logo-twitter" size={30} color="#1DA1F2" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.noSocialText}>No hay redes sociales registradas</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default SocialLinks;
