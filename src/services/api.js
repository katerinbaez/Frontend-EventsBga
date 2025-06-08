/**
 * Servicios de API con configuración y manejo de autenticación
 * - API
 * - Configuración
 * - Autenticación
 * - Interceptors
 * - Tokens
 * - Solicitudes
 */

import axios from 'axios';
import { BACKEND_URL, REDIRECT_URI } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': REDIRECT_URI
  },
  withCredentials: true
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        config.headers['Authorization'] = token;
        console.warn(`API - Solicitud a ${config.url} con token configurado: ${token.substring(0, 20)}...`);
      } else {
        const globalToken = axios.defaults.headers.common['Authorization'];
        if (globalToken) {
          config.headers['Authorization'] = globalToken;
          console.warn(`API - Usando token global para ${config.url}`);
        } else {
          console.warn(`API - Solicitud a ${config.url} sin token (no disponible)`);
        }
      }
    } catch (error) {
      console.error('API - Error al obtener token:', error);
    }
    return config;
  },
  (error) => {
    console.error('API - Error en interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('API - Error 401: Token expirado o inválido');
    }
    return Promise.reject(error);
  }
);

axios.defaults.baseURL = BACKEND_URL;
axios.defaults.withCredentials = true;

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = token;
    axios.defaults.headers.common['Authorization'] = token;
    
    console.warn('Token configurado en ambas instancias de axios');
    console.warn('Primeros caracteres del token:', token.substring(0, 15) + '...');
    return true;
  } else {
    delete api.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['Authorization'];
    console.warn('Token eliminado de ambas instancias de axios');
    return false;
  }
};

AsyncStorage.getItem('token')
  .then(token => {
    if (token) {
      setAuthToken(token);
    }
  })
  .catch(err => console.error('Error al cargar el token:', err));

export default api;
