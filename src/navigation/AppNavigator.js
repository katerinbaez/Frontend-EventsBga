import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Importar componentes de pantallas existentes
import HomeScreen from '../screens/HomeScreen';
import LoginAuth from '../components/features/auth/login/LoginAuth';
import DashboardUser from '../components/features/dashboard/user/views/DashboardUser';
import DashboardArtist from '../components/features/dashboard/artist/views/DashboardArtist';
import DashboardManager from '../components/features/dashboard/manager/views/DashboardManager';
import ArtistRegistration from '../components/features/artists/forms/ArtistRegistration';
import DashboardAdmin from '../components/features/dashboard/admin/views/DashboardAdmin';
import ArtistProfile from '../components/features/artists/sections/ArtistProfile';
import ArtistPortfolio from '../components/features/artists/views/ArtistPortfolio';
import CulturalSpace from '../components/features/spaces/views/CulturalSpace';
import EventCalendar from '../components/features/calendar/views/EventCalendar';
import EventSearch from '../components/features/events/views/EventSearch';
import EventDetail from '../components/features/events/views/EventDetail';
import NotificationCenter from '../components/features/notifications/Views/NotificationCenter';
import FavoritesScreen from '../components/features/favorites/views/FavoritesScreen';
import SpaceSchedule from '../components/features/spaces/views/SpaceSchedule';
import RoleRequestForm from '../components/features/requests/views/RoleRequestForm';
import ViewRoleRequests from '../components/features/requests/views/ViewRoleRequests';
import EventProgramming from '../components/features/events/views/EventProgramming';
import AdminMetrics from '../components/features/admin/metrics/AdminMetrics';
import ManagerRegistration from '../components/features/spaces/forms/ManagerRegistration';
import UserManagement from '../components/features/admin/users/UserManagement';
import EventAttendance from '../components/features/events/views/EventAttendance';
import ManageEvents from '../components/features/events/views/ManageEvents';

// Importar conectores de navegación
import CalendarScreen from '../screens/CalendarScreen';
import NotFoundScreen from '../screens/NotFoundScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    // Usar useAuth para determinar rutas autenticadas vs no autenticadas
    const { isAuthenticated, userData } = useAuth();
    
    // Determinar la pantalla inicial basada en el estado de autenticación
    const initialRouteName = isAuthenticated ? 
        (userData?.role === 'admin' ? 'DashboardAdmin' : 
         userData?.role === 'artist' ? 'DashboardArtist' : 
         userData?.role === 'manager' ? 'DashboardManager' : 'Dashboard') : 'Home';
    
    console.warn('Estado de autenticación:', isAuthenticated, 'Rol:', userData?.role, 'Ruta inicial:', initialRouteName);
    
    return (
        <Stack.Navigator 
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#000000',
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 15,
                },
            }}
            initialRouteName={initialRouteName}
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
                options={{ title: 'Registro de Artista' }}
            />
            <Stack.Screen 
                name="DashboardManager" 
                component={DashboardManager}
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
                name="ArtistPortfolio" 
                component={ArtistPortfolio}
                options={{ 
                    headerShown: false
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
            <Stack.Screen 
                name="ManagerRegistration" 
                component={ManagerRegistration}
                options={{ 
                    title: 'Registro de Espacio Cultural',
                    headerShown: true
                }}
            />
            
            {/* Conectores de pantallas para mejor organización */}
            <Stack.Screen 
                name="CalendarTab" 
                component={CalendarScreen}
                options={{ 
                    title: 'Calendario',
                    headerShown: false 
                }}
            />
            
            {/* Pantalla de respaldo para rutas no encontradas */}
            <Stack.Screen 
                name="NotFound" 
                component={NotFoundScreen}
                options={{ title: 'Página no encontrada' }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
