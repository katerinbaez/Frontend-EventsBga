/**
 * Este archivo maneja el filtro de ubicación
 * - UI
 * - Búsqueda
 * - Selección
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/LocationFilterStyles';


const LocationFilter = ({ location, onLocationChange, locations }) => {
  const [showLocationList, setShowLocationList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedLocation = locations.find(loc => 
    (loc.id || loc._id) === location
  );
  
  const filteredLocations = locations.filter(loc => {
    const locationName = loc.nombre || loc.name || '';
    return locationName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const handleSelectLocation = (locationId) => {
    onLocationChange(locationId);
    setShowLocationList(false);
    setSearchQuery('');
  };
  
  const clearLocation = () => {
    onLocationChange('');
  };
  const renderLocationItem = ({ item }) => {
    const locationId = item.id || item._id;
    const locationName = item.nombre || item.name || 'Ubicación sin nombre';
    const isSelected = location === locationId;
    
    return (
      <TouchableOpacity
        style={[
          styles.locationItem,
          isSelected && styles.selectedLocationItem
        ]}
        onPress={() => handleSelectLocation(locationId)}
      >
        <Text 
          style={[
            styles.locationItemText,
            isSelected && styles.selectedLocationItemText
          ]}
        >
          {locationName}
        </Text>
        
        {isSelected && (
          <Ionicons name="checkmark" size={20} color="white" />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.locationSelector} 
        onPress={() => setShowLocationList(!showLocationList)}
      >
        <View style={styles.locationDisplay}>
          <Ionicons name="location-outline" size={20} color="#666" style={styles.locationIcon} />
          <Text style={styles.locationText}>
            {selectedLocation 
              ? (selectedLocation.nombre || selectedLocation.name)
              : 'Seleccionar ubicación'}
          </Text>
        </View>
        
        {location ? (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={clearLocation}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : (
          <Ionicons 
            name={showLocationList ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        )}
      </TouchableOpacity>
      
      {showLocationList && (
        <View style={styles.locationListContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar ubicación..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          
          {filteredLocations.length > 0 ? (
            <FlatList
              data={filteredLocations}
              renderItem={renderLocationItem}
              keyExtractor={item => (item.id || item._id || item.nombre).toString()}
              style={styles.locationList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No se encontraron ubicaciones
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default LocationFilter;
