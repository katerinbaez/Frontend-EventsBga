import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, LIGHT_TEXT } from '../../../../styles/ArtistProfileStyles';
import ProfileImage from '../ui/ProfileImage';
import BiographySection from '../sections/BiographySection';
import SkillsSection from '../sections/SkillsSection';
import SocialMediaSection from '../sections/SocialMediaSection';
import ContactSection from '../sections/ContactSection';

const ProfileViewMode = ({ profile, onEditPress }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{profile.nombreArtistico || 'Mi Perfil Artístico'}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={onEditPress}
        >
          <Ionicons name="create-outline" size={24} color={LIGHT_TEXT} />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
      
      <ProfileImage profile={profile} isEditing={false} />
      
      <BiographySection biography={profile.biografia} />
      
      <SkillsSection skills={profile.habilidades} />
      
      <SocialMediaSection socialMedia={profile.redesSociales} />
      
      <ContactSection contact={profile.contacto} />
    </ScrollView>
  );
};

export default ProfileViewMode;
