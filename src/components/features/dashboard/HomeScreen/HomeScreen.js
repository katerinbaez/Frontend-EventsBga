/**
 * Este archivo maneja la pantalla principal
 * - UI
 * - Autenticación
 * - Eventos
 * - Navegación
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator, 
  ImageBackground, 
  Image, 
  Linking, 
  SafeAreaView, 
  StatusBar, 
  Platform,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../../../context/AuthContext';
import { styles } from '../../../../styles/HomeStyles';
import AdminAccess from '../../../../components/features/auth/admin/AdminAccess';
import EventCalendar from '../../../../components/features/calendar/views/EventCalendar';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { BACKEND_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, REDIRECT_URI } from '../../../../constants/config';

const culturalData = {
  title: "Bucaramanga",
  subtitle: "Donde los artistas y espacios culturales se encuentran",
  description: "Descubre cómo los artistas locales y los espacios culturales trabajan juntos para crear una escena artística vibrante en nuestra ciudad.",
  backgroundImage: "https://images.unsplash.com/photo-1608501078713-8e445a709b39?q=80&w=2070",
  stats: [
    { icon: "brush-outline", count: "¡Únete a nuestra\n comunidad!", color: "#FF3A5E" },
    { icon: "location", count: "¡Descubre\nnuevos lugares!", color: "#3A9BFF" },
    { icon: "calendar", count: "¡No te pierdas\nnada!", color: "#FFD700" }
  ],
  featuredArtist: {
    name: "María González",
    specialty: "Pintura",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
  },
  featuredSpace: {
    name: "Centro Cultural del Oriente",
    type: "Teatro y Galería",
    image: "https://weekend-bucket.s3.amazonaws.com/Centro_Cultural_Del_Oriente_1_90076d3173.jpg",
  }
};

axios.defaults.headers.common['Origin'] = REDIRECT_URI;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const HomeScreen = ({ navigation }) => {
    const { isAuthenticated, handleLogin } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPolicies, setShowPolicies] = useState(false);
    const [policyAccepted, setPolicyAccepted] = useState(false);
    const [error, setError] = useState(null);
    const { width } = Dimensions.get('window');

    // Verificar si ya aceptó las políticas al cargar el componente
    useEffect(() => {
        const checkPolicyAcceptance = async () => {
            try {
                const accepted = await AsyncStorage.getItem('policy_accepted');
                if (accepted === 'true') {
                    setPolicyAccepted(true);
                }
            } catch (error) {
                console.error('Error al verificar políticas:', error);
            }
        };
        
        checkPolicyAcceptance();
    }, []);

    const handleLoginPress = async () => {
        if (isAuthenticated) {
            navigation.replace('Dashboard');
            return;
        }
        
        // Si ya aceptó las políticas, proceder directamente al login
        if (policyAccepted) {
            startAuth0Login();
            return;
        }
        
        // Mostrar políticas si no las ha aceptado
        setShowPolicies(true);
    };

    const handlePolicyResponse = async (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.action === 'POLICY_RESPONSE') {
                setShowPolicies(false);
                if (data.accepted) {
                    // Guardar aceptación en AsyncStorage
                    await AsyncStorage.setItem('policy_accepted', 'true');
                    setPolicyAccepted(true);
                    startAuth0Login();
                } else {
                    Alert.alert(
                        'Políticas Requeridas',
                        'Debes aceptar nuestras políticas de privacidad para acceder a la aplicación',
                        [{ text: 'Entendido' }]
                    );
                }
            }
        } catch (e) {
            console.error('Error parsing policy response', e);
            setShowPolicies(false);
        }
    };

    const startAuth0Login = async () => {
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
                    handleLogin(userData);
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
        <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <ScrollView 
                style={styles.scrollContainer}
                removeClippedSubviews={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>EventsBga</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <AdminAccess />
                        <TouchableOpacity 
                            style={[styles.headerButton, styles.loginButton]}
                            onPress={handleLoginPress}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.headerButtonText}>
                                    {isAuthenticated ? 'Dashboard' : 'Login'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.culturalHeroSection}>
                <ImageBackground 
                    source={{ uri: culturalData.backgroundImage }}
                    style={styles.culturalHeroBackground}
                    imageStyle={styles.culturalHeroBackgroundImage}
                    resizeMode="cover"
                >
                    <View style={styles.culturalHeroContent}>
                        <View>
                            <Text style={styles.culturalHeroTitle}>{culturalData.title}</Text>
                            <Text style={styles.culturalHeroSubtitle}>{culturalData.subtitle}</Text>
                            <Text style={styles.culturalHeroDescription}>{culturalData.description}</Text>
                        </View>
                        
                        <View style={styles.statsContainer}>
                            {culturalData.stats.map((stat, index) => (
                                <View key={index} style={styles.statItem}>
                                    <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
                                        <Ionicons 
                                            name={stat.icon} 
                                            size={styles.iconLarge.fontSize} 
                                            color="#FFFFFF" 
                                        />
                                    </View>
                                    <Text style={styles.statCount}>{stat.count}</Text>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ImageBackground>
            </View>

            <View style={styles.featuredSection}>
                <Text style={styles.sectionTitle}>Conexión Artística</Text>
                <View style={styles.featuredContainer}>
                    <View style={styles.featuredCard}>
                        <Image 
                            source={{ uri: culturalData.featuredArtist.image }}
                            style={styles.featuredImage}
                        />
                        <View style={styles.featuredOverlay}>
                            <View style={styles.featuredIconContainer}>
                                <FontAwesome5 name="paint-brush" size={styles.iconMedium.fontSize} color="#FFFFFF" />
                            </View>
                            <Text style={styles.featuredTitle}>Artista</Text>
                            <Text style={styles.featuredSubtitle}>Expresión Cultural</Text>
                        </View>
                    </View>

                    <View style={styles.connectionContainer}>
                        <View style={styles.connectionLine} />
                        <View style={styles.connectionCircle}>
                            <Ionicons name="link" size={styles.iconLarge.fontSize} color="#FFFFFF" />
                        </View>
                        <View style={styles.connectionLine} />
                    </View>

                    <View style={styles.featuredCard}>
                        <Image 
                            source={{ uri: culturalData.featuredSpace.image }}
                            style={styles.featuredImage}
                        />
                        <View style={styles.featuredOverlay}>
                            <View style={[styles.featuredIconContainer, { backgroundColor: '#3A9BFF' }]}>
                                <Ionicons name="location" size={styles.iconMedium.fontSize} color="#FFFFFF" />
                            </View>
                            <Text style={styles.featuredTitle}>Espacio Cultural</Text>
                            <Text style={styles.featuredSubtitle}>Escenario Artístico</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.connectionText}>Los artistas y espacios culturales trabajan juntos para crear experiencias únicas</Text>
                
                <View style={styles.exploreButton}>
                    <Text style={styles.exploreButtonText}>Conexión Artística</Text>
                    <Ionicons name="heart" size={styles.iconMedium.fontSize} color="#FFFFFF" />
                </View>
            </View>

            <View style={styles.calendarSection}>
                <Text style={styles.sectionTitle}>Calendario de Eventos</Text>
                <View style={styles.calendarWrapper}>
                    <View collapsable={false} style={{ flex: 1 }}>
                        <EventCalendar inHomeScreen={true} />
                    </View>
                </View>
            </View>
            
            {!isAuthenticated && (
                <View style={styles.loginBanner}>
                    <Text style={styles.loginBannerTitle}>¡Descubre todas las funcionalidades!</Text>
                    <Text style={styles.loginBannerText}>
                        Inicia sesión para disfrutar de todas las funciones exclusivas: guarda tus eventos favoritos, 
                        recibe notificaciones personalizadas, conecta con artistas y espacios culturales, y mucho más.
                    </Text>
                    <TouchableOpacity style={styles.loginBannerButton} onPress={handleLoginPress} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <Text style={styles.loginBannerButtonText}>Iniciar Sesión</Text>
                                <Ionicons name="log-in-outline" size={styles.iconSmall.fontSize} color="#FFFFFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
            </ScrollView>

            {/* Modal de Políticas de Privacidad */}
            <Modal
                visible={showPolicies}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowPolicies(false)}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <WebView
                        source={{ uri: 'https://politicas-privacidad-eventsbga.netlify.app/' }}
                        onMessage={handlePolicyResponse}
                        injectedJavaScript={`
                            window.ReactNativeWebView = window.ReactNativeWebView || null;
                            true;
                        `}
                        style={{ flex: 1 }}
                        startInLoadingState={true}
                        scalesPageToFit={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        mixedContentMode="always"
                    />
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: Platform.OS === 'ios' ? 40 : 20,
                            right: 20,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: 15,
                            padding: 5,
                            zIndex: 1000
                        }}
                        onPress={() => setShowPolicies(false)}
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

export default HomeScreen;