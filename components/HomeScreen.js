import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { styles } from '../styles/HomeStyles';
import ArtistCard from './ArtistCard';
import CulturalSpaceCard from './CulturalSpaceCard';
import AdminAccess from './AdminAccess';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { BACKEND_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, REDIRECT_URI } from '../constants/config';

const sampleArtists = [
    {
        id: 1,
        name: "María González",
        specialty: "Pintura",
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
        description: "Artista visual especializada en pintura al óleo y técnicas mixtas."
    },
    {
        id: 2,
        name: "Carlos Rodríguez",
        specialty: "Escultura",
        image: "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?w=800",
        description: "Escultor contemporáneo trabajando con materiales reciclados."
    }
];

const sampleSpaces = [
    {
        id: 1,
        name: "Centro Cultural del Oriente",
        type: "Teatro y Galería",
        image: "https://weekend-bucket.s3.amazonaws.com/Centro_Cultural_Del_Oriente_1_90076d3173.jpg",
        description: "Espacio multifuncional para artes escénicas y visuales."
    },
    {
        id: 2,
        name: "Casa de la cultura",
        type: "Galería",
        image: "https://museoartescasaculturacustodiogarciarovira.com/wp-content/uploads/2024/09/FACHADA-1024x682.jpeg",
        description: "Galería de arte contemporáneo y espacio de exposiciones."
    }
];



axios.defaults.headers.common['Origin'] = REDIRECT_URI;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const HomeScreen = ({ navigation }) => {
    const { isAuthenticated, handleLogin } = useAuth();
    const [loading, setLoading] = useState(false);
    const { width } = Dimensions.get('window');

    const handleLoginPress = async () => {
        try {
            setLoading(true);
            
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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>EventsBga</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <AdminAccess />
                        <TouchableOpacity 
                            style={[styles.headerButton, { minWidth: 120 }]}
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

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Artistas Destacados</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.cardScroll}
                    decelerationRate="fast"
                    snapToInterval={width * 0.9 + 30}
                    snapToAlignment="center"
                >
                    {sampleArtists.map(artist => (
                        <ArtistCard
                            key={artist.id}
                            artist={artist}
                            onPress={() => navigation.navigate('ArtistProfile', { artist })}
                        />
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Espacios Culturales</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.cardScroll}
                    decelerationRate="fast"
                    snapToInterval={width * 0.9 + 30}
                    snapToAlignment="center"
                >
                    {sampleSpaces.map(space => (
                        <CulturalSpaceCard
                            key={space.id}
                            space={space}
                            onPress={() => navigation.navigate('CulturalSpace', { space })}
                        />
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Próximos Eventos</Text>
                <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => navigation.navigate('Calendar')}
                >
                    <Text style={styles.viewAllText}>Ver Calendario</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};

export default HomeScreen;
