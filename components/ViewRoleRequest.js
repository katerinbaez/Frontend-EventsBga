import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const BACKEND_URL = "http://192.168.1.7:5000";

const ViewRoleRequests = () => {
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

      // Actualizar el estado de la solicitud y enviar el tipo correcto de notificación
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

      // Crear la notificación localmente
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

      // Actualizar la lista de solicitudes y cerrar el modal
      await fetchRequests();
      setModalVisible(false);
      setError(''); // Limpiar cualquier error previo

      // Mostrar mensaje de éxito
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
        // Obtener el nombre del archivo de la URL
        const fileName = url.split('/').pop();
        
        // Crear un directorio para los documentos si no existe
        const documentsDir = FileSystem.documentDirectory + 'RoleRequests/';
        const dirInfo = await FileSystem.getInfoAsync(documentsDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
        }

        // Copiar el archivo al directorio de documentos
        const newPath = documentsDir + fileName;
        await FileSystem.copyAsync({
          from: url,
          to: newPath
        });

        // Compartir el archivo
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(newPath);
        } else {
          Alert.alert('Error', 'Compartir archivos no está disponible en este dispositivo');
        }
      } else {
        // Si es una URL web normal, abrirla
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error al manejar el documento:', error);
      Alert.alert('Error', 'No se pudo abrir el documento');
    } finally {
      setDownloading(false);
    }
  };

  const renderDocumentLink = (url) => {
    return (
      <TouchableOpacity onPress={() => handleDocumentPress(url)}>
        <Text style={styles.link}>Ver documento</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedRequest(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.name}>Usuario: {item.userName || item.userId}</Text>
      <Text style={styles.text}>Rol: {item.rolSolicitado}</Text>
      <Text style={styles.text}>Estado: {item.estado}</Text>
      <Text style={styles.text}>Justificación: {item.justificacion}</Text>
      <Text style={styles.fecha}>Fecha: {new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  const renderDocumentos = (documentos) => {
    console.log('Renderizando documentos:', documentos);

    if (!documentos || (Array.isArray(documentos) && documentos.length === 0) || Object.keys(documentos).length === 0) {
      return <Text style={styles.modalText}>No hay documentos adjuntos</Text>;
    }

    return (
      <View>
        <Text style={styles.modalSubHeader}>Documentos:</Text>
        {Array.isArray(documentos) ? (
          documentos.map((url, index) => {
            console.log('Documento array:', index, url);
            return (
              <TouchableOpacity 
                key={index}
                onPress={() => handleDocumentPress(url)}
                disabled={downloading}
              >
                <Text style={styles.link}>
                  {downloading ? 'Procesando documento...' : `Documento ${index + 1}`}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          Object.entries(documentos).map(([key, url], index) => {
            console.log('Documento objeto:', key, url);
            return (
              <TouchableOpacity 
                key={index}
                onPress={() => handleDocumentPress(url)}
                disabled={downloading}
              >
                <Text style={styles.link}>
                  {downloading ? 'Procesando documento...' : (key || `Documento ${index + 1}`)}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    );
  };

  const renderPortafolio = (portafolio) => {
    if (!portafolio || portafolio.length === 0) {
      return null;
    }

    return (
      <View>
        <Text style={styles.modalSubHeader}>Portafolio:</Text>
        {portafolio.map((url, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => handleDocumentPress(url)}
          >
            <Text style={styles.link}>Ver Portafolio {index + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalHeader}>Detalles de la Solicitud</Text>
          
          {selectedRequest && (
            <>
              <Text style={styles.modalName}>Usuario: {selectedRequest.userName || selectedRequest.userId}</Text>
              <Text style={styles.modalText}>Rol: {selectedRequest.rolSolicitado}</Text>
              <Text style={styles.modalText}>Estado: {selectedRequest.estado}</Text>
              <Text style={styles.modalText}>Justificación: {selectedRequest.justificacion}</Text>
              
              {selectedRequest.rolSolicitado === 'Artista' ? (
                <>
                  <Text style={styles.modalText}>Trayectoria: {selectedRequest.trayectoriaArtistica}</Text>
                  {renderPortafolio(selectedRequest.portafolio)}
                </>
              ) : (
                <>
                  <Text style={styles.modalText}>Experiencia: {selectedRequest.experienciaGestion}</Text>
                  <Text style={styles.modalText}>Espacio Cultural: {selectedRequest.espacioCultural}</Text>
                  <Text style={styles.modalText}>Licencias: {selectedRequest.licencias}</Text>
                </>
              )}
              {renderDocumentos(selectedRequest.documentos)}

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.approveButton]}
                  onPress={() => handleUpdateStatus(selectedRequest.id, 'Aprobado')}
                >
                  <Text style={styles.buttonText}>Aprobar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleUpdateStatus(selectedRequest.id, 'Rechazado')}
                >
                  <Text style={styles.buttonText}>Rechazar</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, styles.closeButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedRequest(null);
                }}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Solicitudes de Rol</Text>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
          }
        />
      )}

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000000',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 90,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  documentViewer: {
    flex: 1,
    backgroundColor: '#000000'
  },
  documentHeader: {
    height: 60,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 15
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5
  },
  text: {
    color: '#FFFFFF',
    marginBottom: 5
  },
  fecha: {
    color: '#999999',
    fontSize: 12,
    marginTop: 5
  },
  emptyText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20
  },
  errorText: {
    color: '#ff4757',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    padding: 10
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxHeight: '90%'
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalSubHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5
  },
  modalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10
  },
  modalText: {
    color: '#FFFFFF',
    marginBottom: 8,
    fontSize: 16
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
    marginVertical: 5
  },
  approveButton: {
    backgroundColor: '#4CAF50'
  },
  rejectButton: {
    backgroundColor: '#f44336'
  },
  closeButton: {
    backgroundColor: '#757575',
    marginTop: 10
  },
});

export default ViewRoleRequests;
