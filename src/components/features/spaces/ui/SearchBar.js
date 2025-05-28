import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/SpaceSearchStyles';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#AAA" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre, dirección o descripción"
        placeholderTextColor="#AAA"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );
};

export default SearchBar;