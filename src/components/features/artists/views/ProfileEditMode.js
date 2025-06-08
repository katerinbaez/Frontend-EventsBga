/**
 * Este archivo maneja el modo de edición del perfil
 * - Formularios
 * - Imágenes
 * - Guardado
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, LIGHT_TEXT, ACCENT_COLOR } from '../../../../styles/ArtistProfileStyles';
import ProfileImage from '../ui/ProfileImage';
import ArtisticNameForm from '../forms/ArtisticNameForm';
import BiographyForm from '../forms/BiographyForm';
import SkillsForm from '../forms/SkillsForm';
import SocialMediaForm from '../forms/SocialMediaForm';
import ContactForm from '../forms/ContactForm';

const ProfileEditMode = ({ 
  profile, 
  tempImageUri,
  newSkill,
  onNewSkillChange,
  onAddSkill,
  onRemoveSkill,
  onProfileChange,
  onSavePress,
  pickImage,
  uploadingImage
}) => {
  const handleArtisticNameChange = (text) => {
    onProfileChange({ ...profile, nombreArtistico: text });
  };

  const handleBiographyChange = (text) => {
    onProfileChange({ ...profile, biografia: text });
  };

  const handleSocialMediaChange = (network, text) => {
    onProfileChange({
      ...profile,
      redesSociales: { ...profile.redesSociales, [network]: text }
    });
  };

  const handleContactChange = (type, text) => {
    onProfileChange({
      ...profile,
      contacto: { ...profile.contacto, [type]: text }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Editar Perfil</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={onSavePress}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <ActivityIndicator size="small" color={ACCENT_COLOR} />
          ) : (
            <>
              <Ionicons name="save-outline" size={24} color={ACCENT_COLOR} />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <ProfileImage 
        profile={profile} 
        isEditing={true} 
        tempImageUri={tempImageUri} 
        pickImage={pickImage} 
      />
      
      <ArtisticNameForm 
        artisticName={profile.nombreArtistico}
        onArtisticNameChange={handleArtisticNameChange}
      />
      
      <BiographyForm 
        biography={profile.biografia}
        onBiographyChange={handleBiographyChange}
      />
      
      <SkillsForm 
        skills={profile.habilidades}
        newSkill={newSkill}
        onNewSkillChange={onNewSkillChange}
        onAddSkill={onAddSkill}
        onRemoveSkill={onRemoveSkill}
      />
      
      <SocialMediaForm 
        socialMedia={profile.redesSociales}
        onSocialMediaChange={handleSocialMediaChange}
      />
      
      <ContactForm 
        contact={profile.contacto}
        onContactChange={handleContactChange}
      />
    </ScrollView>
  );
};

export default ProfileEditMode;
