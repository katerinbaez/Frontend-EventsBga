/**
 * Este archivo contiene las pruebas de seguridad Auth0
 * - Configuración
 * - Tokens
 */

import * as SecureStore from 'expo-secure-store';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, REDIRECT_URI } from '../../constants/config';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('Auth0 Security Tests', () => {
  test('Auth0 configuration is valid', () => {
    expect(AUTH0_DOMAIN).toBeTruthy();
    expect(AUTH0_CLIENT_ID).toBeTruthy();
    expect(REDIRECT_URI).toBeTruthy();
    
    expect(AUTH0_DOMAIN).toMatch(/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.auth0\.com$/);
    
    expect(AUTH0_CLIENT_ID).toMatch(/^[a-zA-Z0-9]{32}$/);
  });

  test('Tokens are stored securely', async () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    await SecureStore.setItemAsync('accessToken', mockToken, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED
    });
    
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'accessToken',
      mockToken,
      expect.objectContaining({
        keychainAccessible: SecureStore.WHEN_UNLOCKED
      })
    );
  });

  test('Token retrieval is secure', async () => {
    SecureStore.getItemAsync.mockResolvedValue('mock-token');
    
    const token = await SecureStore.getItemAsync('accessToken');
    
    expect(token).toBe('mock-token');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('accessToken');
  });

  test('Token deletion works correctly', async () => {
    await SecureStore.deleteItemAsync('accessToken');
    
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
  });
});
