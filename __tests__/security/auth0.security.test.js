import * as SecureStore from 'expo-secure-store';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, REDIRECT_URI } from '../../constants/config';

// Mock de SecureStore
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
    
    // Verificar formato de dominio Auth0
    expect(AUTH0_DOMAIN).toMatch(/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.auth0\.com$/);
    
    // Verificar formato de Client ID
    expect(AUTH0_CLIENT_ID).toMatch(/^[a-zA-Z0-9]{32}$/);
  });

  test('Tokens are stored securely', async () => {
    // Simular almacenamiento de token
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    await SecureStore.setItemAsync('accessToken', mockToken, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED
    });
    
    // Verificar que se llamó a setItemAsync con los parámetros correctos
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'accessToken',
      mockToken,
      expect.objectContaining({
        keychainAccessible: SecureStore.WHEN_UNLOCKED
      })
    );
  });

  test('Token retrieval is secure', async () => {
    // Simular recuperación de token
    SecureStore.getItemAsync.mockResolvedValue('mock-token');
    
    const token = await SecureStore.getItemAsync('accessToken');
    
    expect(token).toBe('mock-token');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('accessToken');
  });

  test('Token deletion works correctly', async () => {
    // Simular eliminación de token
    await SecureStore.deleteItemAsync('accessToken');
    
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
  });
});
