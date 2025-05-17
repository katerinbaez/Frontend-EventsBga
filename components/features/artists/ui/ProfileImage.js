import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, LIGHT_TEXT } from '../../../../styles/ArtistProfileStyles';
import { BACKEND_URL } from '../../../../constants/config';

const ProfileImage = ({ profile, pickImage, isEditing, tempImageUri }) => {
  // Determinar qué imagen mostrar
  const renderImage = () => {
    if (isEditing && tempImageUri) {
      return (
        <Image 
          source={{ uri: tempImageUri }} 
          style={styles.profileImage} 
          resizeMode="cover"
        />
      );
    } else if (profile.fotoPerfil) {
      return (
        <Image 
          source={{ 
            uri: profile.fotoPerfil.startsWith('http') 
              ? profile.fotoPerfil 
              : `${BACKEND_URL}${profile.fotoPerfil}` 
          }} 
          style={styles.profileImage} 
          resizeMode="cover"
        />
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
    </View>
  );
};

export default ProfileImage;
