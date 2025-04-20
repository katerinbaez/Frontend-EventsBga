import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const DashboardArtist = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [artistData, setArtistData] = useState(null);
  const { user, handleLogout } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    checkArtistProfile();
  }, []);

  const checkArtistProfile = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${user.id}`);
      if (response.data.success) {
        setArtistData(response.data.artist);
      }
      setIsLoading(false);
    } catch (error) {
      if (error.response?.status === 404) {
        // No existe perfil, redirigir a registro
        navigation.replace('ArtistRegistration');
      } else {
        console.error('Error al verificar perfil:', error);
        Alert.alert('Error', 'No se pudo verificar el perfil de artista');
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
          <Text style={styles.welcome}>¡Bienvenido Artista,</Text>
          <Text style={styles.userName}>{artistData?.nombreArtistico || user?.name}!</Text>
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
          onPress={() => navigation.navigate('ArtistProfile', { userId: user.id })}
        >
          <Ionicons name="person" size={40} color="#4A90E2" />
          <Text style={styles.optionTitle}>Mi Perfil</Text>
          <Text style={styles.optionDescription}>Editar perfil artístico</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => navigation.navigate('EventCalendar')}
        >
          <Ionicons name="calendar" size={40} color="#4A90E2" />
          <Text style={styles.optionTitle}>Eventos</Text>
          <Text style={styles.optionDescription}>Programar presentaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => navigation.navigate('CulturalSpaces')}
        >
          <Ionicons name="business" size={40} color="#4A90E2" />
          <Text style={styles.optionTitle}>Espacios</Text>
          <Text style={styles.optionDescription}>Buscar espacios disponibles</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => navigation.navigate('Portfolio')}
        >
          <Ionicons name="images" size={40} color="#4A90E2" />
          <Text style={styles.optionTitle}>Portafolio</Text>
          <Text style={styles.optionDescription}>Mostrar mi trabajo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
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

export default DashboardArtist;
