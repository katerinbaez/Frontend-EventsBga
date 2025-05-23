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

// Componentes
import ArtistListItem from '../ui/ArtistListItem';
import ArtistDetails from '../sections/ArtistDetails';

/**
 * Modal para mostrar perfiles de artistas
 */
const ArtistProfilesModal = ({ visible = true, onClose, initialSelectedArtistId }) => {
  // Obtener dimensiones de la pantalla para cálculos de altura
  const windowHeight = Dimensions.get('window').height;
  const { user } = useAuth();
  
  // Estados
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedArtistDetails, setSelectedArtistDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedTrabajoId, setExpandedTrabajoId] = useState(null);
  
  /**
   * Carga todos los artistas desde el backend
   */
  const loadArtists = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/all`);
      const data = response.data;
      
      if (data && data.success) {
        console.log('Artistas cargados:', data.artists.length);
        
        // Procesar fotos de perfil para asegurar URLs válidas
        const processedArtists = data.artists.map(artist => {
          // Verificar si la foto de perfil existe y tiene un formato válido
          if (artist.fotoPerfil) {
            // Asegurarse de que la URL sea absoluta
            if (!artist.fotoPerfil.startsWith('http')) {
              // Si es una ruta relativa, convertirla a absoluta
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

  /**
   * Carga los artistas favoritos del usuario desde el backend
   */
  const loadFavorites = async () => {
    if (!user || !user.id) {
      console.log('No hay usuario autenticado, no se cargarán favoritos');
      return;
    }
    
    try {
      // Usar el mismo endpoint que FavoritesList para consistencia
      const userId = user.id || user.sub || user._id;
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        params: { 
          userId: userId,
          targetType: 'artist'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Favoritos cargados:', response.data.length);
        
        // Extraer los IDs de los favoritos
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

  /**
   * Procesa los detalles completos de un artista
   * @param {string} artistId - ID del artista a cargar
   */
  const loadArtistDetails = async (artistId) => {
    console.log('Cargando detalles del artista:', artistId);
    setSelectedArtistId(artistId);
    setLoadingDetails(true);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile-by-id/${artistId}`);
      const data = response.data;
      
      if (data && data.success) {
        console.log('Detalles del artista cargados:', data.artist.nombreArtistico);
        
        // Procesar los datos del artista
        const artistData = data.artist;
        
        // Asegurarse de que la foto de perfil tenga una URL absoluta
        if (artistData.fotoPerfil && !artistData.fotoPerfil.startsWith('http')) {
          artistData.fotoPerfil = `${BACKEND_URL}${artistData.fotoPerfil}`;
        }
        
        // Asegurarse de que portfolio tenga la estructura correcta según el modelo
        if (!artistData.portfolio) {
          artistData.portfolio = { trabajos: [], imagenes: [] };
          console.log('No se encontró portfolio, se inicializó vacío');
        } else if (typeof artistData.portfolio === 'string') {
          try {
            // Intentar parsear el portfolio si viene como string JSON
            artistData.portfolio = JSON.parse(artistData.portfolio);
            console.log('Portfolio parseado de string JSON:', JSON.stringify(artistData.portfolio, null, 2));
          } catch (e) {
            console.error('Error al parsear portfolio:', e);
            artistData.portfolio = { trabajos: [], imagenes: [] };
          }
        }
        
        // Procesar los trabajos del portfolio si existen
        if (artistData.portfolio && artistData.portfolio.trabajos) {
          artistData.portfolio.trabajos = artistData.portfolio.trabajos.map((trabajo, index) => {
            // Si el trabajo es un string, intentar parsearlo como JSON
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
            
            // Procesar las imágenes del trabajo
            const processedTrabajo = {...trabajo};
            
            // Asegurarse de que la imagen principal tenga una URL absoluta
            if (processedTrabajo.imageUrl && !processedTrabajo.imageUrl.startsWith('http')) {
              processedTrabajo.imageUrl = `${BACKEND_URL}${processedTrabajo.imageUrl}`;
            }
            
            // Asegurarse de que el campo images exista y sea un array
            if (!processedTrabajo.images) {
              processedTrabajo.images = [];
              
              // Si hay una imagen principal, añadirla al array de imágenes
              if (processedTrabajo.imageUrl) {
                processedTrabajo.images.push(processedTrabajo.imageUrl);
              }
              // Si hay una imagen en otro formato de nombre, añadirla también
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
              // Si images es un string, intentar parsearlo como JSON
              try {
                processedTrabajo.images = JSON.parse(processedTrabajo.images);
              } catch (e) {
                console.error(`Error al parsear images de trabajo ${index}:`, e);
                processedTrabajo.images = [processedTrabajo.images]; // Usar el string como única imagen
              }
            }
            
            // Asegurarse de que todas las imágenes tengan URLs absolutas
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
        
        // Procesar las imágenes del portfolio si existen
        if (artistData.portfolio && artistData.portfolio.imagenes) {
          artistData.portfolio.imagenes = artistData.portfolio.imagenes.map(imagen => {
            // Si la imagen es un string con una URL, asegurarse de que sea absoluta
            if (typeof imagen === 'string' && !imagen.startsWith('http')) {
              return `${BACKEND_URL}${imagen}`;
            }
            // Si la imagen es un objeto con una propiedad url, asegurarse de que sea absoluta
            if (imagen && imagen.url && !imagen.url.startsWith('http')) {
              imagen.url = `${BACKEND_URL}${imagen.url}`;
            }
            return imagen;
          });
        }
        
        // Actualizar el estado con los detalles del artista
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

  /**
   * Alterna el estado de favorito de un artista
   * @param {Object} artist - Artista a alternar en favoritos
   */
  const toggleFavorite = async (artist) => {
    if (!user || !user.id) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar favoritos');
      return;
    }
    
    const isFavorite = favorites.includes(artist.id);
    const userId = user.id || user.sub || user._id;
    
    try {
      if (isFavorite) {
        // Eliminar de favoritos usando el mismo endpoint que FavoritesList
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
        // Agregar a favoritos usando el mismo endpoint que FavoritesList
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

  /**
   * Maneja la visualización de los detalles de un artista
   * @param {Object} artist - Artista cuyos detalles se quieren ver
   */
  const handleViewArtistDetails = async (artist) => {
    // Si ya estamos viendo este artista, lo cerramos (toggle)
    if (selectedArtistId === artist.id) {
      console.log('Cerrando detalles del artista:', artist.nombreArtistico);
      setSelectedArtistId(null);
      setSelectedArtistDetails(null);
      return;
    }
    
    console.log('Mostrando detalles del artista:', artist.nombreArtistico);
    // Cargar los detalles del artista
    await loadArtistDetails(artist.id);
  };

  /**
   * Renderiza los detalles del artista seleccionado
   */
  const renderArtistDetails = () => {
    if (!selectedArtistDetails) return null;
    
    // Depuración del portfolio
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

  // Cargar artistas cuando se monta el componente
  useEffect(() => {
    loadArtists();
  }, []);

  // Cargar favoritos cuando se cargan los artistas
  useEffect(() => {
    if (artists.length > 0) {
      loadFavorites();
    }
  }, [artists, user]);
  
  // Mostrar detalles del artista seleccionado si se proporciona un ID inicial
  useEffect(() => {
    if (initialSelectedArtistId) {
      setSelectedArtistId(initialSelectedArtistId);
      loadArtistDetails(initialSelectedArtistId);
    }
  }, [initialSelectedArtistId]);

  /**
   * Renderiza un elemento de la lista de artistas
   */
  const renderArtistItem = ({ item }) => {
    // Verificar si el artista está en favoritos (comparando como string para mayor seguridad)
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
