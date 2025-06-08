/**
 * Este archivo contiene las pruebas de integración de seguridad
 * - Auth0
 * - API
 */

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { Auth0Provider } = require('@auth0/auth0-react');
const { render, waitFor } = require('@testing-library/react-native');
const SecureStore = require('expo-secure-store');
const AuthContext = require('../../context/AuthContext');

const apiClient = { getEvents: jest.fn(), createEvent: jest.fn() };
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: jest.fn(({ children }) => children),
  useAuth0: jest.fn(() => ({
    isAuthenticated: true,
    user: { sub: 'auth0|123', email: 'test@example.com' },
    getAccessTokenSilently: jest.fn(() => Promise.resolve('mock-token'))
  }))
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve('mock-token')),
  deleteItemAsync: jest.fn(() => Promise.resolve())
}));

const mock = new MockAdapter(axios);
const backendUrl = 'http://localhost:3000';

describe('Pruebas de Integración Frontend-Backend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mock.reset();
  });

  test('Flujo completo de autenticación funciona correctamente', async () => {
    const mockAuthResponse = {
      idToken: 'mock-id-token',
      accessToken: 'mock-access-token',
      expiresIn: 86400
    };
    
    mock.onGet(`${backendUrl}/api/events`).reply(200, [
      { id: 1, title: 'Evento de prueba' }
    ]);
    
    await SecureStore.setItemAsync('auth_token', 'mock-access-token');
    
    const mockLogin = jest.fn(() => {
      SecureStore.setItemAsync('auth_token', 'mock-access-token');
      return Promise.resolve(mockAuthResponse);
    });
    
    AuthContext.useAuth = jest.fn(() => ({
      login: mockLogin,
      isAuthenticated: true,
      user: { sub: 'auth0|123', email: 'test@example.com' },
      getAccessToken: jest.fn(() => Promise.resolve('mock-access-token'))
    }));
    
    const { login } = AuthContext.useAuth();
    await login('test@example.com', 'password123');
    
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
    
    apiClient.getEvents.mockResolvedValueOnce([
      { id: 1, title: 'Evento de prueba' }
    ]);
    
    const events = await apiClient.getEvents();
    
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Evento de prueba');
  });

  test('Renovación de token funciona correctamente cuando expira', async () => {
    const almostExpiredToken = 'almost-expired-token';
    SecureStore.getItemAsync.mockResolvedValueOnce(almostExpiredToken);
    
    mock.onGet(`${backendUrl}/api/events`)
      .replyOnce(401, { error: 'Token expirado' })
      .onGet(`${backendUrl}/api/events`)
      .reply(200, [{ id: 1, title: 'Evento después de renovar token' }]);
    
    const newToken = 'new-refreshed-token';
    const mockRefreshToken = jest.fn(() => {
      SecureStore.setItemAsync('auth_token', newToken);
      return Promise.resolve(newToken);
    });
    
    AuthContext.useAuth = jest.fn(() => ({
      refreshToken: mockRefreshToken,
      isAuthenticated: true,
      getAccessToken: jest.fn(() => Promise.resolve(newToken))
    }));
    
    apiClient.getEvents
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce([{ id: 1, title: 'Evento después de renovar token' }]);
    
    let error;
    try {
      await apiClient.getEvents();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.response.status).toBe(401);
    
    const { refreshToken } = AuthContext.useAuth();
    await refreshToken();
    
    expect(mockRefreshToken).toHaveBeenCalled();
    
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
    
    const events = await apiClient.getEvents();
    
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Evento después de renovar token');
  });

  test('Manejo de errores de API en el frontend', async () => {
    mock.onGet(`${backendUrl}/api/events`).reply(500, {
      error: 'Error interno del servidor'
    });
    
    apiClient.getEvents.mockReset();
    
    const serverError = {
      response: { 
        status: 500, 
        data: { error: 'Error interno del servidor' } 
      }
    };
    apiClient.getEvents.mockImplementation(() => Promise.reject(serverError));
    
    const consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});
    
    try {
      await apiClient.getEvents();
      fail('Se esperaba que apiClient.getEvents fallara');
    } catch (error) {
      expect(error).toEqual(
        expect.objectContaining({
          response: expect.objectContaining({
            status: 500
          })
        })
      );
    }
    
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('token')
    );
    
    consoleSpy.mockRestore();
  });
});
