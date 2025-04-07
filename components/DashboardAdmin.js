import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { StyleSheet } from 'react-native';

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
        onPress={() => navigation.navigate('RoleRequests')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  welcomeContainer: {
    marginRight: 50,
  },
  welcome: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  userName: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerButton: {
    position: 'absolute',
    right: 20,
    top: 50,
    backgroundColor: '#ff4757',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '47%',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  adminCard: {
    backgroundColor: '#1a1a1a',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 5,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default DashboardAdmin;
