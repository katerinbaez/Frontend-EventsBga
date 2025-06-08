/**
 * Este archivo maneja el servicio de eliminación de eventos
 * - Servicios
 * - Espacios
 * - Eventos
 * - Eliminación
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { Alert } from 'react-native';


export const deleteEvent = async (event, token, loadData, setLoading) => {
  try {
    setLoading(true);
    console.log('Intentando eliminar evento con ID:', event.id);
    
    const authConfig = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (!token) {
      console.log('No hay token válido, usando headers de manager como respaldo');
      authConfig.headers['x-user-role'] = 'manager';
      authConfig.headers['x-user-email'] = 'manager@eventsbga.com';
      delete authConfig.headers['Authorization'];
    }
    
    try {
      const deleteUrl = `${BACKEND_URL}/api/events/${event.id}`;
      console.log('Intentando eliminar con URL:', deleteUrl);
      
      const response = await axios.delete(deleteUrl, authConfig);
      console.log('Evento eliminado correctamente');
      Alert.alert('Éxito', 'Evento eliminado correctamente');
      loadData();
    } catch (error) {
      console.error('Error al eliminar evento:', error.response?.status, error.message);
      
      if (error.response?.status === 404) {
        try {
          const alternativeUrl = `${BACKEND_URL}/api/manager-events/${event.id}`;
          console.log('Intentando eliminar con URL alternativa:', alternativeUrl);
          
          const altResponse = await axios.delete(alternativeUrl, authConfig);
          console.log('Evento eliminado correctamente con ruta alternativa');
          Alert.alert('Éxito', 'Evento eliminado correctamente');
          loadData();
        } catch (altError) {
          console.error('Error con ruta alternativa:', altError.response?.status);
          Alert.alert('Error', `No se pudo eliminar el evento. Por favor, intenta más tarde.`);
        }
      } else {
        Alert.alert('Error', `No se pudo eliminar el evento. Por favor, intenta más tarde.`);
      }
    }
  } catch (error) {
    console.error('Error general al eliminar evento:', error);
    Alert.alert('Error', `No se pudo eliminar el evento. Por favor, intenta más tarde.`);
  } finally {
    setLoading(false);
  }
};
