/**
 * Este archivo maneja la búsqueda de OpenStreetMap
 * - UI
 * - Búsqueda
 * - Mapa
 */

import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { styles } from '../../../../styles/OpenSteetMapStyles';

import SearchBar from '../ui/SearchBar';
import CurrentLocationButton from '../ui/CurrentLocationButton';
import CategoryList from '../ui/CategoryList';
import SearchResultItem from '../ui/SearchResultItem';
import PlaceDetailModal from '../ui/PlaceDetailModal';

import useGeolocation from '../hooks/useGeolocation';
import useSearch from '../hooks/useSearch';

const OpenStreetMapSearch = ({ onLocationSelect }) => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  
  
  const { 
    userLocation, 
    loading: locationLoading, 
    error: locationError,
    refreshUserLocation 
  } = useGeolocation();
  
  const { 
    searchText, 
    predictions, 
    loading: searchLoading, 
    error: searchError,
    searchPlaces,
    clearSearch
  } = useSearch(userLocation);
  
  const handleCategorySelect = (categoryId) => {
    let searchQuery = '';
    
    switch (categoryId) {
      case 'cultural':
        searchQuery = 'espacios culturales';
        break;
      case 'museum':
        searchQuery = 'museos';
        break;
      case 'cafe':
        searchQuery = 'cafés';
        break;
      case 'restaurant':
        searchQuery = 'restaurantes';
        break;
      case 'shop':
        searchQuery = 'tiendas';
        break;
      case 'park':
        searchQuery = 'parques';
        break;
      default:
        searchQuery = categoryId;
    }
    
    searchPlaces(searchQuery);
  };
  
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setShowPlaceDetail(true);
  };
  
  const selectPlace = (place) => {
    setShowPlaceDetail(false);
    
    if (onLocationSelect) {
      onLocationSelect({
        latitude: place.latitude,
        longitude: place.longitude,
        name: place.name,
        address: place.address
      });
    }
  };
  
  const handleLocationRefresh = async () => {
    const result = await refreshUserLocation();
    
    if (result.coords) {
      if (searchText.trim()) {
        searchPlaces(searchText);
      } else {
        searchPlaces('lugares cerca');
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <SearchBar 
        searchText={searchText}
        onSearchChange={searchPlaces}
        onClearSearch={clearSearch}
      />
      
      <CurrentLocationButton 
        loading={locationLoading}
        onPress={handleLocationRefresh}
      />
      
      {locationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}
      
      {showCategories && searchText.length < 3 && !searchLoading && predictions.length === 0 && (
        <CategoryList onCategorySelect={handleCategorySelect} />
      )}
      
      {searchLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF3A5E" />
        </View>
      )}
      
      {searchError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      )}
      
      {predictions.length > 0 && (
        <FlatList
          data={predictions}
          renderItem={({ item }) => (
            <SearchResultItem 
              item={item}
              onPress={handlePlaceSelect}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          style={styles.predictionsList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <PlaceDetailModal 
        visible={showPlaceDetail}
        place={selectedPlace}
        onClose={() => setShowPlaceDetail(false)}
        onSelect={selectPlace}
      />
    </View>
  );
};

export default OpenStreetMapSearch;
