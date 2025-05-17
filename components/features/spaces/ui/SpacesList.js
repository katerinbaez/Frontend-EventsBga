import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpacesModalStyles';
import SpaceItem from './SpaceItem';

const SpacesList = ({ spaces, loading, favorites, onToggleFavorite, onViewDetails }) => {
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF3A5E" />
        <Text style={styles.loadingText}>Cargando espacios culturales...</Text>
      </View>
    );
  }

  if (!spaces || spaces.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="business-outline" size={60} color="#444" />
        <Text style={styles.emptyText}>No hay espacios culturales disponibles</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={spaces}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <SpaceItem
          space={item}
          isFavorite={favorites.includes(String(item.id))}
          onToggleFavorite={onToggleFavorite}
          onViewDetails={onViewDetails}
        />
      )}
      contentContainerStyle={styles.spacesList}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={false}
      onEndReachedThreshold={0.5}
      bounces={true}
    />
  );
};

export default SpacesList;
