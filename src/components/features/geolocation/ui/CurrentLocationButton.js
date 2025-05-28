import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/OpenSteetMapStyles';

/**
 * Botón para obtener la ubicación actual del usuario
 * @param {boolean} loading - Indica si se está cargando la ubicación
 * @param {function} onPress - Función a ejecutar al presionar el botón
 * @returns {JSX.Element}
 */
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
