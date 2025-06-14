/**
 * Este archivo maneja la autenticación de login
 * - UI
 * - Navegación
 * - API
 */

import React, { useState } from 'react';
import { View, Vibration, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, COMMON_STYLES } from '../../../../styles/theme';

const CustomButton = ({
  title,
  onPress,
  type = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}) => {
  const getButtonStyle = () => {
    if (disabled || loading) {
      return COMMON_STYLES.button.disabled;
    }
    return COMMON_STYLES.button[type];
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.text.primary} size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={COLORS.text.primary}
            />
          )}
          <Text
            style={{
              color: disabled ? COLORS.text.disabled : COLORS.text.primary,
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, BACKEND_URL, REDIRECT_URI } from '../../../../constants/config';

axios.defaults.headers.common['Origin'] = REDIRECT_URI;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.log('Token expirado o inválido');
        }
        return Promise.reject(error);
    }
);

const LoginAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const { isAuthenticated, handleLogin } = useAuth();
    
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

                    axios.defaults.headers.common['Authorization'] = `Bearer ${params.access_token}`;

                    const userInfoResponse = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`);
                    
                    const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
                        sub: userInfoResponse.data.sub,
                        email: userInfoResponse.data.email,
                        name: userInfoResponse.data.name,
                        picture: userInfoResponse.data.picture
                    });

                    const userData = loginResponse.data.user;
                    handleLogin(userData, params.access_token);

                    console.log('Token guardado en el contexto');

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
