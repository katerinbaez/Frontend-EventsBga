import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Modal,
  Alert,
  TextInput,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';

const RequestsModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingRequest, setProcessingRequest] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [categories, setCategories] = useState(['todas', 'musica', 'teatro', 'danza', 'arte', 'literatura', 'cine', 'otro']);
  const [error, setError] = useState(null);
  const [artistsInfo, setArtistsInfo] = useState({});
  const [spaceInfo, setSpaceInfo] = useState({ nombre: 'Cargando...', direccion: 'Cargando...' });
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    if (visible && user) {
      loadRequests();
    }
  }, [visible, user, selectedCategory]);

  useEffect(() => {
    filterRequestsByCategory(requests, selectedCategory);
  }, [requests, selectedCategory]);

  useEffect(() => {
    const loadSpaceInfo = async () => {
      if (selectedRequest && selectedRequest.spaceId) {
        try {
          const info = await getSpaceInfo(selectedRequest.spaceId);
          setSpaceInfo(info);
        } catch (error) {
          console.error('Error al cargar información del espacio:', error);
        }
      }
    };
    
    if (selectedRequest) {
      loadSpaceInfo();
    }
  }, [selectedRequest]);

  const loadArtistInfo = async (artistId) => {
    if (!artistId || artistsInfo[artistId]) return;

    try {
      const response = await axios.get(`${BACKEND_URL}/api/event-requests/artist-info/${artistId}`);

      if (response.data.success && response.data.artist) {
        setArtistsInfo(prev => ({
          ...prev,
          [artistId]: response.data.artist
        }));
      }
    } catch (error) {
      console.error('Error al obtener información del artista:', error);
    }
  };

  const getArtistContact = (request) => {
    const artistId = request?.artistId;

    if (!artistId) {
      return {
        nombreArtistico: 'Artista',
        email: 'No disponible',
        telefono: 'No disponible',
        ciudad: 'Bucaramanga',
        redes: {}
      };
    }

    if (artistsInfo[artistId]) {
      const artist = artistsInfo[artistId];

      let contacto = {};
      let redes = {};

      try {
        if (artist.contacto) {
          contacto = typeof artist.contacto === 'string' 
            ? JSON.parse(artist.contacto) 
            : artist.contacto;
        }

        if (artist.redesSociales) {
          redes = typeof artist.redesSociales === 'string' 
            ? JSON.parse(artist.redesSociales) 
            : artist.redesSociales;
        }
      } catch (parseError) {
        console.error('Error al parsear datos del artista:', parseError);
      }

      return {
        nombreArtistico: artist.nombreArtistico || 'Artista',
        email: contacto.email || 'No disponible',
        telefono: contacto.telefono || 'No disponible',
        ciudad: contacto.ciudad || 'Bucaramanga',
        redes: redes || {}
      };
    }

    if (request && request.metadatos) {
      try {
        const metadatos = typeof request.metadatos === 'string' 
          ? JSON.parse(request.metadatos) 
          : request.metadatos;

        if (metadatos.artistInfo || metadatos.contacto || metadatos.redes || metadatos.redesSociales) {
          const artistInfo = metadatos.artistInfo || {};
          const contacto = metadatos.contacto || artistInfo.contacto || {};
          const redes = metadatos.redes || metadatos.redesSociales || artistInfo.redesSociales || {};

          console.log('Información de contacto encontrada en metadatos:', { contacto, redes });

          return {
            nombreArtistico: metadatos.nombreArtistico || artistInfo.nombreArtistico || 'Artista',
            email: contacto.email || metadatos.email || 'No disponible',
            telefono: contacto.telefono || metadatos.telefono || 'No disponible',
            ciudad: contacto.ciudad || metadatos.ciudad || 'Bucaramanga',
            redes: redes || {}
          };
        }
      } catch (error) {
        console.error('Error al procesar metadatos de contacto:', error);
      }
    }

    return {
      nombreArtistico: 'Artista',
      email: 'No disponible',
      telefono: 'No disponible',
      ciudad: 'Bucaramanga',
      redes: {}
    };
  };

  const getSpaceInfo = async (spaceId) => {
    try {
      console.log(`Obteniendo información del espacio cultural con ID: ${spaceId}`);
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces/${spaceId}`);
      if (response.data.success && response.data.space) {
        console.log('Información del espacio cultural obtenida:', response.data.space);
        return {
          nombre: response.data.space.nombre || 'Espacio Cultural',
          direccion: response.data.space.direccion || 'Dirección no disponible'
        };
      }
      return { nombre: 'Espacio Cultural', direccion: 'Dirección no disponible' };
    } catch (error) {
      console.error('Error al obtener información del espacio cultural:', error);
      return { nombre: 'Espacio Cultural', direccion: 'Dirección no disponible' };
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Cargando solicitudes para el gestor:', user.id);

      const response = await axios.get(`${BACKEND_URL}/api/event-requests/manager-requests/${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Email': user.email,
          'X-User-Role': 'manager'
        }
      });

      console.log('Respuesta del servidor:', response.data);

      if (response.data.success) {
        const requestsWithArtistInfo = [];

        for (const request of response.data.requests) {
          loadArtistInfo(request.artistId);

          const artistContact = getArtistContact(request);

          const normalizedRequest = {
            ...request,
            artistName: artistContact.nombreArtistico || 'Artista',
            artistEmail: artistContact.email || 'No disponible',
            artistContact: artistContact
          };

          requestsWithArtistInfo.push(normalizedRequest);
        }

        const sortedRequests = requestsWithArtistInfo.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setRequests(sortedRequests);
      } else {
        setError(response.data.message || 'Error al cargar solicitudes');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      setError('Error al cargar solicitudes. Por favor, intenta de nuevo más tarde.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRequestsByCategory = (requestsToFilter, category) => {
    if (!requestsToFilter || requestsToFilter.length === 0) {
      setFilteredRequests([]);
      return;
    }

    // Lista de categorías predeterminadas (excluyendo 'todas' y 'otro')
    const categoriasPreestablecidas = ['musica', 'teatro', 'danza', 'arte', 'literatura', 'cine'];
    
    if (category === 'todas') {
      // Mostrar todas las solicitudes
      setFilteredRequests(requestsToFilter);
    } else if (category === 'otro') {
      // Mostrar solicitudes con categorías diferentes a las predeterminadas
      const filtered = requestsToFilter.filter(request => {
        const requestCategory = (request.category || request.categoria || '').toLowerCase();
        // Verificar si la categoría NO está en la lista de categorías predeterminadas
        return requestCategory !== '' && !categoriasPreestablecidas.includes(requestCategory);
      });
      setFilteredRequests(filtered);
    } else {
      // Filtrar por la categoría específica seleccionada
      const filtered = requestsToFilter.filter(request => {
        const requestCategory = (request.category || request.categoria || '').toLowerCase();
        return requestCategory === category.toLowerCase();
      });
      setFilteredRequests(filtered);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterRequestsByCategory(requests, category);
  };

  const getStatusColor = (estado) => {
    if (!estado) return '#999999';

    switch (estado.toLowerCase()) {
      case 'pendiente':
        return '#FFA500';
      case 'aprobada':
        return '#4CAF50';
      case 'rechazada':
        return '#FF3A5E';
      default:
        return '#999999';
    }
  };

  const getStatusIcon = (estado) => {
    if (!estado) return 'help-circle-outline';

    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'time-outline';
      case 'aprobada':
        return 'checkmark-circle-outline';
      case 'rechazada':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '29 de abril de 2025';

    try {
      console.log('Formateando fecha (original):', dateString);

      let date;

      if (!isNaN(dateString) && typeof dateString === 'number') {
        date = new Date(dateString);
      } else if (typeof dateString === 'string' && dateString.includes('T')) {
        date = new Date(dateString);
      } else if (typeof dateString === 'string' && dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          date = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        console.log('Fecha inválida:', dateString);
        return '29 de abril de 2025';
      }

      const day = date.getDate();
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      const formattedDate = `${day} de ${month} de ${year}`;
      console.log('Fecha formateada:', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '29 de abril de 2025';
    }
  };

  const getArtistName = (artistId) => {
    const artistMap = {
      'google-oauth2|108457060497331191635': 'Mariana',
      'auth0|65f5b7a09feea': 'Carlos',
      'google-oauth2|103028624849014652909': 'Juan',
    };

    if (artistId && artistMap[artistId]) {
      return artistMap[artistId];
    }

    if (artistId) {
      if (artistId.includes('google-oauth2')) {
        return 'Artista de Google';
      } else if (artistId.includes('auth0')) {
        return 'Artista de Auth0';
      }
    }

    return 'Artista';
  };

  const openLink = (url) => {
    if (!url) return;

    let formattedUrl = url;
    if (url.startsWith('@')) {
      formattedUrl = `https://instagram.com/${url.substring(1)}`;
    } else if (!url.startsWith('http')) {
      formattedUrl = `https://${url}`;
    }

    Linking.openURL(formattedUrl).catch(err => {
      console.error('Error al abrir la URL:', err);
      Alert.alert('Error', 'No se pudo abrir el enlace');
    });
  };

  const sendEmail = (email) => {
    if (!email) return;

    Linking.openURL(`mailto:${email}`).catch(err => {
      console.error('Error al abrir el correo:', err);
      Alert.alert('Error', 'No se pudo abrir la aplicación de correo');
    });
  };

  const callPhone = (phone) => {
    if (!phone) return;

    Linking.openURL(`tel:${phone}`).catch(err => {
      console.error('Error al llamar:', err);
      Alert.alert('Error', 'No se pudo realizar la llamada');
    });
  };

  const showRequestDetails = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setDetailsModalVisible(true);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    setProcessingRequest(true);
    try {
      console.log('Aprobando solicitud:', selectedRequest.id);
      
      // 1. Aprobar la solicitud usando el nuevo endpoint sin restricciones
      const response = await axios.post(`${BACKEND_URL}/api/event-requests/approve-request/${selectedRequest.id}`);
      console.log('Respuesta de aprobación:', response.data);

      if (response.data.success) {
        // 2. Bloquear el horario en el calendario
        try {
          // Obtener la fecha y hora de la solicitud
          const rawDate = selectedRequest.fecha || selectedRequest.date;
          console.log('Fecha original de la solicitud:', rawDate);
          
          // Crear la fecha correctamente para evitar problemas de zona horaria
          let eventDate;
          if (typeof rawDate === 'string' && rawDate.includes('-')) {
            // Formato YYYY-MM-DD
            const [year, month, day] = rawDate.split('-').map(num => parseInt(num, 10));
            eventDate = new Date(year, month - 1, day);
            console.log(`Fecha parseada: ${year}-${month}-${day}, día de la semana: ${eventDate.getDay()}`);
          } else {
            // Otro formato
            eventDate = new Date(rawDate);
          }
          
          // Extraer la hora de inicio (formato: "09:00")
          const startTimeStr = selectedRequest.horaInicio || selectedRequest.startTime || "09:00";
          const hour = parseInt(startTimeStr.split(':')[0], 10);
          
          // Formatear la fecha para el bloqueo (YYYY-MM-DD) manteniendo el día correcto
          const year = eventDate.getFullYear();
          const month = String(eventDate.getMonth() + 1).padStart(2, '0');
          const day = String(eventDate.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          
          console.log(`Bloqueando horario: Fecha ${formattedDate}, Hora ${hour}, Evento ID ${selectedRequest.id}`);
          
          // Obtener el ID de autenticación del gestor (idauth) si está disponible
          // Esto es para mantener consistencia con los registros existentes
          let managerId = selectedRequest.managerId;
          
          // Si el ID tiene formato de ID interno (UUID), intentar obtener el ID de autenticación
          if (managerId && managerId.includes('-')) {
            try {
              // Intentar obtener el ID de autenticación del gestor desde los metadatos
              if (selectedRequest.metadatos && selectedRequest.metadatos.managerIdAuth) {
                managerId = selectedRequest.metadatos.managerIdAuth;
                console.log('Usando ID de autenticación del gestor desde metadatos:', managerId);
              } else if (selectedRequest.space && selectedRequest.space.managerIdAuth) {
                // Alternativa: obtener del objeto space si está disponible
                managerId = selectedRequest.space.managerIdAuth;
                console.log('Usando ID de autenticación del gestor desde space:', managerId);
              }
            } catch (error) {
              console.error('Error al obtener ID de autenticación del gestor:', error);
              // Continuar con el ID original
            }
          }
          
          // Preparar los datos para el bloqueo
          const blockData = {
            spaceId: managerId, // Usar el ID de autenticación si está disponible
            day: formattedDate, // Usar la fecha específica en formato YYYY-MM-DD
            hour: hour,
            isRecurring: false, // No es recurrente, es una fecha específica
            // No enviamos dayName para que el backend calcule el nombre del día correcto
            eventId: selectedRequest.id // Referencia al evento para trazabilidad
          };
          
          console.log('Datos enviados para bloqueo:', blockData);
          
          // Usar el endpoint que no requiere autenticación con manejo de errores mejorado
          const blockResponse = await axios.post(`${BACKEND_URL}/api/event-requests/block-slot`, blockData)
            .catch(blockError => {
              console.error('Error detallado al bloquear horario:', blockError.response?.data || blockError.message);
              return { data: { success: false, message: blockError.response?.data?.message || 'Error al comunicarse con el servidor' } };
            });
          
          if (blockResponse.data.success) {
            console.log('Horario bloqueado exitosamente:', blockResponse.data);
            
            // Mostrar mensaje de éxito incluyendo la información del bloqueo
            Alert.alert(
              'Solicitud Aprobada', 
              'La solicitud ha sido aprobada correctamente y el horario ha sido bloqueado en el calendario.',
              [{ text: 'OK', onPress: () => {
                setDetailsModalVisible(false);
                loadRequests();
              }}]
            );
          } else {
            console.error('Error al bloquear horario:', blockResponse.data);
            
            // Mostrar mensaje de éxito pero indicando que hubo un problema con el bloqueo
            Alert.alert(
              'Solicitud Aprobada', 
              'La solicitud ha sido aprobada correctamente, pero hubo un problema al bloquear el horario en el calendario.',
              [{ text: 'OK', onPress: () => {
                setDetailsModalVisible(false);
                loadRequests();
              }}]
            );
          }
        } catch (blockError) {
          console.error('Error al intentar bloquear el horario:', blockError);
          
          // Mostrar mensaje de éxito pero indicando que hubo un problema con el bloqueo
          Alert.alert(
            'Solicitud Aprobada', 
            'La solicitud ha sido aprobada correctamente, pero hubo un problema al bloquear el horario en el calendario.',
            [{ text: 'OK', onPress: () => {
              setDetailsModalVisible(false);
              loadRequests();
            }}]
          );
        }
      } else {
        Alert.alert('Error', response.data.message || 'No se pudo aprobar la solicitud');
      }
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      
      // Mostrar información más detallada del error
      let errorMessage = 'No se pudo aprobar la solicitud. Intenta nuevamente.';
      
      if (error.response) {
        console.error('Detalles del error:', error.response.status, error.response.data);
        errorMessage += ` (${error.response.status}: ${error.response.data.message || 'Error desconocido'})`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Por favor ingresa un motivo para el rechazo');
      return;
    }

    setProcessingRequest(true);
    try {
      console.log('Rechazando solicitud:', selectedRequest.id);
      
      // Usar el nuevo endpoint que no requiere autenticación específica
      const response = await axios.post(`${BACKEND_URL}/api/event-requests/reject-request/${selectedRequest.id}`, {
        rejectionReason: rejectionReason,
        // Incluir información adicional que pueda ser útil para el backend
        managerId: user.id || user.sub,
        managerEmail: user.email
      }, {
        // Añadir headers para ayudar con la autenticación
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id || user.sub,
          'X-User-Email': user.email,
          'X-User-Role': 'manager'
        }
      });

      console.log('Respuesta de rechazo:', response.data);

      if (response.data.success) {
        Alert.alert(
          'Solicitud Rechazada', 
          'La solicitud ha sido rechazada correctamente.',
          [{ text: 'OK', onPress: () => {
            setDetailsModalVisible(false);
            loadRequests();
          }}]
        );
      } else {
        Alert.alert('Error', response.data.message || 'No se pudo rechazar la solicitud');
      }
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      
      // Mostrar información más detallada del error
      let errorMessage = 'No se pudo rechazar la solicitud. Intenta nuevamente.';
      
      if (error.response) {
        console.error('Detalles del error:', error.response.status, error.response.data);
        errorMessage += ` (${error.response.status}: ${error.response.data?.message || 'Error desconocido'})`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setProcessingRequest(false);
    }
  };

  const renderRequestItem = (request, index) => {
    console.log('Renderizando solicitud (original):', JSON.stringify(request, null, 2));

    const artistContact = getArtistContact(request);

    // Extraer categoría de todas las fuentes posibles
    const categoria = request.categoria || request.category || '';

    // Intentar extraer metadatos si existen
    let metadatos = {};
    try {
      if (request.metadatos && typeof request.metadatos === 'string') {
        metadatos = JSON.parse(request.metadatos);
      } else if (request.metadatos) {
        metadatos = request.metadatos;
      }
    } catch (error) {
      console.error('Error al parsear metadatos:', error);
    }

    console.log(`Solicitud #${index} - Categoría: "${categoria}"`);

    const normalizedRequest = {
      id: request.id,
      titulo: request.titulo || request.eventName || 'Sin título',
      descripcion: request.descripcion || request.description || 'Sin descripción',
      estado: request.estado || request.status || 'Pendiente',
      artistName: artistContact.nombreArtistico || 'Artista',
      artistEmail: artistContact.email || 'No disponible',
      fecha: request.fecha || request.date || '2025-04-29',
      categoria: categoria,
      startTime: request.startTime || request.horaInicio || '09:00',
      endTime: request.endTime || request.horaFin || '10:00',
      spaceName: request.spaceName || 'Centro del oriente',
      spaceAddress: request.spaceAddress || 'Centro del oriente, Bucaramanga'
    };

    console.log('Solicitud normalizada:', JSON.stringify(normalizedRequest, null, 2));
    
    // Formatear la fecha para mostrarla
    const formattedDate = formatDate(normalizedRequest.fecha);
    
    // Determinar qué categoría mostrar - lógica simplificada
    let categoriaAMostrar = 'No especificada';
    
    // Si hay categoría, mostrarla con primera letra mayúscula
    if (normalizedRequest.categoria && normalizedRequest.categoria.trim() !== '') {
      categoriaAMostrar = normalizedRequest.categoria.charAt(0).toUpperCase() + normalizedRequest.categoria.slice(1);
      console.log(`Usando categoría: ${categoriaAMostrar}`);
    }
    
    console.log(`Categoría final a mostrar: "${categoriaAMostrar}"`);

    return (
      <TouchableOpacity 
        key={normalizedRequest.id || index}
        style={styles.requestItem}
        onPress={() => showRequestDetails(request)}
      >
        <View style={styles.requestHeader}>
          <Text style={styles.requestName}>{normalizedRequest.titulo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(normalizedRequest.estado) }]}>
            <Text style={styles.statusText}>{normalizedRequest.estado}</Text>
          </View>
        </View>

        <View style={styles.requestDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={16} color="#999" />
            <Text style={styles.detailText}>{normalizedRequest.artistName}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#999" />
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={16} color="#999" />
            <Text style={styles.detailText}>{categoriaAMostrar}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#999" />
            <Text style={styles.detailText}>{normalizedRequest.startTime} - {normalizedRequest.endTime}</Text>
          </View>
        </View>

        <View style={styles.requestFooter}>
          <Text style={styles.requestDate}>
            Recibido el {formatDate(request.createdAt || '2025-04-29')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedRequest) return null;

    console.log('Detalles de la solicitud (original):', JSON.stringify(selectedRequest, null, 2));

    const artistContact = getArtistContact(selectedRequest);

    // Intentar extraer metadatos si existen para obtener información adicional
    let metadatos = {};
    try {
      if (selectedRequest.metadatos && typeof selectedRequest.metadatos === 'string') {
        metadatos = JSON.parse(selectedRequest.metadatos);
      } else if (selectedRequest.metadatos) {
        metadatos = selectedRequest.metadatos;
      }
    } catch (error) {
      console.error('Error al parsear metadatos en detalle:', error);
    }

    // Obtener información del espacio cultural
    const loadSpaceInfo = async () => {
      if (selectedRequest && selectedRequest.spaceId) {
        try {
          const info = await getSpaceInfo(selectedRequest.spaceId);
          setSpaceInfo(info);
        } catch (error) {
          console.error('Error al cargar información del espacio:', error);
        }
      }
    };
    
    loadSpaceInfo();

    // Priorizar la dirección del espacio desde diferentes fuentes
    const spaceAddress = 
      selectedRequest.spaceAddress || 
      metadatos.spaceAddress || 
      (selectedRequest.space && selectedRequest.space.direccion) || 
      spaceInfo.direccion ||
      'Dirección no disponible';

    console.log('Dirección del espacio:', spaceAddress);

    const normalizedRequest = {
      id: selectedRequest.id,
      titulo: selectedRequest.titulo || selectedRequest.eventName || 'Sin título',
      descripcion: selectedRequest.descripcion || selectedRequest.description || 'Sin descripción',
      estado: selectedRequest.estado || selectedRequest.status || 'Pendiente',
      artistName: artistContact.nombreArtistico || 'Artista',
      artistEmail: artistContact.email || 'No disponible',
      fecha: selectedRequest.fecha || selectedRequest.date || '2025-04-29',
      categoria: selectedRequest.categoria || selectedRequest.category || '',
      tipo: selectedRequest.tipo || selectedRequest.tipoEvento || selectedRequest.eventType || 'No especificado',
      asistentesEsperados: selectedRequest.asistentesEsperados || selectedRequest.expectedAttendees || '0',
      startTime: selectedRequest.startTime || selectedRequest.horaInicio || '09:00',
      endTime: selectedRequest.endTime || selectedRequest.horaFin || '10:00',
      rejectionReason: selectedRequest.rejectionReason,
      createdAt: selectedRequest.createdAt,
      updatedAt: selectedRequest.updatedAt,
      spaceName: selectedRequest.spaceName || metadatos.spaceName || spaceInfo.nombre || 'Centro del oriente',
      spaceAddress: spaceAddress
    };

    const isPending = normalizedRequest.estado && normalizedRequest.estado.toLowerCase() === 'pendiente';
    console.log('Detalles de la solicitud normalizada:', JSON.stringify(normalizedRequest, null, 2));
    
    // Formatear las fechas para mostrarlas
    const formattedEventDate = formatDate(normalizedRequest.fecha);
    const formattedCreatedDate = formatDate(normalizedRequest.createdAt);
    const formattedUpdatedDate = formatDate(normalizedRequest.updatedAt);

    return (
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.detailsModalContainer}>
          <View style={styles.detailsModalContent}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Detalles de la Solicitud</Text>
              <TouchableOpacity 
                onPress={() => setDetailsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close-outline" size={24} color="#FF3A5E" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.statusSection}>
                <View style={[
                  styles.statusBadgeLarge, 
                  { backgroundColor: getStatusColor(normalizedRequest.estado) }
                ]}>
                  <Text style={styles.statusTextLarge}>{normalizedRequest.estado}</Text>
                </View>

                {normalizedRequest.rejectionReason && normalizedRequest.estado && normalizedRequest.estado.toLowerCase() === 'rechazada' && (
                  <View style={styles.rejectionReasonContainer}>
                    <Text style={styles.rejectionReasonLabel}>Motivo del rechazo:</Text>
                    <Text style={styles.rejectionReasonText}>{normalizedRequest.rejectionReason}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Artista</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nombre:</Text>
                  <Text style={styles.detailValue}>{normalizedRequest.artistName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <TouchableOpacity onPress={() => sendEmail(normalizedRequest.artistEmail)}>
                    <Text style={styles.detailValue}>{normalizedRequest.artistEmail}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Teléfono:</Text>
                  <TouchableOpacity onPress={() => callPhone(artistContact.telefono)}>
                    <Text style={styles.detailValue}>{artistContact.telefono}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ciudad:</Text>
                  <Text style={styles.detailValue}>{artistContact.ciudad}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Redes sociales:</Text>
                  <View style={styles.socialMediaContainer}>
                    {artistContact.redes.facebook && (
                      <TouchableOpacity style={styles.socialMediaButton} onPress={() => openLink(artistContact.redes.facebook)}>
                        <Ionicons name="logo-facebook" size={20} color="#3B5998" />
                      </TouchableOpacity>
                    )}
                    {artistContact.redes.twitter && (
                      <TouchableOpacity style={styles.socialMediaButton} onPress={() => openLink(artistContact.redes.twitter)}>
                        <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                      </TouchableOpacity>
                    )}
                    {artistContact.redes.instagram && (
                      <TouchableOpacity style={styles.socialMediaButton} onPress={() => openLink(artistContact.redes.instagram)}>
                        <Ionicons name="logo-instagram" size={20} color="#FF69B4" />
                      </TouchableOpacity>
                    )}
                    {artistContact.redes.youtube && (
                      <TouchableOpacity style={styles.socialMediaButton} onPress={() => openLink(artistContact.redes.youtube)}>
                        <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Evento</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nombre:</Text>
                  <Text style={styles.detailValue}>{normalizedRequest.titulo}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Descripción:</Text>
                  <Text style={styles.detailValue}>{normalizedRequest.descripcion}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipo:</Text>
                  <Text style={styles.detailValue}>{normalizedRequest.tipo}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Categoría:</Text>
                  <Text style={styles.detailValue}>
                    {normalizedRequest.categoria && normalizedRequest.categoria !== 'otro' 
                      ? normalizedRequest.categoria.charAt(0).toUpperCase() + normalizedRequest.categoria.slice(1) 
                      : 'No especificada'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Asistentes esperados:</Text>
                  <Text style={styles.detailValue}>{normalizedRequest.asistentesEsperados}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Fecha y Horario</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha:</Text>
                  <Text style={styles.detailValue}>{formattedEventDate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Horario:</Text>
                  <Text style={styles.detailValue}>{normalizedRequest.startTime} - {normalizedRequest.endTime}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Espacio Cultural</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nombre:</Text>
                  <Text style={styles.detailValue}>{normalizedRequest.spaceName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dirección:</Text>
                  <Text style={styles.detailValue}>{normalizedRequest.spaceAddress}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Fechas</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Solicitado:</Text>
                  <Text style={styles.detailValue}>{formattedCreatedDate}</Text>
                </View>
                {normalizedRequest.updatedAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Actualizado:</Text>
                    <Text style={styles.detailValue}>{formattedUpdatedDate}</Text>
                  </View>
                )}
              </View>

              {isPending && (
                <View style={styles.actionSection}>
                  <Text style={styles.actionTitle}>Acciones</Text>

                  <TouchableOpacity 
                    style={styles.approveButton}
                    onPress={handleApproveRequest}
                    disabled={processingRequest}
                  >
                    {processingRequest ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Aprobar Solicitud</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={styles.rejectSection}>
                    <Text style={styles.rejectLabel}>Motivo del rechazo:</Text>
                    <TextInput
                      style={styles.rejectInput}
                      placeholder="Ingresa el motivo del rechazo"
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={3}
                      value={rejectionReason}
                      onChangeText={setRejectionReason}
                    />

                    <TouchableOpacity 
                      style={styles.rejectButton}
                      onPress={handleRejectRequest}
                      disabled={processingRequest}
                    >
                      {processingRequest ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>Rechazar Solicitud</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Solicitudes de Eventos</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF3A5E" />
              <Text style={styles.loadingText}>Cargando solicitudes...</Text>
            </View>
          ) : (
            <>
              {requests.length > 0 ? (
                <>
                  <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Filtrar por categoría:</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.categoryFilterContainer}
                    >
                      {categories.map(category => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.categoryFilterButton,
                            selectedCategory === category && styles.categoryFilterButtonActive
                          ]}
                          onPress={() => handleCategoryChange(category)}
                        >
                          <Text 
                            style={[
                              styles.categoryFilterText,
                              selectedCategory === category && styles.categoryFilterTextActive
                            ]}
                          >
                            {category === 'todas' ? 'Todas' : category.charAt(0).toUpperCase() + category.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map(renderRequestItem)
                    ) : (
                      <View style={styles.emptyFilterContainer}>
                        <Ionicons name="filter-outline" size={40} color="#999" />
                        <Text style={styles.emptyFilterText}>No hay solicitudes en esta categoría</Text>
                      </View>
                    )}
                  </ScrollView>
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={64} color="#999" />
                  <Text style={styles.emptyText}>No hay solicitudes de eventos</Text>
                  <Text style={styles.emptySubtext}>
                    Cuando los artistas soliciten tu espacio cultural, las solicitudes aparecerán aquí
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {renderDetailsModal()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  requestItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3A5E',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
  },
  statusIcon: {
    marginRight: 5,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestDetails: {
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 8,
    color: '#CCCCCC',
    fontSize: 14,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
  },
  requestDate: {
    color: '#999999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  categoryFilterContainer: {
    paddingVertical: 5,
  },
  categoryFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryFilterButtonActive: {
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    borderColor: '#FF3A5E',
  },
  categoryFilterText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  categoryFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyFilterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyFilterText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  detailsModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  detailsModalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3A5E',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusTextLarge: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectionReasonContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    borderRadius: 10,
    width: '100%',
  },
  rejectionReasonLabel: {
    color: '#FF3A5E',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rejectionReasonText: {
    color: '#FFFFFF',
  },
  detailSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3A5E',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#999999',
    width: 120,
  },
  detailValue: {
    color: '#FFFFFF',
    flex: 1,
  },
  actionSection: {
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  rejectSection: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
  },
  rejectLabel: {
    color: '#FFFFFF',
    marginBottom: 10,
  },
  rejectInput: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.3)',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 15,
  },
  rejectButton: {
    backgroundColor: '#FF3A5E',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  socialMediaButton: {
    padding: 5,
    marginRight: 10,
  },
});

export default RequestsModal;
