import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { StatusBar } from 'react-native';
import * as SplashScreenNative from 'expo-splash-screen';
import SplashScreen from './components/ui/SplashScreen';

// Importar el navegador centralizado y el manejador de navegación
import AppNavigator from './navigation/AppNavigator';
import NavigationHandler from './components/navigation/NavigationHandler';

// No necesitamos importar componentes individuales aquí ya que están en AppNavigator
// Configuración para el splash screen nativo
// Prevenir que se oculte automáticamente
SplashScreenNative.preventAutoHideAsync().catch(console.warn);

const App = () => {
    const [isLoading, setIsLoading] = useState(true);

    // Ocultar la splash screen nativa lo antes posible
    useEffect(() => {
        const hideSplashScreen = async () => {
            try {
                // Ocultar el splash screen nativo inmediatamente
                await SplashScreenNative.hideAsync();
            } catch (error) {
                console.warn('Error al ocultar el splash screen nativo:', error);
            }
        };
        hideSplashScreen();
    }, []);

    const handleSplashFinish = () => {
        // Cambiar el estado para mostrar la navegación
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
