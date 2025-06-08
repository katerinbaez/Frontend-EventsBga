/**
 * Configuración global de la aplicación
 * - Autenticación
 * - Backend
 * - Redirección
 * - Entorno
 * - URLs
 */

export const AUTH0_DOMAIN = "eventsbga.us.auth0.com";
export const AUTH0_CLIENT_ID = "91dOXcXA8e1UToIQq8ArVy4jtuN4Yssn";
export const BACKEND_URL = "https://backend-eventsbga-production.up.railway.app";

const isProduction = !__DEV__;
export const REDIRECT_URI = isProduction ? "myapp://auth" : "exp://192.168.1.7:8081";
