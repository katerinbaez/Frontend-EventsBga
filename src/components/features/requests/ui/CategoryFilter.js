/**
 * Este archivo maneja el filtro de categorías
 * - UI
 * - Roles
 * - Filtro
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../../../../styles/RequestModalStyles';

const CategoryFilter = ({ categories, selectedCategory, handleCategoryChange }) => {
  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filtrar por categoría:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilterContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryFilterButton,
              selectedCategory === category && styles.categoryFilterButtonActive
            ]}
            onPress={() => handleCategoryChange(category)}
          >
            <Text 
              style={[
                styles.categoryFilterText,
                selectedCategory === category && styles.categoryFilterTextActive
              ]}
            >
              {category === 'todas' ? 'Todas' : category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoryFilter;
