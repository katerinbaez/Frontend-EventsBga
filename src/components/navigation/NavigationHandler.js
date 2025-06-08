/**
 * Este archivo maneja la navegación y configuración de rutas de la aplicación
 * - Contexto de navegación lista
 * - Funcionalidad de navegación post-login
 * - Configuración de linking para deep linking
 * - Manejo del estado del NavigationContainer
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CommonActions } from '@react-navigation/native';
import FallbackScreen from '../ui/FallbackScreen';

const NavigationReadyContext = createContext({
  isNavigationReady: false,
  setNavigationReady: () => {}
});

export const useNavigationReadyContext = () => useContext(NavigationReadyContext);


export const navigateAfterLogin = (navigation, targetScreen, params = {}) => {
  if (!navigation) {
    console.error('Error: navigation es undefined');
    return;
  }

  const { isNavigationReady } = useNavigationReadyContext();
  
  if (isNavigationReady) {
    try {
      console.warn('Navegación lista, usando reset para ir a:', targetScreen);
      navigation.dispatch(
        CommonActions.reset({
          index: 1, 
          routes: [
            { name: 'Home' },
            { name: targetScreen, params }
          ],
        })
      );
    } catch (error) {
      console.error('Error en navegación con reset:', error);
      navigation.navigate(targetScreen, params);
    }
  } else {
    console.warn('Navegación no lista, usando enfoque de dos fases');
    navigation.navigate('Home');
    
    setTimeout(() => {
      navigation.navigate(targetScreen, params);
    }, 1000); 
  }
};

export const linkingConfig = {
  prefixes: ['myapp://', 'https://eventsbga.com'],
  config: {
    screens: {
      Home: 'home',
      Login: 'login',
      Dashboard: 'dashboard',
      DashboardAdmin: 'dashboardAdmin',
      DashboardArtist: 'dashboardArtist',
      DashboardManager: 'dashboardManager',

      ArtistRegistration: 'artistRegistration',
      ArtistProfile: 'artistProfile',
      ArtistPortfolio: 'artistPortfolio',
      
      
      CulturalSpace: 'culturalSpace',
      SpaceSchedule: 'spaceSchedule',
      ManagerRegistration: 'managerRegistration',
      
    
      EventCalendar: 'eventCalendar',
      EventSearch: 'eventSearch',
      EventDetail: 'eventDetail',
      EventProgramming: 'eventProgramming',
      EventAttendance: 'eventAttendance',
      ManageEvents: 'manageEvents',
      
      NotificationCenter: 'notificationCenter',
      FavoritesScreen: 'favorites',
      
      RoleRequestForm: 'roleRequestForm',
      ViewRoleRequests: 'viewRoleRequests',
      
      AdminMetrics: 'adminMetrics',
      UserManagement: 'userManagement',
      
      FallbackScreen: '*',
    },
  },
};

export const useNavigationConfig = () => {
  const [isNavigationReady, setNavigationReady] = useState(false);
  
  const handleNavigationReady = () => {
    console.warn('NavigationContainer raíz está listo');
    setNavigationReady(true);
  };
  
  return {
    linking: linkingConfig,
    onReady: handleNavigationReady,
    fallback: <FallbackScreen />,
    navigationReadyContext: { isNavigationReady, setNavigationReady }
  };
};

const NavigationHandler = ({ children }) => {
  const [isNavigationReady, setNavigationReady] = useState(false);
  
  useEffect(() => {
    const rootNavigationRef = global.rootNavigation;
    
    if (rootNavigationRef) {
      rootNavigationRef.setLinking(linkingConfig);
      
      const unsubscribe = rootNavigationRef.addListener('state', () => {
        setNavigationReady(true);
        console.warn('NavigationContainer raíz está listo (desde NavigationHandler)');
        
        unsubscribe();
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, []);
  
  return (
    <NavigationReadyContext.Provider value={{ isNavigationReady, setNavigationReady }}>
      {children}
    </NavigationReadyContext.Provider>
  );
};

export default NavigationHandler;
