import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { REDIRECT_URI } from '../constants/config';

// Función para manejar los deep links en la aplicación
export const handleDeepLink = (url) => {
  console.warn('Deep link recibido:', url);
  
  // Verificar si es un deep link de autenticación
  if (url) {
    // Caso 1: Esquema myapp://auth (producción)
    if (url.startsWith('myapp://auth')) {
      console.warn('Deep link de autenticación en producción detectado');
      return url;
    }
    
    // Caso 2: Esquema exp:// (desarrollo)
    if (url.startsWith('exp://') && url.includes('auth')) {
      console.warn('Deep link de autenticación en desarrollo detectado');
      return url;
    }
    
    // Caso 3: URL con fragmento de autenticación
    if (url.includes('access_token=')) {
      console.warn('URL con token de acceso detectada');
      return url;
    }
  }
  
  return null;
};

// Hook personalizado para configurar los listeners de deep links
export const useDeepLinks = (callback) => {
  useEffect(() => {
    // Función para manejar los deep links cuando la app está abierta
    const handleOpenURL = ({ url }) => {
      console.warn('URL recibida mientras la app está abierta:', url);
      const result = handleDeepLink(url);
      if (result && callback) {
        callback(result);
      }
    };

    // Verificar si la app fue abierta con un deep link
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.warn('App abierta con URL inicial:', initialUrl);
        const result = handleDeepLink(initialUrl);
        if (result && callback) {
          callback(result);
        }
      }
    };

    // Configurar el listener para deep links
    const subscription = Linking.addEventListener('url', handleOpenURL);
    
    // Verificar URL inicial
    getInitialURL();

    // Asegurarse de que WebBrowser pueda completar las sesiones de autenticación
    WebBrowser.maybeCompleteAuthSession();

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      subscription.remove();
    };
  }, [callback]);
};

// Función para probar si el esquema de deep linking está configurado correctamente
export const testDeepLinking = async () => {
  try {
    console.warn('Probando configuración de deep linking...');
    console.warn('URI de redirección configurado:', REDIRECT_URI);
    
    const canOpen = await Linking.canOpenURL(REDIRECT_URI);
    console.warn('¿Puede abrir el URI de redirección?', canOpen);
    
    return canOpen;
  } catch (error) {
    console.error('Error al probar deep linking:', error);
    return false;
  }
};
