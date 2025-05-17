import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { styles } from '../../../../styles/HomeStyles';

export default function ArtistCard({ artist, onPress }) {
    const scaleValue = new Animated.Value(1);

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => onPress(artist)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={[
                styles.card,
                { transform: [{ scale: scaleValue }] }
            ]}>
                <Image
                    source={{ uri: artist.image }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.cardOverlay}>
                    <Text style={styles.cardTitle}>{artist.name}</Text>
                    <Text style={styles.cardType}>{artist.specialty}</Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                        {artist.description}
                    </Text>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}
