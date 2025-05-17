import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../../styles/EventCalendarStyles';

// Función para formatear fecha en formato YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EventCalendar({ inHomeScreen }) {
  const [eventos, setEventos] = useState({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [eventosDelDia, setEventosDelDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar eventos al iniciar el componente
  useEffect(() => {
    cargarEventos();
  }, []);

  // Función para cargar eventos desde la API
  const cargarEventos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar la misma ruta que en EventSearch para obtener eventos de ambas tablas
      const response = await axios.get(`${BACKEND_URL}/api/events/dashboard/search`);
      
      let allEvents = [];
      
      // Verificar la estructura de la respuesta
      if (Array.isArray(response.data)) {
        allEvents = response.data;
      } else if (response.data && Array.isArray(response.data.events)) {
        allEvents = response.data.events;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        allEvents = response.data.data;
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        setError('Formato de respuesta inesperado');
        setLoading(false);
        return;
      }
      
      // Marcar explícitamente qué eventos son de la tabla Events vs EventRequests
      allEvents = allEvents.map(event => {
        // Determinamos el tipo de evento basado en sus propiedades
        // Los eventos de la tabla Events no tienen estado
        // Las solicitudes (EventRequests) tienen estado (pendiente, aprobado, rechazado)
        const esEventoNormal = event.estado === undefined;
        
        // Agregamos una propiedad para identificar el tipo de evento
        return {
          ...event,
          esEventoNormal: esEventoNormal,
          tipoTabla: esEventoNormal ? 'Events' : 'EventRequests'
        };
      });
      
      
      
      // Ordenar todos los eventos por fecha (más recientes primero)
      allEvents.sort((a, b) => {
        // Obtener las fechas de los eventos, considerando diferentes formatos posibles
        const dateA = new Date(a.fechaProgramada || a.fechaInicio || a.fecha || 0);
        const dateB = new Date(b.fechaProgramada || b.fechaInicio || b.fecha || 0);
        
        // Ordenar de más reciente a más antiguo
        return dateB - dateA;
      });
      
      // Organizar eventos por fecha
      const eventosPorFecha = {};
      
      
      allEvents.forEach(event => {
        // Obtener la fecha del evento (puede estar en diferentes propiedades)
        const eventDate = event.fechaProgramada || event.fechaInicio || event.fecha;
        
        if (eventDate) {
          // Formatear la fecha a YYYY-MM-DD
          const fecha = eventDate.split('T')[0];
          
          // Crear array para esta fecha si no existe
          if (!eventosPorFecha[fecha]) {
            eventosPorFecha[fecha] = [];
          }
          
          // Determinar si es un evento o una solicitud
          // Si ya lo marcamos explícitamente como evento normal, usamos esa marca
          // De lo contrario, verificamos si tiene estado
          const esSolicitud = !event.esEventoNormal && event.estado !== undefined;
          
        
          
          // Obtener datos del espacio cultural
          const espacio = event.space || {};
          
          // Obtener datos del manager (para eventos) o artista (para solicitudes)
          let manager = {};
          let artista = {};
          
          if (esSolicitud) {
            // Para solicitudes, usamos el campo artista
            artista = event.artista || event.artist || {};
            console.log('Artista de la solicitud:', artista);
          } else {
            // Para eventos normales, usamos el espacio cultural como manager
            // Esto es lo que se muestra en la tabla Managers en la base de datos
            // donde nombreEspacio es el nombre del espacio cultural
            
            if (espacio && espacio.nombre) {
              // Si tenemos un espacio con nombre, lo usamos como manager
              manager = { 
                nombre: espacio.nombre,
                id: espacio.id || espacio._id
              };
              console.log('Usando espacio cultural como manager:', manager);
            } 
            else if (event.space && event.space.nombre) {
              // Alternativa si el espacio está en event.space
              manager = { 
                nombre: event.space.nombre,
                id: event.space.id || event.space._id
              };
              console.log('Usando event.space como manager:', manager);
            }
            else if (event.manager && event.manager.nombreEspacio) {
              // Si tenemos un manager con nombreEspacio, lo usamos
              manager = { 
                nombre: event.manager.nombreEspacio,
                id: event.manager.id || event.manager._id
              };
              console.log('Usando manager.nombreEspacio:', manager);
            }
            // Si no encontramos espacio, usamos un valor por defecto
            else {
              manager = { nombre: 'Espacio sin registrar' };
              console.log('No se encontró espacio, usando valor por defecto');
            }
          }
          
          // Obtener categoría (puede ser objeto o string)
          let categoriaId = '';
          let categoriaNombre = '';
          let categoriaColor = '#FF3A5E';
          
          if (event.categoria) {
            if (typeof event.categoria === 'object') {
              categoriaId = event.categoria._id || event.categoria.id || '';
              categoriaNombre = event.categoria.nombre || '';
              categoriaColor = event.categoria.color || '#FF3A5E';
            } else {
              categoriaId = event.categoria;
            }
          } else if (event.category) {
            if (typeof event.category === 'object') {
              categoriaId = event.category._id || event.category.id || '';
              categoriaNombre = event.category.nombre || '';
              categoriaColor = event.category.color || '#FF3A5E';
            } else {
              categoriaId = event.category;
            }
          }
          
          // Procesar horas de inicio y fin correctamente
          let horaInicio = '';
          let horaFin = '';
          
          // Para la hora de inicio
          if (event.horaInicio) {
            // Si ya está en formato HH:MM, usarla directamente
            horaInicio = event.horaInicio;
          } else if (event.start) {
            // Si tenemos una fecha ISO completa, extraer la parte de la hora
            const startDate = new Date(event.start);
            horaInicio = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          } else if (eventDate) {
            // Intentar extraer la hora de la fecha del evento
            const fullDate = new Date(eventDate);
            if (!isNaN(fullDate.getTime())) {
              horaInicio = fullDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            }
          }
          
          // Para la hora de fin
          if (event.horaFin) {
            // Si ya está en formato HH:MM, usarla directamente
            horaFin = event.horaFin;
          } else if (event.end) {
            // Si tenemos una fecha ISO completa, extraer la parte de la hora
            const endDate = new Date(event.end);
            horaFin = endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          } else if (horaInicio) {
            // Si tenemos hora de inicio pero no de fin, estimar 2 horas de duración
            const [hours, minutes] = horaInicio.split(':').map(Number);
            const endHours = (hours + 2) % 24;
            horaFin = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }
          
          // Añadir evento al array de esta fecha con todos los datos disponibles
          eventosPorFecha[fecha].push({
            id: event._id || event.id,
            nombre: event.titulo || event.title || 'Sin título',
            descripcion: event.descripcion || event.description || '',
            horaInicio: horaInicio,
            horaFin: horaFin,
            fecha: fecha,
            fechaCompleta: eventDate,
            espacio: espacio.nombre || 'Sin espacio asignado',
            espacioId: espacio._id || espacio.id || '',
            espacioDireccion: espacio.direccion || '',
            espacioCapacidad: espacio.capacidad || 0,
            // Para solicitudes mostramos el artista, para eventos el manager
            artista: esSolicitud 
  ? (artista.nombreArtistico || artista.nombre || artista.name || 'Artista sin registrar')
  : '',
manager: !esSolicitud 
  ? (manager.nombreEspacio || manager.name || 'Manager sin registrar')
  : '',

            artistaId: esSolicitud ? (artista._id || artista.id || '') : (manager._id || manager.id || ''),
            // Forzamos el tipo a 'espacio' para eventos normales y 'artista' para solicitudes
            personaType: esSolicitud ? 'artista' : 'espacio',
            // Guardamos el tipo de evento para referencia
            tipoEvento: esSolicitud ? 'solicitud' : 'evento',
            // Forzar a que se muestre como espacio para eventos normales
            mostrarComoEspacio: !esSolicitud,
            categoriaId: categoriaId,
            categoriaNombre: categoriaNombre,
            categoriaColor: categoriaColor,
            precio: event.precio || event.price || 'Gratis',
            estado: event.estado || 'Confirmado',
            tipo: esSolicitud ? 'solicitud' : 'evento',
            asistentes: event.asistentes || event.attendees || [],
            numAsistentes: event.numAsistentes || event.attendeeCount || 0,
            imagenes: event.imagenes || event.images || [],
            // Guardar el objeto original para tener acceso a todos los datos
            eventoOriginal: event
          });
        }
      });
      
      setEventos(eventosPorFecha);
      
      // Si hay una fecha seleccionada, actualizar eventos del día
      if (fechaSeleccionada) {
        setEventosDelDia(eventosPorFecha[fechaSeleccionada] || []);
      }
      
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setError('No se pudieron cargar los eventos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar selección de día en el calendario
  const manejarSeleccion = (day) => {
    // Usar directamente la fecha seleccionada sin modificarla
    const fecha = day.dateString;
    console.log('Fecha seleccionada:', fecha);
    setFechaSeleccionada(fecha);
    setEventosDelDia(eventos[fecha] || []);
  };

  // Preparar fechas marcadas para el calendario
  const fechasMarcadas = {};
  Object.keys(eventos).forEach(fecha => {
    // Verificar si hay eventos para esta fecha
    const eventosEnFecha = eventos[fecha] || [];
    
    // Determinar color según el tipo de evento y su estado
    // Prioridad para mostrar en el calendario: eventos programados > solicitudes aprobadas > solicitudes pendientes > eventos pendientes > eventos cancelados > solicitudes rechazadas
    
    // Verificar estados específicos
    const tieneEventosProgramados = eventosEnFecha.some(e => e.tipo === 'evento' && (e.estado === 'programado' || e.estado === 'completado'));
    
    const tieneSolicitudesAprobadas = eventosEnFecha.some(e => e.tipo === 'solicitud' && e.estado === 'aprobado');
   
    let dotColor = '#FF3A5E'; // Color de acento rojo por defecto (eventos programados/completados)
    
    // Determinar el color según la prioridad
    if (tieneEventosProgramados) {
      dotColor = '#FF3A5E'; // Rojo para eventos programados/completados
    } else if (tieneSolicitudesAprobadas) {
      dotColor = '#2ECC71'; // Verde para solicitudes aprobadas
    } 
    
    fechasMarcadas[fecha] = {
      marked: true,
      dotColor: dotColor,
      selected: fecha === fechaSeleccionada,
      selectedColor: '#FF3A5E33', // Color de acento rojo con transparencia
    };
  });
  
  // Si hay fecha seleccionada, asegurarse de que esté marcada
  if (fechaSeleccionada && !fechasMarcadas[fechaSeleccionada]) {
    fechasMarcadas[fechaSeleccionada] = {
      selected: true,
      selectedColor: '#FF3A5E33',
    };
  }

  // Renderizar componente
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3A5E" />
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#FF3A5E" />
          <Text style={styles.errorText}>Error al cargar eventos</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarEventos}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Calendar
            onDayPress={manejarSeleccion}
            markedDates={fechasMarcadas}
            theme={styles.calendarTheme}
            style={styles.calendarContainer}
          />
          
        

          <View style={styles.eventosContainer}>
            <Text style={styles.titulo}>
              {fechaSeleccionada ? 
                `Eventos para ${new Date(fechaSeleccionada + 'T12:00:00').toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'})}` : 
                'Todos los eventos'}
            </Text>
            
            {eventosDelDia.length === 0 ? (
              <Text style={styles.vacio}>No hay eventos para esta fecha.</Text>
            ) : (
              // Usamos una prop para determinar si se debe usar FlatList o no
              <FlatList
                data={eventosDelDia}
                // Configuración para evitar warnings cuando está anidado en un ScrollView
                removeClippedSubviews={inHomeScreen}
                scrollEnabled={!inHomeScreen} // Deshabilitar scroll cuando está en HomeScreen
                disableVirtualization={inHomeScreen} // Deshabilitar virtualización cuando está en HomeScreen
                contentContainerStyle={{ paddingBottom: inHomeScreen ? 20 : 100 }} // Más padding cuando está en la pantalla de Calendario
                initialNumToRender={inHomeScreen ? 5 : 10}
                maxToRenderPerBatch={inHomeScreen ? 10 : 20}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) => {
                  // El evento se renderiza correctamente
                  return (
                    <View style={[styles.evento, getEventoStyle(item)]}>
                    <View style={styles.eventoHeader}>
                      <Text style={styles.nombre}>{item.nombre}</Text>
                      {/* Solo mostrar el badge de estado si no es programado ni aprobado */}
                      {(item.estado && item.estado !== 'programado' && item.estado !== 'aprobado') ? (
                        <View style={[styles.estadoBadge, getEstadoBadgeStyle(item)]}>
                          <Text style={styles.estadoTexto}>{item.estado}</Text>
                        </View>
                      ) : null}
                    </View>
                    
                    {item.categoriaNombre && (
                      <View style={[styles.categoriaBadge, { backgroundColor: item.categoriaColor + '33' }]}>
                        <Text style={[styles.categoriaTexto, { color: item.categoriaColor }]}>
                          {item.categoriaNombre}
                        </Text>
                      </View>
                    )}
                    
                    <Text style={styles.descripcion}>{item.descripcion}</Text>
                    
                    <View style={styles.eventoDetalles}>
                      <View style={styles.detalleItem}>
                        <Ionicons name="time-outline" size={16} color="#DDDDDD" />
                        <Text style={[styles.detalleTexto, {marginLeft: 8}]}>
                          {item.horaInicio && item.horaFin 
                            ? `${item.horaInicio} - ${item.horaFin}` 
                            : item.horaInicio 
                              ? `Desde ${item.horaInicio}` 
                              : 'Hora no especificada'}
                      </Text>
                    </View>
                      
                      <View style={styles.detalleItem}>
                        <Ionicons name="location-outline" size={16} color="#DDDDDD" style={{marginTop: 2}} />
                        <Text style={[styles.detalleTexto, {marginLeft: 8}]} numberOfLines={2}>
                          {item.espacio}{item.espacioDireccion ? `: ${item.espacioDireccion}` : ''}
                        </Text>
                      </View>
                      
                      {/* Información de la persona responsable (artista o manager) */}
                      <View style={styles.detalleItem}>
                        {/* Usar Manager SOLO si el estado es programado, el resto como Artista */}
                        {item.estado === 'programado' ? (
                          <>
                            <Ionicons name="business-outline" size={16} color="#DDDDDD" />
                            <Text style={[styles.detalleTexto, {marginLeft: 8}]}>
                              Manager: {
                                // Probar todas las posibles ubicaciones del nombreEspacio
                                item.eventoOriginal?.manager?.nombreEspacio ||
                                item.eventoOriginal?.space?.nombre ||
                                item.eventoOriginal?.nombreEspacio ||
                                item.manager?.nombreEspacio ||
                                item.space?.nombre ||
                                item.nombreEspacio ||
                                item.espacio ||
                                'No especificado'
                              }
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="person-outline" size={16} color="#DDDDDD" />
                            <Text style={[styles.detalleTexto, {marginLeft: 8}]}>Artista: {item.artista || item.artist?.nombreArtistico || 'No especificado'}</Text>
                          </>
                        )}
                      </View>
                      
                      {/* Información de la categoría del evento */}
                      <View style={styles.detalleItem}>
                        <Ionicons name="pricetag-outline" size={16} color="#DDDDDD" />
                        <Text style={[styles.detalleTexto, {marginLeft: 8}, item.categoriaColor ? {color: item.categoriaColor} : {}]}>
                          Categoria: {item.categoria || item.eventoOriginal?.categoria || item.categoriaNombre || 'Sin categoría'}
                        </Text>
                      </View>
                    </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
}
// Función para determinar el estilo del evento según su tipo y estado
const getEventoStyle = (item) => {
  // Determinar el estilo según el tipo de evento
  
  // Para eventos normales (tabla Event)
  if (item.tipo === 'evento') {
    switch(item.estado?.toLowerCase()) {
      case 'programado':
      case 'completado':
        return styles.eventoProgramado;
      case 'pendiente':
        return styles.eventoPendiente;
      case 'cancelado':
        return styles.eventoCancelado;
      default:
        return styles.eventoProgramado; // Por defecto, usar estilo programado
    }
  }
  // Para solicitudes (tabla EventRequest)
  else {
    switch(item.estado?.toLowerCase()) {
      case 'aprobado':
        return styles.solicitudAprobada;
      case 'rechazado':
        return styles.solicitudRechazada;
      case 'pendiente':
      default:
        return styles.solicitudPendiente; // Por defecto, usar estilo pendiente
    }
  }
};

// Función para determinar el estilo del badge de estado
const getEstadoBadgeStyle = (item) => {
  // Para eventos normales (tabla Event)
  if (item.tipo === 'evento') {
    switch(item.estado?.toLowerCase()) {
      case 'programado':
      case 'completado':
        return styles.estadoProgramado;
      case 'pendiente':
        return styles.estadoPendiente;
      case 'cancelado':
        return styles.estadoCancelado;
      default:
        return styles.estadoProgramado; // Por defecto, usar estilo programado
    }
  }
  // Para solicitudes (tabla EventRequest)
  else {
    switch(item.estado?.toLowerCase()) {
      case 'aprobado':
        return styles.estadoAprobado;
      case 'rechazado':
        return styles.estadoRechazado;
      case 'pendiente':
      default:
        return styles.estadoPendienteSolicitud; // Por defecto, usar estilo pendiente
    }
  }
};
