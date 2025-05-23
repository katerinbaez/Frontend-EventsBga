import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, ACCENT_COLOR } from '../../../../styles/ArtistProfileStyles';

const SocialMediaSection = ({ socialMedia = {} }) => {
  const hasSocialMedia = Object.values(socialMedia).some(url => url && url.trim() !== '');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Redes Sociales</Text>
      {hasSocialMedia ? (
        Object.entries(socialMedia).map(([network, url]) => (
          url && url.trim() !== '' && (
            <TouchableOpacity key={network} style={styles.socialLink}>
              <Ionicons name={`logo-${network}`} size={24} color="#FFFFFF" />
              <Text style={styles.socialText}>{url}</Text>
            </TouchableOpacity>
          )
        ))
      ) : (
        <Text style={styles.text}>No hay redes sociales registradas</Text>
      )}
    </View>
  );
};

export default SocialMediaSection;
