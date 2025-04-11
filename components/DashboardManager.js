import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const DashboardManager = () => {
  const { user, handleLogout } = useAuth();
  const navigation = useNavigation();

  const handleLogoutAndNavigate = async () => {
    await handleLogout();
    navigation.replace('Home');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcome}>¡Bienvenido Gestor,</Text>
          <Text style={styles.userName}>{user?.name}!</Text>
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
          onPress={() => navigation.navigate('EventRequests')}
        >
          <Ionicons name="list" size={40} color="#4A90E2" />
          <Text style={styles.optionTitle}>Solicitudes</Text>
          <Text style={styles.optionDescription}>Revisar solicitudes de eventos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => navigation.navigate('SpaceDetails')}
        >
          <Ionicons name="information-circle" size={40} color="#4A90E2" />
          <Text style={styles.optionTitle}>Detalles</Text>
          <Text style={styles.optionDescription}>Capacidad y características</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
