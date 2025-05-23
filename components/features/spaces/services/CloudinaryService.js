import { Platform } from 'react-native';
import { CLOUDINARY_CONFIG } from '../../../../constants/cloudinaryConfig';

const { CLOUD_NAME, UPLOAD_URL, UPLOAD_PRESET } = CLOUDINARY_CONFIG;

/**
 * Servicio para manejar la subida de imágenes a Cloudinary
 */
const CloudinaryService = {
  /**
   * Verifica si una URL es de Cloudinary
   * @param {string} url - URL a verificar
   * @returns {boolean} true si es una URL de Cloudinary
   */
  isCloudinaryUrl(url) {
    return typeof url === 'string' && url.includes('cloudinary.com');
  },
  
  /**
   * Sube una imagen a Cloudinary
   * @param {string} uri - URI local de la imagen
   * @returns {Promise<string>} URL de la imagen en Cloudinary
   */
  async uploadImage(uri) {
    try {
      // Verificar que la URI sea válida
      if (!uri || typeof uri !== 'string') {
        console.warn('URI inválida');
        return uri;
      }

      console.warn('Preparando imagen para subir a Cloudinary:', uri.substring(0, 50) + '...');
      
      // Preparar el nombre del archivo
      const filename = uri.split('/').pop();
      console.warn('Nombre del archivo:', filename);
      
      // Determinar el tipo MIME basado en la extensión
      const extension = filename.split('.').pop().toLowerCase();
      let mimeType = 'image/jpeg';
      if (extension === 'png') mimeType = 'image/png';
      else if (extension === 'gif') mimeType = 'image/gif';
      console.warn('Tipo MIME:', mimeType);
      
      // Crear un objeto FormData para enviar la imagen
      const formData = new FormData();
      
      // Agregar parámetros requeridos por Cloudinary
      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: filename
      });
      
      // Usar el preset sin firma (unsigned)
      formData.append('upload_preset', UPLOAD_PRESET);
      
      console.warn('Configuración de Cloudinary:');
      console.warn('- Cloud Name:', CLOUD_NAME);
      console.warn('- Upload URL:', UPLOAD_URL);
      console.warn('- Upload Preset:', UPLOAD_PRESET);
      
      console.warn('Iniciando solicitud a Cloudinary...');
      
      // Realizar la solicitud a Cloudinary
      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData
      });
      
      console.warn('Respuesta recibida. Status:', response.status);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        console.warn('Error en respuesta HTTP:', response.status, response.statusText);
        
        // Intentar obtener el texto del error
        try {
          const errorText = await response.text();
          console.warn('Detalle del error:', errorText.substring(0, 200));
        } catch (textError) {
          console.warn('No se pudo obtener el detalle del error');
        }
        
        return uri;
      }
      
      // Obtener la respuesta como JSON
      let data;
      try {
        const responseText = await response.text();
        console.warn('Respuesta:', responseText.substring(0, 100) + '...');
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.warn('Error al parsear respuesta JSON:', jsonError.message);
        return uri;
      }
      
      // Verificar si tenemos una URL segura
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
  
  /**
   * Sube múltiples imágenes a Cloudinary
   * @param {Array<string>} uris - Array de URIs locales de imágenes
   * @returns {Promise<Array<string>>} Array de URLs de imágenes en Cloudinary
   */
  async uploadMultipleImages(uris) {
    try {
      // Verificar que uris sea un array válido
      if (!uris || !Array.isArray(uris)) {
        console.warn('Array de URIs inválido');
        return [];
      }

      console.warn(`Iniciando subida de ${uris.length} imágenes a Cloudinary`);
      
      // Filtrar URIs vacías
      const validUris = uris.filter(uri => uri && typeof uri === 'string');
      
      // Subir cada imagen individualmente
      const results = [];
      
      for (let i = 0; i < validUris.length; i++) {
        try {
          const uri = validUris[i];
          console.warn(`Procesando imagen ${i+1}/${validUris.length}`);
          
          // Si la URI ya es una URL de Cloudinary, usarla directamente
          if (this.isCloudinaryUrl(uri)) {
            console.warn('La imagen ya está en Cloudinary, usando URL existente');
            results.push(uri);
            continue;
          }
          
          // Si es una URI local, intentar subirla a Cloudinary
          console.warn('Subiendo imagen a Cloudinary...');
          const uploadedUrl = await this.uploadImage(uri);
          
          // Verificar si la subida fue exitosa (si la URL cambió)
          if (uploadedUrl !== uri && this.isCloudinaryUrl(uploadedUrl)) {
            console.warn('Imagen subida exitosamente a Cloudinary');
            results.push(uploadedUrl);
          } else {
            console.warn('La subida a Cloudinary falló, usando URI original');
            results.push(uri);
          }
        } catch (uploadError) {
          console.warn(`Error al subir imagen ${i+1}:`, uploadError.message);
          // Si falla, usar la URI original
          results.push(validUris[i]);
        }
      }
      
      console.warn(`Subida completada. ${results.length} imágenes procesadas`);
      console.warn('URLs resultantes:', JSON.stringify(results));
      return results;
    } catch (error) {
      console.warn('Error en CloudinaryService.uploadMultipleImages:', error.message);
      // En caso de error, devolver las URIs originales
      return uris;
    }
  },
  
  /**
   * Verifica si una URI es una URL de Cloudinary
   * @param {string} uri - URI a verificar
   * @returns {boolean} true si es una URL de Cloudinary
   */
  isCloudinaryUrl(uri) {
    return typeof uri === 'string' && uri.includes('cloudinary.com');
  },

  /**
   * Verifica el estado de una imagen en Cloudinary
   * @param {string} uri - URI o URL de la imagen
   * @returns {Promise<Object>} Objeto con información sobre la imagen
   */
  async checkImageStatus(uri) {
    try {
      // Si no es una URL de Cloudinary, retornar estado local
      if (!this.isCloudinaryUrl(uri)) {
        return {
          isInCloud: false,
          location: 'local',
          uri: uri,
          message: 'La imagen solo está disponible localmente'
        };
      }
      
      // Extraer el public_id de la URL de Cloudinary
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
