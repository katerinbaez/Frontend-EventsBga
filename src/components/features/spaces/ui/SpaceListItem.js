/**
 * Este archivo maneja el ítem de la lista del espacio
 * - UI
 * - Espacios
 * - Ítem
 * - Lista
 * - Tarjeta
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SpaceListItem = ({ space, onPress, distance, styles }) => {
  const hasImage = space.imagen && space.imagen.trim() !== '';
  
  return (
    <TouchableOpacity style={styles.spaceItem} onPress={() => onPress(space)}>
      <View style={styles.spaceImageContainer}>
        {hasImage ? (
          <Image 
            source={{ uri: space.imagen }} 
            style={styles.spaceImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={30} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.spaceInfo}>
        <Text style={styles.spaceName} numberOfLines={1}>
          {space.nombreEspacio || 'Espacio Cultural'}
        </Text>
        
        <View style={styles.spaceDetailsRow}>
          <Ionicons name="location" size={14} color="#FF3A5E" style={styles.detailIcon} />
          <Text style={styles.spaceAddress} numberOfLines={1}>
            {space.direccion || 'Sin dirección'}
          </Text>
        </View>
        
        {distance && (
          <View style={styles.spaceDetailsRow}>
            <Ionicons name="navigate" size={14} color="#FF3A5E" style={styles.detailIcon} />
            <Text style={styles.spaceDistance}>
              {distance < 1 
                ? `${Math.round(distance * 1000)} m` 
                : `${distance.toFixed(1)} km`}
            </Text>
          </View>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
};

export default SpaceListItem;
