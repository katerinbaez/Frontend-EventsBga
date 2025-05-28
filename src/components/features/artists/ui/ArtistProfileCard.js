import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';
import styles, { ACCENT_COLOR, ERROR_COLOR } from '../../../styles/ArtistProfileCardStyles';

const placeholderImage = 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=No+Image';

const ArtistProfileCard = ({ artistId, onPress, onRemove }) => {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArtistDetails();
  }, [artistId]);

  const loadArtistDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Intentar obtener los detalles del artista directamente
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile-by-id/${artistId}`);
      
      if (response.data && response.data.success) {
        setArtist(response.data.artist);
      } else {
        setError('No se pudo cargar la información del artista');
      }
    } catch (error) {
      console.error('Error al cargar detalles del artista:', error);
      setError('Error al cargar la información del artista');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={ACCENT_COLOR} />
      </View>
    );
  }

  if (error || !artist) {
    return (
      <View style={styles.favoriteItem}>
        <View style={[styles.iconContainer, { backgroundColor: '#666' }]}>
          <Ionicons name="person" size={30} color="#FFFFFF" />
        </View>
        
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>Artista no disponible</Text>
          <Text style={styles.itemDescription}>No se pudo cargar la información</Text>
        </View>
        
        {onRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
          >
            <Ionicons name="close-circle" size={24} color={ERROR_COLOR} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const imageUrl = artist.fotoPerfil || null;
  const artistName = artist.nombreArtistico || 'Artista sin nombre';
  const biography = artist.biografia || 'Sin biografía';

  return (
    <TouchableOpacity 
      style={styles.favoriteItem}
      onPress={() => onPress && onPress(artist)}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.itemImage}
          defaultSource={{ uri: placeholderImage }}
        />
      ) : (
        <View style={styles.iconContainer}>
          <Ionicons name="person" size={30} color="#FFFFFF" />
        </View>
      )}
      
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{artistName}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {biography}
        </Text>
        
        {artist.habilidades && artist.habilidades.length > 0 && (
          <View style={styles.tagsContainer}>
            {artist.habilidades.slice(0, 2).map((skill, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
              </View>
            ))}
            {artist.habilidades.length > 2 && (
              <Text style={styles.moreTag}>+{artist.habilidades.length - 2}</Text>
            )}
          </View>
        )}
      </View>
      
      {onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
        >
          <Ionicons name="close-circle" size={24} color={ERROR_COLOR} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};



export default ArtistProfileCard;
