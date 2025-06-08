/**
 * Este archivo maneja el selector de categorías
 * - UI
 * - Eventos
 * - Selector
 */

import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { styles } from '../../../../styles/EventRequestFormStyles';
import { getCategoryLabel } from '../utils/eventRequestUtils';

const CategorySelector = ({ 
  eventCategory, 
  handleCategoryChange, 
  customCategory, 
  setCustomCategory 
}) => {
  const categories = [
    'musica',
    'danza',
    'teatro',
    'artes_visuales',
    'literatura',
    'cine',
    'fotografia',
    'otro'
  ];
  
  
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Categoría *</Text>
      
      <View style={styles.categoryContainer}>
        {categories.slice(0, 3).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              eventCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => handleCategoryChange(category)}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                eventCategory === category && styles.categoryButtonTextActive
              ]}
            >
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.categoryContainer}>
        {categories.slice(3, 5).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              eventCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => handleCategoryChange(category)}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                eventCategory === category && styles.categoryButtonTextActive
              ]}
            >
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.categoryContainer}>
        {categories.slice(5).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              eventCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => handleCategoryChange(category)}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                eventCategory === category && styles.categoryButtonTextActive
              ]}
            >
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {eventCategory === 'otro' && (
        <View style={styles.customCategoryContainer}>
          <TextInput
            style={styles.input}
            placeholder="Especifica la categoría"
            placeholderTextColor="#999"
            value={customCategory}
            onChangeText={setCustomCategory}
          />
        </View>
      )}
    </View>
  );
};



export default CategorySelector;
