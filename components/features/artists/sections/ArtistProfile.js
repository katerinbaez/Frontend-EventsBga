import React, { useState, useEffect } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../../../../styles/ArtistProfileStyles';
import ProfileViewMode from '../views/ProfileViewMode';
import ProfileEditMode from '../views/ProfileEditMode';
import { loadArtistProfile, saveArtistProfile, uploadProfileImage } from '../services/ProfileService';

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
        setProfile(prev => ({
          ...prev,
          tempImageUri: result.assets[0].uri
        }));
        setImageSelected(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };
  
  // Guardar el perfil
  const handleSave = async () => {
    try {
      // Si hay una nueva imagen, subirla primero
      let imageUrl = null;
      if (imageSelected && profile.tempImageUri) {
        setUploadingImage(true);
        const imageResult = await uploadProfileImage(user.id, profile.tempImageUri);
        setUploadingImage(false);
        
        if (imageResult.success) {
          imageUrl = imageResult.imageUrl;
        } else {
          Alert.alert('Error', imageResult.error || 'No se pudo subir la imagen');
          return;
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
