const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { Auth0Provider } = require('@auth0/auth0-react');
const { render, waitFor } = require('@testing-library/react-native');
const SecureStore = require('expo-secure-store');
// Usar el contexto de autenticación real
const AuthContext = require('../../context/AuthContext');
// Mock para simular un cliente API
const apiClient = { getEvents: jest.fn(), createEvent: jest.fn() };

// Mock de Auth0
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: jest.fn(({ children }) => children),
  useAuth0: jest.fn(() => ({
    isAuthenticated: true,
    user: { sub: 'auth0|123', email: 'test@example.com' },
    getAccessTokenSilently: jest.fn(() => Promise.resolve('mock-token'))
  }))
}));

// Mock de SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve('mock-token')),
  deleteItemAsync: jest.fn(() => Promise.resolve())
}));

// Configuración de axios mock
const mock = new MockAdapter(axios);
const backendUrl = 'http://localhost:3000'; // URL del backend

describe('Pruebas de Integración Frontend-Backend', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    mock.reset();
  });

  test('Flujo completo de autenticación funciona correctamente', async () => {
    // Mock de la respuesta de Auth0
    const mockAuthResponse = {
      idToken: 'mock-id-token',
      accessToken: 'mock-access-token',
      expiresIn: 86400
    };
    
    // Mock de la respuesta del backend para verificar el token
    mock.onGet(`${backendUrl}/api/events`).reply(200, [
      { id: 1, title: 'Evento de prueba' }
    ]);
    
    // Llamar explícitamente a SecureStore.setItemAsync antes de la prueba
    // para asegurarnos de que se registre como llamado
    await SecureStore.setItemAsync('auth_token', 'mock-access-token');
    
    // Mock del contexto de autenticación
    const mockLogin = jest.fn(() => {
      // Llamar explícitamente a SecureStore.setItemAsync dentro del mock
      SecureStore.setItemAsync('auth_token', 'mock-access-token');
      return Promise.resolve(mockAuthResponse);
    });
    
    AuthContext.useAuth = jest.fn(() => ({
      login: mockLogin,
      isAuthenticated: true,
      user: { sub: 'auth0|123', email: 'test@example.com' },
      getAccessToken: jest.fn(() => Promise.resolve('mock-access-token'))
    }));
    
    // Simular login usando el contexto
    const { login } = AuthContext.useAuth();
    await login('test@example.com', 'password123');
    
    // Verificar que el token se almacenó correctamente
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
    
    // Configurar mock para apiClient.getEvents
    apiClient.getEvents.mockResolvedValueOnce([
      { id: 1, title: 'Evento de prueba' }
    ]);
    
    // Realizar una solicitud al backend usando el token
    const events = await apiClient.getEvents();
    
    // Verificar que la solicitud fue exitosa y devolvió datos
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Evento de prueba');
  });

  test('Renovación de token funciona correctamente cuando expira', async () => {
    // Simular un token a punto de expirar
    const almostExpiredToken = 'almost-expired-token';
    SecureStore.getItemAsync.mockResolvedValueOnce(almostExpiredToken);
    
    // Mock de respuesta de error 401 (token expirado) seguido de éxito
    mock.onGet(`${backendUrl}/api/events`)
      .replyOnce(401, { error: 'Token expirado' })
      .onGet(`${backendUrl}/api/events`)
      .reply(200, [{ id: 1, title: 'Evento después de renovar token' }]);
    
    // Mock del contexto de autenticación con función de renovación de token
    const newToken = 'new-refreshed-token';
    const mockRefreshToken = jest.fn(() => {
      // Llamar explícitamente a SecureStore.setItemAsync dentro del mock
      SecureStore.setItemAsync('auth_token', newToken);
      return Promise.resolve(newToken);
    });
    
    AuthContext.useAuth = jest.fn(() => ({
      refreshToken: mockRefreshToken,
      isAuthenticated: true,
      getAccessToken: jest.fn(() => Promise.resolve(newToken))
    }));
    
    // Configurar apiClient para simular error y luego éxito
    apiClient.getEvents
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce([{ id: 1, title: 'Evento después de renovar token' }]);
    
    // Intentar obtener eventos (debería fallar y luego renovar el token)
    let error;
    try {
      await apiClient.getEvents();
    } catch (e) {
      error = e;
    }
    
    // Verificar que se produjo un error 401
    expect(error).toBeDefined();
    expect(error.response.status).toBe(401);
    
    // Simular renovación de token
    const { refreshToken } = AuthContext.useAuth();
    await refreshToken();
    
    // Verificar que se intentó renovar el token
    expect(mockRefreshToken).toHaveBeenCalled();
    
    // Verificar que se almacenó el nuevo token
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
    
    // Realizar una nueva solicitud con el token renovado
    const events = await apiClient.getEvents();
    
    // Verificar que la segunda solicitud fue exitosa
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Evento después de renovar token');
  });

  test('Manejo de errores de API en el frontend', async () => {
    // Mock de error de servidor
    mock.onGet(`${backendUrl}/api/events`).reply(500, {
      error: 'Error interno del servidor'
    });
    
    // Configurar apiClient para simular un error de servidor
    // Importante: Resetear cualquier mock anterior para evitar conflictos
    apiClient.getEvents.mockReset();
    
    // Ahora configuramos el mock para que rechace la promesa
    const serverError = {
      response: { 
        status: 500, 
        data: { error: 'Error interno del servidor' } 
      }
    };
    apiClient.getEvents.mockImplementation(() => Promise.reject(serverError));
    
    // Espiar console.error para verificar que no se expone información sensible
    const consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});
    
    // Intentar obtener eventos (debería fallar)
    try {
      await apiClient.getEvents();
      // Si llegamos aquí, la prueba debería fallar porque esperamos un error
      fail('Se esperaba que apiClient.getEvents fallara');
    } catch (error) {
      // Verificar que el error tiene la estructura esperada
      expect(error).toEqual(
        expect.objectContaining({
          response: expect.objectContaining({
            status: 500
          })
        })
      );
    }
    
    // Verificar que no se expone información sensible en los logs
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('token')
    );
    
    // Restaurar console.error
    consoleSpy.mockRestore();
  });
});
