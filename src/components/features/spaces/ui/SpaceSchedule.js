/**
 * Este archivo maneja el horario del espacio
 * - UI
 * - Espacios
 * - Horario
 * - Programación
 */

import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../../styles/CulturalSpacesModalStyles';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const SpaceSchedule = ({ schedule }) => {
  if (!schedule) return null;

  return (
    <View style={styles.detailSection}>
      <Text style={styles.sectionTitle}>Horarios</Text>
      
      {DAYS.map((day, index) => {
        const dayKey = day.toLowerCase();
        const daySchedule = schedule[dayKey];
        
        return (
          <View key={`day-${index}`} style={styles.dayContainer}>
            <Text style={styles.dayName}>{day}</Text>
            <View style={styles.timeSlots}>
              {daySchedule && daySchedule.isOpen ? (
                <Text style={styles.timeSlot}>
                  {daySchedule.horarios && daySchedule.horarios.length > 0 
                    ? `${daySchedule.horarios[0].inicio} - ${daySchedule.horarios[0].fin}`
                    : '08:00 - 18:00'}
                </Text>
              ) : (
                <Text style={styles.closedText}>Cerrado</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default SpaceSchedule;
