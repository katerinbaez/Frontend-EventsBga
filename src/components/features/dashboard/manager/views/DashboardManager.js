import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Alert, Modal, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../../context/AuthContext';
import ManagerHeader from '../elements/ManagerHeader';
import ManagerOptionsContainer from '../elements/ManagerOptionsContainer';
import ManagerDashboardService from '../services/ManagerDashboardService';
import RequestsModal from '../../../requests/views/RequestsModal';
import EventAttendeesModal from '../../../events/views/EventAttendeesModal';
import { styles } from '../../../../../styles/DashboardManagerStyles';

const DashboardManager = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [managerData, setManagerData] = useState(null);
  const { user, handleLogout } = useAuth();
  const navigation = useNavigation();
  const [requestsModalVisible, setRequestsModalVisible] = useState(false);
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    checkManagerProfile();
  }, []);

  const checkManagerProfile = async () => {
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }
    
    const result = await ManagerDashboardService.checkManagerProfile(user.id);
    
    if (result.success) {
      setManagerData(result.manager);
      setIsLoading(false);
    } else if (result.error === 'not_found') {
      // No existe perfil, redirigir a registro
      navigation.replace('ManagerRegistration');
    } else {
      Alert.alert('Error', 'No se pudo verificar el perfil de gestor cultural');
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
          <ManagerHeader 
            managerName={managerData?.nombreEspacio || user?.name}
            onLogout={handleLogoutAndNavigate}
          />

          <ManagerOptionsContainer 
            navigation={navigation}
            user={user}
            managerData={managerData}
            onOpenRequestsModal={() => setRequestsModalVisible(true)}
            setSelectedEvent={setSelectedEvent}
            setAttendeesModalVisible={setAttendeesModalVisible}
          />

          {/* Modal para gestionar solicitudes de eventos */}
          <RequestsModal 
            visible={requestsModalVisible}
            onClose={() => setRequestsModalVisible(false)}
          />

          {/* Modal para ver artistas confirmados */}
          <EventAttendeesModal
            visible={attendeesModalVisible}
            onClose={() => setAttendeesModalVisible(false)}
            eventId={selectedEvent?.id}
            eventTitle={selectedEvent?.titulo}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default DashboardManager;
