import { StyleSheet, Dimensions } from 'react-native';
import ResponsiveStyleSheet from '../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../utils/ResponsiveUtils';

const { width } = Dimensions.get('window');

export const styles = ResponsiveStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#63050B',
    padding: moderateScale(16),
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
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(5),
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255, 58, 94, 0.5)',
    textShadowOffset: { width: 0, height: verticalScale(2) },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#CCCCCC',
    marginBottom: verticalScale(15),
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#000000',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(15),
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    elevation: 4,
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(10),
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  statItem: {
    width: '48%',
    backgroundColor: '#222222',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: verticalScale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  statValue: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  impactContainer: {
    marginTop: verticalScale(10),
  },
  impactTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(10),
    letterSpacing: 0.3,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    backgroundColor: '#222222',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: '#333333',
  },
  impactIcon: {
    marginRight: horizontalScale(10),
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    padding: moderateScale(8),
    borderRadius: moderateScale(10),
  },
  impactInfo: {
    flex: 1,
  },
  impactValue: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(2),
  },
  impactLabel: {
    fontSize: moderateScale(14),
    color: '#AAAAAA',
  },
  userListContainer: {
    marginTop: verticalScale(10),
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    backgroundColor: '#222222',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: '#333333',
  },
  userAvatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  userInitial: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(2),
  },
  userEmail: {
    fontSize: moderateScale(14),
    color: '#AAAAAA',
  },
  userRole: {
    fontSize: moderateScale(12),
    color: '#FF3A5E',
    fontWeight: 'bold',
    marginLeft: 'auto',
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  chart: {
    marginVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    alignSelf: 'center',
  },
  chartWrapper: {
    padding: moderateScale(16),
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(16),
    marginVertical: verticalScale(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F52900',
  },
  axisLabelContainer: {
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  axisLabel: {
    fontSize: moderateScale(14),
    color: '#AAAAAA',
    fontStyle: 'italic',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: verticalScale(10),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: horizontalScale(16),
    marginBottom: verticalScale(8),
  },
  legendColor: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    marginRight: horizontalScale(6),
  },
  legendText: {
    fontSize: moderateScale(12),
    color: '#CCCCCC',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: moderateScale(16),
    color: '#AAAAAA',
    fontStyle: 'italic',
    marginTop: verticalScale(20),
  },
  refreshButton: {
    backgroundColor: '#FF3A5E',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(24),
    borderRadius: moderateScale(30),
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 5,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginLeft: horizontalScale(8),
  },

  
  // Estilos adicionales para AdminMetrics
  section: {
    marginBottom: verticalScale(24),
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(16),
    padding: moderateScale(10),
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(8),
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FF3A5E',
    alignItems: 'center',
    width: '100%',
  },

  
  generalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
  },
  
  detailedStatsGrid: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  
  statCard: {
    width: '48%',
    backgroundColor: '#000000',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: verticalScale(11),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F52900',
    minHeight: verticalScale(100),
  },
  
  highlightCard: {
    borderColor: '#F52900',
    borderWidth: moderateScale(1),
  },
  
  statNumber: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  
  statLabel: {
    fontSize: moderateScale(11),
    color: '#FFFFFF',
    textAlign: 'center',
    flexWrap: 'nowrap',
  },
  
  statDetail: {
    fontSize: moderateScale(10),
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: verticalScale(4),
    flexWrap: 'nowrap',
  },
  
  detailedCard: {
    width: '90%',
    padding: moderateScale(12),
    minHeight: verticalScale(130),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginHorizontal: 0,
    marginBottom: verticalScale(15),
    borderWidth: moderateScale(2),
    borderColor: '#FF3A5E',
    borderRadius: moderateScale(12),
  },
  
  chart: {
    marginVertical: verticalScale(12),
    borderRadius: moderateScale(16),
    alignSelf: 'center',
    overflow: 'hidden',
  },
  
  pieChart: {
    alignSelf: 'center',
    marginHorizontal: horizontalScale(10),
  },
  
  customLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: verticalScale(15),
    marginBottom: verticalScale(10),
    paddingHorizontal: horizontalScale(5),
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: horizontalScale(8),
    marginVertical: verticalScale(5),
    width: horizontalScale(120),
  },
  
  legendColorBox: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(3),
    marginRight: horizontalScale(5),
  },
  
  legendText: {
    fontSize: moderateScale(11),
    color: '#333333',
    flex: 1,
    flexWrap: 'wrap',
  },
  
  customBarChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: verticalScale(180),
    marginVertical: verticalScale(15),
    paddingBottom: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  
  customBarContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    marginHorizontal: horizontalScale(5),
  },
  
  customBar: {
    width: horizontalScale(30),
    borderTopLeftRadius: moderateScale(4),
    borderTopRightRadius: moderateScale(4),
  },
  
  barValue: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    marginBottom: verticalScale(5),
    color: '#333333',
  },
  
  chartDescription: {
    fontSize: moderateScale(12),
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: verticalScale(8),
    fontStyle: 'italic',
  },

  
  axisLabelContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  
  axisLabel: {
    fontSize: moderateScale(14),
    color: '#CCCCCC',
    fontWeight: 'bold',
  },
  
  userMetrics: {
    backgroundColor: '#000000',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    borderWidth: moderateScale(1),
    borderColor: '#4A4A6A',
  },
  
  userMetrics: {
    width: '100%',
    paddingHorizontal: horizontalScale(5),
    backgroundColor: '#000000',
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(10),
    marginBottom: verticalScale(10),
  },
  
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#333333',
    width: '100%',
  },
  
  metricRowHighlight: {
    backgroundColor: 'rgba(255, 58, 94, 0.3)',
    borderRadius: moderateScale(8),
  },
  
  metricIcon: {
    marginRight: horizontalScale(12),
  },
  
  metricLabel: {
    flex: 1,
    fontSize: moderateScale(16),
    marginRight: horizontalScale(10),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  
  metricValue: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  impactMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
  },
  
  impactCard: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderColor: '#FF3A5E',
    shadowColor: '#FF3A5E',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(4),
    elevation: 3,
    minHeight: verticalScale(180),
    justifyContent: 'center',
  },
  
  highlightImpactCard: {
    width: '100%',
    borderColor: '#FF3A5E',
    borderWidth: moderateScale(1),
    marginBottom: verticalScale(16),
    backgroundColor: '#000000',
    minHeight: verticalScale(180),
  },
  
  impactIcon: {
    marginBottom: verticalScale(5),
    backgroundColor: 'rgba(255, 58, 94, 0.5)',
    padding: moderateScale(10),
    borderRadius: moderateScale(50),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.35,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },
  
  impactTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(4),
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  impactNumber: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(4),
    marginTop: verticalScale(0),
    textShadowColor: 'rgba(255, 58, 94, 0.5)',
    textShadowOffset: { width: 0, height: verticalScale(1) },
    textShadowRadius: moderateScale(2),
  },
  
  impactDescription: {
    fontSize: moderateScale(13),
    color: '#BBBBBB',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontStyle: 'italic',
    marginTop: verticalScale(2),
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(12),
    backgroundColor: '#222222',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
    borderWidth: moderateScale(1),
    borderColor: '#333333',
  },
  categoryName: {
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#FF3A5E',
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  spaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    backgroundColor: '#222222',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
    borderWidth: moderateScale(1),
    borderColor: '#333333',
  },
  spaceInfo: {
    flex: 1,
    marginLeft: horizontalScale(12),
  },
  spaceName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(2),
  },
  spaceAddress: {
    fontSize: moderateScale(14),
    color: '#AAAAAA',
  },
  spaceIcon: {
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    padding: moderateScale(8),
    borderRadius: moderateScale(10),
  },
  eventCount: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: '#FF3A5E',
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    marginLeft: 'auto',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
    backgroundColor: '#222222',
    borderRadius: moderateScale(30),
    padding: moderateScale(4),
    borderWidth: 1,
    borderColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: moderateScale(25),
  },
  activeTab: {
    backgroundColor: '#FF3A5E',
  },
  tabText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#AAAAAA',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chartTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: verticalScale(12),
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
      borderRadius: moderateScale(16),
    },
    propsForDots: {
      r: moderateScale(6).toString(),
      strokeWidth: moderateScale(2).toString(),
      stroke: '#FF3A5E',
    },
    propsForLabels: {
      fontSize: moderateScale(12),
    },
  },
});
