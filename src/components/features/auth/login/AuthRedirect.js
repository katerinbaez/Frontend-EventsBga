import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '../../../../context/AuthContext';
import { COLORS } from '../../../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Componente intermedio para manejar la redirección después de la autenticación
 * Este componente se encarga de determinar a qué pantalla debe navegar el usuario
 * basado en su rol, obteniendo la información directamente de AsyncStorage
 * para evitar problemas con el estado de autenticación en el contexto
 */
const AuthRedirect = ({ route }) => {
  const navigation = useNavigation();
  const [isReady, setIsReady] = useState(false);
  const [targetScreen, setTargetScreen] = useState('Home');
  const { userData } = route.params || {};
  
  // Usar un efecto para determinar la pantalla de destino basada en los datos almacenados
  // en lugar de depender del contexto de autenticación
  useEffect(() => {
    const determineTargetScreen = async () => {
      try {
        // Obtener datos directamente de AsyncStorage para evitar problemas con el estado
        const storedUserData = await AsyncStorage.getItem('userData');
        let userInfo = userData; // Usar los datos pasados como parámetro primero
        
        // Si no hay datos en los parámetros, intentar usar los datos almacenados
        if (!userInfo && storedUserData) {
          try {
            userInfo = JSON.parse(storedUserData);
          } catch (parseError) {
            console.warn('Error al analizar datos de usuario almacenados:', parseError);
          }
        }
        
        // Determinar la pantalla de destino basada en el rol
        let screen = 'Home';
        
        if (userInfo) {
          const role = userInfo.role;
          
          switch (role) {
            case 'admin':
              screen = 'DashboardAdmin';
              break;
            case 'artist':
              screen = 'DashboardArtist';
              break;
            case 'manager':
              screen = 'DashboardManager';
              break;
            default:
              screen = 'Dashboard';
              break;
          }
        }
        
        console.warn('AuthRedirect: Pantalla de destino determinada:', screen);
        setTargetScreen(screen);
        setIsReady(true);
      } catch (error) {
        console.warn('Error al determinar la pantalla de destino:', error);
        setTargetScreen('Home'); // En caso de error, ir a Home
        setIsReady(true);
      }
    };
    
    determineTargetScreen();
  }, [userData]);
  
  // Usar un segundo efecto para manejar la navegación una vez que se ha determinado la pantalla
  useEffect(() => {
    if (!isReady) return; // No hacer nada hasta que se haya determinado la pantalla
    
    // Dar tiempo al sistema para que se estabilice antes de intentar navegar
    // Usar un tiempo más largo en producción
    const delay = !__DEV__ ? 2000 : 500;
    
    const timer = setTimeout(() => {
      try {
        console.warn('AuthRedirect: Navegando a', targetScreen);
        
        // Implementar diferentes estrategias de navegación para desarrollo y producción
        if (!__DEV__) { // En producción
          // Estrategia para producción: navegar primero a Home y luego al destino
          // Esto evita el problema de " exist"
          navigation.navigate('Home');
          
          // Esperar un momento antes de navegar al destino final
          setTimeout(() => {
            // Si el destino es Home, no hacer nada más
            if (targetScreen === 'Home') return;
            
            // Navegar al destino final
            navigation.navigate(targetScreen);
          }, 300);
        } else { // En desarrollo
          // En desarrollo podemos usar CommonActions.reset directamente
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: targetScreen }],
            })
          );
        }
      } catch (error) {
        console.warn('Error en navegación de AuthRedirect:', error);
        // En caso de error, navegar a la pantalla de inicio
        navigation.navigate('Home');
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [navigation, isReady, targetScreen]);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>Redireccionando...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  text: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default AuthRedirect;
