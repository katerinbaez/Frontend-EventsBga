/**
 * Este archivo maneja la sección de categorías
 * - UI
 * - Categorías
 * - Selección
 */

import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { styles } from '../../../../styles/EventSearchStyles';

const CategorySection = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  loading 
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#FF3A5E" />
      </View>
    );
  }
  
  if (!categories || categories.length === 0) {
    return null;
  }
  
  const renderCategoryChip = (category) => {
    const categoryId = category.id || category._id || category.nombre;
    const categoryName = category.nombre || 'Categoría';
    
    const formattedName = categoryName.toLowerCase().replace(/ /g, '_');
    
    return (
      <TouchableOpacity
        key={categoryId || 'category-' + Math.random()}
        style={[
          styles.categoryChip,
          selectedCategory === categoryId && styles.selectedCategoryChip
        ]}
        onPress={() => onSelectCategory(categoryId)}
      >
        <Text style={[
          styles.categoryChipText,
          selectedCategory === categoryId && styles.selectedCategoryChipText
        ]}>
          {formattedName}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContentContainer}
    >
      <TouchableOpacity
        key="all"
        style={[
          styles.categoryChip,
          selectedCategory === '' && styles.selectedCategoryChip
        ]}
        onPress={() => onSelectCategory('')}
      >
        <Text style={[
          styles.categoryChipText,
          selectedCategory === '' && styles.selectedCategoryChipText
        ]}>
          Todo
        </Text>
      </TouchableOpacity>
      
      {categories.map(category => renderCategoryChip(category))}
    </ScrollView>
  );
};

export default CategorySection;
