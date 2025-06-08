/**
 * Este archivo maneja el calendario de eventos
 * - Visualización
 * - Eventos
 * - UI
 */

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../../styles/EventCalendarStyles';

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

  useEffect(() => {
    cargarEventos();
  }, []);
  const cargarEventos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/events/dashboard/search`);
      
      let allEvents = [];
      
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
      
      allEvents = allEvents.map(event => {
        const esEventoNormal = event.estado === undefined;
        
        return {
          ...event,
          esEventoNormal: esEventoNormal,
          tipoTabla: esEventoNormal ? 'Events' : 'EventRequests'
        };
      });
      
      
      
      allEvents.sort((a, b) => {
        const dateA = new Date(a.fechaProgramada || a.fechaInicio || a.fecha || 0);
        const dateB = new Date(b.fechaProgramada || b.fechaInicio || b.fecha || 0);
        
        return dateB - dateA;
      });
      
      const eventosPorFecha = {};
      
      
      allEvents.forEach(event => {
        const eventDate = event.fechaProgramada || event.fechaInicio || event.fecha;
        
        if (eventDate) {
          const fecha = eventDate.split('T')[0];
          
          if (!eventosPorFecha[fecha]) {
            eventosPorFecha[fecha] = [];
          }
          
          const esSolicitud = !event.esEventoNormal && event.estado !== undefined;
          
          const espacio = event.space || {};
          
          let manager = {};
          let artista = {};
          
          if (esSolicitud) {
            artista = event.artista || event.artist || {};
            console.log('Artista de la solicitud:', artista);
          } else {
            
            if (espacio && espacio.nombre) {
              
              manager = { 
                nombre: espacio.nombre,
                id: espacio.id || espacio._id
              };
              console.log('Usando espacio cultural como manager:', manager);
            } 
            else if (event.space && event.space.nombre) {
              manager = { 
                nombre: event.space.nombre,
                id: event.space.id || event.space._id
              };
              console.log('Usando event.space como manager:', manager);
            }
            else if (event.manager && event.manager.nombreEspacio) {
              
              manager = { 
                nombre: event.manager.nombreEspacio,
                id: event.manager.id || event.manager._id
              };
              console.log('Usando manager.nombreEspacio:', manager);
            }
            
            else {
              manager = { nombre: 'Espacio sin registrar' };
              console.log('No se encontró espacio, usando valor por defecto');
            }
          }
          
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
          
          let horaInicio = '';
          let horaFin = '';
          
          if (event.horaInicio) {
            horaInicio = event.horaInicio;
          } else if (event.start) {
            const startDate = new Date(event.start);
            horaInicio = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          } else if (eventDate) {
            const fullDate = new Date(eventDate);
            if (!isNaN(fullDate.getTime())) {
              horaInicio = fullDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            }
          }
          
          if (event.horaFin) {
            horaFin = event.horaFin;
          } else if (event.end) {
            const endDate = new Date(event.end);
            horaFin = endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          } else if (horaInicio) {
            const [hours, minutes] = horaInicio.split(':').map(Number);
            const endHours = (hours + 2) % 24;
            horaFin = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }
          
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
            artista: esSolicitud 
  ? (artista.nombreArtistico || artista.nombre || artista.name || 'Artista sin registrar')
  : '',
manager: !esSolicitud 
  ? (manager.nombreEspacio || manager.name || 'Manager sin registrar')
  : '',

            artistaId: esSolicitud ? (artista._id || artista.id || '') : (manager._id || manager.id || ''),
            personaType: esSolicitud ? 'artista' : 'espacio',
            tipoEvento: esSolicitud ? 'solicitud' : 'evento',
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
            eventoOriginal: event
          });
        }
      });
      
      setEventos(eventosPorFecha);
      
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
  
  const manejarSeleccion = (day) => {
    const fecha = day.dateString;
    console.log('Fecha seleccionada:', fecha);
    setFechaSeleccionada(fecha);
    setEventosDelDia(eventos[fecha] || []);
  };

  const fechasMarcadas = {};
  Object.keys(eventos).forEach(fecha => {
    const eventosEnFecha = eventos[fecha] || [];
    
    
    const tieneEventosProgramados = eventosEnFecha.some(e => e.tipo === 'evento' && (e.estado === 'programado' || e.estado === 'completado'));
    
    const tieneSolicitudesAprobadas = eventosEnFecha.some(e => e.tipo === 'solicitud' && e.estado === 'aprobado');
   
    let dotColor = '#FF3A5E'; 
    
    if (tieneEventosProgramados) {
      dotColor = '#FF3A5E'; 
    } else if (tieneSolicitudesAprobadas) {
      dotColor = '#2ECC71'; 
    } 
    
    fechasMarcadas[fecha] = {
      marked: true,
      dotColor: dotColor,
      selected: fecha === fechaSeleccionada,
      selectedColor: '#FF3A5E33', 
    };
  });
  
  if (fechaSeleccionada && !fechasMarcadas[fechaSeleccionada]) {
    fechasMarcadas[fechaSeleccionada] = {
      selected: true,
      selectedColor: '#FF3A5E33',
    };
  }

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
              
              <FlatList
                data={eventosDelDia}
                
                removeClippedSubviews={inHomeScreen}
                scrollEnabled={!inHomeScreen}
                disableVirtualization={inHomeScreen}
                contentContainerStyle={{ paddingBottom: inHomeScreen ? 20 : 100 }}
                initialNumToRender={inHomeScreen ? 5 : 10}
                maxToRenderPerBatch={inHomeScreen ? 10 : 20}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) => {
                  
                  return (
                    <View style={[styles.evento, getEventoStyle(item)]}>
                    <View style={styles.eventoHeader}>
                      <Text style={styles.nombre}>{item.nombre}</Text>
                      
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
                      
                      
                      <View style={styles.detalleItem}>
                        
                        {item.estado === 'programado' ? (
                          <>
                            <Ionicons name="business-outline" size={16} color="#DDDDDD" />
                            <Text style={[styles.detalleTexto, {marginLeft: 8}]}>
                              Manager: {
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
const getEventoStyle = (item) => {
  
  
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
        return styles.eventoProgramado;
    }
  }
  
  else {
    switch(item.estado?.toLowerCase()) {
      case 'aprobado':
        return styles.solicitudAprobada;
      case 'rechazado':
        return styles.solicitudRechazada;
      case 'pendiente':
      default:
        return styles.solicitudPendiente;
    }
  }
};
const getEstadoBadgeStyle = (item) => {
  
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
        return styles.estadoProgramado;
    }
  }
  
  else {
    switch(item.estado?.toLowerCase()) {
      case 'aprobado':
        return styles.estadoAprobado;
      case 'rechazado':
        return styles.estadoRechazado;
      case 'pendiente':
      default:
        return styles.estadoPendienteSolicitud;
    }
  }
};
