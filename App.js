import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componentes
import HomeScreen from './components/HomeScreen';
import LoginAuth from './components/LoginAuth';
import DashboardUser from './components/DashboardUser';
import DashboardAdmin from './components/DashboardAdmin';
import ArtistProfile from './components/ArtistProfile';
import CulturalSpace from './components/CulturalSpace';
import EventCalendar from './components/EventCalendar';
import EventSearch from './components/EventSearch';
import EventDetail from './components/EventDetail';
import NotificationCenter from './components/NotificationCenter';
import FavoritesList from './components/FavoritesList';
import RoleRequestForm from './components/RoleRequestForm';
import AdminMetrics from './components/AdminMetrics';

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
                options={{ title: 'Buscar Eventos' }}
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
                name="RoleRequest" 
                component={RoleRequestForm}
                options={{ title: 'Solicitar Rol' }}
            />
            <Stack.Screen 
                name="AdminMetrics" 
                component={AdminMetrics}
                options={{ title: 'Métricas' }}
            />
        </Stack.Navigator>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Navigation />
        </AuthProvider>
    );
};

export default App;
