/**
 * Este archivo maneja los campos del gestor
 * - UI
 * - Roles
 * - Campos
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import styles from '../../../../styles/RoleRequestFormStyles';

const ManagerFields = ({ formData, errors, onInputChange }) => {
  return (
    <>
      <Text style={styles.fieldTitle}>Experiencia en Gestión Cultural *</Text>
      <TextInput
        style={[
          styles.textArea,
          errors.experienciaGestion && styles.textAreaError
        ]}
        multiline
        numberOfLines={4}
        placeholder="Describe tu experiencia en gestión de espacios culturales"
        placeholderTextColor="#666666"
        value={formData.experienciaGestion}
        onChangeText={(text) => onInputChange('experienciaGestion', text)}
      />
      {errors.experienciaGestion && (
        <Text style={styles.errorText}>Este campo es requerido</Text>
      )}

      <Text style={styles.fieldTitle}>Espacio Cultural *</Text>
      <TextInput
        style={[
          styles.textArea,
          errors.espacioCultural && styles.textAreaError
        ]}
        multiline
        numberOfLines={3}
        placeholder="Describe el espacio cultural que gestionas"
        placeholderTextColor="#666666"
        value={formData.espacioCultural}
        onChangeText={(text) => onInputChange('espacioCultural', text)}
      />
      {errors.espacioCultural && (
        <Text style={styles.errorText}>Este campo es requerido</Text>
      )}

      <Text style={styles.fieldTitle}>Licencias y Permisos</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de licencias o permisos relevantes"
        value={formData.licencias}
        onChangeText={(text) => onInputChange('licencias', text)}
      />
    </>
  );
};

export default ManagerFields;