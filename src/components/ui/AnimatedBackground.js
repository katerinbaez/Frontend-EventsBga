import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 30; // Aumentamos la cantidad de partículas

const AnimatedBackground = () => {
  // Referencias para la animación central
  const centralAnimation = useRef(null);
  
  // Función para generar una posición aleatoria en toda la pantalla
  const generatePosition = () => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    return { x, y };
  };
  
  // Referencias para las animaciones de las partículas
  const particleAnims = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => {
      const pos = generatePosition();
      return {
        position: new Animated.ValueXY(pos),
        opacity: new Animated.Value(Math.random() * 0.6 + 0.2),
        scale: new Animated.Value(Math.random() * 1.2 + 0.5),
        rotation: new Animated.Value(0)
      };
    }))
  .current;
  // Función para animar una partícula
  const animateParticle = (index) => {
    const particle = particleAnims[index];
    
    // Generar un destino aleatorio en cualquier parte de la pantalla
    const newPos = generatePosition();
    
    // Duración aleatoria entre 10-20 segundos
    const duration = Math.random() * 10000 + 10000;
    
    // Animación de posición
    Animated.timing(particle.position, {
      toValue: { x: newPos.x, y: newPos.y },
      duration,
      useNativeDriver: true,
    }).start(() => animateParticle(index));
    
    // Animación de opacidad
    Animated.sequence([
      Animated.timing(particle.opacity, {
        toValue: Math.random() * 0.7 + 0.3,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(particle.opacity, {
        toValue: Math.random() * 0.4 + 0.2,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animación de rotación
    Animated.timing(particle.rotation, {
      toValue: Math.random() * 2,
      duration,
      useNativeDriver: true,
    }).start();
  };

  // Iniciar animaciones
  useEffect(() => {
    particleAnims.forEach((_, index) => {
      animateParticle(index);
    });
    
    // Iniciar la animación central
    if (centralAnimation.current) {
      centralAnimation.current.play();
    }
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          '#000000', 
          '#1A0011', 
          '#230019', 
          '#1A0011', 
          '#000000'
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Círculos decorativos fijos */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        
        {/* Partículas animadas distribuidas por toda la pantalla */}
        {particleAnims.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                transform: [
                  { translateX: particle.position.x },
                  { translateY: particle.position.y },
                  { scale: particle.scale },
                  { rotate: particle.rotation.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: ['0deg', '180deg', '360deg'],
                  })},
                ],
                opacity: particle.opacity,
                backgroundColor: index % 5 === 0 
                  ? '#FF3A5E' 
                  : index % 5 === 1 
                    ? '#3A7AFF' 
                    : index % 5 === 2 
                      ? '#FFD43A' 
                      : index % 5 === 3 
                        ? '#3AFF7C' 
                        : '#BA3AFF',
                shadowColor: index % 5 === 0 
                  ? '#FF3A5E' 
                  : index % 5 === 1 
                    ? '#3A7AFF' 
                    : index % 5 === 2 
                      ? '#FFD43A' 
                      : index % 5 === 3 
                        ? '#3AFF7C' 
                        : '#BA3AFF',
              },
            ]}
          />
        ))}
        
        {/* Animación central */}
        <View style={styles.centralAnimation}>
          <LottieView
            ref={centralAnimation}
            source={require('../../assets/animations/colorful-loading.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width,
    height,
    zIndex: -1,
  },
  gradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  circle: {
    position: 'absolute',
    borderRadius: 300,
    opacity: 0.15,
  },
  circle1: {
    width: 600,
    height: 600,
    backgroundColor: '#FF3A5E',
    top: -200,
    left: -100,
  },
  circle2: {
    width: 500,
    height: 500,
    backgroundColor: '#3A7AFF',
    bottom: -150,
    right: -100,
  },
  circle3: {
    width: 400,
    height: 400,
    backgroundColor: '#FF3A5E',
    bottom: height / 3,
    left: -200,
  },
  particle: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  centralAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
});

export default AnimatedBackground;
