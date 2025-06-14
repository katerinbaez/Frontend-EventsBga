/**
 * Este archivo maneja el selector de roles
 * - UI
 * - Roles
 * - Selector
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../../styles/RoleRequestFormStyles';

const RoleSelector = ({ selectedRole, onSelectRole, errors }) => {
  return (
    <View>
      <View style={styles.roleSelector}>
        <TouchableOpacity 
          style={[
            styles.roleButton,
            selectedRole === 'Artista' && styles.roleButtonSelected,
            errors.role && styles.inputError
          ]}
          onPress={() => onSelectRole('Artista')}
        >
          <Ionicons name="brush" size={24} color="#FFFFFF" />
          <Text style={[
            styles.roleButtonText,
            selectedRole === 'Artista' && styles.roleButtonTextSelected
          ]}>Artista</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.roleButton,
            selectedRole === 'Manager' && styles.roleButtonSelected,
            errors.role && styles.inputError
          ]}
          onPress={() => onSelectRole('Manager')}
        >
          <Ionicons name="business" size={24} color="#FFFFFF" />
          <Text style={[
            styles.roleButtonText,
            selectedRole === 'Manager' && styles.roleButtonTextSelected
          ]}>Gestor Cultural</Text>
        </TouchableOpacity>
      </View>

      {errors.role && <Text style={styles.errorText}>Por favor selecciona un rol</Text>}
    </View>
  );
};

export default RoleSelector;