/**
 * Componente principal de la aplicación
 * - App
 * - Navegación
 * - Autenticación
 * - Splash
 * - UI
 */

import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { StatusBar } from 'react-native';
import * as SplashScreenNative from 'expo-splash-screen';
import SplashScreen from './components/ui/SplashScreen';

import AppNavigator from './navigation/AppNavigator';
import NavigationHandler from './components/navigation/NavigationHandler';

SplashScreenNative.preventAutoHideAsync().catch(console.warn);

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const hideSplashScreen = async () => {
            try {
                await SplashScreenNative.hideAsync();
            } catch (error) {
                console.warn('Error al ocultar el splash screen nativo:', error);
            }
        };
        hideSplashScreen();
    }, []);

    const handleSplashFinish = () => {
        setIsLoading(false);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <StatusBar barStyle="light-content" />
                {isLoading ? (
                    <SplashScreen onFinish={handleSplashFinish} />
                ) : (
                    <NavigationHandler>
                        <NavigationContainer>
                            <AppNavigator />
                        </NavigationContainer>
                    </NavigationHandler>
                )}
            </AuthProvider>
        </GestureHandlerRootView>
    );
};

export default App;
