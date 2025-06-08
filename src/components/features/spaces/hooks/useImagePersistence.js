/**
 * Este archivo maneja la persistencia de imágenes
 * - Hooks
 * - Espacios
 * - Imágenes
 */

import { useState, useEffect } from 'react';
import { isLocalDevicePath, convertLocalPathToUrl, getSpaceImage } from '../services/ImageService';

const useImagePersistence = (initialSpaces) => {
  const [spaces, setSpaces] = useState(initialSpaces || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedSpaces, setProcessedSpaces] = useState([]);

  const convertLocalImagesToUrls = async (space) => {
    if (!space || !space.id || (!space.images && !space.imagenes)) return space;

    try {
      let hasChanges = false;
      let updatedSpace = { ...space };

      if (space.images && space.images.length > 0) {
        const updatedImages = [];
        
        for (let i = 0; i < space.images.length; i++) {
          const imagePath = space.images[i];
          if (isLocalDevicePath(imagePath)) {
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

      if (space.imagenes && space.imagenes.length > 0) {
        const updatedImagenes = [];
        let imagenesHasChanges = false;
        
        for (let i = 0; i < space.imagenes.length; i++) {
          const imagePath = space.imagenes[i];
          if (isLocalDevicePath(imagePath)) {
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

  const processAllSpaces = async () => {
    if (!spaces || spaces.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const updatedSpaces = [];
      let hasChanges = false;

      for (let i = 0; i < spaces.length; i++) {
        const updatedSpace = await convertLocalImagesToUrls(spaces[i]);
        updatedSpaces.push(updatedSpace);
        
        if (updatedSpace !== spaces[i]) {
          hasChanges = true;
        }
      }

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

  useEffect(() => {
    if (initialSpaces && initialSpaces.length > 0) {
      setSpaces(initialSpaces);
    }
  }, [initialSpaces]);

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
