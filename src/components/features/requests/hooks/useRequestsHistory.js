import { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import { BACKEND_URL } from '../../../../constants/config';

const useRequestsHistory = (visible, user) => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  
  useEffect(() => {
    if (visible && user) {
      loadRequests();
    }
  }, [visible, user]);
  
  const loadRequests = async () => {
    setLoading(true);
    try {
      // Usar el endpoint alternativo que no requiere token
      const response = await axios.get(`${BACKEND_URL}/api/event-requests/artist-requests/${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Email': user.email,
          'X-User-Role': 'artist'
        }
      });
      console.log('Respuesta de solicitudes:', response.data);
      
      if (response.data.success) {
        // Ordenar por fecha de creación, más recientes primero
        const sortedRequests = response.data.requests.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Asegurarse de que cada solicitud tenga un nombre de espacio válido
        const processedRequests = sortedRequests.map(request => {
          // Si el nombre del espacio es genérico o no existe, intentar obtenerlo de los metadatos
          if (!request.spaceName || request.spaceName === 'Espacio Cultural') {
            try {
              // Intentar extraer el nombre del espacio de los metadatos si existen
              if (request.metadatos) {
                const metadatos = JSON.parse(request.metadatos);
                if (metadatos.spaceName && metadatos.spaceName !== 'Espacio Cultural') {
                  request.spaceName = metadatos.spaceName;
                }
              }
            } catch (error) {
              console.error('Error al procesar metadatos:', error);
            }
          }
          return request;
        });
        
        setRequests(processedRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      let errorMessage = 'No se pudieron cargar las solicitudes. Intenta nuevamente.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'No se encontraron solicitudes para tu usuario.';
          // Si no hay solicitudes, establecer un array vacío
          setRequests([]);
        } else if (error.response.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, intenta más tarde.';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const showRequestDetails = (request) => {
    setSelectedRequest(request);
    setDetailsModalVisible(true);
  };
  
  return {
    loading,
    requests,
    selectedRequest,
    detailsModalVisible,
    setDetailsModalVisible,
    showRequestDetails
  };
};

export default useRequestsHistory;
