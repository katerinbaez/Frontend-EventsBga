import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../../../../styles/DashboardArtistStyles';

const ArtistHeader = ({ artistName, onLogout }) => {
  return (
    <View style={styles.header}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcome}>¡Bienvenido</Text>
        <Text style={styles.welcome}>Artista!</Text>
        <Text style={styles.userName}>{artistName}</Text>
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

export default ArtistHeader;
