import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpaceStyles';

const ContactInfo = ({ contacto, isEditing, onInputChange }) => {
  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contacto</Text>
      
      {isEditing ? (
        <View style={styles.contactContainer}>
          <View style={styles.contactField}>
            <Text style={styles.contactLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={contacto.email}
              onChangeText={(text) => onInputChange('contacto.email', text)}
              placeholder="Email de contacto"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.contactField}>
            <Text style={styles.contactLabel}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={contacto.telefono}
              onChangeText={(text) => onInputChange('contacto.telefono', text)}
              placeholder="Teléfono de contacto"
              keyboardType="phone-pad"
            />
          </View>
        </View>
      ) : (
        <View style={styles.contactCard}>
          <TouchableOpacity 
            style={styles.contactRow}
            onPress={() => handleEmail(contacto.email)}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={20} color="#FF3A5E" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{contacto.email || 'No disponible'}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.contactDivider} />
          
          <TouchableOpacity 
            style={styles.contactRow}
            onPress={() => handleCall(contacto.telefono)}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={20} color="#FF3A5E" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Teléfono</Text>
              <Text style={styles.contactValue}>{contacto.telefono || 'No disponible'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ContactInfo;
