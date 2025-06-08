/**
 * Este archivo maneja la lista de favoritos
 * - UI
 * - Favoritos
 * - Lista
 */

import React, { useState } from 'react';
import { 
  View, 
  FlatList, 
  ActivityIndicator, 
  Modal,
  Alert
} from 'react-native';
import ArtistProfilesModal from '../../artists/modals/ArtistProfilesModal';
import CulturalSpacesModal from '../../spaces/views/CulturalSpacesModal';
import { styles } from '../../../../styles/FavoritesListStyles';

import FavoritesTabs from '../ui/FavoritesTabs';
import FavoriteItem from '../ui/FavoriteItem';
import EmptyFavorites from '../ui/EmptyFavorites';

import useFavorites from '../hooks/useFavorites';

const FavoritesList = ({ user, navigation }) => {
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);
  const {
    favorites,
    activeTab,
    setActiveTab,
    loading,
    error,
    removeFavorite
  } = useFavorites(user);

  const handleItemPress = (item) => {
    try {
      if (activeTab === 'event') {
        const eventIdNum = parseInt(item.targetId);
        if (isNaN(eventIdNum)) {
          console.error('ID de evento inválido:', item.targetId);
          Alert.alert('Error', 'No se puede abrir este evento');
          return;
        }
        
        navigation.navigate('EventDetails', { eventId: eventIdNum });
      } else if (activeTab === 'artist') {
        console.log('Mostrando modal de artista con ID:', item.targetId);
        
        setSelectedArtistId(item.targetId);
        setShowArtistModal(true);
      } else if (activeTab === 'space') {
        console.log('Mostrando modal de espacio cultural con ID:', item.targetId);
        
        setSelectedSpaceId(item.targetId);
        setShowSpaceModal(true);
      }
    } catch (error) {
      console.error('Error al navegar:', error);
      Alert.alert('Error', 'No se pudo abrir el detalle');
    }
  };

  return (
    <View style={styles.container}>
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
            setShowArtistModal(false);
            setSelectedArtistId(null);
          }} 
          initialSelectedArtistId={selectedArtistId}
        />
      </Modal>

      {showSpaceModal && (
        <CulturalSpacesModal 
          visible={showSpaceModal}
          onClose={() => {
            setShowSpaceModal(false);
            setSelectedSpaceId(null);
          }} 
          initialSelectedSpaceId={selectedSpaceId}
        />
      )}
      
      <FavoritesTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <FavoriteItem
              item={item}
              activeTab={activeTab}
              onPress={handleItemPress}
              onRemove={removeFavorite}
            />
          )}
          keyExtractor={(item, index) => `${item.targetId || ''}-${index}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyFavorites message={error} />
      )}
    </View>
  );
};

export default FavoritesList;
