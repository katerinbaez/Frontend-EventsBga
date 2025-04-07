import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EventSearch = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery || selectedCategory) {
      searchEvents();
    }
  }, [searchQuery, selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const searchEvents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...(searchQuery && { q: searchQuery }),
        ...(selectedCategory && { category: selectedCategory })
      });
      
      const response = await fetch(`/api/events/search?${queryParams}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error searching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryChip = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryChip,
        selectedCategory === category.id && styles.selectedCategoryChip
      ]}
      onPress={() => setSelectedCategory(
        selectedCategory === category.id ? '' : category.id
      )}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === category.id && styles.selectedCategoryChipText
      ]}>
        {category.nombre}
      </Text>
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.titulo}</Text>
        <View style={styles.eventCategory}>
          <Text style={styles.eventCategoryText}>{item.categoria}</Text>
        </View>
      </View>

      <View style={styles.eventInfo}>
        <View style={styles.eventInfoItem}>
          <Ionicons name="calendar" size={16} color="#7F8C8D" />
          <Text style={styles.eventInfoText}>
            {new Date(item.fechaInicio).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.eventInfoItem}>
          <Ionicons name="time" size={16} color="#7F8C8D" />
          <Text style={styles.eventInfoText}>
            {new Date(item.fechaInicio).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        <View style={styles.eventInfoItem}>
          <Ionicons name="location" size={16} color="#7F8C8D" />
          <Text style={styles.eventInfoText}>
            {item.space?.nombre || 'Por confirmar'}
          </Text>
        </View>
      </View>

      <View style={styles.eventFooter}>
        <View style={styles.eventInfoItem}>
          <Ionicons name="person" size={16} color="#7F8C8D" />
          <Text style={styles.eventInfoText}>
            {item.artist?.nombreArtistico || 'Artista por confirmar'}
          </Text>
        </View>
        {item.precio > 0 ? (
          <Text style={styles.eventPrice}>${item.precio}</Text>
        ) : (
          <Text style={styles.eventFree}>Gratis</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#95A5A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => renderCategoryChip(item)}
          keyExtractor={item => item.id.toString()}
          style={styles.categoryList}
          contentContainerStyle={styles.categoryListContent}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id.toString()}
          style={styles.eventList}
          contentContainerStyle={styles.eventListContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color="#95A5A6" />
              <Text style={styles.emptyText}>
                No se encontraron eventos
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
  },
  categoryList: {
    flexGrow: 0,
  },
  categoryListContent: {
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#4A90E2',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  selectedCategoryChipText: {
    color: '#FFF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventList: {
    flex: 1,
  },
  eventListContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 8,
  },
  eventCategory: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventCategoryText: {
    fontSize: 12,
    color: '#FFF',
  },
  eventInfo: {
    marginBottom: 12,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7F8C8D',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  eventFree: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
  },
});

export default EventSearch;
