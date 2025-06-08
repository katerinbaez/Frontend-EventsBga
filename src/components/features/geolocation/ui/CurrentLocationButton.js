/**
 * Este archivo maneja el botón de ubicación actual
 * - UI
 * - Ubicación
 * - Botones
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/OpenSteetMapStyles';


const CurrentLocationButton = ({ loading, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.currentLocationButton}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FF3A5E" style={{ marginRight: 8 }} />
      ) : (
        <Ionicons name="locate" size={18} color="#FF3A5E" style={{ marginRight: 8 }} />
      )}
      <Text style={styles.currentLocationText}>
        {loading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
      </Text>
    </TouchableOpacity>
  );
};

export default CurrentLocationButton;
