import axios from 'axios';
import { BACKEND_URL, REDIRECT_URI } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crear una instancia de axios con la URL base
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': REDIRECT_URI
  },
  // Asegurar que las credenciales (cookies) se envíen con las solicitudes
  withCredentials: true
});

// Interceptor para agregar el token a todas las solicitudes
api.interceptors.request.use(
  async (config) => {
    try {
      // Obtener el token de AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        // El backend espera un token JWT firmado con RS256 emitido por Auth0
        // Enviamos el token tal cual, sin agregar el prefijo Bearer
        config.headers['Authorization'] = token;
        console.warn(`API - Solicitud a ${config.url} con token configurado: ${token.substring(0, 20)}...`);
      } else {
        // Intentar obtener el token de los headers globales como respaldo
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

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      console.warn('API - Error 401: Token expirado o inválido');
      // Aquí podrías implementar un refresh token o redirigir al login
    }
    return Promise.reject(error);
  }
);

// Configurar axios global para usar la misma configuración que nuestra instancia api
// Esto es importante porque muchos componentes usan axios directamente en lugar de nuestra instancia api
axios.defaults.baseURL = BACKEND_URL;
axios.defaults.withCredentials = true;

// Función para configurar el token en ambas instancias de axios (global y api)
export const setAuthToken = (token) => {
  if (token) {
    // El backend espera un token JWT firmado con RS256 emitido por Auth0
    // Enviamos el token tal cual, sin agregar el prefijo Bearer
    
    // Configurar en la instancia api
    api.defaults.headers.common['Authorization'] = token;
    // Configurar en axios global
    axios.defaults.headers.common['Authorization'] = token;
    
    console.warn('Token configurado en ambas instancias de axios');
    console.warn('Primeros caracteres del token:', token.substring(0, 15) + '...');
    return true;
  } else {
    // Eliminar el token si no se proporciona
    delete api.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['Authorization'];
    console.warn('Token eliminado de ambas instancias de axios');
    return false;
  }
};

// Cargar el token al iniciar la aplicación
AsyncStorage.getItem('token')
  .then(token => {
    if (token) {
      setAuthToken(token);
    }
  })
  .catch(err => console.error('Error al cargar el token:', err));

export default api;
