import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FavoritesList = ({ user, navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('event');

  useEffect(() => {
    loadFavorites();
  }, [activeTab]);

  const loadFavorites = async () => {
    try {
      const response = await fetch(`/api/favorites?userId=${user.id}&type=${activeTab}`);
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  };

  const removeFavorite = async (itemId) => {
    try {
      await fetch(`/api/favorites/${itemId}`, {
        method: 'DELETE'
      });
      setFavorites(prev => prev.filter(fav => fav.id !== itemId));
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.favoriteItem}
      onPress={() => {
        // Navegar al detalle según el tipo
        navigation.navigate(
          activeTab === 'event' ? 'EventDetail' :
          activeTab === 'artist' ? 'ArtistProfile' : 'SpaceDetail',
          { id: item.targetId }
        );
      }}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.itemImage}
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title || item.nombre}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description || item.descripcion}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFavorite(item.id)}
      >
        <Ionicons name="heart" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderTabs()}
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  removeButton: {
    padding: 8,
  },
});

export default FavoritesList;
