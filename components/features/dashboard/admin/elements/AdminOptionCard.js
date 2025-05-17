import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../../styles/DashboardAdminStyles';

const AdminOptionCard = ({ title, description, iconName, onPress, requiresNavigation, navigationTarget, navigation }) => {
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
      style={[styles.optionCard, styles.adminCard]}
      onPress={handlePress}
    >
      <Ionicons name={iconName} size={40} color="#FFD700" />
      <Text style={[styles.optionTitle, styles.adminText]}>{title}</Text>
      <Text style={[styles.optionDescription, styles.adminText]}>{description}</Text>
    </TouchableOpacity>
  );
};

export default AdminOptionCard;
