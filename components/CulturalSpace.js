import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const CulturalSpace = ({ user, navigation, route }) => {
  const [space, setSpace] = useState({
    nombre: '',
    direccion: '',
    capacidad: '',
    descripcion: '',
    instalaciones: [],
    disponibilidad: [
      { dayOfWeek: 'Lunes', openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 'Martes', openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 'Miércoles', openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 'Jueves', openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 'Viernes', openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 'Sábado', openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 'Domingo', openTime: '09:00', closeTime: '17:00' }
    ],
    images: [],
    managerId: user.id
  });

  const [isEditing, setIsEditing] = useState(!route.params?.spaceId);

  useEffect(() => {
    if (route.params?.spaceId) {
      loadSpaceData();
    }
  }, [route.params?.spaceId]);

  const loadSpaceData = async () => {
    try {
      const response = await fetch(`/api/cultural-spaces/${route.params.spaceId}`);
      const data = await response.json();
      setSpace(data);
    } catch (error) {
      console.error('Error al cargar espacio cultural:', error);
    }
  };

  const handleSave = async () => {
    try {
      const method = route.params?.spaceId ? 'PUT' : 'POST';
      const url = route.params?.spaceId 
        ? `/api/cultural-spaces/${route.params.spaceId}`
        : '/api/cultural-spaces';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(space),
      });

      if (response.ok) {
        setIsEditing(false);
        if (!route.params?.spaceId) {
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error al guardar espacio cultural:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setSpace(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error);
    }
  };

  const renderViewMode = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{space.nombre}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="create-outline" size={24} color="#4A90E2" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        style={styles.imageGallery}
        showsHorizontalScrollIndicator={false}
      >
        {space.images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.spaceImage}
          />
        ))}
      </ScrollView>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dirección</Text>
        <Text style={styles.text}>{space.direccion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Capacidad</Text>
        <Text style={styles.text}>{space.capacidad} personas</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.text}>{space.descripcion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instalaciones</Text>
        <View style={styles.facilitiesContainer}>
          {space.instalaciones.map((instalacion, index) => (
            <View key={index} style={styles.facilityTag}>
              <Text style={styles.facilityText}>{instalacion}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horarios</Text>
        {space.disponibilidad.map((horario, index) => (
          <View key={index} style={styles.scheduleItem}>
            <Text style={styles.dayText}>{horario.dayOfWeek}</Text>
            <Text style={styles.timeText}>
              {horario.openTime} - {horario.closeTime}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderEditMode = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {route.params?.spaceId ? 'Editar Espacio' : 'Nuevo Espacio'}
        </Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Ionicons name="save-outline" size={24} color="#FFF" />
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={space.nombre}
          onChangeText={(text) => setSpace(prev => ({ ...prev, nombre: text }))}
          placeholder="Nombre del espacio cultural"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={space.direccion}
          onChangeText={(text) => setSpace(prev => ({ ...prev, direccion: text }))}
          placeholder="Dirección completa"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Capacidad</Text>
        <TextInput
          style={styles.input}
          value={String(space.capacidad)}
          onChangeText={(text) => setSpace(prev => ({ ...prev, capacidad: text }))}
          placeholder="Número de personas"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={space.descripcion}
          onChangeText={(text) => setSpace(prev => ({ ...prev, descripcion: text }))}
          placeholder="Describe el espacio cultural"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Instalaciones (separadas por coma)</Text>
        <TextInput
          style={styles.input}
          value={space.instalaciones.join(', ')}
          onChangeText={(text) => setSpace(prev => ({ 
            ...prev, 
            instalaciones: text.split(',').map(item => item.trim()).filter(Boolean)
          }))}
          placeholder="Ejemplo: Escenario, Luces, Sonido"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Imágenes</Text>
        <TouchableOpacity 
          style={styles.imagePickerButton}
          onPress={handleImagePick}
        >
          <Ionicons name="images-outline" size={24} color="#4A90E2" />
          <Text style={styles.imagePickerText}>Agregar imágenes</Text>
        </TouchableOpacity>
        <ScrollView 
          horizontal 
          style={styles.imagePreviewContainer}
          showsHorizontalScrollIndicator={false}
        >
          {space.images.map((image, index) => (
            <View key={index} style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => {
                  setSpace(prev => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index)
                  }));
                }}
              >
                <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Horarios</Text>
        {space.disponibilidad.map((horario, index) => (
          <View key={index} style={styles.scheduleInputContainer}>
            <Text style={styles.dayText}>{horario.dayOfWeek}</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                value={horario.openTime}
                onChangeText={(text) => {
                  const newDisponibilidad = [...space.disponibilidad];
                  newDisponibilidad[index] = { ...horario, openTime: text };
                  setSpace(prev => ({ ...prev, disponibilidad: newDisponibilidad }));
                }}
                placeholder="09:00"
              />
              <Text style={styles.timeText}>-</Text>
              <TextInput
                style={styles.timeInput}
                value={horario.closeTime}
                onChangeText={(text) => {
                  const newDisponibilidad = [...space.disponibilidad];
                  newDisponibilidad[index] = { ...horario, closeTime: text };
                  setSpace(prev => ({ ...prev, disponibilidad: newDisponibilidad }));
                }}
                placeholder="18:00"
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return isEditing ? renderEditMode() : renderViewMode();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  imageGallery: {
    height: 200,
    marginBottom: 20,
  },
  spaceImage: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityTag: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  facilityText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  editButtonText: {
    marginLeft: 5,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    marginLeft: 5,
    color: '#FFF',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4A90E2',
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4A90E2',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imagePreview: {
    marginRight: 10,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  scheduleInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 8,
    width: 80,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CulturalSpace;
