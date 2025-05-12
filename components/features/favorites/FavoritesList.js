import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';
import ArtistProfileCard from '../artists/ArtistProfileCard';
import ArtistProfilesModal from '../artists/ArtistProfilesModal';
import CulturalSpacesModal from '../spaces/CulturalSpacesModal';

const placeholderImage = 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=No+Image';

const FavoritesList = ({ user, navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('event');
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [activeTab, user]);

  const loadFavorites = async () => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = user.id || user.sub || user._id;
      console.log('Cargando favoritos para usuario:', userId, 'tipo:', activeTab);

      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        params: {
          userId: userId,
          targetType: activeTab
        }
      });

      console.log('Respuesta de favoritos:', JSON.stringify(response.data, null, 2));

      if (Array.isArray(response.data)) {
        if (response.data.length === 0) {
          setError('No tienes favoritos guardados');
        }
        
        // Si estamos en la pestaña de artistas, cargar detalles de los artistas
        if (activeTab === 'artist' && response.data.length > 0) {
          const artistsWithDetails = await Promise.all(response.data.map(async (favorite) => {
            try {
              const artistResponse = await axios.get(`${BACKEND_URL}/api/artists/profile-by-id/${favorite.targetId}`);
              if (artistResponse.data && artistResponse.data.success) {
                return {
                  ...favorite,
                  nombreArtistico: artistResponse.data.artist.nombreArtistico,
                  biografia: artistResponse.data.artist.biografia,
                  fotoPerfil: artistResponse.data.artist.fotoPerfil,
                  habilidades: artistResponse.data.artist.habilidades
                };
              }
              return favorite;
            } catch (error) {
              console.log('Error al cargar detalles del artista:', favorite.targetId);
              return favorite;
            }
          }));
          setFavorites(artistsWithDetails);
        } else {
          setFavorites(response.data);
        }
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        setFavorites([]);
        setError('Formato de respuesta inesperado');
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setError('No se pudieron cargar tus favoritos');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (itemId) => {
    if (!user) return;

    try {
      const userId = user.id || user.sub || user._id;

      await axios.delete(`${BACKEND_URL}/api/favorites`, {
        data: {
          userId: userId,
          targetType: activeTab,
          targetId: itemId
        }
      });

      setFavorites(prev => prev.filter(fav => fav.targetId !== itemId));
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      Alert.alert('Error', 'No se pudo eliminar el favorito');
    }
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'event' && styles.activeTab]}
        onPress={() => setActiveTab('event')}
      >
        <Ionicons
          name="calendar"
          size={24}
          color={activeTab === 'event' ? '#4A90E2' : '#95A5A6'}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'event' && styles.activeTabText
        ]}>Eventos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'artist' && styles.activeTab]}
        onPress={() => setActiveTab('artist')}
      >
        <Ionicons
          name="person"
          size={24}
          color={activeTab === 'artist' ? '#4A90E2' : '#95A5A6'}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'artist' && styles.activeTabText
        ]}>Artistas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'space' && styles.activeTab]}
        onPress={() => setActiveTab('space')}
      >
        <Ionicons
          name="business"
          size={24}
          color={activeTab === 'space' ? '#4A90E2' : '#95A5A6'}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'space' && styles.activeTabText
        ]}>Espacios</Text>
      </TouchableOpacity>
    </View>
  );

  const handleItemPress = (item) => {
    try {
      if (activeTab === 'event') {
        const eventIdNum = parseInt(item.targetId);
        if (isNaN(eventIdNum)) {
          console.error('ID de evento inválido:', item.targetId);
          Alert.alert('Error', 'No se puede abrir este evento');
          return;
        }
        
        // Usar la ruta original de navegación para eventos
        navigation.navigate('EventDetails', { eventId: eventIdNum });
      } else if (activeTab === 'artist') {
        // Para artistas, mostrar el modal de perfiles de artistas directamente
        console.log('Mostrando modal de artista con ID:', item.targetId);
        
        // Guardar el ID del artista seleccionado y mostrar el modal
        setSelectedArtistId(item.targetId);
        setShowArtistModal(true);
      } else if (activeTab === 'space') {
        // Para espacios culturales, mostrar el modal directamente
        console.log('Mostrando modal de espacio cultural con ID:', item.targetId);
        
        // Guardar el ID del espacio seleccionado y mostrar el modal
        setSelectedSpaceId(item.targetId);
        setShowSpaceModal(true);
      }
    } catch (error) {
      console.error('Error al navegar:', error);
      Alert.alert('Error', 'No se pudo abrir el detalle');
    }
  };

  const renderItem = ({ item }) => {
    let title = '';
    let description = '';
    let imageUrl = '';
    let iconName = '';
    let iconColor = '#4A90E2';

    console.log('Renderizando item favorito:', JSON.stringify(item, null, 2));

    if (activeTab === 'event') {
      iconName = 'calendar';
      iconColor = '#4A90E2';

      // Intentar obtener el título del evento
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
        // Si no encontramos el título, usamos un valor por defecto
        // No intentamos cargar los detalles para evitar errores 404
        title = 'Evento';
        description = 'Ver detalles';
      }
    } else if (activeTab === 'artist') {
      iconName = 'person';
      iconColor = '#FF3A5E'; // Color de acento rojo que prefiere el usuario
      
      console.log('Renderizando artista favorito:', item);
      
      // Acceder directamente a las propiedades del artista
      title = item.nombreArtistico || 'Artista';
      description = item.biografia || 'Ver perfil completo';
      imageUrl = item.fotoPerfil || '';
    } else if (activeTab === 'space') {
      iconName = 'business';
      iconColor = '#2ECC71';

      // No intentamos cargar los detalles para evitar errores 404

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
        onPress={() => handleItemPress(item)}
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
          onPress={() => removeFavorite(item.targetId)}
        >
          <Ionicons name="close-circle" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Modal para mostrar los detalles del artista */}
      <Modal
        visible={showArtistModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowArtistModal(false)}
      >
        <ArtistProfilesModal 
          visible={showArtistModal}
          onClose={() => {
            // Cerrar el modal y limpiar el ID seleccionado
            setShowArtistModal(false);
            setSelectedArtistId(null);
          }} 
          initialSelectedArtistId={selectedArtistId}
        />
      </Modal>

      {/* Modal para mostrar los detalles del espacio cultural */}
      <Modal
        visible={showSpaceModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowSpaceModal(false)}
      >
        <CulturalSpacesModal 
          visible={showSpaceModal}
          onClose={() => {
            // Cerrar el modal y limpiar el ID seleccionado
            setShowSpaceModal(false);
            setSelectedSpaceId(null);
          }} 
          initialSelectedSpaceId={selectedSpaceId}
        />
      </Modal>
      {renderTabs()}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.targetId || ''}-${index}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-dislike-outline" size={64} color="#95A5A6" />
          <Text style={styles.emptyText}>
            {error || 'No tienes favoritos guardados'}
          </Text>
        </View>
      )}
      
      {/* No se necesita modal aquí, ahora navegamos directamente */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    marginTop: 4,
    fontSize: 14,
    color: '#95A5A6',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // Cambiado a circular para artistas
    marginRight: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30, // Cambiado a circular para artistas
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#AAA',
  },
  removeButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 16,
  },
  
  // Fin de los estilos
});

export default FavoritesList;
