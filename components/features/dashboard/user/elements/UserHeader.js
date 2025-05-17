import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../../../styles/DashboardUserStyles';
import UserWelcome from './UserWelcome';

const UserHeader = ({ userName, onLogout, showRoleRequest, onRoleRequest }) => {
  return (
    <View style={styles.header}>
      <UserWelcome 
        userName={userName}
        showRoleRequest={showRoleRequest}
        onRoleRequest={onRoleRequest}
      />
      <TouchableOpacity 
        onPress={onLogout}
        style={styles.headerButton}
      >
        <Text style={styles.headerButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

export default UserHeader;
