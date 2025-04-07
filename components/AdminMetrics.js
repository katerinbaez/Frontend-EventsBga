import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const AdminMetrics = () => {
  const [metrics, setMetrics] = useState({
    general: null,
    eventMetrics: null,
    userMetrics: null,
    categoryMetrics: null,
    spaceMetrics: null
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const [general, events, users, categories, spaces] = await Promise.all([
        fetch('/api/metrics/general').then(res => res.json()),
        fetch('/api/metrics/events').then(res => res.json()),
        fetch('/api/metrics/users').then(res => res.json()),
        fetch('/api/metrics/categories').then(res => res.json()),
        fetch('/api/metrics/spaces').then(res => res.json())
      ]);

      setMetrics({
        general,
        eventMetrics: events,
        userMetrics: users,
        categoryMetrics: categories,
        spaceMetrics: spaces
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  if (!metrics.general) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando métricas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Resumen General */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={32} color="#4A90E2" />
            <Text style={styles.statNumber}>{metrics.general.totalUsers}</Text>
            <Text style={styles.statLabel}>Usuarios Totales</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={32} color="#4A90E2" />
            <Text style={styles.statNumber}>{metrics.general.totalEvents}</Text>
            <Text style={styles.statLabel}>Eventos Realizados</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="business" size={32} color="#4A90E2" />
            <Text style={styles.statNumber}>{metrics.general.activeSpaces}</Text>
            <Text style={styles.statLabel}>Espacios Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="ticket" size={32} color="#4A90E2" />
            <Text style={styles.statNumber}>{metrics.general.totalAttendance}</Text>
            <Text style={styles.statLabel}>Asistentes Totales</Text>
          </View>
        </View>
      </View>

      {/* Tendencia de Eventos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tendencia de Eventos</Text>
        <LineChart
          data={metrics.eventMetrics.trend}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Distribución por Categoría */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eventos por Categoría</Text>
        <PieChart
          data={metrics.categoryMetrics.distribution}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>

      {/* Espacios más Activos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Espacios más Activos</Text>
        <BarChart
          data={metrics.spaceMetrics.topSpaces}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          verticalLabelRotation={30}
        />
      </View>

      {/* Métricas de Usuarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas de Usuarios</Text>
        <View style={styles.userMetrics}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Nuevos usuarios (último mes):</Text>
            <Text style={styles.metricValue}>{metrics.userMetrics.newUsers}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Usuarios activos:</Text>
            <Text style={styles.metricValue}>{metrics.userMetrics.activeUsers}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Artistas verificados:</Text>
            <Text style={styles.metricValue}>{metrics.userMetrics.verifiedArtists}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Gestores culturales:</Text>
            <Text style={styles.metricValue}>{metrics.userMetrics.culturalManagers}</Text>
          </View>
        </View>
      </View>

      {/* Impacto Cultural */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Impacto Cultural</Text>
        <View style={styles.impactMetrics}>
          <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>Diversidad Cultural</Text>
            <Text style={styles.impactNumber}>{metrics.general.culturalDiversityIndex}%</Text>
            <Text style={styles.impactDescription}>Índice de diversidad en eventos</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>Alcance Comunitario</Text>
            <Text style={styles.impactNumber}>{metrics.general.communityReach}</Text>
            <Text style={styles.impactDescription}>Personas alcanzadas</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>Satisfacción</Text>
            <Text style={styles.impactNumber}>{metrics.general.satisfactionRate}%</Text>
            <Text style={styles.impactDescription}>Índice de satisfacción</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  userMetrics: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  impactMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  impactNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
  },
  impactDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

export default AdminMetrics;
