import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#63050B',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255, 58, 94, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  impactContainer: {
    marginTop: 10,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  impactIcon: {
    marginRight: 10,
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    padding: 8,
    borderRadius: 10,
  },
  impactInfo: {
    flex: 1,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  impactLabel: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  userListContainer: {
    marginTop: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#222222',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  userRole: {
    fontSize: 12,
    color: '#FF3A5E',
    fontWeight: 'bold',
    marginLeft: 'auto',
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  chartWrapper: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F52900',
  },
  axisLabelContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  axisLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    fontStyle: 'italic',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#AAAAAA',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  refreshButton: {
    backgroundColor: '#FF3A5E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  
  // Estilos adicionales para AdminMetrics
  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FF3A5E',
  },

  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  statCard: {
    width: '48%',
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F52900',
  },
  
  highlightCard: {
    borderColor: '#F52900',
    borderWidth: 1,
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  
  statDetail: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 4,
  },
  
  detailedCard: {
    width: '31%',
    padding: 10,
  },
  
  chart: {
    marginVertical: 12,
    borderRadius: 16,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  
  chartDescription: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  
  axisLabelContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  
  axisLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: 'bold',
  },
  
  userMetrics: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A4A6A',
  },
  
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A6A',
  },
  
  metricRowHighlight: {
    backgroundColor: 'rgba(234, 24, 62, 0.61)',
    borderRadius: 8,
  },
  
  metricIcon: {
    marginRight: 12,
  },
  
  metricLabel: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3A5E',
  },
  
  impactMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  
  impactCard: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3A5E',
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 180,
    justifyContent: 'center',
  },
  
  highlightImpactCard: {
    width: '100%',
    borderColor: '#FF3A5E',
    borderWidth: 1,
    marginBottom: 16,
    backgroundColor: '#000000',
    minHeight: 180,
  },
  
  impactIcon: {
    marginBottom: 12,
    backgroundColor: 'rgba(198, 0, 36, 0.75)',
    padding: 12,
    borderRadius: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  impactNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 4,
    textShadowColor: 'rgba(255, 58, 94, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  impactDescription: {
    fontSize: 13,
    color: '#BBBBBB',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontStyle: 'italic',
    marginTop: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#222222',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3A5E',
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  spaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#222222',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  spaceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  spaceAddress: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  spaceIcon: {
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    padding: 8,
    borderRadius: 10,
  },
  eventCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3A5E',
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#222222',
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: '#FF3A5E',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AAAAAA',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartConfig: {
    backgroundColor: '#222222',
    backgroundGradientFrom: '#222222',
    backgroundGradientTo: '#222222',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 58, 94, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#FF3A5E',
    },
    propsForLabels: {
      fontSize: 12,
    },
  },
});
