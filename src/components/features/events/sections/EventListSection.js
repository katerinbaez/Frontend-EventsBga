/**
 * Este archivo maneja la sección de lista de eventos
 * - UI
 * - Eventos
 * - Navegación
 */

import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import EventCardSearch from '../ui/EventCardSearch';
import { styles } from '../../../../styles/EventSearchStyles';


const EventListSection = ({ 
  events, 
  loading, 
  navigation, 
  favorites,
  onToggleFavorite,
  refreshing,
  onRefresh
}) => {
  if (loading && (!events || !Array.isArray(events) || events.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3A5E" />
      </View>
    );
  }
  
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
