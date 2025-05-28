import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, CommonActions, useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';

/**
 * Pantalla de respaldo para manejar errores de navegación
 * Se muestra cuando hay un problema con la navegación o cuando una ruta no existe
 * Proporciona información detallada para facilitar la depuración
 */
const FallbackScreen = ({ route }) => {
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuth();
  const navState = useNavigationState(state => state);
  
  // Obtener información detallada sobre el error
  const errorMessage = route?.params?.error || 'Ha ocurrido un error en la navegación';
  const targetRoute = route?.params?.targetRoute || 'Ruta desconocida';
  
  // Registrar información de depuración cuando se monta el componente
  useEffect(() => {
    console.error('Error de navegación detectado:');
    console.error('Mensaje:', errorMessage);
    console.error('Ruta objetivo:', targetRoute);
    console.error('Estado de navegación actual:', JSON.stringify(navState, null, 2));
    
    // Registrar rutas disponibles en linkingConfig
    try {
      const { linkingConfig } = require('../navigation/NavigationHandler');
      console.error('Rutas configuradas en linkingConfig:', 
        Object.keys(linkingConfig.config.screens).join(', '));
    } catch (e) {
      console.error('No se pudo acceder a linkingConfig:', e.message);
    }
  }, []);

  // Determinar la pantalla de inicio según el rol del usuario
  const getHomeScreen = () => {
    if (!isAuthenticated) return 'Home';
    
    switch (user?.role) {
      case 'admin':
        return 'DashboardAdmin';
      case 'artist':
        return 'DashboardArtist';
      case 'manager':
        return 'DashboardManager';
      default:
        return 'Dashboard';
    }
  };

  // Navegar a la pantalla de inicio
  const navigateToHome = () => {
    const homeScreen = getHomeScreen();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: homeScreen }],
      })
    );
  };

  // Volver a la pantalla anterior
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigateToHome();
    }
  };

  // Obtener información sobre las rutas disponibles
  const getAvailableRoutes = () => {
    try {
      const { linkingConfig } = require('../navigation/NavigationHandler');
      return Object.keys(linkingConfig.config.screens);
    } catch (e) {
      return ['No se pudieron cargar las rutas'];
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Ionicons name="alert-circle" size={80} color={COLORS.primary} style={styles.icon} />
          <Text style={styles.title}>Oops! Algo salió mal</Text>
          <Text style={styles.message}>{errorMessage}</Text>
          
          {/* Información de depuración */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Información de depuración:</Text>
            <Text style={styles.debugText}>Ruta objetivo: {targetRoute}</Text>
            <Text style={styles.debugText}>Estado de autenticación: {isAuthenticated ? 'Autenticado' : 'No autenticado'}</Text>
            {user && <Text style={styles.debugText}>Rol de usuario: {user.role || 'No definido'}</Text>}
            
            <Text style={styles.debugSubtitle}>Rutas disponibles:</Text>
            {getAvailableRoutes().map((route, index) => (
              <Text key={index} style={styles.routeText}>{route}</Text>
            ))}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={goBack}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={navigateToHome}>
              <Ionicons name="home" size={20} color="#fff" />
              <Text style={styles.buttonText}>Ir al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  debugContainer: {
    width: '100%',
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  debugSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 5,
  },
  debugText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  routeText: {
    fontSize: 12,
    color: '#AAAAAA',
    marginLeft: 10,
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.48,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FallbackScreen;
