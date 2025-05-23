import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../../../styles/ArtistProfileStyles';
import { moderateScale, verticalScale } from '../../../../utils/ResponsiveUtils';

const ContactForm = ({ contact, onContactChange }) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Información de Contacto</Text>
      {Object.keys(contact).map((type) => (
        <TextInput
          key={type}
          style={styles.input}
          value={contact[type]}
          onChangeText={(text) => onContactChange(type, text)}
          placeholder={type === 'email' ? 'Correo electrónico' : type}
          placeholderTextColor="#666"
        />
      ))}
      {/* Espacio adicional al final de la información de contacto */}
      <View style={{ height: verticalScale(30) }} />
    </View>
  );
};

export default ContactForm;
