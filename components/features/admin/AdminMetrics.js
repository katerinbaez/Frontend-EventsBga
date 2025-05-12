import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';

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
  

  
  // Función para combinar categorías de Events y EventRequest
  const combineCategories = (eventsCategories = [], requestsCategories = []) => {
    const categoryMap = new Map();
    
    // Procesar categorías de Events
    eventsCategories.forEach(category => {
      categoryMap.set(category.name, {
        name: category.name,
        value: category.value,
        color: category.color,
        legendFontColor: category.legendFontColor || '#7F7F7F',
        legendFontSize: category.legendFontSize || 12
      });
    });
    
    // Añadir o actualizar con categorías de EventRequest
    requestsCategories.forEach(category => {
      if (categoryMap.has(category.name)) {
        // Si la categoría ya existe, sumar los valores
        const existingCategory = categoryMap.get(category.name);
        existingCategory.value += category.value;
        categoryMap.set(category.name, existingCategory);
      } else {
        // Si es una nueva categoría, añadirla al mapa
        categoryMap.set(category.name, {
          name: category.name,
          value: category.value,
          color: category.color || `#${Math.floor(Math.random()*16777215).toString(16)}`, // Color aleatorio si no tiene
          legendFontColor: category.legendFontColor || '#7F7F7F',
          legendFontSize: category.legendFontSize || 12
        });
      }
    });
    
    // Convertir el mapa de vuelta a un array
    return Array.from(categoryMap.values());
  };

  // Verificar que tenemos datos antes de renderizar
  if (!metrics.general) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando métricas...</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 58, 94, ${opacity})`, // Color de acento rojo
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
            data={metrics.eventMetrics.trend}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
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
                color: (opacity = 1) => `rgba(255, 58, 94, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statDetail: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  chartDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  chartWrapper: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 10,
    overflow: 'hidden', // Ocultar cualquier contenido que se salga del contenedor
  },
  axisLabelContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  axisLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  detailedCard: {
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#FFD0D9',
    width: '31%',
  },
  userCard: {
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#FFD0D9',
    width: '31%',
  },
  highlightCard: {
    backgroundColor: '#C9E4CA',
    borderWidth: 1,
    borderColor: '#8BC34A',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
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
  metricRowHighlight: {
    backgroundColor: '#C9E4CA',
    padding: 8,
    borderRadius: 8,
  },
  metricIcon: {
    marginRight: 8,
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
  highlightImpactCard: {
    backgroundColor: '#C9E4CA',
    borderWidth: 1,
    borderColor: '#8BC34A',
  },
  impactIcon: {
    marginRight: 8,
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
  impactNote: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});

export default AdminMetrics;
