// src/screens/CalendarScreen.js (conector mínimo)
// Este archivo actúa como un conector entre la navegación y el componente real

import EventCalendar from '../components/features/calendar/views/EventCalendar';

import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CalendarScreen = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={28} color="#FF3A5E" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Calendario</Text>
      </View>
      
      <View style={styles.calendarFullContainer}>
        <EventCalendar inHomeScreen={false} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginHorizontal: 12,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calendarFullContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 12,
  },
});

export default CalendarScreen;
