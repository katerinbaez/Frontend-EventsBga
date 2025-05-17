import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/FavoritesListStyles';

/**
 * Componente para mostrar cuando no hay favoritos
 * @param {string} message - Mensaje a mostrar
 * @returns {JSX.Element}
 */
const EmptyFavorites = ({ message }) => {
  return (
    <View style={styles.centerContainer}>
      <Ionicons name="heart-dislike-outline" size={64} color="#95A5A6" />
      <Text style={styles.emptyText}>
        {message || 'No tienes favoritos guardados'}
      </Text>
    </View>
  );
};

export default EmptyFavorites;
