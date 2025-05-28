import React from 'react';
import { FlatList, View, Text, ActivityIndicator } from 'react-native';
import SpaceListItem from './SpaceListItem';

const SpaceList = ({ 
  spaces, 
  loading, 
  onSelectSpace, 
  userLocation, 
  calculateDistance,
  styles 
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3A5E" />
        <Text style={styles.loadingText}>Cargando espacios culturales...</Text>
      </View>
    );
  }

  if (spaces.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No se encontraron espacios culturales</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={spaces}
      keyExtractor={(item, index) => `space-${item.id || index}`}
      renderItem={({ item }) => {
        // Calcular distancia si hay ubicación de usuario
        let distance = null;
        if (userLocation && item.latitud && item.longitud) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            parseFloat(item.latitud),
            parseFloat(item.longitud)
          );
        }
        
        return (
          <SpaceListItem 
            space={item} 
            onPress={onSelectSpace} 
            distance={distance}
            styles={styles}
          />
        );
      }}
      contentContainerStyle={styles.listContainer}
    />
  );
};

export default SpaceList;
