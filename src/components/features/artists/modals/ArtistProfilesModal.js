/**
 * Este archivo maneja el modal de perfiles de artistas
 * - Lista de artistas
 * - Detalles
 * - API
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  Dimensions,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import styles from '../../../../styles/ArtistProfilesModalStyles';
import { BACKEND_URL } from '../../../../constants/config';

import ArtistListItem from '../ui/ArtistListItem';
import ArtistDetails from '../sections/ArtistDetails';

const ArtistProfilesModal = ({ visible = true, onClose, initialSelectedArtistId }) => {
  const windowHeight = Dimensions.get('window').height;
  const { user } = useAuth();
  
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedArtistDetails, setSelectedArtistDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedTrabajoId, setExpandedTrabajoId] = useState(null);
  
  const loadArtists = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/all`);
      const data = response.data;
      
      if (data && data.success) {
        console.log('Artistas cargados:', data.artists.length);
        
        const processedArtists = data.artists.map(artist => {
          if (artist.fotoPerfil) {
            if (!artist.fotoPerfil.startsWith('http')) {
              artist.fotoPerfil = `${BACKEND_URL}${artist.fotoPerfil}`;
            }
            console.log(`Foto de perfil de ${artist.nombreArtistico} (procesada):`, artist.fotoPerfil);
          } else {
            console.log(`${artist.nombreArtistico} no tiene foto de perfil`);
          }
          return artist;
        });
        
        setArtists(processedArtists);
      } else {
        console.error('Error al cargar artistas:', data);
        Alert.alert('Error', 'No se pudieron cargar los artistas');
      }
    } catch (error) {
      console.error('Error al cargar artistas:', error);
      Alert.alert('Error', 'No se pudieron cargar los artistas');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user || !user.id) {
      console.log('No hay usuario autenticado, no se cargarán favoritos');
      return;
    }
    
    try {
      const userId = user.id || user.sub || user._id;
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        params: { 
          userId: userId,
          targetType: 'artist'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Favoritos cargados:', response.data.length);
        
        const favoriteIds = response.data.map(fav => fav.targetId);
        console.log('IDs de favoritos:', favoriteIds);
        
        setFavorites(favoriteIds);
      } else {
        console.error('Error al cargar favoritos:', response.data);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  };

  const loadArtistDetails = async (artistId) => {
    console.log('Cargando detalles del artista:', artistId);
    setSelectedArtistId(artistId);
    setLoadingDetails(true);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile-by-id/${artistId}`);
      const data = response.data;
      
      if (data && data.success) {
        console.log('Detalles del artista cargados:', data.artist.nombreArtistico);
        
        const artistData = data.artist;
        
        if (artistData.fotoPerfil && !artistData.fotoPerfil.startsWith('http')) {
          artistData.fotoPerfil = `${BACKEND_URL}${artistData.fotoPerfil}`;
        }
        
        if (!artistData.portfolio) {
          artistData.portfolio = { trabajos: [], imagenes: [] };
          console.log('No se encontró portfolio, se inicializó vacío');
        } else if (typeof artistData.portfolio === 'string') {
          try {
            artistData.portfolio = JSON.parse(artistData.portfolio);
            console.log('Portfolio parseado de string JSON:', JSON.stringify(artistData.portfolio, null, 2));
          } catch (e) {
            console.error('Error al parsear portfolio:', e);
            artistData.portfolio = { trabajos: [], imagenes: [] };
          }
        }
        
        if (artistData.portfolio && artistData.portfolio.trabajos) {
          artistData.portfolio.trabajos = artistData.portfolio.trabajos.map((trabajo, index) => {
            if (typeof trabajo === 'string') {
              try {
                return JSON.parse(trabajo);
              } catch (e) {
                console.error(`Error al parsear trabajo ${index}:`, e);
                return {
                  titulo: `Trabajo ${index + 1}`,
                  descripcion: trabajo // Usar el string como descripción
                };
              }
            }
            
            const processedTrabajo = {...trabajo};
            
            if (processedTrabajo.imageUrl && !processedTrabajo.imageUrl.startsWith('http')) {
              processedTrabajo.imageUrl = `${BACKEND_URL}${processedTrabajo.imageUrl}`;
            }
            
            if (!processedTrabajo.images) {
              processedTrabajo.images = [];
              
              if (processedTrabajo.imageUrl) {
                processedTrabajo.images.push(processedTrabajo.imageUrl);
              }
              
              if (processedTrabajo.ImageUrl && !processedTrabajo.images.includes(processedTrabajo.ImageUrl)) {
                processedTrabajo.images.push(processedTrabajo.ImageUrl);
              }
              if (processedTrabajo.imagenUrl && !processedTrabajo.images.includes(processedTrabajo.imagenUrl)) {
                processedTrabajo.images.push(processedTrabajo.imagenUrl);
              }
              if (processedTrabajo.imagen && !processedTrabajo.images.includes(processedTrabajo.imagen)) {
                processedTrabajo.images.push(processedTrabajo.imagen);
              }
            } else if (typeof processedTrabajo.images === 'string') {
              try {
                processedTrabajo.images = JSON.parse(processedTrabajo.images);
              } catch (e) {
                console.error(`Error al parsear images de trabajo ${index}:`, e);
                processedTrabajo.images = [processedTrabajo.images];
              }
            }
            
            if (Array.isArray(processedTrabajo.images)) {
              processedTrabajo.images = processedTrabajo.images.map(img => {
                if (typeof img === 'string' && !img.startsWith('http')) {
                  return `${BACKEND_URL}${img}`;
                }
                return img;
              });
            }
            
            return processedTrabajo;
          });
        }
        
        if (artistData.portfolio && artistData.portfolio.imagenes) {
          artistData.portfolio.imagenes = artistData.portfolio.imagenes.map(imagen => {
            if (typeof imagen === 'string' && !imagen.startsWith('http')) {
              return `${BACKEND_URL}${imagen}`;
            }
            if (imagen && imagen.url && !imagen.url.startsWith('http')) {
              imagen.url = `${BACKEND_URL}${imagen.url}`;
            }
            return imagen;
          });
        }
        
        setSelectedArtistDetails(artistData);
      } else {
        console.error('Error al cargar detalles del artista:', data);
        Alert.alert('Error', 'No se pudieron cargar los detalles del artista');
      }
    } catch (error) {
      console.error('Error al cargar detalles del artista:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles del artista');
    } finally {
      setLoadingDetails(false);
    }
  };

  
  const toggleFavorite = async (artist) => {
    if (!user || !user.id) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar favoritos');
      return;
    }
    
    const isFavorite = favorites.includes(artist.id);
    const userId = user.id || user.sub || user._id;
    
    try {
      if (isFavorite) {
        await axios.delete(`${BACKEND_URL}/api/favorites`, {
          data: { 
            userId: userId,
            targetType: 'artist',
            targetId: artist.id 
          }
        });
        setFavorites(favorites.filter(id => id !== artist.id));
        console.log('Artista eliminado de favoritos:', artist.nombreArtistico);
      } else {
        await axios.post(`${BACKEND_URL}/api/favorites`, {
          userId: userId,
          targetType: 'artist',
          targetId: artist.id
        });
        setFavorites([...favorites, artist.id]);
        console.log('Artista agregado a favoritos:', artist.nombreArtistico);
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      Alert.alert('Error', 'No se pudo actualizar la lista de favoritos');
    }
  };

  const handleViewArtistDetails = async (artist) => {
    if (selectedArtistId === artist.id) {
      console.log('Cerrando detalles del artista:', artist.nombreArtistico);
      setSelectedArtistId(null);
      setSelectedArtistDetails(null);
      return;
    }
    
    console.log('Mostrando detalles del artista:', artist.nombreArtistico);
    await loadArtistDetails(artist.id);
  };

  const renderArtistDetails = () => {
    if (!selectedArtistDetails) return null;
    
    console.log('Renderizando detalles del artista:', selectedArtistDetails.nombreArtistico);
    console.log('Portfolio disponible:', selectedArtistDetails.portfolio);
    if (selectedArtistDetails.portfolio && selectedArtistDetails.portfolio.trabajos) {
      console.log('Trabajos en portfolio:', selectedArtistDetails.portfolio.trabajos.length);
      console.log('Primer trabajo:', JSON.stringify(selectedArtistDetails.portfolio.trabajos[0], null, 2));
    }
    
    return (
      <ArtistDetails
        artist={selectedArtistDetails}
        loadingDetails={loadingDetails}
        onClose={() => setSelectedArtistId(null)}
        expandedTrabajoId={expandedTrabajoId}
        setExpandedTrabajoId={setExpandedTrabajoId}
      />
    );
  };

  useEffect(() => {
    loadArtists();
  }, []);
  useEffect(() => {
    if (artists.length > 0) {
      loadFavorites();
    }
  }, [artists, user]);
  
  useEffect(() => {
    if (initialSelectedArtistId) {
      setSelectedArtistId(initialSelectedArtistId);
      loadArtistDetails(initialSelectedArtistId);
    }
  }, [initialSelectedArtistId]);

  const renderArtistItem = ({ item }) => {
    const isFavorite = favorites.some(favId => 
      favId === item.id || favId === item.id.toString()
    );
    
    const isSelected = selectedArtistId === item.id;
    
    return (
      <View>
        <ArtistListItem
          item={item}
          isSelected={isSelected}
          isFavorite={isFavorite}
          onPress={() => handleViewArtistDetails(item)}
          onToggleFavorite={() => toggleFavorite(item)}
        />
        
        {isSelected && renderArtistDetails()}
      </View>
    );
  };

  return (
    <View style={styles.modalContainer}>
      <View style={[styles.modalContent, { maxHeight: windowHeight * 0.9 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfiles de Artistas</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FF3A5E" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#FF3A5E" style={styles.loader} />
        ) : artists.length > 0 ? (
          <FlatList
            data={artists}
            renderItem={renderArtistItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.artistsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay perfiles de artistas disponibles</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ArtistProfilesModal;
