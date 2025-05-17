import React from 'react';
import { View } from 'react-native';
import ArtistOptionCard from './ArtistOptionCard';
import { styles } from '../../../../../styles/DashboardArtistStyles';

const ArtistOptionsContainer = ({ navigation, onOpenSpaceSearch, onOpenEventsModal, onOpenRequestsHistory }) => {
  return (
    <View style={styles.optionsContainer}>
      <ArtistOptionCard
        title="Mi Perfil"
        description="Editar perfil artístico"
        iconName="person"
        iconColor="#4A90E2"
        requiresNavigation={true}
        navigationTarget="ArtistProfile"
        navigation={navigation}
      />

      <ArtistOptionCard
        title="Calendario"
        description="Ver eventos programados"
        iconName="calendar"
        iconColor="#4A90E2"
        requiresNavigation={true}
        navigationTarget="Calendar"
        navigation={navigation}
      />

      <ArtistOptionCard
        title="Espacios"
        description="Buscar espacios disponibles"
        iconName="business"
        iconColor="#FF3A5E"
        onPress={onOpenSpaceSearch}
      />

      <ArtistOptionCard
        title="Eventos Disponibles"
        description="Ver eventos para registrarse"
        iconName="calendar-outline"
        iconColor="#FF3A5E"
        onPress={onOpenEventsModal}
      />

      <ArtistOptionCard
        title="Mis Solicitudes"
        description="Ver estado de solicitudes"
        iconName="document-text-outline"
        iconColor="#FF3A5E"
        onPress={onOpenRequestsHistory}
      />

      <ArtistOptionCard
        title="Portafolio"
        description="Mostrar mi trabajo"
        iconName="images"
        iconColor="#4A90E2"
        requiresNavigation={true}
        navigationTarget="ArtistPortfolio"
        navigation={navigation}
      />
    </View>
  );
};

export default ArtistOptionsContainer;
