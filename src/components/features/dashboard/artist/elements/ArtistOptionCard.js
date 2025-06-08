/**
 * Este archivo maneja la tarjeta de opción del artista
 * - UI
 * - Navegación
 * - Interacción
 */

import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../../styles/DashboardArtistStyles';

const ArtistOptionCard = ({ title, description, iconName, iconColor, onPress, requiresNavigation, navigationTarget, navigation }) => {
  const handlePress = () => {
    if (requiresNavigation && navigation) {
      try {
        navigation.navigate(navigationTarget);
      } catch (error) {
        Alert.alert(
          'Error de navegación',
          `No se pudo acceder a ${title}. Por favor, intenta nuevamente.`,
          [{ text: 'Aceptar' }]
        );
        console.error(`Error al navegar a ${navigationTarget}:`, error);
      }
    } else {
      onPress && onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.optionCard}
      onPress={handlePress}
    >
      <Ionicons name={iconName} size={40} color={iconColor || '#865FF4'} />
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </TouchableOpacity>
  );
};

export default ArtistOptionCard;
