/**
 * Este archivo maneja el hook de visualización de solicitudes de rol
 * - Hooks
 * - Roles
 * - Visualización
 */

import { useState, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../../../context/AuthContext';
import { BACKEND_URL } from '../../../../constants/config';

const useViewRoleRequests = () => {
  const [requests, setRequests] = useState([]);
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [base64Content, setBase64Content] = useState(null);

  const fetchRequests = async () => {
    try {
      console.log('📱 Estado de autenticación:');
      console.log('- Usuario:', user ? JSON.stringify(user, null, 2) : 'No hay usuario');
      console.log('- Rol:', user?.role || 'No hay rol');

      if (!user) {
        setError('No hay información del usuario');
        return;
      }

      if (user.role !== 'admin') {
        setError(`El usuario no tiene rol de administrador (Rol actual: ${user.role})`);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/role-requests`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'x-user-email': 'admin@eventsbga.com'
        }
      });

      console.log('✅ Solicitudes obtenidas:', response.data);
      setRequests(response.data);
      setError('');
    } catch (error) {
      console.error('❌ Error al obtener solicitudes:', error);
      if (error.response) {
        console.error('Detalles del error:');
        console.error('- Status:', error.response.status);
        console.error('- Data:', error.response.data);
        setError(`Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
        setError('No se pudo conectar con el servidor');
      } else {
        console.error('Error en la configuración de la petición:', error.message);
        setError(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'Aprobado' && !selectedRequest) {
        throw new Error('No se encontró la solicitud seleccionada');
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-role': 'admin',
        'x-user-email': 'admin@eventsbga.com'
      };

      await axios.patch(
        `${BACKEND_URL}/api/role-requests/${id}/status`,
        { 
          estado: newStatus,
          notificationType: newStatus === 'Aprobado' ? 'roleApproved' : 'roleRejected',
          roleType: selectedRequest?.rolSolicitado?.toLowerCase() === 'gestoreventos' ? 'manager' : 'artist',
          userId: selectedRequest.userId, // ID del usuario que recibirá la notificación
          titulo: newStatus === 'Aprobado' ? 'Solicitud Aprobada' : 'Solicitud Rechazada',
          mensaje: newStatus === 'Aprobado' 
            ? `Tu solicitud para ser ${selectedRequest.rolSolicitado} ha sido aprobada.` 
            : `Tu solicitud para ser ${selectedRequest.rolSolicitado} ha sido rechazada.`
        },
        { headers }
      );

      await axios.post(
        `${BACKEND_URL}/api/notifications`,
        {
          userId: selectedRequest.userId,
          type: newStatus === 'Aprobado' ? 'roleApproved' : 'roleRejected',
          titulo: newStatus === 'Aprobado' ? 'Solicitud Aprobada' : 'Solicitud Rechazada',
          mensaje: newStatus === 'Aprobado' 
            ? `Tu solicitud para ser ${selectedRequest.rolSolicitado} ha sido aprobada.` 
            : `Tu solicitud para ser ${selectedRequest.rolSolicitado} ha sido rechazada.`,
          data: {
            roleType: selectedRequest?.rolSolicitado?.toLowerCase() === 'gestoreventos' ? 'manager' : 'artist'
          }
        },
        { headers }
      );

      await fetchRequests();
      setModalVisible(false);
      setError('');
      Alert.alert(
        'Éxito',
        newStatus === 'Aprobado' 
          ? 'La solicitud ha sido aprobada y se ha notificado al usuario.'
          : 'La solicitud ha sido rechazada.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error al actualizar estado:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      Alert.alert(
        'Error',
        `Error al procesar la solicitud: ${errorMessage}`,
        [{ text: 'OK' }]
      );
      setError(`Error al actualizar el estado de la solicitud: ${errorMessage}`);
    }
  };

  const handleDocumentPress = async (url) => {
    try {
      if (url.startsWith('file://')) {
        setDownloading(true);
        const fileName = url.split('/').pop();
        const documentsDir = FileSystem.documentDirectory + 'RoleRequests/';
        const dirInfo = await FileSystem.getInfoAsync(documentsDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
        }

        const newPath = documentsDir + fileName;
        await FileSystem.copyAsync({
          from: url,
          to: newPath
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(newPath);
        } else {
          Alert.alert('Error', 'Compartir archivos no está disponible en este dispositivo');
        }
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error al manejar el documento:', error);
      Alert.alert('Error', 'No se pudo abrir el documento');
    } finally {
      setDownloading(false);
    }
  };

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  return {
    requests,
    error,
    selectedRequest,
    modalVisible,
    downloading,
    handleUpdateStatus,
    handleDocumentPress,
    handleRequestSelect,
    closeModal
  };
};

export default useViewRoleRequests;
