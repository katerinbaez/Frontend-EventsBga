import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { styles } from '../../../../styles/EventProgrammingStyles';
import { getCategoryLabel } from '../utils/categoryUtils';

const CategorySelector = ({ 
  eventCategory, 
  customCategory, 
  onCategoryChange, 
  onCustomCategoryChange 
}) => {
  const categories = ['musica', 'danza', 'teatro', 'artes_visuales', 'literatura', 'cine', 'fotografia', 'otro'];
  
  return (
    <View>
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              eventCategory === category && styles.categoryButtonSelected
            ]}
            onPress={() => onCategoryChange(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                eventCategory === category && styles.categoryButtonTextSelected
              ]}
            >
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {eventCategory === 'otro' && (
        <TextInput
          style={styles.input}
          placeholder="Especifica la categoría"
          value={customCategory}
          onChangeText={onCustomCategoryChange}
        />
      )}
    </View>
  );
};

export default CategorySelector;