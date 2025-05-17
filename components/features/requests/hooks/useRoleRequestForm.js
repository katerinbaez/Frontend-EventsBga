import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { BACKEND_URL } from '../../../../constants/config';

const useRoleRequestForm = () => {
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
  useEffect(() => {
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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, rolSolicitado: role }));
    setErrors(prev => ({ ...prev, role: false }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  return {
    selectedRole,
    formData,
    errors,
    isSubmitting,
    portfolioUrls,
    handleRoleSelect,
    handleInputChange,
    setPortfolioUrls,
    handleDocumentPick,
    handleRemoveDocument,
    handleSubmit,
    goBack
  };
};

export default useRoleRequestForm;