/**
 * Este archivo maneja la búsqueda de eventos
 * - UI
 * - Eventos
 * - Búsqueda
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StatusBar,
  SafeAreaView,
  Platform,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../context/AuthContext';
import { styles } from '../../../../styles/EventSearchStyles';

import SearchBar from '../ui/SearchBar';
import FilterModal from '../ui/FilterModal';

import CategorySection from '../sections/CategorySection';
import EventListSection from '../sections/EventListSection';

import { fetchLocations } from '../services/EventSearchService';

import useEvents from '../hooks/useEvents';
import useCategories from '../hooks/useCategories';
import useFavorites from '../hooks/useFavorites';

const EventSearch = ({ navigation }) => {
  const { user } = useAuth();
  
  const [showFilters, setShowFilters] = useState(false);
  const [locations, setLocations] = useState([]);
  
  const { 
    categories, 
    loading: loadingCategories, 
    selectedCategory, 
    setSelectedCategory 
  } = useCategories();
  
  const { 
    events, 
    loading: loadingEvents, 
    refreshing,
    searchQuery, 
    setSearchQuery,
    startDate, 
    setStartDate,
    endDate, 
    setEndDate,
    location, 
    setLocation,
    filtersApplied,
    refreshEvents,
    applyFilters,
    clearFilters
  } = useEvents(categories, selectedCategory);
  
  useEffect(() => {
    console.log('Categoría seleccionada cambiada:', selectedCategory);
  }, [selectedCategory]);
  
  const { 
    favorites, 
    toggleFavorite, 
    loading: loadingFavorites 
  } = useFavorites(user);
  
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    loadLocations();
  }, []);
  
  const handleCategorySelect = (categoryId) => {
    console.log('Seleccionando categoría:', categoryId);
    setSelectedCategory(categoryId);
  };
  
  const handleSearch = (text) => {
    setSearchQuery(text);
  };
  
  const handleApplyFilters = () => {
    setShowFilters(false);
    applyFilters();
  };
  
  const handleClearFilters = () => {
    clearFilters();
    setSelectedCategory('');
    setShowFilters(false);
  };
  
  const containerStyle = {
    ...styles.container,
    paddingTop: Platform.OS === 'ios' ? 50 : 30
  };
  
  return (
    <View style={containerStyle}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explorar Eventos</Text>
          <View style={styles.headerRight} />
        </View>
      </View>
      
      <SearchBar 
        value={searchQuery}
        onChangeText={handleSearch}
        onFilterPress={() => setShowFilters(true)}
        filtersApplied={filtersApplied}
      />
      
      <CategorySection 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        loading={loadingCategories}
      />
      
      <EventListSection 
        events={events}
        loading={loadingEvents}
        refreshing={refreshing}
        onRefresh={refreshEvents}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        navigation={navigation}
      />
      
      <FilterModal 
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        location={location}
        onLocationChange={setLocation}
        locations={locations}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </View>
  );
};


export default EventSearch;
