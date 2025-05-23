import React, { useEffect, useRef } from 'react';
import { View, Text, Dimensions, Animated, Image } from 'react-native';
import ResponsiveStyleSheet from '../../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../../utils/ResponsiveUtils';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from './AnimatedBackground';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const animation = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Iniciar la animación al montar el componente
    if (animation.current) {
      animation.current.play();
    }
    
    // Animación de entrada con fade y escala
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      }),
      // Animación de la barra de progreso (sin useNativeDriver para width)
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false
      })
    ]).start();

    // Configurar un temporizador para llamar a onFinish después de 3.5 segundos
    const timer = setTimeout(() => {
      // Animación de salida
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        })
      ]).start(() => {
        if (onFinish) {
          onFinish();
        }
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, [onFinish, fadeAnim, scaleAnim, progressAnim]);

  return (
    <View style={styles.container}>
      {/* Fondo animado con partículas */}
      <AnimatedBackground />
      
      {/* Contenido principal */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Panel con efecto de desenfoque */}
        <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
          <View style={styles.innerContainer}>
            {/* Icono representativo del proyecto */}
            <View style={styles.iconContainer}>
              <Animated.View
                style={[styles.iconWrapper, {
                  transform: [{
                    rotate: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }]
                }]}
              >
                <LinearGradient
                  colors={['#FF3A5E', '#3A7AFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBackground}
                >
                  <Ionicons name="calendar" size={70} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
              <View style={styles.iconOverlay}>
                <Ionicons name="people" size={36} color="#FFFFFF" style={styles.overlayIcon} />
              </View>
            </View>
            
            {/* Línea decorativa */}
            <View style={styles.divider} />
            
            {/* Textos */}
            <Text style={styles.title}>EventsBga</Text>
            <Text style={styles.subtitle}>Plataforma Cultural de Bucaramanga</Text>
            
            {/* Indicador de carga */}
            <View style={styles.loadingIndicator}>
              <View style={styles.loadingBar}>
                <Animated.View 
                  style={[styles.loadingProgress, {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }]}
                />
              </View>
              <Text style={styles.loadingText}>Cargando experiencias culturales...</Text>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = ResponsiveStyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.85,
    maxWidth: moderateScale(400),
  },
  blurContainer: {
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.3)',
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(12),
    elevation: 10,
  },
  innerContainer: {
    padding: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  iconContainer: {
    width: moderateScale(200),
    height: moderateScale(200),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    position: 'relative',
  },
  iconWrapper: {
    width: moderateScale(140),
    height: moderateScale(140),
    borderRadius: moderateScale(70),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.5,
    shadowRadius: moderateScale(8),
    elevation: 10,
  },
  iconBackground: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(70),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: verticalScale(20),
    right: horizontalScale(30),
    backgroundColor: '#3A7AFF',
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(4),
    elevation: 5,
  },
  overlayIcon: {
    marginLeft: horizontalScale(2),
  },
  divider: {
    height: verticalScale(2),
    width: '80%',
    backgroundColor: '#FF3A5E',
    marginTop: verticalScale(15),
    marginBottom: verticalScale(15),
    opacity: 0.7,
  },
  title: {
    fontSize: moderateScale(35),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: verticalScale(2) },
    textShadowRadius: moderateScale(10),
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    marginTop: verticalScale(8),
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  loadingIndicator: {
    width: '100%',
    alignItems: 'center',
    marginTop: verticalScale(25),
  },
  loadingBar: {
    width: '100%',
    height: verticalScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(2),
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#FF3A5E',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(12),
    marginTop: verticalScale(8),
    fontStyle: 'italic',
  },
});

export default SplashScreen;
