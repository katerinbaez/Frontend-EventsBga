import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../../../../styles/DashboardUserStyles';

const UserOptionsContainer = ({ 
  onShowRoleRequest, 
  onShowArtistProfiles, 
  onShowCulturalSpaces,
  onShowNotifications,
  hasArtistProfile,
  hasManagerProfile,
  notifications = []
}) => {
  const navigation = useNavigation();
  return (
    <View style={styles.optionsContainer}>
      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => navigation.navigate('Calendar')}
      >
        <Ionicons name="calendar" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Calendario</Text>
        <Text style={styles.optionDescription}>Ver eventos próximos</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Buscar Eventos</Text>
        <Text style={styles.optionDescription}>Explorar eventos</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => navigation.navigate('Favorites')}
      >
        <Ionicons name="heart" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Favoritos</Text>
        <Text style={styles.optionDescription}>Tus eventos guardados</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={onShowNotifications}
      >
        <Ionicons name="notifications" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Notificaciones</Text>
        <Text style={styles.optionDescription}>Centro de notificaciones {notifications.length > 0 ? `(${notifications.length})` : ''}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={onShowArtistProfiles}
      >
        <Ionicons name="people" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Ver Perfiles de Artistas</Text>
        <Text style={styles.optionDescription}>Explorar perfiles de artistas</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={onShowCulturalSpaces}
      >
        <Ionicons name="business" size={40} color="#4A90E2" />
        <Text style={styles.optionTitle}>Ver Espacios Culturales</Text>
        <Text style={styles.optionDescription}>Descubre espacios para eventos</Text>
      </TouchableOpacity>

      {!hasArtistProfile && !hasManagerProfile && (
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={onShowRoleRequest}
        >
          <Ionicons name="person-add" size={40} color="#4A90E2" />
          <Text style={styles.optionTitle}>Solicitar Rol</Text>
          <Text style={styles.optionDescription}>Artista o Gestor Cultural</Text>
        </TouchableOpacity>
      )}

      {/* Los botones de perfil de artista y gestor se muestran en DashboardUser, no aquí */}
    </View>
  );
};

export default UserOptionsContainer;
