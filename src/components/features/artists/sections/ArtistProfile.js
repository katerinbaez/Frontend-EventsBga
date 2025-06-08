/**
 * Este archivo maneja el perfil del artista
 * - Vista
 * - Edición
 * - Imágenes
 */

import React, { useState, useEffect } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../../../../styles/ArtistProfileStyles';
import ProfileViewMode from '../views/ProfileViewMode';
import ProfileEditMode from '../views/ProfileEditMode';
import { loadArtistProfile, saveArtistProfile, uploadProfileImage } from '../services/ProfileService';
import CloudinaryService from '../../../../features/spaces/services/CloudinaryService';

const ArtistProfile = ({ route, navigation }) => {
  const { user } = useAuth();
  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);
  
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

  useEffect(() => {
    fetchArtistProfile();
  }, []);
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
        
        setUploadingImage(true);
        
        try {
          console.warn('Subiendo imagen de perfil a Cloudinary...');
          const cloudinaryUrl = await CloudinaryService.uploadImage(imageUri);
          console.warn('Imagen subida a Cloudinary:', cloudinaryUrl);
          
          if (cloudinaryUrl && CloudinaryService.isCloudinaryUrl(cloudinaryUrl)) {
            setProfile(prev => ({
              ...prev,
              tempImageUri: cloudinaryUrl
            }));
            setImageSelected(true);
            Alert.alert('Éxito', 'Imagen de perfil subida correctamente');
          } else {
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
  
  const handleSave = async () => {
    try {
      let imageUrl = null;
      if (imageSelected && profile.tempImageUri) {
        if (CloudinaryService.isCloudinaryUrl(profile.tempImageUri)) {
          console.warn('La imagen ya está en Cloudinary, usando URL existente');
          imageUrl = profile.tempImageUri;
        } else {
          console.warn('Subiendo imagen de perfil a Cloudinary antes de guardar...');
          setUploadingImage(true);
          
          try {
            const cloudinaryUrl = await CloudinaryService.uploadImage(profile.tempImageUri);
            
            if (cloudinaryUrl && CloudinaryService.isCloudinaryUrl(cloudinaryUrl)) {
              console.warn('Imagen subida exitosamente a Cloudinary:', cloudinaryUrl);
              imageUrl = cloudinaryUrl;
              
              setProfile(prev => ({
                ...prev,
                tempImageUri: cloudinaryUrl
              }));
            } else {
              console.warn('Subida a Cloudinary falló, intentando método tradicional...');
              const imageResult = await uploadProfileImage(user.id, profile.tempImageUri);
              
              if (imageResult.success) {
                imageUrl = imageResult.imageUrl;
                
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
      
      const method = profile.id ? 'put' : 'post';
      const dataToSend = {
        ...profile,
        fotoPerfil: imageUrl || profile.fotoPerfil
      };
      
      if (dataToSend.tempImageUri) {
        delete dataToSend.tempImageUri;
      }
      
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
