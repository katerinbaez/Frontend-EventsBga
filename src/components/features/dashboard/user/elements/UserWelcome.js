/**
 * Este archivo maneja el mensaje de bienvenida del usuario
 * - UI
 * - Roles
 * - Interacción
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../../styles/DashboardUserStyles';

const UserWelcome = ({ userName, showRoleRequest, onRoleRequest }) => {
  return (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcome}>¡Bienvenido,</Text>
      <Text style={styles.userName}>{userName}!</Text>
      {showRoleRequest && (
        <TouchableOpacity 
          style={styles.requestRoleButton}
          onPress={onRoleRequest}
        >
          <Ionicons name="person-add" size={20} color="#FFF" />
          <Text style={styles.requestRoleText}>Solicitar Rol</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default UserWelcome;
