import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StatusBar } from 'react-native';

// Componentes
import HomeScreen from './components/HomeScreen';
import LoginAuth from './components/LoginAuth';
import DashboardUser from './components/DashboardUser';
import DashboardArtist from './components/DashboardArtist';
import DashboardManager from './components/DashboardManager';
import ArtistRegistration from './components/ArtistRegistration';
import DashboardAdmin from './components/DashboardAdmin';
import ArtistProfile from './components/ArtistProfile';
import ArtistPortfolio from './components/ArtistPortfolio';
import CulturalSpace from './components/CulturalSpace';
import SpaceProfile from './components/SpaceProfile';
import EventCalendar from './components/EventCalendar';
import EventSearch from './components/EventSearch';
import EventDetail from './components/EventDetail';
import NotificationCenter from './components/NotificationCenter';
import FavoritesList from './components/FavoritesList';
import SpaceSchedule from './components/SpaceSchedule';
import EventRequests from './components/EventRequests';
import RoleRequestForm from './components/RoleRequestForm';
import ViewRoleRequests from './components/ViewRoleRequest';
import EventProgramming from './components/EventProgramming';
import RoleRequestList from './components/RoleRequestList';
import AdminMetrics from './components/AdminMetrics';
import ManagerRegistration from './components/ManagerRegistration';
import UserManagement from './components/UserManagement';
import EventAttendance from './components/EventAttendance';

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
                options={{
                    title: 'Registro de Artista',
                    headerStyle: {
                        backgroundColor: '#000',
                    },
                    headerTintColor: '#fff',
                }}
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
                options={{ title: 'Espacio Cultural' }}
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
                component={FavoritesList}
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
                    headerStyle: {
                        backgroundColor: '#000',
                    },
                    headerTintColor: '#fff',
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
                name="SpaceProfile" 
                component={SpaceProfile}
                options={{ 
                    headerShown: false
                }}
            />
            <Stack.Screen 
                name="EventRequests" 
                component={EventRequests}
                options={{ 
                    title: 'Solicitudes de Eventos',
                    headerStyle: {
                        backgroundColor: '#000',
                    },
                    headerTintColor: '#fff',
                    headerShown: false,
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
        </Stack.Navigator>
    );
};

const App = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <StatusBar barStyle="light-content" />
                <Navigation />
            </AuthProvider>
        </GestureHandlerRootView>
    );
};

export default App;
