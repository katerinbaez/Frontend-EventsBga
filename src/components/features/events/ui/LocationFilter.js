import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  FlatList,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente para seleccionar ubicación
 */
const LocationFilter = ({ location, onLocationChange, locations }) => {
  const [showLocationList, setShowLocationList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Encontrar la ubicación seleccionada
  const selectedLocation = locations.find(loc => 
    (loc.id || loc._id) === location
  );
  
  // Filtrar ubicaciones según la búsqueda
  const filteredLocations = locations.filter(loc => {
    const locationName = loc.nombre || loc.name || '';
    return locationName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Seleccionar una ubicación
  const handleSelectLocation = (locationId) => {
    onLocationChange(locationId);
    setShowLocationList(false);
    setSearchQuery('');
  };
  
  // Limpiar la ubicación seleccionada
  const clearLocation = () => {
    onLocationChange('');
  };
  
  // Renderizar un ítem de ubicación
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
      {/* Selector de ubicación */}
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
      
      {/* Lista de ubicaciones */}
      {showLocationList && (
        <View style={styles.locationListContainer}>
          {/* Barra de búsqueda */}
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
          
          {/* Lista de ubicaciones */}
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    marginRight: 10,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  clearButton: {
    padding: 5,
  },
  locationListContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 300,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 5,
  },
  locationList: {
    maxHeight: 240,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedLocationItem: {
    backgroundColor: '#FF3A5E',
  },
  locationItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLocationItemText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
});

export default LocationFilter;
