import React, { useState, useEffect } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../../../../styles/ArtistProfileStyles';
import ProfileViewMode from '../views/ProfileViewMode';
import ProfileEditMode from '../views/ProfileEditMode';
import { loadArtistProfile, saveArtistProfile, uploadProfileImage } from '../services/ProfileService';
// Importación absoluta para evitar problemas de rutas relativas
import CloudinaryService from '../../../features/spaces/services/CloudinaryService';

const ArtistProfile = ({ route, navigation }) => {
  // Estado y contexto
  const { user } = useAuth();
  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);
  
  // Estado del perfil
  const [profile, setProfile] = useState({
    id: '',
    nombreArtistico: '',
    biografia: '',
    fotoPerfil: null,
    habilidades: [],
    portfolio: {
      trabajos: [],
      imagenes: []
    },
    redesSociales: {
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: ''
    },
    contacto: {
      email: user?.email || '',
      telefono: '',
      ciudad: ''
    },
    isProfileComplete: false
  });

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    fetchArtistProfile();
  }, []);

  // Función para cargar el perfil del artista
  const fetchArtistProfile = async () => {
    const result = await loadArtistProfile(user.id);
    if (result.success) {
      setProfile(prevProfile => ({
        ...prevProfile,
        ...result.data,
        contacto: {
          ...prevProfile.contacto,
          ...result.data.contacto
        }
      }));
    }
  };

  // Gestión de habilidades
  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setProfile(prev => ({
        ...prev,
        habilidades: [...prev.habilidades, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      habilidades: prev.habilidades.filter((_, i) => i !== index)
    }));
  };

  // Gestión de imágenes
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tu galería de imágenes');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Mostrar indicador de carga
        setUploadingImage(true);
        
        try {
          // Subir imagen a Cloudinary
          console.warn('Subiendo imagen de perfil a Cloudinary...');
          const cloudinaryUrl = await CloudinaryService.uploadImage(imageUri);
          console.warn('Imagen subida a Cloudinary:', cloudinaryUrl);
          
          // Verificar si la subida fue exitosa
          if (cloudinaryUrl && CloudinaryService.isCloudinaryUrl(cloudinaryUrl)) {
            // Actualizar el perfil con la URL de Cloudinary
            setProfile(prev => ({
              ...prev,
              tempImageUri: cloudinaryUrl
            }));
            setImageSelected(true);
            Alert.alert('Éxito', 'Imagen de perfil subida correctamente');
          } else {
            // Si falla, usar la URI local
            console.warn('La subida a Cloudinary falló, usando URI local');
            setProfile(prev => ({
              ...prev,
              tempImageUri: imageUri
            }));
            setImageSelected(true);
            Alert.alert('Advertencia', 'No se pudo subir la imagen a la nube. Se usará la imagen local temporalmente.');
          }
        } catch (cloudinaryError) {
          console.error('Error subiendo a Cloudinary:', cloudinaryError);
          // Si falla, usar la URI local
          setProfile(prev => ({
            ...prev,
            tempImageUri: imageUri
          }));
          setImageSelected(true);
          Alert.alert('Advertencia', 'No se pudo subir la imagen a la nube. Se usará la imagen local temporalmente.');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };
  
  // Guardar el perfil
  const handleSave = async () => {
    try {
      // Si hay una nueva imagen, verificar si ya está en Cloudinary o subirla
      let imageUrl = null;
      if (imageSelected && profile.tempImageUri) {
        // Verificar si la imagen ya es una URL de Cloudinary
        if (CloudinaryService.isCloudinaryUrl(profile.tempImageUri)) {
          console.warn('La imagen ya está en Cloudinary, usando URL existente');
          imageUrl = profile.tempImageUri;
        } else {
          // Si no es una URL de Cloudinary, SIEMPRE intentar subirla primero
          console.warn('Subiendo imagen de perfil a Cloudinary antes de guardar...');
          setUploadingImage(true);
          
          try {
            // Intentar subir a Cloudinary primero
            const cloudinaryUrl = await CloudinaryService.uploadImage(profile.tempImageUri);
            
            if (cloudinaryUrl && CloudinaryService.isCloudinaryUrl(cloudinaryUrl)) {
              console.warn('Imagen subida exitosamente a Cloudinary:', cloudinaryUrl);
              imageUrl = cloudinaryUrl;
              
              // Actualizar el perfil con la URL de Cloudinary para que quede registrado
              setProfile(prev => ({
                ...prev,
                tempImageUri: cloudinaryUrl
              }));
            } else {
              // Si falla Cloudinary, intentar con el método tradicional
              console.warn('Subida a Cloudinary falló, intentando método tradicional...');
              const imageResult = await uploadProfileImage(user.id, profile.tempImageUri);
              
              if (imageResult.success) {
                imageUrl = imageResult.imageUrl;
                // Actualizar el perfil con la URL del método tradicional
                setProfile(prev => ({
                  ...prev,
                  tempImageUri: imageResult.imageUrl
                }));
              } else {
                Alert.alert('Error', 'No se pudo subir la imagen a la nube. Intenta de nuevo.');
                setUploadingImage(false);
                return;
              }
            }
          } catch (uploadError) {
            console.error('Error al subir imagen:', uploadError);
            Alert.alert('Error', 'No se pudo subir la imagen a la nube. Intenta de nuevo.');
            setUploadingImage(false);
            return;
          } finally {
            setUploadingImage(false);
          }
        }
      }
      
      // Preparar los datos para enviar
      const method = profile.id ? 'put' : 'post';
      const dataToSend = {
        ...profile,
        fotoPerfil: imageUrl || profile.fotoPerfil
      };
      
      // Eliminar la URI temporal antes de enviar
      if (dataToSend.tempImageUri) {
        delete dataToSend.tempImageUri;
      }
      
      // Guardar el perfil
      const saveResult = await saveArtistProfile(user.id, dataToSend, method);
      
      if (saveResult.success) {
        setIsEditing(false);
        setImageSelected(false);
        fetchArtistProfile();
      } else {
        Alert.alert('Error', saveResult.error || 'Error al guardar el perfil');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al guardar el perfil - intente nuevamente');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isEditing ? (
        <ProfileEditMode 
          profile={profile}
          tempImageUri={profile.tempImageUri}
          newSkill={newSkill}
          onNewSkillChange={setNewSkill}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
          onProfileChange={setProfile}
          onSavePress={handleSave}
          pickImage={pickImage}
          uploadingImage={uploadingImage}
        />
      ) : (
        <ProfileViewMode 
          profile={profile}
          onEditPress={() => setIsEditing(true)}
        />
      )}
    </SafeAreaView>
  );
};

export default ArtistProfile;
