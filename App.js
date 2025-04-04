import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, SafeAreaView, Dimensions } from 'react-native';
import { styles } from './styles/HomeStyles';
import LoginAuth from './components/LoginAuth';
import ArtistCard from './components/ArtistCard';
import CulturalSpaceCard from './components/CulturalSpaceCard';

const sampleArtists = [
    {
        id: 1,
        name: "María González",
        specialty: "Pintura",
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
        description: "Artista visual especializada en pintura al óleo y técnicas mixtas, explorando la identidad cultural de Bucaramanga."
    },
    {
        id: 2,
        name: "Carlos Rodríguez",
        specialty: "Escultura",
        image: "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?w=800",
        description: "Escultor contemporáneo trabajando con materiales reciclados, creando obras que reflejan la memoria urbana."
    }
];

const sampleSpaces = [
    {
        id: 1,
        name: "Centro Cultural del Oriente",
        type: "Teatro y Galería",
        image: "https://weekend-bucket.s3.amazonaws.com/Centro_Cultural_Del_Oriente_1_90076d3173.jpg",
        description: "Espacio multifuncional para artes escénicas y visuales, ubicado en el corazón histórico de la ciudad."
    },
    {
        id: 2,
        name: "Casa de la cultura",
        type: "Galería",
        image: "https://museoartescasaculturacustodiogarciarovira.com/wp-content/uploads/2024/09/FACHADA-1024x682.jpeg",
        description: "Galería de arte contemporáneo y espacio de exposiciones, promoviendo artistas locales emergentes."
    }
];

export default function App() {
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const { width } = Dimensions.get('window');

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setShowLogin(false);
    };

    const handleItemPress = (item) => {
        setSelectedItem(item);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.headerText}>EventsBga</Text>
                        <Text style={styles.subHeaderText}>Arte y Cultura</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={() => setShowLogin(true)}
                    >
                        <Text style={styles.loginButtonText}>
                            {user ? 'Perfil' : 'Iniciar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.categoryTitle}>Artistas Destacados</Text>
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
                            onPress={handleItemPress}
                        />
                    ))}
                </ScrollView>

                <Text style={styles.categoryTitle}>Espacios Culturales</Text>
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
                            onPress={handleItemPress}
                        />
                    ))}
                </ScrollView>
            </ScrollView>

            <Modal
                visible={showLogin}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowLogin(false)}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <View style={styles.indicator} />
                        <LoginAuth onLoginSuccess={handleLoginSuccess} />
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setShowLogin(false)}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={!!selectedItem}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedItem(null)}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <View style={styles.indicator} />
                        <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                        <Text style={styles.modalDescription}>{selectedItem?.description}</Text>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setSelectedItem(null)}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
