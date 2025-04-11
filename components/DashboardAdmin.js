import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { styles } from '../styles/DashboardAdminStyles';

const DashboardAdmin = () => {
  const { user, handleLogout } = useAuth();
  const navigation = useNavigation();

  const handleLogoutAndNavigate = async () => {
    await handleLogout();
    navigation.replace('Home');
  };

  const renderAdminWelcome = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcome}>Panel de</Text>
      <Text style={styles.userName}>Administración</Text>
    </View>
  );

  const renderAdminOptions = () => (
    <View style={styles.optionsContainer}>
      <TouchableOpacity 
        style={[styles.optionCard, styles.adminCard]}
        onPress={() => navigation.navigate('ViewRoleRequests')}
      >
        <Ionicons name="people" size={40} color="#FFD700" />
        <Text style={[styles.optionTitle, styles.adminText]}>Solicitudes de Rol</Text>
        <Text style={[styles.optionDescription, styles.adminText]}>Gestionar solicitudes pendientes</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.optionCard, styles.adminCard]}
        onPress={() => navigation.navigate('EventApprovals')}
      >
        <Ionicons name="calendar" size={40} color="#FFD700" />
        <Text style={[styles.optionTitle, styles.adminText]}>Eventos Pendientes</Text>
        <Text style={[styles.optionDescription, styles.adminText]}>Aprobar eventos nuevos</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.optionCard, styles.adminCard]}
        onPress={() => navigation.navigate('UserManagement')}
      >
        <Ionicons name="settings" size={40} color="#FFD700" />
        <Text style={[styles.optionTitle, styles.adminText]}>Gestión de Usuarios</Text>
        <Text style={[styles.optionDescription, styles.adminText]}>Administrar roles y permisos</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.optionCard, styles.adminCard]}
        onPress={() => navigation.navigate('AdminMetrics')}
      >
        <Ionicons name="stats-chart" size={40} color="#FFD700" />
        <Text style={[styles.optionTitle, styles.adminText]}>Métricas</Text>
        <Text style={[styles.optionDescription, styles.adminText]}>Estadísticas y reportes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {renderAdminWelcome()}
        <TouchableOpacity 
          onPress={handleLogoutAndNavigate}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
      {renderAdminOptions()}
    </ScrollView>
  );
};

export default DashboardAdmin;
