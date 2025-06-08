/**
 * Este archivo maneja el ítem de favorito
 * - UI
 * - Favoritos
 * - Elementos
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/FavoritesListStyles';

const placeholderImage = 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=No+Image';


const FavoriteItem = ({ item, activeTab, onPress, onRemove }) => {
  let title = '';
  let description = '';
  let imageUrl = '';
  let iconName = '';
  let iconColor = '#4A90E2';

  console.log('Renderizando item favorito:', JSON.stringify(item, null, 2));

  if (activeTab === 'event') {
    iconName = 'calendar';
    iconColor = '#4A90E2';

    if (item.details && item.details.titulo) {
      title = item.details.titulo;
      description = item.details.descripcion || 'Sin descripción';
      imageUrl = item.details.imagenUrl || '';
    } else if (item.titulo) {
      title = item.titulo;
      description = item.descripcion || 'Sin descripción';
      imageUrl = item.imagenUrl || '';
    } else if (item.nombre) {
      title = item.nombre;
      description = item.descripcion || 'Sin descripción';
      imageUrl = item.imagenUrl || '';
    } else {
      title = 'Evento';
      description = 'Ver detalles';
    }
  } else if (activeTab === 'artist') {
    iconName = 'person';
    iconColor = '#FF3A5E';
    
    console.log('Renderizando artista favorito:', item);
    
    title = item.nombreArtistico || 'Artista';
    description = item.biografia || 'Ver perfil completo';
    imageUrl = item.fotoPerfil || '';
  } else if (activeTab === 'space') {
    iconName = 'business';
    iconColor = '#2ECC71';

    if (item.details && item.details.nombre) {
      title = item.details.nombre;
      description = item.details.descripcion || 'Sin descripción';
      imageUrl = item.details.imagenUrl || '';
    } else if (item.nombre) {
      title = item.nombre;
      description = item.descripcion || 'Sin descripción';
      imageUrl = item.imagenUrl || '';
    } else {
      title = 'Espacio Cultural';
      description = 'Ver detalles';
    }
  }

  return (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() => onPress(item)}
    >
      {imageUrl && activeTab !== 'artist' ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.itemImage}
          defaultSource={{ uri: placeholderImage }}
        />
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: activeTab === 'artist' ? '#FF3A5E' : iconColor }]}>
          <Ionicons name={iconName} size={30} color="#FFFFFF" />
        </View>
      )}

      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {description}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.targetId)}
      >
        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default FavoriteItem;
