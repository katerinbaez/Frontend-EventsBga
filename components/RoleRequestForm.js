import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/RoleRequestForm.styles';

// URL del backend
const BACKEND_URL = "http://192.168.1.7:5000";

const RoleRequestForm = () => {
  const navigation = useNavigation();
  const goBack = () => {
    console.log('Intentando navegar al Dashboard...');
    if (navigation) {
      console.log('Navigation está disponible');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } else {
      console.log('Navigation no está disponible');
    }
  };
  const { user, token, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [portfolioUrls, setPortfolioUrls] = useState(''); // URLs separadas por comas

  // Estado inicial del formulario
  const initialFormState = {
    justificacion: '',
    trayectoriaArtistica: '',
    experienciaGestion: '',
    espacioCultural: '',
    licencias: '',
    documentos: []
  };

  const [formData, setFormData] = useState(initialFormState);

  const [errors, setErrors] = useState({
    role: false,
    justificacion: false,
    trayectoriaArtistica: false,
    experienciaGestion: false,
    espacioCultural: false
  });

  const validateFields = () => {
    const newErrors = {
      role: !selectedRole,
      justificacion: !formData.justificacion,
      trayectoriaArtistica: selectedRole === 'Artista' && !formData.trayectoriaArtistica,
      experienciaGestion: selectedRole === 'Manager' && !formData.experienciaGestion,
      espacioCultural: selectedRole === 'Manager' && !formData.espacioCultural
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Verificar que el usuario está autenticado al cargar el componente
  React.useEffect(() => {
    console.log('Estado de autenticación:', { isAuthenticated, user });
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Error',
        'Debes iniciar sesión para solicitar un rol',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [isAuthenticated, user]);


  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      console.log('DocumentPicker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const document = result.assets[0];
        const fileData = {
          name: document.name,
          uri: document.uri,
          type: document.mimeType || 'application/octet-stream'
        };

        console.log('Adding document:', fileData);

        setFormData(prev => ({
          ...prev,
          documentos: [...prev.documentos, fileData]
        }));
      }
    } catch (err) {
      console.log('Error al seleccionar documento:', err);
      Alert.alert('Error', 'No se pudo seleccionar el documento');
    }
  };

  const handleRemoveDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validar campos
      if (!validateFields()) {
        Alert.alert('Error', 'Por favor completa todos los campos requeridos');
        return;
      }

      const userId = user?.sub || user?.id;
      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener el ID del usuario');
        return;
      }

      // Procesar URLs del portafolio
      const portafolioArray = portfolioUrls
        ? portfolioUrls.split(',').map(url => url.trim()).filter(url => url !== '')
        : [];

      // Construir el objeto de solicitud
      const requestData = {
        userId: userId,
        rolSolicitado: selectedRole === 'Manager' ? 'GestorEventos' : 'Artista',
        justificacion: formData.justificacion.trim(),
        trayectoriaArtistica: selectedRole === 'Artista' ? formData.trayectoriaArtistica.trim() : '',
        portafolio: selectedRole === 'Artista' ? portafolioArray : [],
        experienciaGestion: selectedRole === 'Manager' ? formData.experienciaGestion.trim() : '',
        espacioCultural: selectedRole === 'Manager' ? formData.espacioCultural.trim() : '',
        licencias: formData.licencias ? formData.licencias.trim() : '',
        documentos: formData.documentos.map(doc => doc.uri)
      };

      console.log('Datos de la solicitud:', {
        selectedRole,
        userId,
        requestData
      });

      try {
        console.log('Intentando enviar solicitud al backend...');
        const response = await axios.post(`${BACKEND_URL}/api/role-requests`, requestData);
        console.log('Respuesta del backend:', response.data);
        
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        Alert.alert(
          'Solicitud Enviada',
          'Tu solicitud ha sido enviada correctamente',
          [{ 
            text: 'OK',
            onPress: () => navigation.replace('Dashboard')
          }]
        );

        // Limpiar el formulario
        setFormData(initialFormState);
        setSelectedRole('');
        setPortfolioUrls('');

      } catch (axiosError) {
        console.error('Error detallado:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            headers: axiosError.config?.headers,
            data: axiosError.config?.data
          }
        });
        throw axiosError;
      }

    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Hubo un problema al enviar la solicitud. Por favor, intenta de nuevo.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderArtistFields = () => (
    <>
      <Text style={styles.fieldTitle}>Trayectoria Artística *</Text>
      <TextInput
        style={[
          styles.textArea,
          errors.trayectoriaArtistica && styles.textAreaError
        ]}
        multiline
        numberOfLines={4}
        placeholder="Describe tu experiencia y trayectoria artística"
        placeholderTextColor="#666666"
        value={formData.trayectoriaArtistica}
        onChangeText={(text) => {
          setFormData(prev => ({ ...prev, trayectoriaArtistica: text }));
          setErrors(prev => ({ ...prev, trayectoriaArtistica: false }));
        }}
      />
      {errors.trayectoriaArtistica && (
        <Text style={styles.errorText}>Este campo es requerido</Text>
      )}

      <Text style={styles.fieldTitle}>Portafolio (URLs separadas por comas)</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={3}
        placeholder="Ingresa las URLs de tu portafolio separadas por comas (ejemplo: https://url1.com, https://url2.com)"
        value={portfolioUrls}
        onChangeText={setPortfolioUrls}
        autoCapitalize="none"
        keyboardType="url"
      />
    </>
  );

  const renderManagerFields = () => (
    <>
      <Text style={styles.fieldTitle}>Experiencia en Gestión Cultural *</Text>
      <TextInput
        style={[
          styles.textArea,
          errors.experienciaGestion && styles.textAreaError
        ]}
        multiline
        numberOfLines={4}
        placeholder="Describe tu experiencia en gestión de espacios culturales"
        placeholderTextColor="#666666"
        value={formData.experienciaGestion}
        onChangeText={(text) => {
          setFormData(prev => ({ ...prev, experienciaGestion: text }));
          setErrors(prev => ({ ...prev, experienciaGestion: false }));
        }}
      />
      {errors.experienciaGestion && (
        <Text style={styles.errorText}>Este campo es requerido</Text>
      )}

      <Text style={styles.fieldTitle}>Espacio Cultural *</Text>
      <TextInput
        style={[
          styles.textArea,
          errors.espacioCultural && styles.textAreaError
        ]}
        multiline
        numberOfLines={3}
        placeholder="Describe el espacio cultural que gestionas"
        placeholderTextColor="#666666"
        value={formData.espacioCultural}
        onChangeText={(text) => {
          setFormData(prev => ({ ...prev, espacioCultural: text }));
          setErrors(prev => ({ ...prev, espacioCultural: false }));
        }}
      />
      {errors.espacioCultural && (
        <Text style={styles.errorText}>Este campo es requerido</Text>
      )}

      <Text style={styles.fieldTitle}>Licencias y Permisos</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de licencias o permisos relevantes"
        value={formData.licencias}
        onChangeText={(text) => setFormData(prev => ({ ...prev, licencias: text }))}
      />
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Solicitud de Rol</Text>
      
      <View style={styles.roleSelector}>
        <TouchableOpacity 
          style={[
            styles.roleButton,
            selectedRole === 'Artista' && styles.roleButtonSelected,
            errors.role && styles.inputError
          ]}
          onPress={() => {
            setSelectedRole('Artista');
            setFormData(prev => ({ ...prev, rolSolicitado: 'Artista' }));
            setErrors(prev => ({ ...prev, role: false }));
          }}
        >
          <Ionicons name="brush" size={24} color={selectedRole === 'Artista' ? '#FFF' : '#4A90E2'} />
          <Text style={[
            styles.roleButtonText,
            selectedRole === 'Artista' && styles.roleButtonTextSelected
          ]}>Artista</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.roleButton,
            selectedRole === 'Manager' && styles.roleButtonSelected,
            errors.role && styles.inputError
          ]}
          onPress={() => {
            setSelectedRole('Manager');
            setFormData(prev => ({ ...prev, rolSolicitado: 'Manager' }));
            setErrors(prev => ({ ...prev, role: false }));
          }}
        >
          <Ionicons name="business" size={24} color={selectedRole === 'Manager' ? '#FFF' : '#4A90E2'} />
          <Text style={[
            styles.roleButtonText,
            selectedRole === 'Manager' && styles.roleButtonTextSelected
          ]}>Gestor Cultural</Text>
        </TouchableOpacity>
      </View>

      {errors.role && <Text style={styles.errorText}>Por favor selecciona un rol</Text>}

      {selectedRole && (
        <>
          <Text style={styles.fieldTitle}>Justificación *</Text>
          <TextInput
            style={[
              styles.textArea,
              errors.justificacion && styles.textAreaError
            ]}
            multiline
            numberOfLines={4}
            placeholder="Explica por qué solicitas este rol"
            placeholderTextColor="#666666"
            value={formData.justificacion}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, justificacion: text }));
              setErrors(prev => ({ ...prev, justificacion: false }));
            }}
          />
          {errors.justificacion && (
            <Text style={styles.errorText}>Este campo es requerido</Text>
          )}

          {selectedRole === 'Artista' ? renderArtistFields() : renderManagerFields()}

          <TouchableOpacity style={styles.documentButton} onPress={handleDocumentPick}>
            <Ionicons name="document-attach" size={24} color="#4A90E2" />
            <Text style={styles.documentButtonText}>Adjuntar Documentos de Respaldo</Text>
          </TouchableOpacity>

          {formData.documentos.length > 0 && (
            <View style={styles.documentsList}>
              <Text style={styles.documentsTitle}>Documentos adjuntos:</Text>
              {formData.documentos.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <Ionicons name="document" size={20} color="#4A90E2" />
                  <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                  <TouchableOpacity 
                    style={styles.removeDocumentButton}
                    onPress={() => handleRemoveDocument(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.submitButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={goBack}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default RoleRequestForm;
