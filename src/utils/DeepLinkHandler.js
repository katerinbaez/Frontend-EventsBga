/**
 * Manejador de deep links para autenticación y navegación
 * - Deep Links
 * - Autenticación
 * - Navegación
 * - URLs
 * - Tokens
 */

import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { REDIRECT_URI } from '../constants/config';

export const handleDeepLink = (url) => {
  console.warn('Deep link recibido:', url);
  
  if (url) {
    if (url.startsWith('myapp://auth')) {
      console.warn('Deep link de autenticación en producción detectado');
      return url;
    }
    
    if (url.startsWith('exp://') && url.includes('auth')) {
      console.warn('Deep link de autenticación en desarrollo detectado');
      return url;
    }
    
    if (url.includes('access_token=')) {
      console.warn('URL con token de acceso detectada');
      return url;
    }
  }
  
  return null;
};

export const useDeepLinks = (callback) => {
  useEffect(() => {
    const handleOpenURL = ({ url }) => {
      console.warn('URL recibida mientras la app está abierta:', url);
      const result = handleDeepLink(url);
      if (result && callback) {
        callback(result);
      }
    };

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

    const subscription = Linking.addEventListener('url', handleOpenURL);
    
    getInitialURL();

    WebBrowser.maybeCompleteAuthSession();

    return () => {
      subscription.remove();
    };
  }, [callback]);
};

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
