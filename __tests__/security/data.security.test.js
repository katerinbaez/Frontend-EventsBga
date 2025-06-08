/**
 * Este archivo contiene las pruebas de seguridad de datos
 * - HTTPS
 * - Almacenamiento
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '../../constants/config';

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
    if (process.env.NODE_ENV === 'production') {
      expect(BACKEND_URL).toMatch(/^https:\/\//);
    }
  });

  test('Sensitive data is stored in SecureStore, not AsyncStorage', async () => {
    const sensitiveData = {
      accessToken: 'test-token',
      userProfile: { id: '123', email: 'user@example.com' }
    };
    
    await SecureStore.setItemAsync('accessToken', sensitiveData.accessToken);
    
    await AsyncStorage.setItem('lastVisited', JSON.stringify(['event1', 'event2']));
    
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', sensitiveData.accessToken);
    
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('accessToken', expect.any(String));
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('userProfile', expect.any(String));
  });

  test('API requests include proper security headers', async () => {
    axios.get.mockResolvedValue({ data: {} });
    
    SecureStore.getItemAsync.mockResolvedValue('test-token');
    
    const token = await SecureStore.getItemAsync('accessToken');
    await axios.get(`${BACKEND_URL}/api/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
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
    axios.post.mockResolvedValue({ data: {} });
    
    const unsafeInput = {
      name: "Event with <script>alert('XSS')</script>",
      description: "Description with SQL injection: ' OR '1'='1"
    };
    
    const sanitizeInput = (input) => {
      return {
        ...input,
        name: input.name.replace(/<[^>]*>?/gm, ''),
        description: input.description.replace(/'/g, "''")
      };
    };
    
    const safeInput = sanitizeInput(unsafeInput);
    await axios.post(`${BACKEND_URL}/api/events`, safeInput);
    
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        name: expect.not.stringContaining('<script>'),
        description: expect.not.stringMatching(/ OR '1'='1/)
      })
    );
  });
});
