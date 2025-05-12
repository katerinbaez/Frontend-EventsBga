import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import { styles } from '../../../styles/DashboardAdminStyles';

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
        onPress={() => {
          try {
            navigation.navigate('Calendar');
          } catch (error) {
            Alert.alert(
              'Error de navegación',
              'No se pudo acceder al calendario de eventos. Por favor, intenta nuevamente.',
              [{ text: 'Aceptar' }]
            );
            console.error('Error al navegar al calendario:', error);
          }
        }}
      >
        <Ionicons name="calendar" size={40} color="#FFD700" />
        <Text style={[styles.optionTitle, styles.adminText]}>Calendario</Text>
        <Text style={[styles.optionDescription, styles.adminText]}>Ver todos los eventos programados</Text>
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
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {renderAdminWelcome()}
          <TouchableOpacity 
            onPress={handleLogoutAndNavigate}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      
        <View style={styles.welcomeMessageContainer}>
          <Ionicons name="star-outline" size={24} color="#FFD700" />
          <View style={styles.welcomeMessageTextContainer}>
            <Text style={styles.welcomeMessageTitle}>
              ¡Bienvenido, {user?.nombre || 'Administrador'}!
            </Text>
            <Text style={styles.welcomeMessage}>
              Desde este panel puedes gestionar todos los aspectos de la plataforma de eventos culturales. Selecciona una opción para comenzar.
            </Text>
          </View>
        </View>
        
        {renderAdminOptions()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardAdmin;
