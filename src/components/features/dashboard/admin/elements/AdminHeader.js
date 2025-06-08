/**
 * Este archivo maneja el header del dashboard administrativo
 * - UI
 * - Sesión
 * - Navegación
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../../../../styles/DashboardAdminStyles';

const AdminHeader = ({ onLogout }) => {
  return (
    <View style={styles.header}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcome}>Panel de</Text>
        <Text style={styles.userName}>Administración</Text>
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

export default AdminHeader;
