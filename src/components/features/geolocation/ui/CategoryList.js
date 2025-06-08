/**
 * Este archivo maneja la lista de categorías
 * - UI
 * - Categorías
 * - Búsqueda
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/OpenSteetMapStyles';


const CategoryList = ({ onCategorySelect }) => {
  const categories = [
    { id: 'cultural', name: 'Cultural', icon: 'color-palette' },
    { id: 'museum', name: 'Museos', icon: 'business' },
    { id: 'cafe', name: 'Cafés', icon: 'cafe' },
    { id: 'restaurant', name: 'Restaurantes', icon: 'restaurant' },
    { id: 'shop', name: 'Tiendas', icon: 'cart' },
    { id: 'park', name: 'Parques', icon: 'leaf' }
  ];

  return (
    <>
      <Text style={styles.categoriesTitle}>Categorías populares</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryButton}
            onPress={() => onCategorySelect(category.id)}
          >
            <Ionicons name={category.icon} size={24} color="#FF3A5E" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

export default CategoryList;
