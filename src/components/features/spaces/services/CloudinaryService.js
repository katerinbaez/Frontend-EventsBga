/**
 * Este archivo maneja el servicio de Cloudinary
 * - Servicios
 * - Espacios
 * - Imágenes
 */

import { Platform } from 'react-native';
import { CLOUDINARY_CONFIG } from '../../../../constants/cloudinaryConfig';

const { CLOUD_NAME, UPLOAD_URL, UPLOAD_PRESET } = CLOUDINARY_CONFIG;

const CloudinaryService = {

  isCloudinaryUrl(url) {
    return typeof url === 'string' && url.includes('cloudinary.com');
  },
  
  
  async uploadImage(uri) {
    try {
      if (!uri || typeof uri !== 'string') {
        console.warn('URI inválida');
        return uri;
      }

      console.warn('Preparando imagen para subir a Cloudinary:', uri.substring(0, 50) + '...');
      
      const filename = uri.split('/').pop();
      console.warn('Nombre del archivo:', filename);
      
      const extension = filename.split('.').pop().toLowerCase();
      let mimeType = 'image/jpeg';
      if (extension === 'png') mimeType = 'image/png';
      else if (extension === 'gif') mimeType = 'image/gif';
      console.warn('Tipo MIME:', mimeType);
      
      const formData = new FormData();
      
      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: filename
      });
      
      formData.append('upload_preset', UPLOAD_PRESET);
      
      console.warn('Configuración de Cloudinary:');
      console.warn('- Cloud Name:', CLOUD_NAME);
      console.warn('- Upload URL:', UPLOAD_URL);
      console.warn('- Upload Preset:', UPLOAD_PRESET);
      
      console.warn('Iniciando solicitud a Cloudinary...');
      
      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData
      });
      
      console.warn('Respuesta recibida. Status:', response.status);
      
      if (!response.ok) {
        console.warn('Error en respuesta HTTP:', response.status, response.statusText);
        
        try {
          const errorText = await response.text();
          console.warn('Detalle del error:', errorText.substring(0, 200));
        } catch (textError) {
          console.warn('No se pudo obtener el detalle del error');
        }
        
        return uri;
      }
      
      let data;
      try {
        const responseText = await response.text();
        console.warn('Respuesta:', responseText.substring(0, 100) + '...');
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.warn('Error al parsear respuesta JSON:', jsonError.message);
        return uri;
      }
      
      if (data && data.secure_url) {
        console.warn('¡ÉXITO! Imagen subida a Cloudinary');
        console.warn('URL:', data.secure_url);
        return data.secure_url;
      } else if (data && data.error) {
        console.warn('Error reportado por Cloudinary:', data.error.message || JSON.stringify(data.error));
        return uri;
      } else {
        console.warn('Respuesta sin URL ni error:', JSON.stringify(data).substring(0, 100));
        return uri;
      }
    } catch (error) {
      console.warn('Error al subir imagen:', error.message || error);
      console.warn('Stack trace:', error.stack);
      return uri;
    }
  },
  
  async uploadMultipleImages(uris) {
    try {
      if (!uris || !Array.isArray(uris)) {
        console.warn('Array de URIs inválido');
        return [];
      }

      console.warn(`Iniciando subida de ${uris.length} imágenes a Cloudinary`);
      
      const validUris = uris.filter(uri => uri && typeof uri === 'string');
      
      const results = [];
      
      for (let i = 0; i < validUris.length; i++) {
        try {
          const uri = validUris[i];
          console.warn(`Procesando imagen ${i+1}/${validUris.length}`);
          
          if (this.isCloudinaryUrl(uri)) {
            console.warn('La imagen ya está en Cloudinary, usando URL existente');
            results.push(uri);
            continue;
          }
          
          console.warn('Subiendo imagen a Cloudinary...');
          const uploadedUrl = await this.uploadImage(uri);
          
          if (uploadedUrl !== uri && this.isCloudinaryUrl(uploadedUrl)) {
            console.warn('Imagen subida exitosamente a Cloudinary');
            results.push(uploadedUrl);
          } else {
            console.warn('La subida a Cloudinary falló, usando URI original');
            results.push(uri);
          }
        } catch (uploadError) {
          console.warn(`Error al subir imagen ${i+1}:`, uploadError.message);
          results.push(validUris[i]);
        }
      }
      
      console.warn(`Subida completada. ${results.length} imágenes procesadas`);
      console.warn('URLs resultantes:', JSON.stringify(results));
      return results;
    } catch (error) {
      console.warn('Error en CloudinaryService.uploadMultipleImages:', error.message);
      return uris;
    }
  },
  
  
  isCloudinaryUrl(uri) {
    return typeof uri === 'string' && uri.includes('cloudinary.com');
  },

 
  async checkImageStatus(uri) {
    try {
      if (!this.isCloudinaryUrl(uri)) {
        return {
          isInCloud: false,
          location: 'local',
          uri: uri,
          message: 'La imagen solo está disponible localmente'
        };
      }
      
      const publicIdMatch = uri.match(/\/v\d+\/(.+)$/);
      if (!publicIdMatch || !publicIdMatch[1]) {
        return {
          isInCloud: true,
          location: 'cloud',
          uri: uri,
          message: 'La imagen está en Cloudinary pero no se puede verificar su estado'
        };
      }
      
      const publicId = publicIdMatch[1];
      console.warn('Verificando imagen con public_id:', publicId);
      
      return {
        isInCloud: true,
        location: 'cloud',
        uri: uri,
        publicId: publicId,
        message: 'La imagen está disponible en Cloudinary'
      };
    } catch (error) {
      console.warn('Error al verificar estado de imagen:', error.message);
      return {
        isInCloud: false,
        error: error.message,
        uri: uri,
        message: 'Error al verificar estado de la imagen'
      };
    }
  }
};

export default CloudinaryService;
