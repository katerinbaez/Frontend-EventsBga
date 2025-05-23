import * as FileSystem from 'expo-file-system';
import { Platform, Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Servicio para manejar imágenes, comprimirlas y guardarlas como URLs
 */
const ImageService = {
  /**
   * Comprime una imagen y devuelve su URI
   * @param {string} uri - URI local de la imagen
   * @returns {Promise<string>} URI de la imagen comprimida
   */
  async compressImage(uri) {
    try {
      console.warn('Comprimiendo imagen:', uri.substring(0, 30) + '...');
      
      // En Android, las URIs de contenido necesitan ser manejadas de forma especial
      if (Platform.OS === 'android' && uri.startsWith('content://')) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        uri = fileInfo.uri;
      }
      
      // Comprimir la imagen usando ImageManipulator
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Redimensionar a 800px de ancho
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Comprimir al 50%
      );
      
      console.warn('Imagen comprimida exitosamente');
      return result.uri;
    } catch (error) {
      console.warn('Error al comprimir imagen:', error.message);
      return uri; // Devolver la URI original como fallback
    }
  },
  
  /**
   * Guarda una imagen en el sistema de archivos local y devuelve su URI
   * @param {string} uri - URI local de la imagen
   * @returns {Promise<string>} URI permanente de la imagen guardada
   */
  async saveImageLocally(uri) {
    try {
      // Primero comprimir la imagen
      const compressedUri = await this.compressImage(uri);
      
      // Generar un nombre de archivo único
      const fileName = `image_${new Date().getTime()}.jpg`;
      const newUri = `${FileSystem.documentDirectory}images/${fileName}`;
      
      // Asegurarse de que el directorio exista
      const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}images`);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images`, { intermediates: true });
      }
      
      // Copiar el archivo
      await FileSystem.copyAsync({
        from: compressedUri,
        to: newUri
      });
      
      console.warn('Imagen guardada localmente:', newUri);
      return newUri;
    } catch (error) {
      console.warn('Error al guardar imagen localmente:', error.message);
      return uri; // Devolver la URI original como fallback
    }
  },
  
  /**
   * Procesa múltiples imágenes y las guarda localmente
   * @param {Array<string>} uris - Array de URIs locales de imágenes
   * @returns {Promise<Array<string>>} Array de URIs de imágenes guardadas
   */
  async processImages(uris) {
    try {
      // Verificar que uris sea un array válido
      if (!uris || !Array.isArray(uris)) {
        console.warn('Array de URIs inválido');
        return [];
      }

      console.warn(`Procesando ${uris.length} imágenes`);
      
      // Filtrar URIs vacías
      const validUris = uris.filter(uri => uri && typeof uri === 'string');
      
      // Procesar cada imagen individualmente
      const results = [];
      
      for (let i = 0; i < validUris.length; i++) {
        try {
          const uri = validUris[i];
          console.warn(`Procesando imagen ${i+1}/${validUris.length}`);
          
          // Si la URI ya es una URI de archivo local permanente, usarla directamente
          if (uri.startsWith(FileSystem.documentDirectory)) {
            results.push(uri);
            continue;
          }
          
          // Guardar la imagen localmente
          const savedUri = await this.saveImageLocally(uri);
          results.push(savedUri);
        } catch (processError) {
          console.warn(`Error al procesar imagen ${i+1}:`, processError.message);
          // Si falla, usar la URI original
          results.push(validUris[i]);
        }
      }
      
      console.warn(`Procesamiento completado. ${results.length} imágenes procesadas`);
      return results;
    } catch (error) {
      console.warn('Error en ImageService.processImages:', error.message);
      // En caso de error, devolver las URIs originales
      return uris;
    }
  },
  
  /**
   * Verifica si una URI es una imagen local guardada
   * @param {string} uri - URI a verificar
   * @returns {boolean} true si es una imagen local guardada
   */
  isLocalImage(uri) {
    return typeof uri === 'string' && uri.startsWith(FileSystem.documentDirectory);
  }
};

export default ImageService;
