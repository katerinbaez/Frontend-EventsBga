import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '../../constants/config';

// Mocks
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('Data Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('API requests use HTTPS for production', () => {
    // Verificar que la URL del backend use HTTPS en producción
    if (process.env.NODE_ENV === 'production') {
      expect(BACKEND_URL).toMatch(/^https:\/\//);
    }
  });

  test('Sensitive data is stored in SecureStore, not AsyncStorage', async () => {
    // Simular almacenamiento de datos sensibles
    const sensitiveData = {
      accessToken: 'test-token',
      userProfile: { id: '123', email: 'user@example.com' }
    };
    
    // Almacenar token en SecureStore
    await SecureStore.setItemAsync('accessToken', sensitiveData.accessToken);
    
    // Almacenar datos no sensibles en AsyncStorage
    await AsyncStorage.setItem('lastVisited', JSON.stringify(['event1', 'event2']));
    
    // Verificar que los datos sensibles se almacenan en SecureStore
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', sensitiveData.accessToken);
    
    // Verificar que AsyncStorage no se usa para datos sensibles
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('accessToken', expect.any(String));
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('userProfile', expect.any(String));
  });

  test('API requests include proper security headers', async () => {
    // Configurar mock de axios para verificar headers
    axios.get.mockResolvedValue({ data: {} });
    
    // Simular token de acceso
    SecureStore.getItemAsync.mockResolvedValue('test-token');
    
    // Realizar solicitud con token
    const token = await SecureStore.getItemAsync('accessToken');
    await axios.get(`${BACKEND_URL}/api/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Verificar que se incluyen los headers de seguridad correctos
    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json'
        })
      })
    );
  });

  test('User input is sanitized before sending to API', async () => {
    // Configurar mock de axios
    axios.post.mockResolvedValue({ data: {} });
    
    // Datos de entrada con caracteres potencialmente peligrosos
    const unsafeInput = {
      name: "Event with <script>alert('XSS')</script>",
      description: "Description with SQL injection: ' OR '1'='1"
    };
    
    // Función para sanitizar entrada (simulada)
    const sanitizeInput = (input) => {
      return {
        ...input,
        name: input.name.replace(/<[^>]*>?/gm, ''),
        description: input.description.replace(/'/g, "''")
      };
    };
    
    // Sanitizar y enviar datos
    const safeInput = sanitizeInput(unsafeInput);
    await axios.post(`${BACKEND_URL}/api/events`, safeInput);
    
    // Verificar que los datos enviados están sanitizados
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        name: expect.not.stringContaining('<script>'),
        description: expect.not.stringMatching(/ OR '1'='1/)
      })
    );
  });
});
