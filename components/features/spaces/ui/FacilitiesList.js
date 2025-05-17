import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpaceStyles';

const FacilitiesList = ({ 
  instalaciones, 
  isEditing, 
  nuevaInstalacion, 
  onInputChange, 
  onAddInstalacion, 
  onRemoveInstalacion 
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Instalaciones</Text>
      
      {isEditing ? (
        <>
          <View style={styles.facilitiesInputContainer}>
            <TextInput
              style={styles.facilitiesInput}
              value={nuevaInstalacion}
              onChangeText={onInputChange}
              placeholder="Añadir instalación"
            />
            <TouchableOpacity 
              style={styles.addFacilityButton}
              onPress={onAddInstalacion}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.facilitiesTagsContainer}>
            {instalaciones.map((item, index) => (
              <View key={index} style={styles.facilityTagEditable}>
                <Text style={styles.facilityText}>{item}</Text>
                <TouchableOpacity onPress={() => onRemoveInstalacion(index)}>
                  <Ionicons name="close-circle" size={20} color="#FF3A5E" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.facilitiesContainer}>
          {instalaciones && instalaciones.length > 0 ? (
            instalaciones.map((item, index) => (
              <View key={index} style={styles.facilityTag}>
                <Text style={styles.facilityText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.text}>No hay instalaciones registradas</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default FacilitiesList;
