import React, { useState } from 'react';
import { View, Vibration } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import CustomButton from './common/CustomButton';
import { COLORS } from '../styles/theme';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, BACKEND_URL, REDIRECT_URI } from '../constants/config';

axios.defaults.headers.common['Origin'] = REDIRECT_URI;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const LoginAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const { isAuthenticated, handleLogin } = useAuth(); // ya no usamos setToken directamente

    const handleLoginPress = async () => {
        try {
            Vibration.vibrate(50);
            setLoading(true);
            setError(null);
            
            const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
                `response_type=token` +
                `&client_id=${AUTH0_CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                `&scope=openid%20profile%20email` +
                `&audience=${encodeURIComponent(`https://${AUTH0_DOMAIN}/api/v2/`)}` +
                `&prompt=login`;

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                REDIRECT_URI
            );

            if (result.type === 'success' && result.url) {
                const params = {};
                const hash = result.url.split('#')[1];
                
                if (hash) {
                    hash.split('&').forEach(param => {
                        const [key, value] = param.split('=');
                        params[key] = decodeURIComponent(value);
                    });
                }

                if (params.access_token) {
                    console.log('Token obtenido:', params.access_token);

                    const userInfoResponse = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
                        headers: { 
                            'Authorization': `Bearer ${params.access_token}`,
                            'Accept': 'application/json'
                        }
                    });

                    axios.defaults.headers.common['Authorization'] = `Bearer ${params.access_token}`;

                    const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
                        sub: userInfoResponse.data.sub,
                        email: userInfoResponse.data.email,
                        name: userInfoResponse.data.name,
                        picture: userInfoResponse.data.picture
                    });

                    const userData = loginResponse.data.user;

                    // Guardamos token desde handleLogin
                    handleLogin(userData, params.access_token);

                    navigation.replace(userData.role === 'admin' ? 'DashboardAdmin' : 'Dashboard');
                }
            }
        } catch (error) {
            console.error('Error en autenticación:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <CustomButton
                onPress={handleLoginPress}
                title={isAuthenticated ? 'Dashboard' : 'Iniciar Sesión'}
                icon={isAuthenticated ? 'person' : 'log-in'}
                loading={loading}
                type="primary"
            />
        </View>
    );
};

export default LoginAuth;
