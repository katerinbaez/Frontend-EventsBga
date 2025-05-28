import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Dimensions, ScrollView } from 'react-native';
import { styles as profileStyles } from '../../../../styles/ArtistProfileStyles';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveStyleSheet from '../../../../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../../../../utils/ResponsiveUtils';

// Lista blanca de redes sociales válidas
const VALID_NETWORKS = Object.freeze({
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  LINKEDIN: 'linkedin',
  WEBSITE: 'website'
});

// Array de redes sociales válidas para iteración
const VALID_NETWORKS_ARRAY = Object.values(VALID_NETWORKS);

const SocialMediaForm = ({ socialMedia, onSocialMediaChange }) => {
  // Usar Map en lugar de objeto para evitar inyección de objetos
  const [invalidUrls, setInvalidUrls] = useState(new Map());

  // Función para validar URLs
  const isValidUrl = (url) => {
    if (!url || url.trim() === '') return true; // Permitir campo vacío
    
    try {
      // Verificación simple: debe contener al menos un punto y no tener espacios
      if (!url.includes('.') || url.includes(' ')) {
        return false;
      }
      
      // Agregar http:// si no tiene protocolo
      const urlToTest = url.match(/^https?:\/\//) ? url : `http://${url}`;
      new URL(urlToTest);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Manejar cambio de texto en los campos de redes sociales
  const handleTextChange = (network, text) => {
    // Validar que network sea una red social válida usando la lista blanca global
    if (!VALID_NETWORKS_ARRAY.includes(network)) {
      console.warn('Red social no válida:', network);
      return;
    }

    // Permitir la escritura sin validar, solo actualizar el valor
    onSocialMediaChange(network, text);
    
    // Si hay un error marcado, limpiarlo mientras el usuario escribe
    if (invalidUrls.get(network)) {
      setInvalidUrls(prev => {
        const newMap = new Map(prev);
        newMap.set(network, false);
        return newMap;
      });
    }
  };

  // Verificar si es una red social válida usando la lista blanca global
  const isValidNetwork = (network) => {
    return typeof network === 'string' && VALID_NETWORKS_ARRAY.includes(network);
  };

  // Manejar cuando el usuario termina de editar
  const handleEndEditing = (network) => {
    // Validar que network sea una red social válida usando la lista blanca global
    if (!VALID_NETWORKS_ARRAY.includes(network)) {
      console.warn('Red social no válida en handleEndEditing:', network);
      return;
    }
    
    // Obtener el valor actual del campo
    const currentValue = socialMedia?.[network] || '';
    
    // Si el valor no es válido, limpiarlo
    if (currentValue && !isValidUrl(currentValue)) {
      // Marcar como inválido
      setInvalidUrls(prev => {
        const newMap = new Map(prev);
        newMap.set(network, true);
        return newMap;
      });
      
      // Limpiar el campo
      onSocialMediaChange(network, '');
      
      // Mostrar un mensaje de error temporalmente
      setTimeout(() => {
        setInvalidUrls(prev => {
          const newMap = new Map(prev);
          newMap.set(network, false);
          return newMap;
        });
      }, 2000);
    }
  };

  // Filtrar las redes sociales válidas para renderizar
  const renderSocialNetworks = () => {
    // Usar la lista blanca global
    return VALID_NETWORKS_ARRAY.filter(network => 
      // Solo mostrar redes que existen en el objeto socialMedia
      socialMedia && typeof socialMedia === 'object' && 
      Object.prototype.hasOwnProperty.call(socialMedia, network)
    ).map(network => {
      // Acceder de forma segura usando Map para invalidUrls
      const isInvalid = invalidUrls.get(network) === true;
      
      // Acceder de forma segura a socialMedia
      const networkValue = socialMedia && typeof socialMedia === 'object' && 
                          Object.prototype.hasOwnProperty.call(socialMedia, network) ? 
                          socialMedia[network] : '';
      
      // Obtener el icono de forma segura
      const iconName = getIconForNetwork(network);
      
      return (
        <View key={network} style={styles.inputContainer}>
          <Ionicons 
            name={iconName} 
            size={moderateScale(20)} 
            color={isInvalid ? "#FF3A5E" : "#FFFFFF"} 
            style={styles.icon} 
          />
          <TextInput
            style={[
              profileStyles.input, 
              styles.socialInput,
              isInvalid && styles.invalidInput
            ]}
            value={networkValue}
            onChangeText={(text) => handleTextChange(network, text)}
            onEndEditing={() => handleEndEditing(network)}
            placeholder={`URL de ${network}`}
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="url"
          />
          {isInvalid && (
            <Text style={styles.errorText}>URL inválida - Ingrese una URL correcta</Text>
          )}
        </View>
      );
    }).filter(Boolean); // Filtrar elementos nulos
  };

  // Monitorear cambios en el tamaño de la pantalla
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  return (
    <View style={[profileStyles.inputGroup, styles.container]}>
      <Text style={styles.label}>Redes Sociales</Text>
      <Text style={styles.helperText}>Ingresa URLs completas (ej: https://facebook.com/miartista)</Text>
      
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderSocialNetworks()}
      </ScrollView>
    </View>
  );
};

// Función para obtener el icono correspondiente a cada red social
const getIconForNetwork = (network) => {
  // Usar un objeto para mapear redes sociales a iconos de forma segura
  const iconMap = {
    [VALID_NETWORKS.FACEBOOK]: 'logo-facebook',
    [VALID_NETWORKS.INSTAGRAM]: 'logo-instagram',
    [VALID_NETWORKS.TWITTER]: 'logo-twitter',
    [VALID_NETWORKS.YOUTUBE]: 'logo-youtube',
    [VALID_NETWORKS.TIKTOK]: 'musical-notes-outline',
    [VALID_NETWORKS.LINKEDIN]: 'logo-linkedin',
    [VALID_NETWORKS.WEBSITE]: 'globe-outline'
  };
  
  // Acceder de forma segura al mapa de iconos
  return iconMap[network] || 'link-outline';
};


// Utilizamos los estilos importados de ArtistProfileStyles.js y ResponsiveStyleSheet para los estilos locales
const styles = ResponsiveStyleSheet.create({
  container: profileStyles.inputGroup,
  label: profileStyles.label,
  helperText: {
    ...profileStyles.text,
    fontSize: moderateScale(12),
    marginBottom: verticalScale(12),
    color: '#CCCCCC',
  },
  inputContainer: {
    flexDirection: 'column',
    marginBottom: verticalScale(12),
    position: 'relative',
  },
  icon: {
    marginRight: horizontalScale(10),
    alignSelf: 'flex-start',
    marginTop: verticalScale(12),
  },
  socialInput: {
    flex: 1,
  },
  invalidInput: {
    borderColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    backgroundColor: 'rgba(255, 58, 94, 0.05)',
  },
  errorText: {
    color: '#FFFFFF',
    backgroundColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
    fontSize: moderateScale(13),
    fontWeight: '500',
    marginTop: verticalScale(8),
    padding: moderateScale(8),
    borderRadius: moderateScale(4),
    width: '100%',
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: verticalScale(20),
  }
});

export default SocialMediaForm;
