export const AUTH0_DOMAIN = "eventsbga.us.auth0.com";
export const AUTH0_CLIENT_ID = "91dOXcXA8e1UToIQq8ArVy4jtuN4Yssn";
export const BACKEND_URL = "https://backend-eventsbga-production.up.railway.app";

// Determinar si estamos en modo de desarrollo o producción
const isProduction = !__DEV__;

// URI de redirección según el entorno
// En producción: usar el esquema personalizado definido en app.json
// En desarrollo: usar el esquema de Expo
export const REDIRECT_URI = isProduction ? "myapp://auth" : "exp://192.168.1.7:8081";
