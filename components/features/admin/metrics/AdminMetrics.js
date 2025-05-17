import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../../../../constants/config';
import { styles } from '../../../../styles/AdminMetricsStyles';

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
      // Valores predeterminados para las métricas
      let generalData = { 
        totalUsers: 0, 
        totalEvents: 0, 
        activeSpaces: 0, 
        totalAttendance: 0,
        culturalSpaces: 0,
        artists: 0,
        managers: 0
      };
      let eventsData = { trend: { labels: [], datasets: [{ data: [] }] } };
      let usersData = {};
      let categoriesData = { distribution: [] };
      let spacesData = { topSpaces: { labels: [], datasets: [{ data: [] }] } };
      let requestCategoriesData = []; // Para almacenar las categorías de EventRequest
      
      try {
        // Obtener métricas generales
        const response = await fetch(`${BACKEND_URL}/api/metrics/general`);
        const data = await response.json();
        
        console.log('Respuesta de métricas generales:', data);
        
        if (data && !data.error) {
          generalData = {
            ...generalData,
            ...data
          };
          console.log('Métricas generales actualizadas:', generalData);
        } else {
          console.error('Error en la respuesta de métricas generales:', data?.error || 'Respuesta inválida');
        }
        
        // Obtener otras métricas
        const [events, users, categories, spaces] = await Promise.all([
          fetch(`${BACKEND_URL}/api/metrics/events`).then(res => res.json()).catch(() => eventsData),
          fetch(`${BACKEND_URL}/api/metrics/users`).then(res => res.json()).catch(() => usersData),
          fetch(`${BACKEND_URL}/api/metrics/categories?includeEventRequests=true`).then(res => res.json()).catch(() => categoriesData),
          fetch(`${BACKEND_URL}/api/metrics/spaces`).then(res => res.json()).catch(() => spacesData)
        ]);
        
        // Actualizar con datos reales si están disponibles
        if (events && !events.error) eventsData = events;
        if (users && !users.error) usersData = users;
        if (categories && !categories.error) categoriesData = categories;
        if (spaces && !spaces.error) spacesData = spaces;
        
        // Las categorías de Events y EventRequests ya se obtienen combinadas desde el backend
        // gracias al parámetro includeEventRequests=true en la solicitud inicial
      } catch (error) {
        console.error('Error al cargar métricas:', error.message);
      }
      
      // Asegurar que todos los datos de gráficos tengan el formato correcto
      const formattedMetrics = {
        general: generalData,
        eventMetrics: {
          ...eventsData,
          trend: eventsData?.trend || { labels: [], datasets: [{ data: [] }] }
        },
        userMetrics: usersData,
        categoryMetrics: {
          ...categoriesData,
          distribution: categoriesData?.distribution || []
        },
        spaceMetrics: {
          ...spacesData,
          topSpaces: spacesData?.topSpaces || { labels: [], datasets: [{ data: [] }] }
        }
      };

      console.log('Formatted metrics:', formattedMetrics);

      setMetrics(formattedMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  if (!metrics.general) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando métricas...</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  // Configuración común para todos los gráficos
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 58, 94, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#FF3A5E'
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Resumen General */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{metrics.general.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>Usuarios Registrados</Text>
          </View>
          <View style={[styles.statCard, styles.highlightCard]}>
            <Text style={styles.statNumber}>{metrics.general.totalEvents || 0}</Text>
            <Text style={styles.statLabel}>Eventos Realizados</Text>
            <Text style={styles.statDetail}>({metrics.eventMetrics?.eventsCount || 0} eventos + {metrics.eventMetrics?.approvedRequestsCount || 0} solicitudes)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{metrics.general.activeSpaces || 0}</Text>
            <Text style={styles.statLabel}>Espacios Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{metrics.general.totalAttendance || 0}</Text>
            <Text style={styles.statLabel}>Asistentes Totales</Text>
          </View>
        </View>
      </View>

      {/* Métricas Detalladas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas Detalladas</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.detailedCard]}>
            <Ionicons name="business" size={32} color="#FF3A5E" />
            <Text style={styles.statNumber}>{metrics.general.culturalSpaces !== undefined ? metrics.general.culturalSpaces : 0}</Text>
            <Text style={styles.statLabel}>Espacios Culturales</Text>
          </View>
          <View style={[styles.statCard, styles.detailedCard]}>
            <Ionicons name="person-circle" size={32} color="#FF3A5E" />
            <Text style={styles.statNumber}>{metrics.general.artists !== undefined ? metrics.general.artists : 0}</Text>
            <Text style={styles.statLabel}>Artistas</Text>
          </View>
          <View style={[styles.statCard, styles.detailedCard]}>
            <Ionicons name="briefcase" size={32} color="#FF3A5E" />
            <Text style={styles.statNumber}>{metrics.general.managers !== undefined ? metrics.general.managers : 0}</Text>
            <Text style={styles.statLabel}>Gestores Culturales</Text>
          </View>
        </View>
      </View>

      {/* Tendencia de Eventos */}
      {metrics.eventMetrics?.trend?.labels && metrics.eventMetrics?.trend?.datasets && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tendencia de Eventos</Text>
          <LineChart
            data={{
              labels: metrics.eventMetrics.trend.labels,
              datasets: [
                {
                  data: metrics.eventMetrics.trend.datasets[0].data,
                  color: chartConfig.color,
                  strokeWidth: 2
                }
              ]
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: chartConfig.color,
              labelColor: chartConfig.labelColor,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#FF3A5E'
              }
            }}
            bezier
            style={styles.chart}
            fromZero={true}
            yAxisLabel=""
            yAxisSuffix=""
          />
          <Text style={styles.chartDescription}>Eventos realizados por mes (incluye eventos creados y solicitudes aprobadas)</Text>
        </View>
      )}

      {/* Distribución por Categoría */}
      {metrics.categoryMetrics?.distribution?.length > 0 && (
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
      )}

      {/* Espacios más Activos */}
      {metrics.spaceMetrics?.topSpaces?.datasets?.[0]?.data?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Espacios más Activos</Text>
          <View style={styles.chartWrapper}>
            <BarChart
              data={metrics.spaceMetrics.topSpaces}
              width={screenWidth - 100} // Reducir significativamente el ancho para evitar que se salga de la tarjeta
              height={260}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: chartConfig.color,
                labelColor: chartConfig.labelColor,
                barPercentage: 0.4,
                propsForLabels: {
                  fontSize: 12,
                  fontWeight: 'bold',
                  textAlign: 'center'
                }
              }}
              style={styles.chart}
              verticalLabelRotation={0}
              horizontalLabelRotation={0}
              showValuesOnTopOfBars={true}
              fromZero={true}
              withHorizontalLabels={true}
              yAxisLabel=""
              yAxisSuffix=""
              showBarTops={true}
            />
            <View style={styles.axisLabelContainer}>
              <Text style={styles.axisLabel}>Espacios</Text>
            </View>
            <Text style={styles.chartDescription}>Número de eventos realizados en cada espacio cultural</Text>
          </View>
        </View>
      )}

      {/* Métricas de Usuarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas de Usuarios</Text>
        <View style={styles.userMetrics}>
          <View style={[styles.metricRow, styles.metricRowHighlight]}>
            <Ionicons name="people" size={24} color="#FF3A5E" style={styles.metricIcon} />
            <Text style={styles.metricLabel}>Usuarios totales:</Text>
            <Text style={styles.metricValue}>{metrics.general.totalUsers || 0}</Text>
          </View>
          <View style={styles.metricRow}>
            <Ionicons name="person-add" size={24} color="#FF3A5E" style={styles.metricIcon} />
            <Text style={styles.metricLabel}>Artistas registrados:</Text>
            <Text style={styles.metricValue}>{metrics.general.artists || 0}</Text>
          </View>
          <View style={styles.metricRow}>
            <Ionicons name="briefcase" size={24} color="#FF3A5E" style={styles.metricIcon} />
            <Text style={styles.metricLabel}>Gestores culturales:</Text>
            <Text style={styles.metricValue}>{metrics.general.managers || 0}</Text>
          </View>
          <View style={[styles.metricRow, styles.metricRowHighlight]}>
            <Ionicons name="business" size={24} color="#FF3A5E" style={styles.metricIcon} />
            <Text style={styles.metricLabel}>Espacios culturales:</Text>
            <Text style={styles.metricValue}>{metrics.general.culturalSpaces || 0}</Text>
          </View>
        </View>
      </View>

      {/* Impacto Cultural */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Impacto Cultural</Text>
        <View style={styles.impactMetrics}>
          <View style={styles.impactCard}>
            <Ionicons name="brush" size={32} color="#FF3A5E" style={styles.impactIcon} />
            <Text style={styles.impactTitle}>Diversidad Cultural</Text>
            <Text style={styles.impactNumber}>{metrics.general.culturalDiversityIndex || 0}%</Text>
            <Text style={styles.impactDescription}>Índice de diversidad en eventos</Text>
          </View>
          <View style={[styles.impactCard, styles.highlightImpactCard]}>
            <Ionicons name="people" size={32} color="#FF3A5E" style={styles.impactIcon} />
            <Text style={styles.impactTitle}>Alcance Comunitario</Text>
            <Text style={styles.impactNumber}>{metrics.general.communityReach || 0}</Text>
            <Text style={styles.impactDescription}>Asistentes registrados a eventos culturales</Text>
          </View>
          <View style={styles.impactCard}>
            <Ionicons name="star" size={32} color="#FF3A5E" style={styles.impactIcon} />
            <Text style={styles.impactTitle}>Satisfacción</Text>
            <Text style={styles.impactNumber}>{metrics.general.satisfactionRate || 0}%</Text>
            <Text style={styles.impactDescription}>Índice de satisfacción</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
export default AdminMetrics;
