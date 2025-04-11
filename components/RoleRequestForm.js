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
  const { user, isAuthenticated } = useAuth();
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

      // Validaciones
      if (!selectedRole || !formData.justificacion) {
        Alert.alert('Error', 'Por favor completa todos los campos requeridos');
        return;
      }

      if (selectedRole === 'Artista' && !formData.trayectoriaArtistica) {
        Alert.alert('Error', 'Por favor completa tu trayectoria artística');
        return;
      }

      if (selectedRole === 'Manager' && (!formData.experienciaGestion || !formData.espacioCultural)) {
        Alert.alert('Error', 'Por favor completa todos los campos de gestor');
        return;
      }

      if (!isAuthenticated || !user) {
        Alert.alert('Error', 'Debes estar autenticado para enviar una solicitud');
        return;
      }

      const userId = user?.sub || user?.id;
      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener el ID del usuario');
        return;
      }


      // Construir el objeto de solicitud
      const requestData = {
        userId,
        rolSolicitado: selectedRole,
        justificacion: formData.justificacion,
        trayectoriaArtistica: selectedRole === 'Artista' ? formData.trayectoriaArtistica : '',
        portafolio: [],  // Se actualizará después
        experienciaGestion: formData.experienciaGestion || '',
        espacioCultural: formData.espacioCultural || '',
        licencias: formData.licencias || '',
        documentos: formData.documentos.map(doc => doc.uri)
      };

      // Procesar URLs del portafolio
      const portafolioArray = portfolioUrls
        ? portfolioUrls.split(',').map(url => url.trim()).filter(url => url !== '')
        : [];

      // Actualizar el portafolio en requestData
      requestData.portafolio = selectedRole === 'Artista' ? portafolioArray : [];

      console.log('Datos a enviar:', {
        portafolioUrls: portfolioUrls,
        portafolioArray,
        requestData
      });

      // Configurar headers para asegurar que se envía como JSON
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(`${BACKEND_URL}/api/role-requests`, requestData, config);
      
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

    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      Alert.alert('Error', 'Hubo un problema al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderArtistFields = () => (
    <>
      <Text style={styles.fieldTitle}>Trayectoria Artística *</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        placeholder="Describe tu experiencia y trayectoria artística"
        value={formData.trayectoriaArtistica}
        onChangeText={(text) => setFormData(prev => ({ ...prev, trayectoriaArtistica: text }))}
      />

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
        style={styles.textArea}
        multiline
        numberOfLines={4}
        placeholder="Describe tu experiencia en gestión de espacios culturales"
        value={formData.experienciaGestion}
        onChangeText={(text) => setFormData(prev => ({ ...prev, experienciaGestion: text }))}
      />

      <Text style={styles.fieldTitle}>Espacio Cultural *</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={3}
        placeholder="Describe el espacio cultural que gestionas"
        value={formData.espacioCultural}
        onChangeText={(text) => setFormData(prev => ({ ...prev, espacioCultural: text }))}
      />

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
            selectedRole === 'Artista' && styles.roleButtonSelected
          ]}
          onPress={() => {
            setSelectedRole('Artista');
            setFormData(prev => ({ ...prev, rolSolicitado: 'Artista' }));
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
            selectedRole === 'GestorEventos' && styles.roleButtonSelected
          ]}
          onPress={() => {
            setSelectedRole('GestorEventos');
            setFormData(prev => ({ ...prev, rolSolicitado: 'GestorEventos' }));
          }}
        >
          <Ionicons name="business" size={24} color={selectedRole === 'GestorEventos' ? '#FFF' : '#4A90E2'} />
          <Text style={[
            styles.roleButtonText,
            selectedRole === 'GestorEventos' && styles.roleButtonTextSelected
          ]}>Gestor de Eventos</Text>
        </TouchableOpacity>
      </View>

      {selectedRole && (
        <>
          <Text style={styles.fieldTitle}>Justificación *</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Explica por qué solicitas este rol"
            value={formData.justificacion}
            onChangeText={(text) => setFormData(prev => ({ ...prev, justificacion: text }))}
          />

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
