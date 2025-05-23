import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, LIGHT_TEXT } from '../../../../styles/ArtistProfileStyles';
import { BACKEND_URL } from '../../../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { getProfileImage } from '../services/ProfileService';

const ProfileImage = ({ profile, pickImage, isEditing, tempImageUri }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [timestamp, setTimestamp] = useState(Date.now());
  
  // Efecto para cargar la imagen desde el almacenamiento local o normalizar la URL
  useEffect(() => {
    const loadImage = async () => {
      // Si hay una imagen temporal (durante la edición), usarla directamente
      if (isEditing && tempImageUri) {
        setImageUrl(tempImageUri);
        setHasError(false);
        return;
      }
      
      if (!profile?.id || !profile?.fotoPerfil) {
        setImageUrl(null);
        return;
      }
      
      try {
        // Normalizar la URL directamente sin usar caché
        const url = normalizeImageUrl(profile.fotoPerfil);
        // Añadir un timestamp para evitar caché
        setImageUrl(`${url}?t=${timestamp}`);
        setHasError(false);
      } catch (error) {
        console.error('Error al cargar imagen de perfil:', error);
        setHasError(true);
      }
    };
    
    loadImage();
  }, [profile?.id, profile?.fotoPerfil, timestamp, isEditing, tempImageUri]);
  
  // Normalizar la URL de la imagen
  const normalizeImageUrl = (url) => {
    if (!url) return null;
    
    // Convertir a string por si acaso
    const urlStr = String(url);
    
    // Si ya tiene un esquema http o https, devolverla tal cual
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      return urlStr;
    }
    
    // Si comienza con una barra, es una ruta relativa al backend
    if (urlStr.startsWith('/')) {
      // Verificar si la ruta contiene 'uploads/profile-pics'
      if (urlStr.includes('uploads/profile-pics')) {
        return `${BACKEND_URL}${urlStr}`;
      } else {
        // Asegurarse de que la ruta sea correcta para las imágenes de perfil
        return `${BACKEND_URL}/uploads/profile-pics/${urlStr.split('/').pop()}`;
      }
    }
    
    // En cualquier otro caso, asumir que es una ruta relativa sin barra inicial
    return `${BACKEND_URL}/${urlStr}`;
  };
  
  // Manejar eventos de carga de imagen
  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0); // Resetear contador de intentos cuando la carga es exitosa
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    
    // Intentar recargar la imagen hasta 3 veces
    if (retryCount < 3) {
      console.warn(`Reintentando cargar imagen (intento ${retryCount + 1} de 3)`);
      setRetryCount(prevCount => prevCount + 1);
      setTimestamp(Date.now()); // Actualizar timestamp para forzar recarga
    } else {
      setHasError(true);
      console.error('Error al cargar la imagen de perfil después de 3 intentos');
    }
  };
  
  // Función para forzar la recarga de la imagen
  const forceReload = async () => {
    if (hasError && profile?.fotoPerfil) {
      setHasError(false);
      setRetryCount(0);
      setTimestamp(Date.now());
      setIsLoading(true);
      
      // Si la imagen es local, intentar convertirla a base64 y guardarla
      if (profile.fotoPerfil.startsWith('file://') && profile.id) {
        try {
          const base64 = await FileSystem.readAsStringAsync(profile.fotoPerfil, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          const base64Uri = `data:image/jpeg;base64,${base64}`;
          await AsyncStorage.setItem(`artist_image_${profile.id}`, base64Uri);
          
          console.error('Imagen guardada en caché durante recarga');
          setImageUrl(base64Uri);
          setHasError(false);
          return;
        } catch (error) {
          console.error('Error al convertir imagen local a base64:', error);
        }
      }
    }
  };
  
  // Determinar qué imagen mostrar
  const renderImage = () => {
    // Si la URL comienza con 'data:', es una imagen en base64
    const isBase64Image = imageUrl && imageUrl.startsWith('data:');
    
    if (isEditing && tempImageUri) {
      return (
        <Image 
          source={{ uri: tempImageUri }} 
          style={styles.profileImage} 
          resizeMode="cover"
          onLoadStart={() => setIsLoading(true)}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      );
    } else if (imageUrl && !hasError) {
      return (
        <>
          {isLoading && !isBase64Image && (
            <ActivityIndicator 
              size="large" 
              color="#FF3A5E" 
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: -20,
                marginTop: -20,
                zIndex: 1
              }}
            />
          )}
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.profileImage} 
            resizeMode="cover"
            onLoadStart={() => isBase64Image ? setIsLoading(false) : setIsLoading(true)}
            onLoad={handleImageLoad}
            onError={handleImageError}
            // Deshabilitar caché de imágenes (excepto para base64)
            cachePolicy={isBase64Image ? "default" : "reload"}
            // Forzar la recarga de la imagen
            key={`profile-image-${isBase64Image ? 'base64' : timestamp}`}
          />
        </>
      );
    } else if (hasError) {
      // Si hay error, mostrar un placeholder con opción para reintentar
      return (
        <TouchableOpacity 
          style={[styles.profileImage, styles.profileImagePlaceholder]}
          onPress={forceReload}
        >
          <Ionicons name="refresh" size={40} color="#FF3A5E" />
          <Text style={{color: '#CCCCCC', marginTop: 5, textAlign: 'center', fontSize: 10}}>Toca para reintentar</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
          <Ionicons name="person" size={60} color="#CCCCCC" />
        </View>
      );
    }
  };

  return (
    <View style={styles.profileImageContainer}>
      {renderImage()}
      
      {isEditing && (
        <TouchableOpacity 
          style={styles.changePhotoButton}
          onPress={pickImage}
        >
          <Ionicons name="camera" size={18} color={LIGHT_TEXT} />
          <Text style={styles.changePhotoText}>Cambiar foto</Text>
        </TouchableOpacity>
      )}
      
      {!isEditing && hasError && (
        <TouchableOpacity 
          style={[styles.changePhotoButton, {backgroundColor: '#FF3A5E'}]}
          onPress={forceReload}
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={[styles.changePhotoText, {color: '#FFFFFF'}]}>Recargar imagen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProfileImage;
