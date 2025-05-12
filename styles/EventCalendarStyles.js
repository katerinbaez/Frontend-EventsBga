import { StyleSheet } from 'react-native';

const EventCalendarStyles = StyleSheet.create({
  // Estilos principales del contenedor
  container: { 
    flex: 1, 
    padding: 10,
    backgroundColor: '#000000'
  },
  
  // Estilos para la pantalla de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000'
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500'
  },
  
  // Estilos para la pantalla de error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000'
  },
  errorText: {
    color: '#FF3A5E',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
    fontWeight: 'bold'
  },
  errorSubtext: {
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14
  },
  retryButton: {
    backgroundColor: '#FF3A5E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  
  // Contenedor de eventos
  eventosContainer: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#000000'
  },
  titulo: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginVertical: 10,
    color: '#FFFFFF',
    textAlign: 'center'
  },
  vacio: { 
    fontStyle: 'italic', 
    marginTop: 10,
    color: '#AAAAAA',
    textAlign: 'center'
  },
  
  // Tarjeta de evento
  evento: { 
    marginVertical: 5, 
    padding: 12, 
    borderRadius: 8,
    borderLeftWidth: 3,
    backgroundColor: '#222222',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3
  },
  
  // Estilos para eventos (tabla Event)
  eventoProgramado: {
    borderLeftColor: '#FF3A5E' // Rojo (color de acento)
  },
  eventoPendiente: {
    borderLeftColor: '#3498DB' // Azul
  },
  eventoCancelado: {
    borderLeftColor: '#95A5A6', // Gris
    opacity: 0.8
  },
  
  // Estilos para solicitudes (tabla EventRequest)
  solicitudAprobada: {
    borderLeftColor: '#2ECC71' // Verde
  },
  solicitudPendiente: {
    borderLeftColor: '#F39C12' // Naranja
  },
  solicitudRechazada: {
    borderLeftColor: '#E74C3C', // Rojo oscuro
    opacity: 0.8
  },
  
  // Cabecera del evento
  eventoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  nombre: { 
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1
  },
  descripcion: { 
    color: '#CCCCCC',
    marginBottom: 8
  },
  
  // Detalles del evento
  eventoDetalles: {
    marginTop: 5,
    backgroundColor: '#333333',
    borderRadius: 6,
    padding: 8,
    width: '100%'
  },
  detalleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 3,
    marginBottom: 5,
    width: '100%'
  },
  detalleTexto: {
    fontSize: 13,
    color: '#DDDDDD',
    marginLeft: 5,
    flex: 1,
    flexWrap: 'wrap'
  },
  detalleSubtexto: {
    fontSize: 12,
    color: '#AAAAAA',
    marginLeft: 22,
    marginTop: 2
  },
  
  // Estilos para la dirección
  direccionContainer: {
    flex: 1,
    marginLeft: 8,
    flexDirection: 'column'
  },
  direccionTexto: {
    fontSize: 14,
    color: '#DDDDDD',
    marginTop: 3,
    fontWeight: '500'
  },
  
  // Badges de estado
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8
  },
  estadoPendiente: {
    backgroundColor: '#F39C1266',
  },
  estadoAprobado: {
    backgroundColor: '#27AE6066',
  },
  estadoRechazado: {
    backgroundColor: '#E74C3C66',
  },
  estadoTexto: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  
  // Estilos para badges de estado de eventos (tabla Event)
  estadoProgramado: {
    backgroundColor: '#FF3A5E66' // Rojo (color de acento)
  },
  estadoCancelado: {
    backgroundColor: '#95A5A666' // Gris
  },
  
  // Estilos para badges de estado de solicitudes (tabla EventRequest)
  estadoPendienteSolicitud: {
    backgroundColor: '#F39C1266' // Naranja
  },
  
  // Leyenda de colores
  leyendaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
    padding: 5,
    backgroundColor: '#333333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444'
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 3
  },
  leyendaColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5
  },
  leyendaTexto: {
    fontSize: 12,
    color: '#DDDDDD',
    fontWeight: '500'
  },
  
  // Estilos para el calendario
  calendarContainer: {
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 15,
    padding: 5,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333'
  },
  calendarTheme: {
    // Colores de fondo
    calendarBackground: '#111111',
    monthTextColor: '#FFFFFF',
    textSectionTitleColor: '#AAAAAA',
    
    // Colores de los días
    dayTextColor: '#FFFFFF',
    textDisabledColor: '#555555',
    
    // Destacados
    selectedDayBackgroundColor: '#FF3A5E',
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: '#FF3A5E',
    
    // Indicadores y flechas
    dotColor: '#FF3A5E',
    selectedDotColor: '#FFFFFF',
    arrowColor: '#FF3A5E',
    disabledArrowColor: '#555555',
    
    // Estilos de texto
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
    textDayFontWeight: '500',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '500'
  }
});

export default EventCalendarStyles;
