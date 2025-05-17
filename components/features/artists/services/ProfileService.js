import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

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

export const uploadProfileImage = async (userId, imageUri) => {
  if (!imageUri) return { success: false, error: 'No hay imagen para subir' };
  
  try {
    // Crear un objeto FormData para enviar la imagen
    const formData = new FormData();
    
    // Obtener el nombre del archivo de la URI
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // Añadir la imagen al FormData
    formData.append('profileImage', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg' // Ajustar según el tipo de imagen
    });
    
    // Enviar la imagen al servidor
    const response = await axios.put(
      `${BACKEND_URL}/api/artists/upload-profile-image/${encodeURIComponent(userId)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.data.success) {
      return { success: true, imageUrl: response.data.imageUrl };
    } else {
      return { success: false, error: 'No se pudo subir la imagen de perfil' };
    }
  } catch (error) {
    return { success: false, error: error.message || 'Error al subir la imagen' };
  }
};
