import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { styles } from '../../../../styles/ManagerRegistrationStyles';

const ManagerRegistration = ({ navigation }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombreEspacio: '',
    descripcion: '',
    direccion: '',
    tipoEspacio: '',
    capacidad: '',
    contacto: {
      email: user?.email || '',
      telefono: ''
    }
  });

  const handleSubmit = async () => {
    try {
      if (!formData.nombreEspacio.trim()) {
        Alert.alert('Error', 'El nombre del espacio cultural es requerido');
        return;
      }

      const response = await axios.post(`${BACKEND_URL}/api/managers/register`, {
        ...formData,
        userId: user.id,
        capacidad: parseInt(formData.capacidad) || 0,
        contacto: {
          ...formData.contacto,
          whatsapp: formData.contacto.telefono // Usar el mismo número para WhatsApp
        }
      });

      if (response.data.success) {
        Alert.alert(
          '¡Registro Exitoso!',
          'Tu perfil de gestor cultural ha sido creado. Ahora puedes comenzar a personalizarlo.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('DashboardManager')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error al registrar gestor:', error);
      Alert.alert('Error', 'No se pudo completar el registro. Por favor, intenta de nuevo.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registro de Espacio Cultural</Text>
        <Text style={styles.subtitle}>
          Complete la información básica para crear tu perfil de gestor cultural
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre del Espacio Cultural *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombreEspacio}
            onChangeText={(text) => setFormData({ ...formData, nombreEspacio: text })}
            placeholder="Nombre de tu espacio cultural"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.descripcion}
            onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            placeholder="Describe tu espacio cultural..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            value={formData.direccion}
            onChangeText={(text) => setFormData({ ...formData, direccion: text })}
            placeholder="Dirección del espacio"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de Espacio</Text>
          <TextInput
            style={styles.input}
            value={formData.tipoEspacio}
            onChangeText={(text) => setFormData({ ...formData, tipoEspacio: text })}
            placeholder="Ej: Teatro, Galería, Centro Cultural"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Capacidad</Text>
          <TextInput
            style={styles.input}
            value={formData.capacidad}
            onChangeText={(text) => setFormData({ ...formData, capacidad: text })}
            placeholder="Capacidad del espacio"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono/WhatsApp</Text>
          <TextInput
            style={styles.input}
            value={formData.contacto.telefono}
            onChangeText={(text) => 
              setFormData({
                ...formData,
                contacto: { ...formData.contacto, telefono: text }
              })
            }
            placeholder="Número de contacto"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Crear Perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


export default ManagerRegistration;
