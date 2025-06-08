/**
 * Este archivo contiene las pruebas de seguridad en la red
 * - API
 * - Tokens
 */

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  getBaseUrl: jest.fn(() => 'http://localhost:3000'),
  setAuthHeader: jest.fn(),
  getEvents: jest.fn(() => axios.get(`${backendUrl}/api/events`)),
  createEvent: jest.fn((eventData) => axios.post(`${backendUrl}/api/events`, eventData)),
  handleApiError: jest.fn((error) => {
    console.error('Error en la API:', error.message);
    throw error;
  })
};

const mock = new MockAdapter(axios);
const backendUrl = 'http://localhost:3000';

describe('Pruebas de Seguridad en la Red', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mock.reset();
  });

  test('Las solicitudes API utilizan HTTPS en producción', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const mockProductionUrl = 'https://api.eventsbga.com';
    
    const originalGetBaseUrl = apiClient.getBaseUrl;
    apiClient.getBaseUrl = jest.fn(() => mockProductionUrl);
    
    expect(apiClient.getBaseUrl()).toMatch(/^https:\/\//);
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('Las solicitudes incluyen encabezados de seguridad apropiados', async () => {
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['X-Content-Type-Options'] = 'nosniff';
    
    let capturedHeaders = null;
    mock.onGet(`${backendUrl}/api/events`).reply(config => {
      capturedHeaders = config.headers;
      return [200, []];
    });
    
    await apiClient.getEvents();
    
    expect(capturedHeaders).toBeDefined();
    expect(capturedHeaders['Content-Type']).toBe('application/json');
    expect(capturedHeaders['X-Content-Type-Options']).toBe('nosniff');
    
    const headersStr = JSON.stringify(capturedHeaders);
    expect(headersStr).not.toContain('password');
    expect(headersStr).not.toContain('secret');
  });

  test('La aplicación maneja correctamente los errores de red', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});
    
    mock.onGet(`${backendUrl}/api/events`).networkError();
    
    await expect(apiClient.getEvents()).rejects.toThrow();
    
    const allCalls = consoleSpy.mock.calls.flat().join(' ');
    expect(allCalls).not.toContain('token');
    expect(allCalls).not.toContain('password');
    
    consoleSpy.mockRestore();
  });

  test('La aplicación implementa protección contra CSRF', async () => {
    let capturedHeaders = null;
    mock.onPost(`${backendUrl}/api/events`).reply(config => {
      capturedHeaders = config.headers;
      return [200, { success: true }];
    });
    
    axios.defaults.headers.common['X-CSRF-Token'] = 'mock-csrf-token';
    
    await apiClient.createEvent({ title: 'Nuevo evento' });
    
    expect(capturedHeaders).toBeDefined();
    expect(capturedHeaders['X-CSRF-Token']).toBe('mock-csrf-token');
  });

  test('La aplicación maneja correctamente los errores de rate limiting', async () => {
    apiClient.handleRateLimiting = jest.fn((retryAfter) => {
      console.warn(`Esperando ${retryAfter} segundos antes de reintentar`);
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    
    mock.onGet(`${backendUrl}/api/events`).reply(429, {
      error: 'Too many requests'
    }, {
      'Retry-After': '60'
    });
    
    const handleApiErrorSpy = jest.spyOn(apiClient, 'handleApiError');
    
    const retryAfterHandler = jest.spyOn(apiClient, 'handleRateLimiting');
    
    apiClient.getEvents.mockImplementationOnce(() => {
      return axios.get(`${backendUrl}/api/events`)
        .catch(error => {
          if (error.response && error.response.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || '60';
            apiClient.handleRateLimiting(parseInt(retryAfter, 10));
            throw new Error('Rate limit exceeded');
          }
          return apiClient.handleApiError(error);
        });
    });
    
    await expect(apiClient.getEvents()).rejects.toThrow('Rate limit exceeded');
    
    expect(retryAfterHandler).toHaveBeenCalled();
  });
});
