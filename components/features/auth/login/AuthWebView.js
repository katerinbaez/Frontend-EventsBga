import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../../../context/AuthContext';
import { navigateAfterLogin } from '../../../navigation/NavigationHandler';
import axios from 'axios';
import { CommonActions } from '@react-navigation/native';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, REDIRECT_URI, BACKEND_URL } from '../../../../constants/config';
import api, { setAuthToken } from '../../../../services/api';

const AuthWebView = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAuth, setProcessingAuth] = useState(false);
  const navigation = useNavigation();
  
  // Función para manejar la autenticación exitosa
  const handleSuccessfulAuthentication = async (params) => {
    // Evitar procesamiento duplicado
    if (processingAuth) return;
    setProcessingAuth(true);
    
    try {
      console.warn('Procesando autenticación exitosa...');
      
      // Verificar que el token exista antes de continuar
      if (!params || !params.access_token) {
        console.error('Error: Token de acceso es undefined o nulo');
        console.warn('Intentando obtener token de respuesta del backend...');
        
        // Continuar con el flujo de autenticación sin el token
        // El token se obtendrá de la respuesta del backend
      } else {
        // Configurar el token en axios y en la instancia api
        console.warn('Configurando token de autenticación...');
        
        try {
          // Guardar el token en AsyncStorage para que persista
          await AsyncStorage.setItem('token', params.access_token);
          console.warn('Token guardado en AsyncStorage');
        } catch (storageError) {
          console.error('Error guardando token en AsyncStorage:', storageError);
          // Continuar a pesar del error
        }
      }
      
      // Configurar el token en ambas instancias de axios
      setAuthToken(params.access_token);
      
      // Verificar que el token se haya configurado correctamente
      console.warn('Headers de axios después de configurar:', 
        axios.defaults.headers.common['Authorization'] ? 
        'Token configurado correctamente' : 'Token NO configurado');
      
      // Obtener información del usuario desde Auth0
      console.warn('Obteniendo información del usuario desde Auth0...');
      const userInfoResponse = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${params.access_token}`
        }
      });
      console.warn('Información de usuario obtenida:', userInfoResponse.data.email);
      
      // Crear configuración explícita para la solicitud con el token en el encabezado
      const requestConfig = {
        headers: {
          'Authorization': `Bearer ${params.access_token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.warn('Enviando información al backend:', BACKEND_URL);
      console.warn('Enviando solicitud al backend con headers:', JSON.stringify(requestConfig.headers));
      
      // Usar la instancia api para la solicitud al backend con la configuración explícita
      const loginResponse = await api.post(`${BACKEND_URL}/auth/login`, {
        sub: userInfoResponse.data.sub,
        email: userInfoResponse.data.email,
        name: userInfoResponse.data.name,
        picture: userInfoResponse.data.picture
      }, requestConfig);
      
      console.warn('Respuesta del backend recibida');
      console.warn('Datos completos de la respuesta:', JSON.stringify(loginResponse.data));
      console.warn('¿La respuesta incluye token?', loginResponse.data.token ? 'Sí' : 'No');
      const userData = loginResponse.data.user;
      
      // Asegurarnos de guardar el token nuevamente después de la respuesta del backend
      // Esto es crucial para asegurar que el token esté disponible para futuras solicitudes
      try {
        // IMPORTANTE: Usar el token de Auth0 directamente, ya que el backend espera un token JWT firmado con RS256 emitido por Auth0
        // El backend necesita validar este token, no generar uno propio
        const tokenToStore = params.access_token;
        
        if (tokenToStore) {
          console.warn('Guardando token de Auth0');
          await AsyncStorage.setItem('token', tokenToStore);
          
          // Actualizar el token en las instancias de axios
          setAuthToken(tokenToStore);
          
          console.warn('Token actualizado y guardado correctamente');
        } else {
          console.error('No se pudo obtener un token válido ni de Auth0 ni del backend');
        }
      } catch (tokenError) {
        console.error('Error guardando token después de la respuesta del backend:', tokenError);
      }
      
      // IMPORTANTE: Usar el token de Auth0 directamente, ya que el backend espera un token JWT firmado con RS256
      const finalToken = params.access_token;
      
      if (!finalToken) {
        console.error('Error crítico: No hay token disponible para la autenticación');
        setError('Error de autenticación: No se pudo obtener un token válido');
        setLoading(false);
        setProcessingAuth(false);
        return;
      }
      
      console.warn('Actualizando estado de autenticación...');
      
      // Procesar la autenticación exitosa
      const processSuccessfulAuth = async (userData, finalToken) => {
        try {
          setProcessingAuth(true);
          console.warn('[AUTH-INFO] Procesando autenticación exitosa...');
          
          // Ya no necesitamos guardar datos en AsyncStorage aquí
          // El AuthContext se encargará de eso de manera más robusta
          
          // Actualizar el estado global de autenticación
          // El AuthContext ahora maneja esto con retrasos adecuados para evitar problemas de timing
          console.warn('[AUTH-INFO] Llamando a onSuccess para actualizar estado de autenticación...');
          
          // Esperar a que el AuthContext complete el proceso de autenticación
          await onSuccess(userData, finalToken);
          
          console.warn('[AUTH-INFO] Estado de autenticación actualizado correctamente');
          console.warn('[AUTH-INFO] Autenticación completada, la navegación automática se encargará del resto');
          
          // Esperar un momento adicional para asegurar que todos los cambios de estado se hayan propagado
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Error procesando autenticación:', error);
          setError(`Error de autenticación: ${error.message}`);
        } finally {
          // Retrasar ligeramente la actualización de estos estados para evitar problemas de timing
          setTimeout(() => {
            setLoading(false);
            setProcessingAuth(false);
          }, 500);
        }
      };
      
      processSuccessfulAuth(userData, finalToken);
    } catch (error) {
      console.error('Error procesando autenticación:', error);
      setError(`Error de autenticación: ${error.message}`);
    } finally {
      setLoading(false);
      setProcessingAuth(false);
    }
  };

  // Construir la URL de autenticación
  const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
    `response_type=token` +
    `&client_id=${AUTH0_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=openid%20profile%20email` +
    `&audience=${encodeURIComponent(`https://${AUTH0_DOMAIN}/api/v2/`)}` +
    `&prompt=login`;
  
  // Manejar el botón de retroceso en Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    
    return () => backHandler.remove();
  }, [onCancel]);

  // Función para procesar la URL de autenticación y extraer los parámetros
  const processAuthUrl = (url) => {
    console.warn('Procesando URL de autenticación:', url);
    console.warn('REDIRECT_URI configurado:', REDIRECT_URI);
    
    try {
      // Caso 1: URL con esquema myapp://auth (producción) o exp:// (desarrollo)
      if (url.startsWith('myapp://auth') || url.startsWith('exp://')) {
        console.warn('Detectado esquema de redirección:', url.startsWith('myapp://auth') ? 'myapp://auth' : 'exp://');
        
        // Extraer los parámetros de la query string
        const queryParams = {};
        
        // Si hay parámetros en la URL
        if (url.includes('?')) {
          const queryString = url.split('?')[1];
          queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value) {
              queryParams[key] = decodeURIComponent(value);
            }
          });
          
          console.warn('Parámetros extraídos de query:', Object.keys(queryParams).join(', '));
          
          // Si hay un token en los parámetros de la query
          if (queryParams.access_token) {
            console.warn('Token encontrado en query params de URL de redirección');
            return queryParams;
          }
        }
        
        // Si hay un fragmento (#) en la URL
        if (url.includes('#')) {
          const fragment = url.split('#').pop();
          console.warn('Fragmento extraído de URL de redirección:', fragment);
          
          const fragmentParams = {};
          fragment.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value) {
              fragmentParams[key] = decodeURIComponent(value);
            }
          });
          
          console.warn('Parámetros extraídos de fragmento:', Object.keys(fragmentParams).join(', '));
          
          if (fragmentParams.access_token) {
            console.warn('Token encontrado en fragmento de URL de redirección');
            return fragmentParams;
          }
        }
      }
      
      // Caso 2: URL normal con fragmento (#)
      if (url.includes('#')) {
        // Extraer el fragmento
        const fragment = url.split('#').pop();
        console.warn('Fragmento extraído:', fragment);
        
        // Convertir el fragmento en un objeto de parámetros
        const params = {};
        fragment.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            params[key] = decodeURIComponent(value);
          }
        });
        
        console.warn('Parámetros extraídos:', Object.keys(params).join(', '));
        return params;
      }
      
      // Caso 3: URL con parámetros en query string
      if (url.includes('?') && url.includes('access_token=')) {
        const queryString = url.split('?')[1];
        const params = {};
        queryString.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            params[key] = decodeURIComponent(value);
          }
        });
        
        console.warn('Parámetros extraídos de query string:', Object.keys(params).join(', '));
        return params;
      }
      
      console.warn('No se encontró token en la URL');
      return null;
    } catch (error) {
      console.error('Error procesando URL de autenticación:', error);
      return null;
    }
  };

  // Función para manejar la navegación dentro del WebView
  const handleNavigationStateChange = (navState) => {
    console.warn('=== NAVEGACIÓN WEBVIEW ===');
    console.warn('URL:', navState.url);
    console.warn('Título:', navState.title);
    console.warn('Cargando:', navState.loading ? 'Sí' : 'No');
    console.warn('Puede retroceder:', navState.canGoBack ? 'Sí' : 'No');
    console.warn('Puede avanzar:', navState.canGoForward ? 'Sí' : 'No');
    
    // Log completo para depuración
    console.warn('Estado completo de navegación:', JSON.stringify(navState));
    
    // Verificar si estamos en la página de Auth0 y se ha completado la autenticación
    if (navState.url.includes('auth0.com') && navState.title && navState.title.includes('Success')) {
      console.warn('Detección de página de éxito de Auth0');
      // Intentar extraer el token de la URL o del título
      const params = processAuthUrl(navState.url);
      if (params && params.access_token) {
        console.warn('Token encontrado en la URL de éxito');
        handleSuccessfulAuthentication(params);
        return;
      }
    }

    // Verificar si la URL contiene el token de acceso (redirección exitosa) o es nuestro esquema de deep link
    if (navState.url.includes('access_token=') || navState.url.startsWith(REDIRECT_URI) || navState.url.startsWith('myapp://auth')) {
      console.warn('Redirección detectada:', navState.url);
      console.warn('Verificando si contiene access_token:', navState.url.includes('access_token='));
      console.warn('Verificando si empieza con REDIRECT_URI:', navState.url.startsWith(REDIRECT_URI));
      console.warn('Verificando si empieza con myapp://auth:', navState.url.startsWith('myapp://auth'));
      
      try {
        // Procesar la URL para extraer los parámetros
        const params = processAuthUrl(navState.url);
        console.warn('Parámetros extraídos:', params ? JSON.stringify(params) : 'null');
        
        if (params && params.access_token) {
          console.warn('Token obtenido correctamente:', params.access_token.substring(0, 10) + '...');
          console.warn('Longitud del token:', params.access_token.length);
          
          // Llamar a la función que maneja la autenticación exitosa
          handleSuccessfulAuthentication(params);
        } else {
          console.warn('No se encontró token en la URL');
          console.warn('Parámetros disponibles:', params ? Object.keys(params).join(', ') : 'ninguno');
          
          // Si estamos en la URL de redirección pero no tenemos token, podría ser un error
          if (navState.url.includes('error=')) {
            const errorMsg = navState.url.match(/error_description=([^&]+)/);
            setError(errorMsg ? decodeURIComponent(errorMsg[1]) : 'Error de autenticación');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error procesando redirección:', error);
        setError(`Error procesando redirección: ${error.message}`);
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorButton} onPress={onCancel}>Volver</Text>
        </View>
      )}
      
      <WebView
        source={{ uri: authUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoad={() => setLoading(false)}
        onError={(e) => {
          console.error('Error en WebView:', e);
          setError(`Error cargando la página: ${e.nativeEvent.description}`);
          setLoading(false);
        }}
        injectedJavaScript={`
          (function() {
            // Interceptar la función pushState y replaceState para detectar cambios en la URL
            const pushState = window.history.pushState;
            const replaceState = window.history.replaceState;
            
            window.history.pushState = function() {
              window.ReactNativeWebView.postMessage('pushState:' + arguments[2]);
              return pushState.apply(window.history, arguments);
            };
            
            window.history.replaceState = function() {
              window.ReactNativeWebView.postMessage('replaceState:' + arguments[2]);
              return replaceState.apply(window.history, arguments);
            };
            
            // Interceptar todos los enlaces
            document.addEventListener('click', function(e) {
              var target = e.target;
              while (target && target.tagName !== 'A') {
                target = target.parentNode;
              }
              if (target && target.tagName === 'A') {
                window.ReactNativeWebView.postMessage('link:' + target.href);
              }
            }, true);
            
            // Monitorear cambios en la URL
            setInterval(function() {
              window.ReactNativeWebView.postMessage('location:' + window.location.href);
            }, 1000);
            
            true;
          })();
        `}
        onMessage={(event) => {
          const message = event.nativeEvent.data;
          console.warn('Mensaje del WebView:', message);
          
          // Extraer el tipo de mensaje y el contenido
          const [type, content] = message.includes(':') ? 
            [message.substring(0, message.indexOf(':')), message.substring(message.indexOf(':') + 1)] :
            ['unknown', message];
          
          switch(type) {
            case 'redirect':
              console.warn('Redirección detectada en WebView:', content);
              if (content.includes('access_token=') || content.startsWith(REDIRECT_URI)) {
                handleNavigationStateChange({ url: content });
              }
              break;
              
            case 'log':
              console.warn('Log del WebView:', content);
              break;
              
            case 'loaded':
              console.warn('Página cargada:', content);
              break;
              
            case 'location':
              // Verificar si la URL contiene el token de acceso
              if (content.includes('access_token=') || content.startsWith(REDIRECT_URI)) {
                console.warn('Token detectado en cambio de location:', content);
                handleNavigationStateChange({ url: content });
              }
              break;
              
            case 'pushState':
            case 'replaceState':
              // Verificar si la URL contiene el token de acceso
              if (content.includes('access_token=') || content.startsWith(REDIRECT_URI)) {
                console.warn('Token detectado en cambio de estado:', content);
                handleNavigationStateChange({ url: content });
              }
              break;
              
            case 'link':
              console.warn('Enlace clickeado:', content);
              break;
              
            default:
              console.warn('Mensaje desconocido del WebView:', message);
              break;
          }
        }}
        startInLoadingState={true}
        scalesPageToFit={true}
        incognito={false}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        domStorageEnabled={true}
        javaScriptEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    color: '#3498db',
    fontSize: 16,
    padding: 10,
  },
});

export default AuthWebView;
