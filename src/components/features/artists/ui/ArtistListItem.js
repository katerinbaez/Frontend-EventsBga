/**
 * Este archivo maneja el ítem de lista de artista
 * - UI
 * - Favoritos
 * - Manejo de imágenes
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../../styles/ArtistProfilesModalStyles';
import { BACKEND_URL } from '../../../../constants/config';


const ArtistListItem = ({ 
  item, 
  isSelected, 
  isFavorite, 
  onPress, 
  onToggleFavorite 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const getImageUrl = () => {
    if (!item.fotoPerfil) return null;
    
    if (item.fotoPerfil.startsWith('http') || item.fotoPerfil.startsWith('file://')) {
      return item.fotoPerfil;
    }
    
    const prefix = item.fotoPerfil.startsWith('/') ? '' : '/';
    return `${BACKEND_URL}${prefix}${item.fotoPerfil}`;
  };
  
  return (
    <TouchableOpacity 
      style={[styles.artistItem, isSelected && styles.selectedArtistItem]}
      onPress={onPress}
    >
      <View style={styles.artistImageContainer}>
        {item.fotoPerfil && !imageError ? (
          <Image
            source={{ uri: getImageUrl() }}
            style={styles.artistImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.artistImagePlaceholder}>
            <Ionicons name="person" size={30} color="#FFF" />
          </View>
        )}
      </View>
      
      <View style={styles.artistInfo}>
        <Text style={styles.artistName}>{item.nombreArtistico}</Text>
        <Text style={styles.artistBio} numberOfLines={2}>
          {item.biografia || 'Sin biografía disponible'}
        </Text>
        
        {item.habilidades && item.habilidades.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.habilidades.slice(0, 3).map((skill, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
              </View>
            ))}
            {item.habilidades.length > 3 && (
              <Text style={styles.moreTag}>+{item.habilidades.length - 3}</Text>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#FF3A5E" : "#999"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={onPress}
        >
          <Ionicons 
            name={isSelected ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#FF3A5E" 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ArtistListItem;
