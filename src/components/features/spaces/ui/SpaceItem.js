/**
 * Este archivo maneja el ítem del espacio
 * - UI
 * - Espacios
 * - Ítem
 * - Lista
 */


import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpacesModalStyles';
import { isValidImageUri } from '../services/CulturalSpacesService';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150/000000/FFFFFF?text=No+Image';

const SpaceItem = ({ space, isFavorite, onToggleFavorite, onViewDetails }) => {
  const renderInstalaciones = () => {
    if (!space.instalaciones || !Array.isArray(space.instalaciones) || space.instalaciones.length === 0) {
      return null;
    }

    const visibleInstalaciones = space.instalaciones.slice(0, 2);
    const hasMoreInstalaciones = space.instalaciones.length > 2;

    return (
      <View style={styles.tagsContainer}>
        {visibleInstalaciones.map((instalacion, index) => (
          <View key={`instalacion-${index}`} style={styles.tag}>
            <Text style={styles.tagText}>{instalacion}</Text>
          </View>
        ))}
        {hasMoreInstalaciones && (
          <Text style={styles.moreTag}>+{space.instalaciones.length - 2} más</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.spaceItem}>
      <View style={styles.spaceContent}>
        <View style={styles.spaceImageContainer}>
          {space.images && Array.isArray(space.images) && space.images.length > 0 && isValidImageUri(space.images[0]) ? (
            <Image 
              source={{ uri: space.images[0] }} 
              style={styles.spaceThumb} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.spaceImagePlaceholder}>
              <Ionicons name="image-outline" size={30} color="#555" />
            </View>
          )}
        </View>
        <View style={styles.spaceInfo}>
          <Text style={styles.spaceName}>{space.nombre || 'Espacio sin nombre'}</Text>
          <Text style={styles.spaceAddress}>{space.direccion || 'Dirección no disponible'}</Text>
          {renderInstalaciones()}
        </View>
        <View style={styles.spaceActions}>
          <TouchableOpacity 
            style={[styles.favoriteButton, isFavorite ? styles.favoriteButtonActive : null]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite(space);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF3A5E" : "#FFF"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={(e) => {
              e.stopPropagation();
              onViewDetails(space);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-forward-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SpaceItem;
