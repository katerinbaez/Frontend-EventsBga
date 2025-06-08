/**
 * Este archivo maneja las instalaciones del espacio
 * - UI
 * - Espacios
 * - Instalaciones
 * - Lista
 */


import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../../styles/CulturalSpacesModalStyles';

const SpaceFacilities = ({ facilities }) => {
  if (!facilities || !Array.isArray(facilities) || facilities.length === 0) {
    return null;
  }

  return (
    <View style={styles.detailSection}>
      <Text style={styles.sectionTitle}>Instalaciones</Text>
      <View style={styles.facilitiesContainer}>
        {facilities.map((facility, index) => (
          <View key={`facility-${index}`} style={styles.facilityTag}>
            <Text style={styles.facilityText}>{facility}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SpaceFacilities;
