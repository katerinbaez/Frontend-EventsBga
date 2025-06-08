/**
 * Este archivo maneja el modal de filtros
 * - UI
 * - Filtros
 * - Calendario
 */

import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { styles } from '../../../../styles/EventSearchStyles';

const FilterModal = ({ 
  visible, 
  onClose, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  location,
  onLocationChange,
  locations,
  categories,
  selectedCategory,
  onCategoryChange,
  onApplyFilters,
  onClearFilters
}) => {
  const hasFilters = startDate || endDate || location;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros de búsqueda</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.filterLabel}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContentContainer}>
              {categories && categories.length > 0 && categories.map(category => {
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
                    onPress={() => {
                      if (typeof onCategoryChange === 'function') {
                        if (selectedCategory === categoryId) {
                          onCategoryChange('');
                        } else {
                          onCategoryChange(categoryId);
                        }
                      }
                    }}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === categoryId && styles.selectedCategoryChipText
                    ]}>
                      {formattedName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            <Text style={styles.filterLabel}>Fecha de inicio</Text>
            <Calendar
              style={styles.calendar}
              minDate={new Date().toISOString().split('T')[0]}
              onDayPress={(day) => {
                if (typeof onStartDateChange === 'function') {
                  const [year, month, dayOfMonth] = day.dateString.split('-').map(Number);
                  const selectedDate = new Date(Date.UTC(year, month - 1, dayOfMonth, 12, 0, 0));
                  onStartDateChange(selectedDate);
                }
              }}
              markedDates={{
                [startDate ? startDate.toISOString().split('T')[0] : '']: { selected: true, selectedColor: '#FF3A5E' }
              }}
              theme={{
                calendarBackground: '#2C2C2C',
                textSectionTitleColor: '#FFF',
                selectedDayBackgroundColor: '#FF3A5E',
                selectedDayTextColor: '#FFF',
                todayTextColor: '#FF3A5E',
                dayTextColor: '#FFF',
                textDisabledColor: '#666',
                arrowColor: '#FF3A5E',
                monthTextColor: '#FFF'
              }}
            />
            
            <Text style={styles.filterLabel}>Fecha de fin</Text>
            <Calendar
              style={styles.calendar}
              minDate={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              onDayPress={(day) => {
                if (typeof onEndDateChange === 'function') {
                  const [year, month, dayOfMonth] = day.dateString.split('-').map(Number);
                  const selectedDate = new Date(Date.UTC(year, month - 1, dayOfMonth, 12, 0, 0));
                  onEndDateChange(selectedDate);
                }
              }}
              markedDates={{
                [endDate ? endDate.toISOString().split('T')[0] : '']: { selected: true, selectedColor: '#FF3A5E' }
              }}
              theme={{
                calendarBackground: '#2C2C2C',
                textSectionTitleColor: '#FFF',
                selectedDayBackgroundColor: '#FF3A5E',
                selectedDayTextColor: '#FFF',
                todayTextColor: '#FF3A5E',
                dayTextColor: '#FFF',
                textDisabledColor: '#666',
                arrowColor: '#FF3A5E',
                monthTextColor: '#FFF'
              }}
            />
            
            <Text style={styles.filterLabel}>Ubicación</Text>
            <View style={styles.locationsContainer}>
              {locations && locations.map(loc => (
                <TouchableOpacity
                  key={loc.id}
                  style={[
                    styles.locationChip,
                    location === loc.id && styles.selectedLocationChip
                  ]}
                  onPress={() => {
                    if (typeof onLocationChange === 'function') {
                      onLocationChange(location === loc.id ? '' : loc.id);
                    }
                  }}
                >
                  <Text style={[
                    styles.locationChipText,
                    location === loc.id && styles.selectedLocationChipText
                  ]}>
                    {loc.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={onClearFilters}
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={onApplyFilters}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
