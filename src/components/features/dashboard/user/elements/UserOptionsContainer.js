import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { moderateScale, verticalScale, horizontalScale } from '../../../../../utils/ResponsiveUtils';
import { styles as dashboardStyles } from '../../../../../styles/DashboardUserStyles';

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
    <View style={dashboardStyles.optionsContainer}>
      <TouchableOpacity 
        style={dashboardStyles.optionCard}
        onPress={() => navigation.navigate('Calendar')}
      >
        <Ionicons name="calendar" size={30} color="#FFFFFF" />
        <Text style={dashboardStyles.optionTitle}>Calendario</Text>
        <Text style={dashboardStyles.optionDescription}>Ver eventos próximos</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={dashboardStyles.optionCard}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search" size={30} color="#FFFFFF" />
        <Text style={dashboardStyles.optionTitle}>Buscar Eventos</Text>
        <Text style={dashboardStyles.optionDescription}>Explorar eventos</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={dashboardStyles.optionCard}
        onPress={() => navigation.navigate('Favorites')}
      >
        <Ionicons name="heart" size={30} color="#FFFFFF" />
        <Text style={dashboardStyles.optionTitle}>Favoritos</Text>
        <Text style={dashboardStyles.optionDescription}>Tus eventos guardados</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={dashboardStyles.optionCard}
        onPress={onShowNotifications}
      >
        <Ionicons name="notifications" size={30} color="#FFFFFF" />
        <Text style={dashboardStyles.optionTitle}>Notificaciones</Text>
        <Text style={dashboardStyles.optionDescription}>Centro de notificaciones {notifications.length > 0 ? `(${notifications.length})` : ''}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={dashboardStyles.optionCard}
        onPress={onShowArtistProfiles}
      >
        <Ionicons name="people" size={30} color="#FFFFFF" />
        <Text style={dashboardStyles.optionTitle}>Ver Perfiles de Artistas</Text>
        <Text style={dashboardStyles.optionDescription}>Explorar perfiles de artistas</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={dashboardStyles.optionCard}
        onPress={onShowCulturalSpaces}
      >
        <Ionicons name="business" size={30} color="#FFFFFF" />
        <Text style={dashboardStyles.optionTitle}>Ver Espacios Culturales</Text>
        <Text style={dashboardStyles.optionDescription}>Descubre espacios para eventos</Text>
      </TouchableOpacity>

      

      {/* Los botones de perfil de artista y gestor se muestran en DashboardUser, no aquí */}
    </View>
  );
};

export default UserOptionsContainer;
