import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Modal, Alert, StatusBar, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../../context/AuthContext';
import ArtistHeader from '../elements/ArtistHeader';
import ArtistOptionsContainer from '../elements/ArtistOptionsContainer';
import ArtistDashboardService from '../services/ArtistDashboardService';
import SpaceSearch from '../../../spaces/views/SpaceSearch';
import RequestsHistoryModal from '../../../requests/views/RequestsHistoryModal';
import AvailableEventsModal from '../../../events/views/AvailableEventsModal';
import { styles } from '../../../../../styles/DashboardArtistStyles';

const DashboardArtist = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [artistData, setArtistData] = useState(null);
  const { user, handleLogout } = useAuth();
  const navigation = useNavigation();
  const [spaceSearchVisible, setSpaceSearchVisible] = useState(false);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [requestsHistoryVisible, setRequestsHistoryVisible] = useState(false);
  const [availableEventsVisible, setAvailableEventsVisible] = useState(false);

  useEffect(() => {
    checkArtistProfile();
  }, []);

  const checkArtistProfile = async () => {
    if (!user || !user.id) return;
    
    const result = await ArtistDashboardService.checkArtistProfile(user.id);
    
    if (result.success) {
      setArtistData(result.artist);
      setIsLoading(false);
    } else if (result.error === 'not_found') {
      // No existe perfil, redirigir a registro
      navigation.replace('ArtistRegistration');
    } else {
      Alert.alert('Error', 'No se pudo verificar el perfil de artista');
      setIsLoading(false);
    }
  };

  const handleLogoutAndNavigate = async () => {
    await handleLogout();
    navigation.replace('Home');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="transparent" translucent={true} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <ArtistHeader 
            artistName={artistData?.nombreArtistico || user?.name}
            onLogout={handleLogoutAndNavigate}
          />

          <ArtistOptionsContainer 
            navigation={navigation}
            onOpenSpaceSearch={() => setSpaceSearchVisible(true)}
            onOpenEventsModal={() => setEventsModalVisible(true)}
            onOpenRequestsHistory={() => setRequestsHistoryVisible(true)}
          />
        </ScrollView>
        
        {/* Modal para la búsqueda de espacios culturales */}
        <Modal
          visible={spaceSearchVisible}
          animationType="slide"
          onRequestClose={() => setSpaceSearchVisible(false)}
        >
          <SpaceSearch onClose={() => setSpaceSearchVisible(false)} />
        </Modal>

        {/* Modal para eventos disponibles */}
        <AvailableEventsModal 
          visible={eventsModalVisible}
          onClose={() => setEventsModalVisible(false)}
        />

        {/* Modal para historial de solicitudes */}
        <RequestsHistoryModal
          visible={requestsHistoryVisible}
          onClose={() => setRequestsHistoryVisible(false)}
        />
      </SafeAreaView>
    </>
  );
};


export default DashboardArtist;
