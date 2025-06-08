/**
 * Este archivo maneja el formulario de redes sociales
 * - Lista de redes
 * - Validación
 * - Manejo de cambios
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Dimensions, ScrollView } from 'react-native';
import { styles as profileStyles } from '../../../../styles/ArtistProfileStyles';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveStyleSheet from '../../../../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../../../../utils/ResponsiveUtils';

const VALID_NETWORKS = Object.freeze({
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  LINKEDIN: 'linkedin',
  WEBSITE: 'website'
});

const VALID_NETWORKS_ARRAY = Object.values(VALID_NETWORKS);

const SocialMediaForm = ({ socialMedia, onSocialMediaChange }) => {
  const [invalidUrls, setInvalidUrls] = useState(new Map());
  const isValidUrl = (url) => {
    if (!url || url.trim() === '') return true;
    
    try {
      if (!url.includes('.') || url.includes(' ')) {
        return false;
      }
      
      const urlToTest = url.match(/^https?:\/\//) ? url : `http://${url}`;
      new URL(urlToTest);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleTextChange = (network, text) => {
    if (!VALID_NETWORKS_ARRAY.includes(network)) {
      console.warn('Red social no válida:', network);
      return;
    }

    onSocialMediaChange(network, text);
    
    if (invalidUrls.get(network)) {
      setInvalidUrls(prev => {
        const newMap = new Map(prev);
        newMap.set(network, false);
        return newMap;
      });
    }
  };

  const isValidNetwork = (network) => {
    return typeof network === 'string' && VALID_NETWORKS_ARRAY.includes(network);
  };

  const handleEndEditing = (network) => {
    if (!VALID_NETWORKS_ARRAY.includes(network)) {
      console.warn('Red social no válida en handleEndEditing:', network);
      return;
    }
    
    const currentValue = socialMedia?.[network] || '';
    
    if (currentValue && !isValidUrl(currentValue)) {
      setInvalidUrls(prev => {
        const newMap = new Map(prev);
        newMap.set(network, true);
        return newMap;
      });
      
      onSocialMediaChange(network, '');
      
      setTimeout(() => {
        setInvalidUrls(prev => {
          const newMap = new Map(prev);
          newMap.set(network, false);
          return newMap;
        });
      }, 2000);
    }
  };

  const renderSocialNetworks = () => {
    return VALID_NETWORKS_ARRAY.filter(network => 
      socialMedia && typeof socialMedia === 'object' && 
      Object.prototype.hasOwnProperty.call(socialMedia, network)
    ).map(network => {
      const isInvalid = invalidUrls.get(network) === true;
      
      const networkValue = socialMedia && typeof socialMedia === 'object' && 
                          Object.prototype.hasOwnProperty.call(socialMedia, network) ? 
                          socialMedia[network] : '';
      
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
    }).filter(Boolean);
  };

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

const getIconForNetwork = (network) => {
  const iconMap = {
    [VALID_NETWORKS.FACEBOOK]: 'logo-facebook',
    [VALID_NETWORKS.INSTAGRAM]: 'logo-instagram',
    [VALID_NETWORKS.TWITTER]: 'logo-twitter',
    [VALID_NETWORKS.YOUTUBE]: 'logo-youtube',
    [VALID_NETWORKS.TIKTOK]: 'musical-notes-outline',
    [VALID_NETWORKS.LINKEDIN]: 'logo-linkedin',
    [VALID_NETWORKS.WEBSITE]: 'globe-outline'
  };
  
  return iconMap[network] || 'link-outline';
};

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
    borderColor: '#FF3A5E',
    backgroundColor: 'rgba(255, 58, 94, 0.05)',
  },
  errorText: {
    color: '#FFFFFF',
    backgroundColor: '#FF3A5E',
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
