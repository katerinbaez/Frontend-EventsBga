import { useState } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

const useEventSubmission = (onClose) => {
  const [loading, setLoading] = useState(false);

  // Enviar solicitud de evento al endpoint sin token de autenticación
  const handleSubmit = async (user, formData, resetForm) => {
    setLoading(true);
    try {
      console.log('Datos de la solicitud:', JSON.stringify(formData));
      
      // Verificar que el usuario esté autenticado
      if (!user || !user.id) {
        Alert.alert(
          'Error de autenticación', 
          'No se pudo verificar tu identidad. Por favor, inicia sesión nuevamente.',
          [{ text: 'Entendido', style: 'cancel' }]
        );
        setLoading(false);
        return;
      }
      
      try {
        console.log('Enviando solicitud sin token...');
        
        // Preparar los datos para el endpoint alternativo sin token
        const dataToSend = {
          ...formData,
          artistEmail: user.email,  // Incluir email para verificación adicional
          oauth_id: user.id,  // Incluir ID de OAuth para verificación en backend
          // Asegurar que todos los campos requeridos estén presentes
          artistId: user.id || '',
          managerId: formData.managerId || '',
          // Convertir spaceId a número entero si es posible, o usar 1 como valor por defecto
          spaceId: formData.spaceId && !isNaN(parseInt(formData.spaceId)) ? 
                  parseInt(formData.spaceId) : 1,
          // Usar el nombre del espacio que se recibe como prop
          spaceName: formData.spaceName || 'Espacio Cultural',
          spaceAddress: 'Centro del oriente, Bucaramanga',
          titulo: formData.titulo || '',
          descripcion: formData.descripcion || '',
          fecha: formData.fecha || new Date().toISOString().split('T')[0],
          horaInicio: formData.horaInicio || '00:00:00',
          horaFin: formData.horaFin || '01:00:00',
          duracionHoras: formData.duracionHoras || 1,
          asistentesEsperados: parseInt(formData.asistentesEsperados) || 0,
          tipoEvento: formData.tipoEvento || '',
          categoria: formData.categoria || '',
          requerimientosAdicionales: formData.requerimientosAdicionales || ''
        };
        
        console.log('Enviando datos al endpoint sin token:', dataToSend);
        
        // Enviar la solicitud al endpoint alternativo que no requiere token
        const response = await axios.post(`${BACKEND_URL}/api/event-requests/artist-submit`, dataToSend, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Respuesta exitosa del servidor:', response.data);
        
        // Mostrar mensaje de éxito con el color de acento rojo (#FF3A5E)
        Alert.alert(
          'Solicitud Enviada', 
          'Tu solicitud ha sido enviada con éxito. El gestor del espacio te notificará cuando sea revisada.',
          [{ text: 'OK', onPress: () => {
            // Limpiar formulario
            resetForm();
            // Cerrar modal
            onClose();
          }}]
        );
      } catch (error) {
        console.error('Error al enviar solicitud:', error);

        let errorMessage = 'Ocurrió un error al enviar la solicitud. Por favor, inténtalo de nuevo.';

        if (error.response) {
          // El servidor respondió con un código de error
          console.error('Error de respuesta:', error.response.data);
          if (error.response.status === 401) {
            errorMessage = 'No estás autorizado para realizar esta acción. Por favor, inicia sesión nuevamente.';
          } else if (error.response.status === 403) {
            errorMessage = 'No tienes permisos para realizar esta acción.';
          } else if (error.response.status === 500) {
            errorMessage = 'Error en el servidor. El equipo técnico ha sido notificado. Por favor, inténtalo más tarde.';
            // Intentar extraer más información del error para mostrar un mensaje más específico
            if (error.response.data && error.response.data.error) {
              if (error.response.data.error.includes('foreign key constraint')) {
                errorMessage = 'Error de referencia: Uno de los datos proporcionados no existe en el sistema.';
              } else if (error.response.data.error.includes('null')) {
                errorMessage = 'Faltan datos obligatorios en el formulario. Por favor, completa todos los campos requeridos.';
              }
            }
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error('Error de solicitud:', error.request);
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }

        // Mostrar el error en un Alert con el color de acento rojo (#FF3A5E)
        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'Entendido', style: 'cancel' }]
        );
      }
    } catch (outerError) {
      console.error('Error inesperado:', outerError);
      Alert.alert('Error Inesperado', 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    handleSubmit
  };
};

export default useEventSubmission;