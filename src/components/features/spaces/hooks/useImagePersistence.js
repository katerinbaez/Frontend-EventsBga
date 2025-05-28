import { useState, useEffect } from 'react';
import { isLocalDevicePath, convertLocalPathToUrl, getSpaceImage } from '../services/ImageService';

/**
 * Hook personalizado para manejar la persistencia de imágenes entre dispositivos
 * @param {Array} spaces - Lista de espacios culturales
 * @returns {Object} - Espacios actualizados con URLs persistentes y funciones auxiliares
 */
const useImagePersistence = (initialSpaces) => {
  const [spaces, setSpaces] = useState(initialSpaces || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedSpaces, setProcessedSpaces] = useState([]);

  /**
   * Convierte imágenes locales a URLs persistentes para un espacio cultural
   * @param {Object} space - Espacio cultural
   * @returns {Promise<Object>} - Espacio actualizado con URLs persistentes
   */
  const convertLocalImagesToUrls = async (space) => {
    if (!space || !space.id || (!space.images && !space.imagenes)) return space;

    try {
      let hasChanges = false;
      let updatedSpace = { ...space };

      // Procesar imágenes en el campo 'images'
      if (space.images && space.images.length > 0) {
        const updatedImages = [];
        
        for (let i = 0; i < space.images.length; i++) {
          const imagePath = space.images[i];
          if (isLocalDevicePath(imagePath)) {
            // Si es una ruta local, convertirla a URL persistente
            const persistentUrl = await getSpaceImage(space.id, imagePath, i);
            if (persistentUrl) {
              updatedImages.push(persistentUrl);
              hasChanges = true;
              console.error(`Imagen ${i} convertida a URL persistente para el espacio ${space.id}`);
            } else {
              updatedImages.push('https://via.placeholder.com/300x200?text=Imagen+no+disponible');
            }
          } else {
            updatedImages.push(imagePath);
          }
        }
        
        if (hasChanges) {
          updatedSpace.images = updatedImages;
        }
      }

      // Procesar imágenes en el campo 'imagenes'
      if (space.imagenes && space.imagenes.length > 0) {
        const updatedImagenes = [];
        let imagenesHasChanges = false;
        
        for (let i = 0; i < space.imagenes.length; i++) {
          const imagePath = space.imagenes[i];
          if (isLocalDevicePath(imagePath)) {
            // Si es una ruta local, convertirla a URL persistente
            const persistentUrl = await getSpaceImage(space.id, imagePath, i + 100); // Offset para diferenciar
            if (persistentUrl) {
              updatedImagenes.push(persistentUrl);
              imagenesHasChanges = true;
              console.error(`Imagen ${i} (imagenes) convertida a URL persistente para el espacio ${space.id}`);
            } else {
              updatedImagenes.push('https://via.placeholder.com/300x200?text=Imagen+no+disponible');
            }
          } else {
            updatedImagenes.push(imagePath);
          }
        }
        
        if (imagenesHasChanges) {
          updatedSpace.imagenes = updatedImagenes;
          hasChanges = true;
        }
      }

      return hasChanges ? updatedSpace : space;
    } catch (error) {
      console.error('Error al convertir imágenes a URLs persistentes:', error);
      return space;
    }
  };

  /**
   * Procesa todos los espacios para convertir imágenes locales a URLs persistentes
   */
  const processAllSpaces = async () => {
    if (!spaces || spaces.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const updatedSpaces = [];
      let hasChanges = false;

      // Procesar cada espacio
      for (let i = 0; i < spaces.length; i++) {
        const updatedSpace = await convertLocalImagesToUrls(spaces[i]);
        updatedSpaces.push(updatedSpace);
        
        // Verificar si hubo cambios
        if (updatedSpace !== spaces[i]) {
          hasChanges = true;
        }
      }

      // Actualizar el estado solo si hubo cambios
      if (hasChanges) {
        setProcessedSpaces(updatedSpaces);
      } else {
        setProcessedSpaces(spaces);
      }
    } catch (error) {
      console.error('Error al procesar todos los espacios:', error);
      setProcessedSpaces(spaces);
    } finally {
      setIsProcessing(false);
    }
  };

  // Procesar espacios cuando cambian
  useEffect(() => {
    if (initialSpaces && initialSpaces.length > 0) {
      setSpaces(initialSpaces);
    }
  }, [initialSpaces]);

  // Procesar espacios cuando se actualiza el estado
  useEffect(() => {
    if (spaces.length > 0) {
      processAllSpaces();
    }
  }, [spaces]);

  return {
    processedSpaces,
    isProcessing,
    convertLocalImagesToUrls,
    processAllSpaces
  };
};

export default useImagePersistence;
