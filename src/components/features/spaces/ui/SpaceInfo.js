/**
 * Este archivo maneja la información del espacio
 * - UI
 * - Espacios
 * - Información
 * - Detalles
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpacesModalStyles';

const SpaceInfo = ({ space }) => {
  return (
    <>
      <View style={styles.detailSection}>
        <Text style={styles.spaceName}>{space.nombre || 'Espacio Cultural'}</Text>
        
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={20} color="#FF3A5E" />
          <Text style={styles.addressText}>{space.direccion || 'Dirección no disponible'}</Text>
        </View>
      </View>
      
      {space.descripcion && (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{space.descripcion}</Text>
        </View>
      )}
      
      {space.capacidad && (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Capacidad</Text>
          <View style={styles.capacityContainer}>
            <Ionicons name="people-outline" size={20} color="#FF3A5E" />
            <Text style={styles.capacityText}>{space.capacidad} personas</Text>
          </View>
        </View>
      )}
    </>
  );
};

export default SpaceInfo;
