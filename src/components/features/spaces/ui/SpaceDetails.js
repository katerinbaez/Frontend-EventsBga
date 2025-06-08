/**
 * Este archivo maneja los detalles del espacio
 * - UI
 * - Espacios
 * - Detalles
 * - Formulario
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpaceStyles';

const SpaceDetails = ({ space, isEditing, onInputChange }) => {
  return (
    <View style={styles.section}>
      {isEditing ? (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Espacio</Text>
            <TextInput
              style={styles.input}
              value={space.nombre}
              onChangeText={(text) => onInputChange('nombre', text)}
              placeholder="Nombre del espacio cultural"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={styles.input}
              value={space.direccion}
              onChangeText={(text) => onInputChange('direccion', text)}
              placeholder="Dirección del espacio"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capacidad</Text>
            <TextInput
              style={styles.input}
              value={space.capacidad}
              onChangeText={(text) => onInputChange('capacidad', text)}
              placeholder="Capacidad del espacio"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={space.descripcion}
              onChangeText={(text) => onInputChange('descripcion', text)}
              placeholder="Descripción del espacio cultural"
              multiline
              numberOfLines={4}
            />
          </View>
        </>
      ) : (
        <View style={styles.detailsContainer}>
          <Text style={[styles.sectionTitle, {marginBottom: 15, fontSize: 22}]}>{space.nombre || 'Espacio Cultural'}</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#FF3A5E" style={{marginRight: 8}} />
            <Text style={[styles.text, {fontWeight: '500'}]}>Dirección: {space.direccion || 'No disponible'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={20} color="#FF3A5E" style={{marginRight: 8}} />
            <Text style={[styles.text, {fontWeight: '500'}]}>Capacidad: {space.capacidad || 'No especificada'}</Text>
          </View>
          
          {space.descripcion && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.text, {marginTop: 10, lineHeight: 22}]}>{space.descripcion}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SpaceDetails;
