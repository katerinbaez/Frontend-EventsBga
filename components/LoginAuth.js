import React, { useState, useEffect } from "react";
import { Text, View, Button, ActivityIndicator } from "react-native";
import * as WebBrowser from "expo-web-browser";
import axios from "axios";
import { styles } from '../styles/LoginStyles';

// Configuración de Auth0
const AUTH0_DOMAIN = "eventsbga.us.auth0.com";
const AUTH0_CLIENT_ID = "91dOXcXA8e1UToIQq8ArVy4jtuN4Yssn";

// URL del backend y frontend
const BACKEND_URL = "http://192.168.1.7:5000";
const REDIRECT_URI = 'exp://192.168.1.7:8081';
//const REDIRECT_URI = 'exp://ock00sg-katerinbaez-8081.exp.direct';

// Configuración de Axios para CORS
axios.defaults.headers.common['Origin'] = REDIRECT_URI;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default function LoginAuth({ onLoginSuccess }) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState("checking");

    const login = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
                `response_type=token` +
                `&client_id=${AUTH0_CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                `&scope=openid%20profile%20email` +
                `&audience=${encodeURIComponent(`https://${AUTH0_DOMAIN}/api/v2/`)}` +
                `&prompt=login`;

            console.log("URL de autenticación:", authUrl);

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                REDIRECT_URI,
                { showInRecents: true }
            );

            if (result.type === 'success') {
                const url = result.url;
                const params = {};
                const hash = url.split('#')[1];
                if (hash) {
                    hash.split('&').forEach(param => {
                        const [key, value] = param.split('=');
                        params[key] = decodeURIComponent(value);
                    });
                }

                if (params.access_token) {
                    await getUserData(params.access_token);
                } else {
                    setError("No se pudo obtener el token de acceso");
                }
            } else {
                setError("La autenticación no fue exitosa");
            }
        } catch (error) {
            console.error("Error en login:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getUserData = async (token) => {
        try {
            const userInfoResponse = await axios.get(
                `https://${AUTH0_DOMAIN}/userinfo`,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            const userData = userInfoResponse.data;

            const loginResponse = await axios.post(
                `${BACKEND_URL}/auth/login`,
                {
                    sub: userData.sub,
                    email: userData.email,
                    name: userData.name,
                    picture: userData.picture
                },
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setUser(loginResponse.data.user);
            setBackendStatus("connected");
            setError(null);
            if (onLoginSuccess) {
                onLoginSuccess(loginResponse.data.user);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                const errorMsg = error.response.data?.details || error.response.data?.error || error.message;
                setError(`Error de autenticación: ${errorMsg}`);
            } else {
                setError("Error al obtener datos del usuario: " + error.message);
            }
            setBackendStatus("error");
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            setUser(null);
            setBackendStatus("needsAuth");
            setError(null);

            const logoutUrl = `https://${AUTH0_DOMAIN}/v2/logout?` +
                `client_id=${AUTH0_CLIENT_ID}` +
                `&returnTo=${encodeURIComponent(REDIRECT_URI)}`;

            await WebBrowser.openAuthSessionAsync(logoutUrl);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            setError("Error al cerrar sesión");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkBackend = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/status`);
                setBackendStatus("connected");
            } catch (error) {
                setBackendStatus("error");
            }
        };

        checkBackend();
    }, []);

    return (
        <View style={styles.authContainer}>
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : (
                <>
                    {user ? (
                        <>
                            <View style={styles.userInfo}>
                                <Text style={styles.welcomeText}>¡Bienvenido!</Text>
                                <Text style={styles.userName}>{user.name || 'Usuario'}</Text>
                                <Text style={styles.userEmail}>{user.email || ''}</Text>
                            </View>
                            <Button 
                                title="Cerrar Sesión" 
                                onPress={logout}
                                color="#ff3b30"
                            />
                        </>
                    ) : (
                        <Button 
                            title="Iniciar Sesión" 
                            onPress={login}
                            color="#007AFF"
                        />
                    )}
                    {error && <Text style={styles.errorText}>{error}</Text>}
                </>
            )}
        </View>
    );
}
