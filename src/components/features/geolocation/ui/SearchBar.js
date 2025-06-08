/**
 * Este archivo maneja la barra de búsqueda
 * - UI
 * - Búsqueda
 * - Barra
 */

import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/OpenSteetMapStyles';


const SearchBar = ({ searchText, onSearchChange, onClearSearch }) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={20}
        color="#FFFFFF"
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        placeholder="Buscar lugares, direcciones..."
        placeholderTextColor="#999999"
        value={searchText}
        onChangeText={onSearchChange}
      />
      {searchText && searchText.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClearSearch}
        >
          <Ionicons name="close-circle" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
