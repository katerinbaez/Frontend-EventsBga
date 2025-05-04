import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import RequestsModal from './RequestsModal';
import EventAttendeesModal from './EventAttendeesModal';

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
    try {
      const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${user.id}`);
      if (response.data.success) {
        setManagerData(response.data.manager);
      }
      setIsLoading(false);
    } catch (error) {
      if (error.response?.status === 404) {
        // No existe perfil, redirigir a registro
        navigation.replace('ManagerRegistration');
      } else {
        console.error('Error al verificar perfil:', error);
        Alert.alert('Error', 'No se pudo verificar el perfil de gestor cultural');
        setIsLoading(false);
      }
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcome}>¡Bienvenido Gestor,</Text>
          <Text style={styles.userName}>{managerData?.nombreEspacio || user?.name}!</Text>
        </View>
        <TouchableOpacity 
          onPress={handleLogoutAndNavigate}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => navigation.navigate('CulturalSpace', { userId: user.id })}
        >
          <Ionicons name="business" size={40} color="#4A90E2" />
          <Text style={styles.optionTitle}>Mi Espacio</Text>
          <Text style={styles.optionDescription}>Gestionar espacio cultural</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => navigation.navigate('SpaceSchedule')}
        >
          <Ionicons name="calendar" size={40} color="#4A90E2" />
          <Text style={styles.optionTitle}>Horarios</Text>
          <Text style={styles.optionDescription}>Gestionar disponibilidad</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => setRequestsModalVisible(true)}
        >
          <Ionicons name="list" size={40} color="#FF3A5E" />
          <Text style={styles.optionTitle}>Solicitudes</Text>
          <Text style={styles.optionDescription}>Revisar solicitudes de eventos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => navigation.navigate('EventProgramming', { 
            managerId: user?.id,
            spaceId: managerData?.id || user?.id, 
            spaceName: managerData?.nombreEspacio || user?.name || 'Mi Espacio Cultural'
          })}
        >
          <Ionicons name="calendar" size={40} color="#FF3A5E" />
          <Text style={styles.optionTitle}>Programar eventos</Text>
          <Text style={styles.optionDescription}>Programar eventos para el espacio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => navigation.navigate('EventAttendance', { 
            managerId: user?.id,
            setSelectedEvent: setSelectedEvent,
            setAttendeesModalVisible: setAttendeesModalVisible
          })}
        >
          <Ionicons name="people" size={40} color="#4A90E2" />
          <Text style={styles.optionTitle}>Artistas Confirmados</Text>
          <Text style={styles.optionDescription}>Ver asistentes a eventos</Text>
        </TouchableOpacity>
      </View>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  welcomeContainer: {
    marginRight: 50,
  },
  welcome: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  userName: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerButton: {
    position: 'absolute',
    right: 20,
    top: 50,
    backgroundColor: '#ff4757',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '47%',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 5,
    textAlign: 'center',
  },

});

export default DashboardManager;
