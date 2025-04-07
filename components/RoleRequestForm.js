import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

const RoleRequestForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    rolSolicitado: '',
    justificacion: '',
    documentos: [],
    // Campos específicos para artistas
    trayectoriaArtistica: '',
    portafolio: '',
    redesSociales: '',
    // Campos específicos para gestores
    experienciaGestion: '',
    espacioCultural: '',
    licencias: '',
  });

  const [selectedRole, setSelectedRole] = useState(null);

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setFormData(prev => ({
          ...prev,
          documentos: [...prev.documentos, result]
        }));
      }
    } catch (err) {
      console.log('Error al seleccionar documento:', err);
    }
  };

  const renderArtistFields = () => (
    <>
      <Text style={styles.fieldTitle}>Trayectoria Artística</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        placeholder="Describe tu experiencia y trayectoria artística"
        value={formData.trayectoriaArtistica}
        onChangeText={(text) => setFormData(prev => ({ ...prev, trayectoriaArtistica: text }))}
      />

      <Text style={styles.fieldTitle}>Portafolio</Text>
      <TextInput
        style={styles.input}
        placeholder="Enlaces a tu trabajo artístico (separados por comas)"
        value={formData.portafolio}
        onChangeText={(text) => setFormData(prev => ({ ...prev, portafolio: text }))}
      />

      <Text style={styles.fieldTitle}>Redes Sociales Profesionales</Text>
      <TextInput
        style={styles.input}
        placeholder="Enlaces a tus redes sociales artísticas"
        value={formData.redesSociales}
        onChangeText={(text) => setFormData(prev => ({ ...prev, redesSociales: text }))}
      />
    </>
  );

  const renderManagerFields = () => (
    <>
      <Text style={styles.fieldTitle}>Experiencia en Gestión Cultural</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        placeholder="Describe tu experiencia en gestión de espacios culturales"
        value={formData.experienciaGestion}
        onChangeText={(text) => setFormData(prev => ({ ...prev, experienciaGestion: text }))}
      />

      <Text style={styles.fieldTitle}>Espacio Cultural</Text>
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
          <Text style={styles.fieldTitle}>Justificación</Text>
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

          {formData.documentos.map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <Ionicons name="document" size={20} color="#4A90E2" />
              <Text style={styles.documentName}>{doc.name}</Text>
            </View>
          ))}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]}
              onPress={() => onSubmit(formData)}
            >
              <Text style={styles.buttonText}>Enviar Solicitud</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4A90E2',
    width: '45%',
  },
  roleButtonSelected: {
    backgroundColor: '#4A90E2',
  },
  roleButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  roleButtonTextSelected: {
    color: '#FFF',
  },
  fieldTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4A90E2',
    borderRadius: 10,
    marginTop: 20,
  },
  documentButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4A90E2',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    marginTop: 10,
  },
  documentName: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2C3E50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RoleRequestForm;
