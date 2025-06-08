/**
 * Este archivo maneja los botones del formulario
 * - UI
 * - Roles
 * - Botones
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../../../../styles/RoleRequestFormStyles';

const FormButtons = ({ onSubmit, onCancel, isSubmitting }) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.button, styles.submitButton, isSubmitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.cancelButton]}
        onPress={onCancel}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FormButtons;