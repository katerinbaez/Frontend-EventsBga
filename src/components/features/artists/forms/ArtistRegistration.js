import React, { useState } from 'react';
import {
  View,
  Text, 
  TextInput,
  TouchableOpacity, 
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import styles from '../../../../styles/ArtistsRegistrationsStyles';

const ArtistRegistration = ({ navigation }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombreArtistico: '',
    biografia: '',
    habilidades: '',
    contacto: {
      email: user?.email || '',
      telefono: '',
      ciudad: ''
    }
  });

  const handleSubmit = async () => {
    try {
      if (!formData.nombreArtistico.trim()) {
        Alert.alert('Error', 'El nombre artístico es requerido');
        return;
      }

      const response = await axios.post(`${BACKEND_URL}/api/artists/register`, {
        ...formData,
        userId: user.id,
        habilidades: formData.habilidades.split(',').map(h => h.trim())
      });

      if (response.data.success) {
        Alert.alert(
          '¡Registro Exitoso!',
          'Tu perfil de artista ha sido creado. Ahora puedes comenzar a personalizarlo.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('DashboardArtist')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error al registrar artista:', error);
      Alert.alert('Error', 'No se pudo completar el registro. Por favor, intenta de nuevo.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
      <View style={styles.statusBarSpace} />
      <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Registro de Artista</Text>
        <Text style={styles.subtitle}>
          Complete la información básica para crear tu perfil de artista
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre Artístico *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombreArtistico}
            onChangeText={(text) => setFormData({ ...formData, nombreArtistico: text })}
            placeholder="Tu nombre artístico"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Biografía</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.biografia}
            onChangeText={(text) => setFormData({ ...formData, biografia: text })}
            placeholder="Cuéntanos sobre ti..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Habilidades</Text>
          <TextInput
            style={styles.input}
            value={formData.habilidades}
            onChangeText={(text) => setFormData({ ...formData, habilidades: text })}
            placeholder="Ej: Música, Pintura, Danza (separadas por comas)"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={formData.contacto.telefono}
            onChangeText={(text) => 
              setFormData({
                ...formData,
                contacto: { ...formData.contacto, telefono: text }
              })
            }
            placeholder="Tu número de teléfono"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ciudad</Text>
          <TextInput
            style={styles.input}
            value={formData.contacto.ciudad}
            onChangeText={(text) => 
              setFormData({
                ...formData,
                contacto: { ...formData.contacto, ciudad: text }
              })
            }
            placeholder="Tu ciudad"
            placeholderTextColor="#666"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Crear Perfil</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArtistRegistration;
