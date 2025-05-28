import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { styles } from '../../../../styles/OpenSteetMapStyles';

// Componentes UI
import SearchBar from '../ui/SearchBar';
import CurrentLocationButton from '../ui/CurrentLocationButton';
import CategoryList from '../ui/CategoryList';
import SearchResultItem from '../ui/SearchResultItem';
import PlaceDetailModal from '../ui/PlaceDetailModal';

// Hooks personalizados
import useGeolocation from '../hooks/useGeolocation';
import useSearch from '../hooks/useSearch';

const OpenStreetMapSearch = ({ onLocationSelect }) => {
  // Estados para la vista detallada
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  
  // Usar hooks personalizados
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
  
  // Función para manejar la selección de categoría
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
  
  // Función para manejar la selección de un lugar
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setShowPlaceDetail(true);
  };
  
  // Función para seleccionar un lugar y cerrar el modal
  const selectPlace = (place) => {
    // Cerrar el modal
    setShowPlaceDetail(false);
    
    // Notificar al componente padre
    if (onLocationSelect) {
      onLocationSelect({
        latitude: place.latitude,
        longitude: place.longitude,
        name: place.name,
        address: place.address
      });
    }
  };
  
  // Función para actualizar la ubicación y buscar lugares cercanos
  const handleLocationRefresh = async () => {
    const result = await refreshUserLocation();
    
    if (result.coords) {
      // Si hay texto en el campo de búsqueda, actualizar los resultados
      if (searchText.trim()) {
        searchPlaces(searchText);
      } else {
        // Si no hay búsqueda activa, mostrar lugares cercanos de interés
        searchPlaces('lugares cerca');
      }
    }
  };
  
  // Renderizar el componente principal
  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <SearchBar 
        searchText={searchText}
        onSearchChange={searchPlaces}
        onClearSearch={clearSearch}
      />
      
      {/* Botón de ubicación actual */}
      <CurrentLocationButton 
        loading={locationLoading}
        onPress={handleLocationRefresh}
      />
      
      {/* Mostrar error de ubicación si existe */}
      {locationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}
      
      {/* Categorías populares */}
      {showCategories && searchText.length < 3 && !searchLoading && predictions.length === 0 && (
        <CategoryList onCategorySelect={handleCategorySelect} />
      )}
      
      {/* Indicador de carga */}
      {searchLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF3A5E" />
        </View>
      )}
      
      {/* Mostrar error de búsqueda si existe */}
      {searchError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      )}
      
      {/* Lista de resultados */}
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
      
      {/* Modal de detalles */}
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
