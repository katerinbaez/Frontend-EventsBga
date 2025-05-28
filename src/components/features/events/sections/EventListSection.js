import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import EventCardSearch from '../ui/EventCardSearch';
import { styles } from '../../../../styles/EventSearchStyles';

/**
 * Sección que muestra la lista de eventos
 */
const EventListSection = ({ 
  events, 
  loading, 
  navigation, 
  favorites,
  onToggleFavorite,
  refreshing,
  onRefresh
}) => {
  // Si está cargando y no hay eventos, mostrar indicador
  if (loading && (!events || !Array.isArray(events) || events.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3A5E" />
      </View>
    );
  }
  
  // Si no hay eventos, mostrar mensaje
  if (!events || !Array.isArray(events) || events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No se encontraron eventos</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.eventsContainer}>
      
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <EventCardSearch
            event={item}
            navigation={navigation}
            isFavorite={Array.isArray(favorites) && favorites.includes(String(item.id || item._id))}
            onToggleFavorite={onToggleFavorite}
          />
        )}
        keyExtractor={item => String(item.id || item._id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsListContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={
          loading ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#FF3A5E" />
            </View>
          ) : null
        }
      />
    </View>
  );
};


export default EventListSection;
