/**
 * Este archivo maneja el hook de gestión de solicitudes
 * - Hooks
 * - Solicitudes
 * - Gestión
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import { BACKEND_URL } from '../../../../constants/config';

const useRequestsManager = (visible, user) => {
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

    const categoriasPreestablecidas = ['musica', 'teatro', 'danza', 'arte', 'literatura', 'cine'];
    
    if (category === 'todas') {
      setFilteredRequests(requestsToFilter);
    } else if (category === 'otro') {
      const filtered = requestsToFilter.filter(request => {
        const requestCategory = (request.category || request.categoria || '').toLowerCase();
        return requestCategory !== '' && !categoriasPreestablecidas.includes(requestCategory);
      });
      setFilteredRequests(filtered);
    } else {
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
      
      const response = await axios.post(`${BACKEND_URL}/api/event-requests/approve-request/${selectedRequest.id}`);
      console.log('Respuesta de aprobación:', response.data);

      if (response.data.success) {
        try {
          const rawDate = selectedRequest.fecha || selectedRequest.date;
          console.log('Fecha original de la solicitud:', rawDate);
          
          let eventDate;
          if (typeof rawDate === 'string' && rawDate.includes('-')) {
            const [year, month, day] = rawDate.split('-').map(num => parseInt(num, 10));
            eventDate = new Date(year, month - 1, day);
            console.log(`Fecha parseada: ${year}-${month}-${day}, día de la semana: ${eventDate.getDay()}`);
          } else {
            eventDate = new Date(rawDate);
          }
          
          const startTimeStr = selectedRequest.horaInicio || selectedRequest.startTime || "09:00";
          const hour = parseInt(startTimeStr.split(':')[0], 10);
          
          const year = eventDate.getFullYear();
          const month = String(eventDate.getMonth() + 1).padStart(2, '0');
          const day = String(eventDate.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          
          console.log(`Bloqueando horario: Fecha ${formattedDate}, Hora ${hour}, Evento ID ${selectedRequest.id}`);
          
          let managerId = selectedRequest.managerId;
          
          if (managerId && managerId.includes('-')) {
            try {
              if (selectedRequest.metadatos && selectedRequest.metadatos.managerIdAuth) {
                managerId = selectedRequest.metadatos.managerIdAuth;
                console.log('Usando ID de autenticación del gestor desde metadatos:', managerId);
              } else if (selectedRequest.space && selectedRequest.space.managerIdAuth) {
                managerId = selectedRequest.space.managerIdAuth;
                console.log('Usando ID de autenticación del gestor desde space:', managerId);
              }
            } catch (error) {
              console.error('Error al obtener ID de autenticación del gestor:', error);
            }
          }
          
          const blockData = {
            spaceId: managerId,
            day: formattedDate,
            hour: hour,
            isRecurring: false,
            eventId: selectedRequest.id
          };
          
          console.log('Datos enviados para bloqueo:', blockData);
          
          const blockResponse = await axios.post(`${BACKEND_URL}/api/event-requests/block-slot`, blockData)
            .catch(blockError => {
              console.error('Error detallado al bloquear horario:', blockError.response?.data || blockError.message);
              return { data: { success: false, message: blockError.response?.data?.message || 'Error al comunicarse con el servidor' } };
            });
          
          if (blockResponse.data.success) {
            console.log('Horario bloqueado exitosamente:', blockResponse.data);
            
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
      
      const response = await axios.post(`${BACKEND_URL}/api/event-requests/reject-request/${selectedRequest.id}`, {
        rejectionReason: rejectionReason,
        managerId: user.id || user.sub,
        managerEmail: user.email
      }, {
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

  return {
    loading,
    requests,
    filteredRequests,
    selectedRequest,
    detailsModalVisible,
    rejectionReason,
    processingRequest,
    selectedCategory,
    categories,
    error,
    artistsInfo,
    spaceInfo,
    setRejectionReason,
    handleCategoryChange,
    showRequestDetails,
    setDetailsModalVisible,
    handleApproveRequest,
    handleRejectRequest,
    getArtistContact
  };
};

export default useRequestsManager;
