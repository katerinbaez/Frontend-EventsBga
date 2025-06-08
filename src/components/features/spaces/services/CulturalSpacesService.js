/**
 * Este archivo maneja el servicio de espacios culturales
 * - Servicios
 * - Espacios
 * - CRUD
 * - Gestión
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';


const isValidImageUri = (uri) => {
  if (!uri) return false;
  return uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://');
};

const processImageForPersistence = (imageUri) => {
  return imageUri;
};

const getSpaces = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
    
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.spaces && Array.isArray(response.data.spaces)) {
      return response.data.spaces;
    } else {
      console.error('Formato de respuesta inesperado:', response.data);
      throw new Error('No se pudieron cargar los espacios culturales.');
    }
  } catch (error) {
    console.error('Error al cargar espacios culturales:', error);
    throw error;
  }
};

const getSpaceDetails = async (spaceId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces/${spaceId}`);
    
    if (response.data) {
      return response.data.space || response.data;
    } else {
      throw new Error('No se pudieron cargar los detalles del espacio cultural.');
    }
  } catch (error) {
    console.error('Error al cargar detalles del espacio:', error);
    throw error;
  }
};

export {
  getSpaces,
  getSpaceDetails,
  isValidImageUri,
  processImageForPersistence
};
