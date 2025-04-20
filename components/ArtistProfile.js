import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const ArtistProfile = ({ route, navigation }) => {
  const [newSkill, setNewSkill] = useState('');
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    id: '',
    nombreArtistico: '',
    biografia: '',
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

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Aquí cargarías el perfil del artista desde tu backend
    loadArtistProfile();
  }, []);

  const loadArtistProfile = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile/${user.id}`);
      if (response.data.success) {
        setProfile(prevProfile => ({
          ...prevProfile,
          ...response.data.artist,
          contacto: {
            ...prevProfile.contacto,
            ...response.data.artist.contacto
          }
        }));
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.log('Perfil no encontrado - creando nuevo perfil');
      }
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

  const handleSave = async () => {
    try {
      const method = profile.id ? 'put' : 'post';
      const response = await axios[method](`${BACKEND_URL}/api/artists/profile/${user.id}`, profile);

      if (response.data.success) {
        setIsEditing(false);
        loadArtistProfile();
      } else {
        console.log('Error al guardar el perfil - intente nuevamente');
      }
    } catch (error) {
      console.log('Error al guardar el perfil - intente nuevamente');
    }
  };

  const renderViewMode = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{profile.nombreArtistico || 'Mi Perfil Artístico'}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="create-outline" size={24} color="#4A90E2" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Biografía</Text>
        <Text style={styles.text}>{profile.biografia || 'Sin biografía'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habilidades</Text>
        <View style={styles.skillsContainer}>
          {profile.habilidades?.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Redes Sociales</Text>
        {Object.entries(profile.redesSociales).map(([red, url]) => (
          url && (
            <TouchableOpacity key={red} style={styles.socialLink}>
              <Ionicons name={`logo-${red}`} size={24} color="#4A90E2" />
              <Text style={styles.socialText}>{url}</Text>
            </TouchableOpacity>
          )
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contacto</Text>
        {Object.entries(profile.contacto).map(([tipo, valor]) => (
          valor && (
            <View key={tipo} style={styles.contactItem}>
              <Text style={styles.contactLabel}>{tipo}:</Text>
              <Text style={styles.contactValue}>{valor}</Text>
            </View>
          )
        ))}
      </View>
    </ScrollView>
  );

  const renderEditMode = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Editar Perfil</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Ionicons name="save-outline" size={24} color="#FFF" />
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre Artístico</Text>
        <TextInput
          style={styles.input}
          value={profile.nombreArtistico}
          onChangeText={(text) => setProfile(prev => ({ ...prev, nombreArtistico: text }))}
          placeholder="Tu nombre artístico"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Biografía</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profile.biografia}
          onChangeText={(text) => setProfile(prev => ({ ...prev, biografia: text }))}
          placeholder="Cuéntanos sobre ti"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Habilidades</Text>
        <View style={styles.skillsInputContainer}>
          <TextInput
            style={styles.skillInput}
            value={newSkill}
            onChangeText={setNewSkill}
            placeholder="Agregar habilidad"
            onSubmitEditing={handleAddSkill}
          />
          <TouchableOpacity 
            style={styles.addSkillButton}
            onPress={handleAddSkill}
          >
            <Ionicons name="add-circle" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal style={styles.skillsScrollView}>
          <View style={styles.skillsContainer}>
            {profile.habilidades.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill}</Text>
                <TouchableOpacity 
                  onPress={() => handleRemoveSkill(index)}
                  style={styles.removeSkillButton}
                >
                  <Ionicons name="close-circle" size={20} color="#FF4757" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Redes Sociales</Text>
        {Object.keys(profile.redesSociales).map((red) => (
          <TextInput
            key={red}
            style={styles.input}
            value={profile.redesSociales[red]}
            onChangeText={(text) => setProfile(prev => ({
              ...prev,
              redesSociales: { ...prev.redesSociales, [red]: text }
            }))}
            placeholder={`URL de ${red}`}
          />
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Información de Contacto</Text>
        {Object.keys(profile.contacto).map((tipo) => (
          <TextInput
            key={tipo}
            style={styles.input}
            value={profile.contacto[tipo]}
            onChangeText={(text) => setProfile(prev => ({
              ...prev,
              contacto: { ...prev.contacto, [tipo]: text }
            }))}
            placeholder={tipo === 'email' ? 'Correo electrónico' : tipo}
          />
        ))}
      </View>
    </ScrollView>
  );

  return isEditing ? renderEditMode() : renderViewMode();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  skillsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginRight: 10,
  },
  addSkillButton: {
    padding: 8,
  },
  skillsScrollView: {
    maxHeight: 100,
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipText: {
    color: '#4A90E2',
    fontSize: 14,
    marginRight: 5,
  },
  removeSkillButton: {
    padding: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  editButtonText: {
    marginLeft: 5,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    marginLeft: 5,
    color: '#FFF',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  socialText: {
    marginLeft: 10,
    color: '#4A90E2',
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contactLabel: {
    width: 80,
    fontSize: 16,
    color: '#7F8C8D',
  },
  contactValue: {
    flex: 1,
    fontSize: 16,
    color: '#34495E',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default ArtistProfile;
