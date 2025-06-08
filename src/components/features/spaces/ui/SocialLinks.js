/**
 * Este archivo maneja los enlaces sociales
 * - UI
 * - Espacios
 * - Redes Sociales
 * - Enlaces
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpaceStyles';

const SocialLinks = ({ redesSociales, isEditing, onInputChange }) => {
  const [errors, setErrors] = useState({
    facebook: '',
    instagram: '',
    twitter: ''
  });

  const isValidURL = (url) => {
    if (!url || url.trim() === '') return true; 
    
    try {
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      
      const hasDomain = url.includes('.') && url.split('.')[1]?.length > 0;
      return hasDomain;
    } catch (e) {
      return false;
    }
  };

  const handleSocialInputChange = (field, text) => {
    onInputChange(field, text);
    
    setErrors(prev => ({ ...prev, [field.split('.')[1]]: '' }));
  };
  
  const handleBlur = (field) => {
    let fieldName = '';
    if (field === 'redesSociales.facebook') fieldName = 'facebook';
    else if (field === 'redesSociales.instagram') fieldName = 'instagram';
    else if (field === 'redesSociales.twitter') fieldName = 'twitter';
    else return;
    
    let value = '';
    if (fieldName === 'facebook') value = redesSociales.facebook || '';
    else if (fieldName === 'instagram') value = redesSociales.instagram || '';
    else if (fieldName === 'twitter') value = redesSociales.twitter || '';
    
    if (value && value.trim() !== '' && !isValidURL(value)) {
      const newErrors = { ...errors };
      newErrors[fieldName] = 'URL inválida';
      setErrors(newErrors);
      
      setTimeout(() => {
        onInputChange(field, '');
        const clearedErrors = { ...errors };
        clearedErrors[fieldName] = '';
        setErrors(clearedErrors);
      }, 1500);
    }
  };

  const handleOpenLink = (url) => {
    if (url && url.trim() !== '') {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(formattedUrl);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Redes Sociales</Text>
      
      {isEditing ? (
        <View style={styles.socialContainer}>
          <View style={styles.socialField}>
            <Text style={styles.socialLabel}>Facebook</Text>
            <TextInput
              style={[styles.input, errors.facebook ? styles.inputError : null]}
              value={redesSociales.facebook}
              onChangeText={(text) => handleSocialInputChange('redesSociales.facebook', text)}
              onBlur={() => handleBlur('redesSociales.facebook')}
              placeholder="URL de Facebook"
              autoCapitalize="none"
              keyboardType="url"
            />
            {errors.facebook ? <Text style={styles.errorText}>{errors.facebook}</Text> : null}
          </View>
          
          <View style={styles.socialField}>
            <Text style={styles.socialLabel}>Instagram</Text>
            <TextInput
              style={[styles.input, errors.instagram ? styles.inputError : null]}
              value={redesSociales.instagram}
              onChangeText={(text) => handleSocialInputChange('redesSociales.instagram', text)}
              onBlur={() => handleBlur('redesSociales.instagram')}
              placeholder="URL de Instagram"
              autoCapitalize="none"
              keyboardType="url"
            />
            {errors.instagram ? <Text style={styles.errorText}>{errors.instagram}</Text> : null}
          </View>
          
          <View style={styles.socialField}>
            <Text style={styles.socialLabel}>Twitter</Text>
            <TextInput
              style={[styles.input, errors.twitter ? styles.inputError : null]}
              value={redesSociales.twitter}
              onChangeText={(text) => handleSocialInputChange('redesSociales.twitter', text)}
              onBlur={() => handleBlur('redesSociales.twitter')}
              placeholder="URL de Twitter"
              autoCapitalize="none"
              keyboardType="url"
            />
            {errors.twitter ? <Text style={styles.errorText}>{errors.twitter}</Text> : null}
          </View>
        </View>
      ) : (
        <View style={styles.socialCardContainer}>
          {(redesSociales.facebook || redesSociales.instagram || redesSociales.twitter) ? (
            <View style={styles.socialScrollContainer}>
              {redesSociales.facebook && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(redesSociales.facebook)}
                >
                  <Ionicons name="logo-facebook" size={30} color="#4267B2" />
                </TouchableOpacity>
              )}
              
              {redesSociales.instagram && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(redesSociales.instagram)}
                >
                  <Ionicons name="logo-instagram" size={30} color="#C13584" />
                </TouchableOpacity>
              )}
              
              {redesSociales.twitter && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(redesSociales.twitter)}
                >
                  <Ionicons name="logo-twitter" size={30} color="#1DA1F2" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.noSocialText}>No hay redes sociales registradas</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default SocialLinks;
