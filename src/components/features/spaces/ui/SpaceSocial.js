/**
 * Este archivo maneja las redes sociales del espacio
 * - UI
 * - Espacios
 * - Redes Sociales
 * - Enlaces
 */

import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpacesModalStyles';

const SpaceSocial = ({ redesSociales }) => {
  if (!redesSociales) return null;
  
  const { facebook, instagram, twitter } = redesSociales;
  
  if (!facebook && !instagram && !twitter) return null;

  const handleOpenLink = (url) => {
    if (url && url.trim() !== '') {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(formattedUrl);
    }
  };

  return (
    <View style={styles.detailSection}>
      <Text style={styles.sectionTitle}>Redes Sociales</Text>
      <View style={styles.socialButtonsContainer}>
        {facebook && (
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#3b5998' }]}
            onPress={() => handleOpenLink(facebook)}
          >
            <Ionicons name="logo-facebook" size={20} color="#FFF" />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        )}
        
        {instagram && (
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#C13584' }]}
            onPress={() => handleOpenLink(instagram)}
          >
            <Ionicons name="logo-instagram" size={20} color="#FFF" />
            <Text style={styles.socialButtonText}>Instagram</Text>
          </TouchableOpacity>
        )}
        
        {twitter && (
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
            onPress={() => handleOpenLink(twitter)}
          >
            <Ionicons name="logo-twitter" size={20} color="#FFF" />
            <Text style={styles.socialButtonText}>Twitter</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SpaceSocial;
