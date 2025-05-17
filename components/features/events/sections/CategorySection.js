import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { styles } from '../../../../styles/EventSearchStyles';

/**
 * Sección que muestra las categorías disponibles
 */
const CategorySection = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  loading 
}) => {
  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#FF3A5E" />
      </View>
    );
  }
  
  // Si no hay categorías, no mostrar nada
  if (!categories || categories.length === 0) {
    return null;
  }
  
  // Renderizar chip de categoría
  const renderCategoryChip = (category) => {
    // Asegurarse de que la categoría tenga un ID válido
    const categoryId = category.id || category._id || category.nombre;
    const categoryName = category.nombre || 'Categoría';
    
    // Convertir el nombre de la categoría a minúsculas y reemplazar espacios por guiones bajos
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
      {/* Categoría "Todo" */}
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
