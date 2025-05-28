import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../../styles/DashboardAdminStyles';
import { moderateScale } from '../../../../../utils/ResponsiveUtils';

const AdminWelcomeMessage = ({ userName }) => {
  return (
    <View style={styles.welcomeMessageContainer}>
      <Ionicons name="star-outline" size={moderateScale(24)} color="#FFD700" />
      <View style={styles.welcomeMessageTextContainer}>
        <Text style={styles.welcomeMessageTitle}>
          ¡Bienvenido, {userName || 'Administrador'}!
        </Text>
        <Text style={styles.welcomeMessage}>
          Desde este panel puedes gestionar todos los aspectos de la plataforma de eventos culturales. Selecciona una opción para comenzar.
        </Text>
      </View>
    </View>
  );
};

export default AdminWelcomeMessage;
