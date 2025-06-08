/**
 * Este archivo maneja el contenedor de opciones administrativas
 * - UI
 * - Navegación
 * - Gestión de opciones
 */

import React from 'react';
import { View } from 'react-native';
import AdminOptionCard from './AdminOptionCard';
import { styles } from '../../../../../styles/DashboardAdminStyles';

const AdminOptionsContainer = ({ navigation }) => {
  return (
    <View style={styles.optionsContainer}>
      <AdminOptionCard 
        title="Solicitudes de Rol"
        description="Gestionar solicitudes pendientes"
        iconName="people"
        requiresNavigation={true}
        navigationTarget="ViewRoleRequests"
        navigation={navigation}
      />

      <AdminOptionCard 
        title="Calendario"
        description="Ver todos los eventos programados"
        iconName="calendar"
        requiresNavigation={true}
        navigationTarget="Calendar"
        navigation={navigation}
      />

      <AdminOptionCard 
        title="Gestión de Usuarios"
        description="Administrar roles y permisos"
        iconName="settings"
        requiresNavigation={true}
        navigationTarget="UserManagement"
        navigation={navigation}
      />

      <AdminOptionCard 
        title="Métricas"
        description="Estadísticas y reportes"
        iconName="stats-chart"
        requiresNavigation={true}
        navigationTarget="AdminMetrics"
        navigation={navigation}
      />
    </View>
  );
};

export default AdminOptionsContainer;
