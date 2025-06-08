/**
 * Este archivo maneja el estado de carga y error
 * - UI
 * - Estados
 * - Acciones
 */

import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { styles } from '../../../../styles/EventDetailStyles';

const LoadingErrorState = ({ isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3A5E" />
        <Text style={styles.loadingText}>Cargando detalles del evento...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error}
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onRetry}
        >
          <Text style={styles.backButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return null;
};

export default LoadingErrorState;
