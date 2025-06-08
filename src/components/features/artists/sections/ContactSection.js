/**
 * Este archivo maneja la sección de contacto del artista
 * - Visualización
 * - Manejo de datos
 * - UI de contacto
 */

import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../../styles/ArtistProfileStyles';

const ContactSection = ({ contact = {} }) => {
  const hasContactInfo = Object.values(contact).some(value => value && value.trim() !== '');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contacto</Text>
      {hasContactInfo ? (
        Object.entries(contact).map(([type, value]) => (
          value && value.trim() !== '' && (
            <View key={type} style={styles.contactItem}>
              <Text style={styles.contactLabel}>{type}:</Text>
              <Text style={styles.contactValue}>{value}</Text>
            </View>
          )
        ))
      ) : (
        <Text style={styles.text}>No hay información de contacto registrada</Text>
      )}
    </View>
  );
};

export default ContactSection;
