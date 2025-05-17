import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/EventDetailStyles';

/**
 * Componente que muestra el botón de asistencia a un evento
 */
const AttendanceButton = ({ isExpired, isAttending, onRegister, onCancel }) => {
  if (isExpired) {
    return (
      <View style={styles.expiredEventNotice}>
        <Ionicons name="time-outline" size={20} color="#A0A0A0" />
        <Text style={styles.expiredEventText}>
          Este evento ya ha finalizado
        </Text>
      </View>
    );
  }
  
  return (
    <TouchableOpacity
      style={[
        styles.registerButton,
        isAttending ? styles.attendingButton : {}
      ]}
      onPress={isAttending ? onCancel : onRegister}
    >
      <Text style={styles.registerButtonText}>
        {isAttending ? 'Cancelar Asistencia' : 'Confirmar Asistencia'}
      </Text>
    </TouchableOpacity>
  );
};

export default AttendanceButton;
