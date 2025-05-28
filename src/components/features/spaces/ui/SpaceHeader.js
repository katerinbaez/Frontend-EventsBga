import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpaceStyles';

const SpaceHeader = ({ title, isEditing, onToggleEdit, onSave, onGoBack }) => {
  return (
    <View style={styles.header}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity onPress={onGoBack} style={[styles.backButton, {padding: 12}]}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, {color: '#FFFFFF', marginLeft: 15}]}>{title || 'Espacio Cultural'}</Text>
      </View>
      
      <TouchableOpacity 
        style={[isEditing ? styles.saveButton : styles.editButton, {padding: 12}]}
        onPress={isEditing ? onSave : onToggleEdit}
      >
        <Ionicons 
          name={isEditing ? "save-outline" : "create-outline"} 
          size={24} 
          color={isEditing ? "#FFF" : "#000000"} 
        />
      </TouchableOpacity>
    </View>
  );
};

export default SpaceHeader;
