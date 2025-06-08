/**
 * Pantalla de inicio con animación y barra de progreso
 * - UI
 * - Splash
 * - Animación
 * - Barra de progreso
 * - Fondo animado
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Dimensions, Animated, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from './AnimatedBackground';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false
    }).start();

    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [onFinish, progressAnim]);
  

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      
      <View style={styles.panel}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#FF3A5E', '#3A7AFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBackground}
          >
            <Ionicons name="calendar" size={70} color="#FFFFFF" />
          </LinearGradient>
          
          <View style={styles.iconOverlay}>
            <Ionicons name="people" size={36} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.title}>EventsBga</Text>
        <Text style={styles.subtitle}>Plataforma Cultural de</Text>
        <Text style={styles.subtitle}>Bucaramanga</Text>
        
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[styles.progressFill, {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }]} 
            />
          </View>
        </View>
        
        <Text style={styles.loadingText}>Cargando experiencias culturales...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  panel: {
    width: width * 0.75,
    maxWidth: 350,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.3)',
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  iconContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  iconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3A7AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  divider: {
    height: 2,
    width: '80%',
    backgroundColor: '#FF3A5E',
    marginTop: 15,
    marginBottom: 15,
    opacity: 0.7,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF3A5E',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default SplashScreen;
