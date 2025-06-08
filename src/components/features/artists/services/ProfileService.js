/**
 * Este archivo maneja las operaciones del servicio de perfil
 * - Carga
 * - Guardado
 * - Imágenes
 */

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

const saveImageToLocalStorage = async (userId, imageUri, imageType = 'image/jpeg') => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    const base64Uri = `data:${imageType};base64,${base64}`;
    
    await AsyncStorage.setItem(`artist_image_${userId}`, base64Uri);
    
    console.error(`Imagen guardada localmente para el artista ${userId}`);
    return base64Uri;
  } catch (error) {
    console.error('Error al guardar imagen localmente:', error);
    return null;
  }
};

export const uploadProfileImage = async (userId, imageUri) => {
  if (!imageUri) return { success: false, error: 'No hay imagen para subir' };
  
  let localBase64Uri = null;
  
  try {
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    let fileType = 'image/jpeg';
    
    if (fileName.toLowerCase().endsWith('.png')) {
      fileType = 'image/png';
    } else if (fileName.toLowerCase().endsWith('.gif')) {
      fileType = 'image/gif';
    } else if (fileName.toLowerCase().endsWith('.webp')) {
      fileType = 'image/webp';
    }
    
    localBase64Uri = await saveImageToLocalStorage(userId, imageUri, fileType);
  } catch (localError) {
    console.error('Error al procesar imagen localmente:', localError);
  }
  try {
    const formData = new FormData();
    
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    let fileType = 'image/jpeg';
    if (fileName.toLowerCase().endsWith('.png')) {
      fileType = 'image/png';
    } else if (fileName.toLowerCase().endsWith('.gif')) {
      fileType = 'image/gif';
    } else if (fileName.toLowerCase().endsWith('.webp')) {
      fileType = 'image/webp';
    }
    
    formData.append('profileImage', {
      uri: imageUri,
      name: fileName,
      type: fileType
    });
    
    formData.append('userId', userId);
    
    const response = await axios.put(
      `${BACKEND_URL}/api/artists/upload-profile-image/${encodeURIComponent(userId)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000
      }
    );
    
    if (response.data.success) {
      if (localBase64Uri) {
        return { 
          success: true, 
          imageUrl: response.data.imageUrl,
          localImageUrl: localBase64Uri
        };
      }
      return { success: true, imageUrl: response.data.imageUrl };
    } else {
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
    
    if (localBase64Uri) {
      return { 
        success: true, 
        imageUrl: localBase64Uri,
        localOnly: true,
        message: 'Imagen guardada localmente, pero no se pudo subir al servidor'
      };
    }
    
    try {
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

export const getProfileImage = async (artistId) => {
  if (!artistId) return null;
  
  try {
    const localImage = await AsyncStorage.getItem(`artist_image_${artistId}`);
    if (localImage) {
      console.error(`Usando imagen en caché para el artista ${artistId}`);
      return localImage;
    }
  } catch (error) {
    console.error('Error al obtener imagen local:', error);
  }
  
  return null;
};
