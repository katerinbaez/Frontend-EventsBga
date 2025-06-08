/**
 * Este archivo maneja la sección de categoría del evento
 * - UI
 * - Selección
 * - Datos
 */

import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../../styles/EventProgrammingStyles';
import CategorySelector from '../ui/CategorySelector';

const EventCategorySection = ({ 
  eventCategory, 
  customCategory, 
  onCategoryChange, 
  onCustomCategoryChange 
}) => {
  return (
    <View>
      <Text style={styles.label}>Categoría</Text>
      <CategorySelector 
        eventCategory={eventCategory}
        customCategory={customCategory}
        onCategoryChange={onCategoryChange}
        onCustomCategoryChange={onCustomCategoryChange}
      />
    </View>
  );
};

export default EventCategorySection;