import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpacesModalStyles';

const SpaceContact = ({ contacto }) => {
  if (!contacto) return null;

  const handleEmail = () => {
    if (contacto.email) {
      Linking.openURL(`mailto:${contacto.email}`);
    }
  };

  const handleCall = () => {
    if (contacto.telefono) {
      Linking.openURL(`tel:${contacto.telefono}`);
    }
  };

  return (
    <View style={styles.detailSection}>
      <Text style={styles.sectionTitle}>Información de Contacto</Text>
      
      {contacto.email && (
        <TouchableOpacity 
          style={[styles.contactButton, { backgroundColor: '#4A90E2' }]} 
          onPress={handleEmail}
          activeOpacity={0.8}
        >
          <Ionicons name="mail-outline" size={20} color="#FFF" />
          <Text style={styles.contactButtonText}>Contactar por Email</Text>
        </TouchableOpacity>
      )}
      
      {contacto.telefono && (
        <TouchableOpacity 
          style={[styles.contactButton, { backgroundColor: '#4CAF50' }]} 
          onPress={handleCall}
          activeOpacity={0.8}
        >
          <Ionicons name="call-outline" size={20} color="#FFF" />
          <Text style={styles.contactButtonText}>Llamar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SpaceContact;
