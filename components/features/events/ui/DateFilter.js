import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../utils/dateUtilsSearch';
import { styles } from '../../../../styles/EventSearchStyles';

/**
 * Componente para seleccionar fechas de inicio y fin
 */
const DateFilter = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  
  // Formatear las fechas para el calendario
  const formatCalendarDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  };
  
  // Crear objeto de marcas para el calendario
  const getMarkedDates = () => {
    const markedDates = {};
    
    if (startDate) {
      const startDateStr = formatCalendarDate(startDate);
      markedDates[startDateStr] = { 
        selected: true, 
        selectedColor: '#FF3A5E' 
      };
    }
    
    if (endDate) {
      const endDateStr = formatCalendarDate(endDate);
      markedDates[endDateStr] = { 
        selected: true, 
        selectedColor: '#FF3A5E' 
      };
    }
    
    return markedDates;
  };
  
  // Manejar la selección de fecha en el calendario
  const handleDateSelect = (day) => {
    console.log('Día seleccionado (calendario):', day.dateString);
    
    // Crear la fecha directamente del string YYYY-MM-DD sin conversión de zona horaria
    const [year, month, dayOfMonth] = day.dateString.split('-').map(Number);
    // Crear fecha con año, mes (0-11), día, y hora fija (mediodía UTC)
    const selectedDate = new Date(Date.UTC(year, month - 1, dayOfMonth, 12, 0, 0));
    
    if (selectingStartDate) {
      console.log('Fecha seleccionada (inicio):', selectedDate.toISOString());
      console.log('Día del mes seleccionado:', selectedDate.getUTCDate());
      
      if (typeof onStartDateChange === 'function') {
        onStartDateChange(selectedDate);
      } else {
        console.error('onStartDateChange no es una función');
      }
      
      setSelectingStartDate(false);
    } else {
      console.log('Fecha seleccionada (fin):', selectedDate.toISOString());
      console.log('Día del mes seleccionado:', selectedDate.getUTCDate());
      
      if (typeof onEndDateChange === 'function') {
        onEndDateChange(selectedDate);
      } else {
        console.error('onEndDateChange no es una función');
      }
      
      setShowCalendar(false);
      setSelectingStartDate(true);
    }
  };

  return (
    <View style={styles.dateFilterContainer}>
      {/* Mostrar fechas seleccionadas */}
      <View style={styles.dateDisplay}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Desde:</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => {
              setSelectingStartDate(true);
              setShowCalendar(!showCalendar);
            }}
          >
            <Text style={styles.dateButtonText}>
              {startDate ? formatDate(startDate) : 'Seleccionar'}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Hasta:</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => {
              setSelectingStartDate(false);
              setShowCalendar(!showCalendar);
            }}
          >
            <Text style={styles.dateButtonText}>
              {endDate ? formatDate(endDate) : 'Seleccionar'}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Calendario */}
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>
              {selectingStartDate ? 'Seleccionar fecha de inicio' : 'Seleccionar fecha de fin'}
            </Text>
            <TouchableOpacity onPress={() => setShowCalendar(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <Calendar
            style={styles.calendar}
            minDate={selectingStartDate ? new Date().toISOString().split('T')[0] : (startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])}
            onDayPress={handleDateSelect}
            markedDates={getMarkedDates()}
            theme={{
              calendarBackground: '#2C2C2C',
              textSectionTitleColor: '#FFF',
              selectedDayBackgroundColor: '#FF3A5E',
              selectedDayTextColor: '#FFF',
              todayTextColor: '#FF3A5E',
              dayTextColor: '#FFF',
              textDisabledColor: '#666',
              arrowColor: '#FF3A5E',
              monthTextColor: '#FFF'
            }}
          />
        </View>
      )}
    </View>
  );
};

export default DateFilter;
