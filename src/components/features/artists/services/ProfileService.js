import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadArtistProfile = async (userId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${userId}`);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.artist
      };
    }
    return { success: false, error: 'No se pudo cargar el perfil' };
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false, error: 'Perfil no encontrado', notFound: true };
    }
    return { success: false, error: error.message || 'Error al cargar perfil' };
  }
};

export const saveArtistProfile = async (userId, profileData, method = 'post') => {
  try {
    const response = await axios[method](`${BACKEND_URL}/api/artists/profile/${userId}`, profileData);
    if (response.data.success) {
      return { success: true, data: response.data };
    }
    return { success: false, error: 'Error al guardar el perfil' };
  } catch (error) {
    return { success: false, error: error.message || 'Error al guardar el perfil' };
  }
};

/**
 * Guarda una imagen en base64 en el almacenamiento local
 * @param {string} userId - ID del usuario/artista
 * @param {string} imageUri - URI de la imagen
 * @param {string} imageType - Tipo MIME de la imagen
 * @returns {Promise<string>} - URI de la imagen en base64
 */
const saveImageToLocalStorage = async (userId, imageUri, imageType = 'image/jpeg') => {
  try {
    // Convertir la imagen a base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Crear la URI de base64 completa
    const base64Uri = `data:${imageType};base64,${base64}`;
    
    // Guardar en AsyncStorage
    await AsyncStorage.setItem(`artist_image_${userId}`, base64Uri);
    
    console.error(`Imagen guardada localmente para el artista ${userId}`);
    return base64Uri;
  } catch (error) {
    console.error('Error al guardar imagen localmente:', error);
    return null;
  }
};

/**
 * Sube una imagen de perfil al servidor y la guarda localmente
 */
export const uploadProfileImage = async (userId, imageUri) => {
  if (!imageUri) return { success: false, error: 'No hay imagen para subir' };
  
  // Guardar la imagen localmente primero
  let localBase64Uri = null;
  
  try {
    // Determinar el tipo de imagen basado en la extensión
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    let fileType = 'image/jpeg'; // Por defecto
    
    if (fileName.toLowerCase().endsWith('.png')) {
      fileType = 'image/png';
    } else if (fileName.toLowerCase().endsWith('.gif')) {
      fileType = 'image/gif';
    } else if (fileName.toLowerCase().endsWith('.webp')) {
      fileType = 'image/webp';
    }
    
    // Guardar la imagen localmente
    localBase64Uri = await saveImageToLocalStorage(userId, imageUri, fileType);
  } catch (localError) {
    console.error('Error al procesar imagen localmente:', localError);
  }
  
  // Intentar subir al servidor
  try {
    // Crear un objeto FormData para enviar la imagen
    const formData = new FormData();
    
    // Obtener el nombre del archivo de la URI
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // Determinar el tipo de imagen basado en la extensión
    let fileType = 'image/jpeg'; // Por defecto
    if (fileName.toLowerCase().endsWith('.png')) {
      fileType = 'image/png';
    } else if (fileName.toLowerCase().endsWith('.gif')) {
      fileType = 'image/gif';
    } else if (fileName.toLowerCase().endsWith('.webp')) {
      fileType = 'image/webp';
    }
    
    // Añadir la imagen al FormData
    formData.append('profileImage', {
      uri: imageUri,
      name: fileName,
      type: fileType
    });
    
    // Añadir el userId al FormData para identificar al usuario
    formData.append('userId', userId);
    
    // Enviar la imagen al servidor
    const response = await axios.put(
      `${BACKEND_URL}/api/artists/upload-profile-image/${encodeURIComponent(userId)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // Aumentar el timeout a 30 segundos para archivos grandes
      }
    );
    
    if (response.data.success) {
      // Si tenemos una versión local, devolverla como alternativa
      if (localBase64Uri) {
        return { 
          success: true, 
          imageUrl: response.data.imageUrl,
          localImageUrl: localBase64Uri
        };
      }
      return { success: true, imageUrl: response.data.imageUrl };
    } else {
      // Si falló el servidor pero tenemos versión local, considerarlo éxito parcial
      if (localBase64Uri) {
        return { 
          success: true, 
          imageUrl: localBase64Uri,
          localOnly: true,
          message: 'Imagen guardada localmente, pero no se pudo subir al servidor'
        };
      }
      return { success: false, error: 'No se pudo subir la imagen de perfil' };
    }
  } catch (error) {
    console.error('Error al subir imagen de perfil:', error);
    
    // Si tenemos una versión local, considerarlo éxito parcial
    if (localBase64Uri) {
      return { 
        success: true, 
        imageUrl: localBase64Uri,
        localOnly: true,
        message: 'Imagen guardada localmente, pero no se pudo subir al servidor'
      };
    }
    
    // Intentar un enfoque alternativo si el servidor no responde correctamente
    try {
      // Crear un objeto con los datos del perfil incluyendo la imagen en base64
      const response = await axios.post(
        `${BACKEND_URL}/api/artists/upload-profile-image-alternative/${encodeURIComponent(userId)}`,
        { imageUri },
        { timeout: 30000 }
      );
      
      if (response.data.success) {
        return { success: true, imageUrl: response.data.imageUrl };
      }
    } catch (alternativeError) {
      console.error('Error en método alternativo:', alternativeError);
    }
    
    return { success: false, error: error.message || 'Error al subir la imagen' };
  }
};

/**
 * Obtiene la imagen de perfil de un artista, intentando primero desde el almacenamiento local
 * @param {string} artistId - ID del artista
 * @returns {Promise<string>} - URL de la imagen
 */
export const getProfileImage = async (artistId) => {
  if (!artistId) return null;
  
  try {
    // Intentar obtener la imagen desde el almacenamiento local
    const localImage = await AsyncStorage.getItem(`artist_image_${artistId}`);
    if (localImage) {
      console.error(`Usando imagen en caché para el artista ${artistId}`);
      return localImage;
    }
  } catch (error) {
    console.error('Error al obtener imagen local:', error);
  }
  
  // Si no hay imagen local, devolver null para que se use la URL del servidor
  return null;
};
