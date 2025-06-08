/**
 * Este archivo maneja el servicio de imágenes
 * - Servicios
 * - Espacios
 * - Imágenes
 */

import * as FileSystem from 'expo-file-system';
import { Platform, Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';


const ImageService = {
 
  async compressImage(uri) {
    try {
      console.warn('Comprimiendo imagen:', uri.substring(0, 30) + '...');
      
      if (Platform.OS === 'android' && uri.startsWith('content://')) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        uri = fileInfo.uri;
      }
      
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], 
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } 
      );
      
      console.warn('Imagen comprimida exitosamente');
      return result.uri;
    } catch (error) {
      console.warn('Error al comprimir imagen:', error.message);
      return uri; 
    }
  },
  
  async saveImageLocally(uri) {
    try {
      const compressedUri = await this.compressImage(uri);
      
      const fileName = `image_${new Date().getTime()}.jpg`;
      const newUri = `${FileSystem.documentDirectory}images/${fileName}`;
      
      const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}images`);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images`, { intermediates: true });
      }
      
      await FileSystem.copyAsync({
        from: compressedUri,
        to: newUri
      });
      
      console.warn('Imagen guardada localmente:', newUri);
      return newUri;
    } catch (error) {
      console.warn('Error al guardar imagen localmente:', error.message);
      return uri; 
    }
  },
  
  async processImages(uris) {
    try {
      if (!uris || !Array.isArray(uris)) {
        console.warn('Array de URIs inválido');
        return [];
      }

      console.warn(`Procesando ${uris.length} imágenes`);
      
      const validUris = uris.filter(uri => uri && typeof uri === 'string');
      
      const results = [];
      
      for (let i = 0; i < validUris.length; i++) {
        try {
          const uri = validUris[i];
          console.warn(`Procesando imagen ${i+1}/${validUris.length}`);
          
          if (uri.startsWith(FileSystem.documentDirectory)) {
            results.push(uri);
            continue;
          }
          
          const savedUri = await this.saveImageLocally(uri);
          results.push(savedUri);
        } catch (processError) {
          console.warn(`Error al procesar imagen ${i+1}:`, processError.message);
          results.push(validUris[i]);
        }
      }
      
      console.warn(`Procesamiento completado. ${results.length} imágenes procesadas`);
      return results;
    } catch (error) {
      console.warn('Error en ImageService.processImages:', error.message);
      return uris;
    }
  },
  
  isLocalImage(uri) {
    return typeof uri === 'string' && uri.startsWith(FileSystem.documentDirectory);
  }
};

export default ImageService;
