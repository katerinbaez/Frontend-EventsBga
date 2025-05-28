import React, { createContext, useContext, useState, useEffect } from 'react';
import { CommonActions } from '@react-navigation/native';
import FallbackScreen from '../ui/FallbackScreen';

// Contexto para el estado de navegación
const NavigationReadyContext = createContext({
  isNavigationReady: false,
  setNavigationReady: () => {}
});

/**
 * Hook para acceder al contexto de navegación lista
 * @returns {object} El contexto de navegación lista
 */
export const useNavigationReadyContext = () => useContext(NavigationReadyContext);

/**
 * Función centralizada para la navegación después del login
 * Esta función maneja de forma segura la navegación post-autenticación
 * para evitar el error "This screen doesn't exist"
 * 
 * @param {object} navigation - Objeto de navegación
 * @param {string} targetScreen - Pantalla de destino
 * @param {object} params - Parámetros para la navegación
 */
export const navigateAfterLogin = (navigation, targetScreen, params = {}) => {
  if (!navigation) {
    console.error('Error: navigation es undefined');
    return;
  }

  // Obtener el contexto de navegación lista
  const { isNavigationReady } = useNavigationReadyContext();
  
  if (isNavigationReady) {
    // Si la navegación está lista, usar reset para una experiencia más fluida
    try {
      console.warn('Navegación lista, usando reset para ir a:', targetScreen);
      navigation.dispatch(
        CommonActions.reset({
          index: 1, // Establecer el índice en 1 para que el dashboard sea la pantalla activa
          routes: [
            { name: 'Home' },
            { name: targetScreen, params }
          ],
        })
      );
    } catch (error) {
      console.error('Error en navegación con reset:', error);
      // Intentar navegación simple como respaldo
      navigation.navigate(targetScreen, params);
    }
  } else {
    // Si la navegación no está lista, usar el enfoque de dos fases
    console.warn('Navegación no lista, usando enfoque de dos fases');
    // Primero navegar a Home (que siempre existe)
    navigation.navigate('Home');
    
    // Luego navegar al destino final después de un tiempo
    setTimeout(() => {
      navigation.navigate(targetScreen, params);
    }, 1000); // 1000ms es un valor conservador para asegurar que la navegación esté lista
  }
};

/**
 * Configuración de linking para la aplicación
 * Esta configuración puede ser importada y utilizada en el NavigationContainer principal
 */
export const linkingConfig = {
  prefixes: ['myapp://', 'https://eventsbga.com'],
  config: {
    screens: {
      // Pantallas principales
      Home: 'home',
      Login: 'login',
      Dashboard: 'dashboard',
      DashboardAdmin: 'dashboardAdmin',
      DashboardArtist: 'dashboardArtist',
      DashboardManager: 'dashboardManager',
      
      // Pantallas de artistas
      ArtistRegistration: 'artistRegistration',
      ArtistProfile: 'artistProfile',
      ArtistPortfolio: 'artistPortfolio',
      
      // Pantallas de espacios
      CulturalSpace: 'culturalSpace',
      SpaceSchedule: 'spaceSchedule',
      ManagerRegistration: 'managerRegistration',
      
      // Pantallas de eventos
      EventCalendar: 'eventCalendar',
      EventSearch: 'eventSearch',
      EventDetail: 'eventDetail',
      EventProgramming: 'eventProgramming',
      EventAttendance: 'eventAttendance',
      ManageEvents: 'manageEvents',
      
      // Pantallas de notificaciones y favoritos
      NotificationCenter: 'notificationCenter',
      FavoritesScreen: 'favorites',
      
      // Pantallas de solicitudes
      RoleRequestForm: 'roleRequestForm',
      ViewRoleRequests: 'viewRoleRequests',
      
      // Pantallas de administración
      AdminMetrics: 'adminMetrics',
      UserManagement: 'userManagement',
      
      // Pantalla de respaldo para rutas no manejadas
      FallbackScreen: '*',
    },
  },
};

/**
 * Hook para configurar el NavigationContainer raíz de Expo
 * @returns {object} Configuración para el NavigationContainer raíz
 */
export const useNavigationConfig = () => {
  // Estado para controlar si la navegación está lista
  const [isNavigationReady, setNavigationReady] = useState(false);
  
  // Manejar el evento onReady del NavigationContainer
  const handleNavigationReady = () => {
    console.warn('NavigationContainer raíz está listo');
    // Actualizar el estado de navegación lista
    setNavigationReady(true);
  };
  
  // Devolver la configuración para el NavigationContainer raíz
  return {
    linking: linkingConfig,
    onReady: handleNavigationReady,
    fallback: <FallbackScreen />,
    // Proporcionar el contexto de navegación lista
    navigationReadyContext: { isNavigationReady, setNavigationReady }
  };
};

/**
 * Componente de utilidad para proporcionar el contexto de navegación lista
 * y configurar el NavigationContainer raíz
 */
const NavigationHandler = ({ children }) => {
  // Estado para controlar si la navegación está lista
  const [isNavigationReady, setNavigationReady] = useState(false);
  
  // Configurar el NavigationContainer raíz de Expo en useEffect
  useEffect(() => {
    // Acceder al NavigationContainer raíz de Expo
    const rootNavigationRef = global.rootNavigation;
    
    // Si existe, configurarlo
    if (rootNavigationRef) {
      // Configurar el linking
      rootNavigationRef.setLinking(linkingConfig);
      
      // Configurar el evento onReady
      const unsubscribe = rootNavigationRef.addListener('state', () => {
        // Actualizar el estado de navegación lista
        setNavigationReady(true);
        console.warn('NavigationContainer raíz está listo (desde NavigationHandler)');
        
        // Eliminar el listener después de la primera vez
        unsubscribe();
      });
      
      // Limpiar al desmontar
      return () => {
        unsubscribe();
      };
    }
  }, []);
  
  // Proporcionar el contexto de navegación lista a los componentes hijos
  return (
    <NavigationReadyContext.Provider value={{ isNavigationReady, setNavigationReady }}>
      {children}
    </NavigationReadyContext.Provider>
  );
};

export default NavigationHandler;
