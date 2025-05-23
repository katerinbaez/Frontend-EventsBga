import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ManagerOptionCard from './ManagerOptionCard';
import { styles } from '../../../../../styles/DashboardManagerStyles';

const ManagerOptionsContainer = ({ navigation, user, managerData, onOpenRequestsModal, setSelectedEvent, setAttendeesModalVisible }) => {
  return (
    <View style={styles.optionsContainer}>
      {/* Primera fila de opciones - 6 tarjetas en 3 filas de 2 */}
      <ManagerOptionCard 
        title="Mi Espacio"
        description="Gestionar espacio cultural"
        iconName="business"
        iconColor="#4A90E2"
        requiresNavigation={true}
        navigationTarget="CulturalSpace"
        navigationParams={{ userId: user?.id || '' }}
        navigation={navigation}
      />

      <ManagerOptionCard 
        title="Calendario"
        description="Ver eventos programados"
        iconName="calendar"
        iconColor="#4A90E2"
        requiresNavigation={true}
        navigationTarget="Calendar"
        navigation={navigation}
      />

      <ManagerOptionCard 
        title="Horarios"
        description="Gestionar disponibilidad"
        iconName="calendar"
        iconColor="#4A90E2"
        requiresNavigation={true}
        navigationTarget="SpaceSchedule"
        navigation={navigation}
      />

      <ManagerOptionCard 
        title="Solicitudes"
        description="Revisar solicitudes de eventos"
        iconName="list"
        iconColor="#FF3A5E"
        onPress={onOpenRequestsModal}
      />

      <ManagerOptionCard 
        title="Programar eventos"
        description="Programar eventos para el espacio"
        iconName="calendar"
        iconColor="#FF3A5E"
        requiresNavigation={true}
        navigationTarget="EventProgramming"
        navigationParams={{ 
          managerId: user?.id || '',
          spaceId: (managerData?.id || user?.id || ''), 
          spaceName: (managerData?.nombreEspacio || user?.name || 'Mi Espacio Cultural')
        }}
        navigation={navigation}
      />

      <ManagerOptionCard 
        title="Mis eventos"
        description="Ver y editar eventos programados"
        iconName="calendar-outline" // Cambiado de "list" a "calendar-outline" para diferenciarlo de Solicitudes
        iconColor="#FF3A5E"
        requiresNavigation={true}
        navigationTarget="ManageEvents"
        navigationParams={{ 
          managerId: user?.id || '',
          spaceId: (managerData?.id || user?.id || ''), 
          spaceName: (managerData?.nombreEspacio || user?.name || 'Mi Espacio Cultural')
        }}
        navigation={navigation}
      />

      {/* Cuadro de ancho completo para la última opción */}
      <View style={{ width: '100%', marginBottom: 20 }}>
        <View style={[styles.optionCard, { width: '100%' }]}>
          <Ionicons name="people" size={32} color="#FFFFFF" />
          <Text style={styles.optionTitle}>Asistentes Confirmados</Text>
          <Text style={styles.optionDescription}>Ver asistentes a eventos</Text>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#00EA01', 
              paddingVertical: 8, 
              paddingHorizontal: 15, 
              borderRadius: 20, 
              marginTop: 15 
            }}
            onPress={() => {
              if (navigation) {
                navigation.navigate('EventAttendance', { 
                  managerId: user?.id || ''
                });
              }
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Ver asistentes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ManagerOptionsContainer;
