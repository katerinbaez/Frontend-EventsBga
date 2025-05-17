import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/FavoritesListStyles';

/**
 * Componente para mostrar las pestañas de navegación entre tipos de favoritos
 * @param {string} activeTab - Pestaña activa actual
 * @param {function} onTabChange - Función para cambiar de pestaña
 * @returns {JSX.Element}
 */
const FavoritesTabs = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'event' && styles.activeTab]}
        onPress={() => onTabChange('event')}
      >
        <Ionicons
          name="calendar"
          size={24}
          color={activeTab === 'event' ? '#4A90E2' : '#95A5A6'}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'event' && styles.activeTabText
        ]}>Eventos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'artist' && styles.activeTab]}
        onPress={() => onTabChange('artist')}
      >
        <Ionicons
          name="person"
          size={24}
          color={activeTab === 'artist' ? '#4A90E2' : '#95A5A6'}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'artist' && styles.activeTabText
        ]}>Artistas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'space' && styles.activeTab]}
        onPress={() => onTabChange('space')}
      >
        <Ionicons
          name="business"
          size={24}
          color={activeTab === 'space' ? '#4A90E2' : '#95A5A6'}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'space' && styles.activeTabText
        ]}>Espacios</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FavoritesTabs;
