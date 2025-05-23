import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StatusBar } from 'react-native';
import * as SplashScreenNative from 'expo-splash-screen';
import SplashScreen from './components/ui/SplashScreen';

// Componentes
import HomeScreen from './components/features/dashboard/HomeScreen/HomeScreen';
import LoginAuth from './components/features/auth/login/LoginAuth';
import DashboardUser from './components/features/dashboard/user/views/DashboardUser';
import DashboardArtist from './components/features/dashboard/artist/views/DashboardArtist';
import DashboardManager from './components/features/dashboard/manager/views/DashboardManager';
import ArtistRegistration from './components/features/artists/forms/ArtistRegistration';
import DashboardAdmin from './components/features/dashboard/admin/views/DashboardAdmin';
import ArtistProfile from './components/features/artists/sections/ArtistProfile';
import ArtistPortfolio from './components/features/artists/views/ArtistPortfolio';
import CulturalSpace from './components/features/spaces/views/CulturalSpace';
import EventCalendar from './components/features/calendar/views/EventCalendar';
import EventSearch from './components/features/events/views/EventSearch';
import EventDetail from './components/features/events/views/EventDetail';
import NotificationCenter from './components/features/notifications/Views/NotificationCenter';
import FavoritesScreen from './components/features/favorites/views/FavoritesScreen';
import SpaceSchedule from './components/features/spaces/views/SpaceSchedule';
import RoleRequestForm from './components/features/requests/views/RoleRequestForm';
import ViewRoleRequests from './components/features/requests/views/ViewRoleRequests';
import EventProgramming from './components/features/events/views/EventProgramming';
import AdminMetrics from './components/features/admin/metrics/AdminMetrics';
import ManagerRegistration from './components/features/spaces/forms/ManagerRegistration';
import UserManagement from './components/features/admin/users/UserManagement';
import EventAttendance from './components/features/events/views/EventAttendance';
import ManageEvents from './components/features/events/views/ManageEvents';

const Stack = createNativeStackNavigator();

const Navigation = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Stack.Navigator 
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#000000',
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 15, // Tamaño de letra más pequeño
                },
            }}
            initialRouteName="Home"
        >
            {/* Rutas públicas */}
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Login"
                component={LoginAuth}
                options={{
                    headerShown: true,
                    title: 'Iniciar Sesión',
                    headerStyle: {
                        backgroundColor: '#000',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen 
                name="Dashboard" 
                component={DashboardUser}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="DashboardArtist" 
                component={DashboardArtist}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="ArtistRegistration" 
                component={ArtistRegistration}
                options={{ headerShown: false } }
            />
            <Stack.Screen 
                name="DashboardManager" 
                component={DashboardManager}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="ManagerRegistration" 
                component={ManagerRegistration}
                options={{
                    title: 'Registro de Espacio Cultural',
                    headerStyle: {
                        backgroundColor: '#000',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen 
                name="DashboardAdmin" 
                component={DashboardAdmin}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="ArtistProfile" 
                component={ArtistProfile}
                options={{ title: 'Perfil del Artista' }}
            />
            <Stack.Screen 
                name="ArtistPortfolio" 
                component={ArtistPortfolio}
                options={{ 
                    headerShown: false  // Ocultar el header del Stack Navigator para evitar duplicación

                }}
            />
            <Stack.Screen 
                name="CulturalSpace" 
                component={CulturalSpace}
                options={{ headerShown: false  }}
            />
            <Stack.Screen 
                name="EventDetails" 
                component={EventDetail}
                options={{ title: 'Detalles del Evento' }}
            />
            <Stack.Screen 
                name="Calendar" 
                component={EventCalendar}
                options={{ title: 'Calendario' }}
            />
            <Stack.Screen 
                name="Search" 
                component={EventSearch}
                options={{  
                     headerShown: false   }}
            />
            <Stack.Screen 
                name="Notifications" 
                component={NotificationCenter}
                options={{ title: 'Notificaciones' }}
            />
            <Stack.Screen 
                name="Favorites" 
                component={FavoritesScreen}
                options={{ title: 'Mis Favoritos' }}
            />
            <Stack.Screen 
                name="ViewRoleRequests" 
                component={ViewRoleRequests}
                options={{ title: 'Solicitudes de Rol' }}
            />
            <Stack.Screen 
                name="RoleRequest" 
                component={RoleRequestForm}
                options={{ title: 'Solicitar Rol' }}
            />
            <Stack.Screen 
                name="AdminMetrics" 
                component={AdminMetrics}
                options={{ title: 'Métricas' }}
            />
            <Stack.Screen 
                name="SpaceSchedule" 
                component={SpaceSchedule}
                options={{
                    title: 'Horario',
                    headerShown: false

                }}
            />
            <Stack.Screen 
                name="EventProgramming" 
                component={EventProgramming}
                options={{
                    headerShown: false
                }}
            />
            
            <Stack.Screen 
                name="UserManagement" 
                component={UserManagement}
                options={{ title: 'Gestión de Usuarios' }}
            />
            <Stack.Screen 
                name="EventAttendance" 
                component={EventAttendance}
                options={{ 
                    headerShown: false
                }}
            />
            <Stack.Screen 
                name="ManageEvents" 
                component={ManageEvents}
                options={{ 
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    );
};

// Configuración para el splash screen nativo
// Prevenir que se oculte automáticamente
SplashScreenNative.preventAutoHideAsync().catch(console.warn);

const App = () => {
    const [isLoading, setIsLoading] = useState(true);

    const handleSplashFinish = async () => {
        try {
            // Ocultar el splash screen nativo
            await SplashScreenNative.hideAsync();
            // Cambiar el estado para mostrar la navegación
            setIsLoading(false);
        } catch (error) {
            console.warn('Error al ocultar el splash screen:', error);
            setIsLoading(false);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <StatusBar barStyle="light-content" />
                {isLoading ? (
                    <SplashScreen onFinish={handleSplashFinish} />
                ) : (
                    <Navigation />
                )}
            </AuthProvider>
        </GestureHandlerRootView>
    );
};

export default App;
