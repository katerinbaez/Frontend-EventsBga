import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator, Platform } from 'react-native';
import { BACKEND_URL } from '../../constants/config';
import * as FileSystem from 'expo-file-system';

/**
 * Componente de imagen personalizado que maneja diferentes formatos de URL
 * y proporciona un indicador de carga y manejo de errores
 */
const CustomImage = ({ 
  source, 
  style, 
  resizeMode = 'cover',
  placeholderContent = null,
  forceRemote = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [processedSource, setProcessedSource] = useState(source);
  
  // Procesar la URL de la imagen
  useEffect(() => {
    const processImageSource = async () => {
      if (typeof source !== 'object' || !source.uri) {
        setProcessedSource(source);
        return;
      }
      
      let { uri } = source;
      
      // Manejar URLs de archivo local
      if (uri && uri.startsWith('file://')) {
        // Si estamos en un dispositivo móvil y la imagen es local
        if (Platform.OS !== 'web' && !forceRemote) {
          // Usar la URI local directamente
          setProcessedSource(source);
          return;
        } else {
          // Intentar convertir a base64 para compartir entre dispositivos
          try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            setProcessedSource({
              uri: `data:image/jpeg;base64,${base64}`
            });
            return;
          } catch (error) {
            console.error('Error al convertir imagen local a base64:', error);
            // Si falla, continuar con el procesamiento normal
          }
        }
      }
      
      // Si la URI no comienza con http, añadir el BACKEND_URL
      if (uri && !uri.startsWith('http') && !uri.startsWith('data:')) {
        // Si comienza con /, mantener tal cual, si no, añadir /
        uri = uri.startsWith('/') ? `${BACKEND_URL}${uri}` : `${BACKEND_URL}/${uri}`;
        setProcessedSource({ ...source, uri });
      } else {
        setProcessedSource(source);
      }
    };
    
    processImageSource();
  }, [source, forceRemote]);
  
  return (
    <View style={[style, { overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }]}>
      {isLoading && (
        <ActivityIndicator 
          size="small" 
          color="#FF3A5E" 
          style={{ position: 'absolute', zIndex: 1 }}
        />
      )}
      
      <Image 
        source={processedSource}
        style={{ width: '100%', height: '100%' }}
        resizeMode={resizeMode}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={(error) => {
          console.error('Error al cargar imagen:', error);
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </View>
  );
};

export default CustomImage;
