/**
 * Este archivo maneja el ítem de resultado de búsqueda
 * - UI
 * - Búsqueda
 * - Resultados
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/OpenSteetMapStyles';


const SearchResultItem = ({ item, onPress }) => {
  const getIconForType = (type) => {
    switch (type) {
      case 'Restaurante': return 'restaurant';
      case 'Café': return 'cafe';
      case 'Bar': return 'wine';
      case 'Museo': return 'business';
      case 'Biblioteca': return 'book';
      case 'Teatro': return 'film';
      case 'Cine': return 'videocam';
      case 'Centro Cultural': return 'color-palette';
      case 'Galería': return 'images';
      case 'Hotel': return 'bed';
      case 'Tienda': return 'cart';
      case 'Espacio Cultural': return 'color-palette';
      default: return 'location';
    }
  };

  const formatDistance = (distance) => {
    if (distance === null) return null;
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const distanceText = formatDistance(item.distance);

  return (
    <TouchableOpacity
      style={styles.predictionItem}
      onPress={() => onPress(item)}
    >
      <View style={styles.resultCardContent}>
        <Ionicons
          name={getIconForType(item.type)}
          size={24}
          color="#FF3A5E"
          style={styles.resultIcon}
        />
        <View style={styles.resultTextContainer}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.name}
          </Text>
          
          <View style={styles.resultDetailsContainer}>
            <Text style={styles.resultType}>{item.type}</Text>
            {distanceText && (
              <>
                <Text style={styles.resultDot}>•</Text>
                <Text style={styles.resultDistance}>{distanceText}</Text>
              </>
            )}
          </View>
          
          <Text style={styles.resultAddress} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchResultItem;
