/**
 * Este archivo maneja el header del dashboard del gestor
 * - UI
 * - Sesión
 * - Navegación
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../../../../styles/DashboardManagerStyles';

const ManagerHeader = ({ managerName, onLogout }) => {
  return (
    <View style={styles.header}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcome}>¡Bienvenido</Text>
        <Text style={styles.welcome}>Gestor!</Text>
        <Text style={styles.userName}>{managerName}</Text>
      </View>
      <TouchableOpacity
        onPress={onLogout}
        style={styles.headerButton}
      >
        <Text style={styles.headerButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ManagerHeader;
