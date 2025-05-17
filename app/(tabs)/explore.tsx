import { StyleSheet, View, Text, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// @ts-nocheck
import EventCalendar from '../../components/features/calendar/views/EventCalendar';

export default function CalendarScreen() {
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
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    // Eliminamos paddingTop ya que ahora usamos insets.top
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
