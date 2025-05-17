import React from 'react';
import { View, TextInput, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/EventSearchStyles';

/**
 * Componente de barra de búsqueda para eventos
 */
const SearchBar = ({ value, onChangeText, onFilterPress, filtersApplied }) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <Ionicons name="search" size={20} color="#95A5A6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar eventos..."
          placeholderTextColor="#95A5A6"
          value={value || ''}
          onChangeText={onChangeText}
        />
        {value && value.length > 0 && (
          <TouchableOpacity 
            onPress={() => onChangeText('')}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Ionicons name="close-circle" size={20} color="#95A5A6" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filtersApplied && styles.filterButtonActive
        ]}
        onPress={onFilterPress}
      >
        <Ionicons 
          name="options" 
          size={24} 
          color={filtersApplied ? "#FFF" : "#95A5A6"} 
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
