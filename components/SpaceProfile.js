import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const SpaceProfile = ({ navigation, route }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [spaceData, setSpaceData] = useState({
    nombreEspacio: '',
    direccion: '',
    capacidad: '',
    descripcion: '',
    instalaciones: [],
    imagenes: [],
    contacto: {
      email: '',
      telefono: ''
    },
    redesSociales: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });
  const [newInstallation, setNewInstallation] = useState('');

  useEffect(() => {
    loadManagerProfile();
  }, []);

  const loadManagerProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${user.id}`);
      
      if (response.data.success && response.data.manager) {
        const managerData = response.data.manager;
        console.log('Datos del gestor cargados:', managerData);
        
        // Asegurarse de que contacto tenga la estructura correcta
        const contactoData = managerData.contacto || {};
        console.log('Datos de contacto originales:', contactoData);
        
        // Intentar también obtener datos del espacio cultural si existe
        try {
          const allSpacesResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
          
          if (allSpacesResponse.data.spaces && allSpacesResponse.data.spaces.length > 0) {
            // Buscar un espacio con el mismo managerId
            const existingSpace = allSpacesResponse.data.spaces.find(
              space => space.managerId === user.id
            );
            
            if (existingSpace) {
              console.log('Espacio cultural encontrado:', existingSpace);
              console.log('Datos de contacto del espacio:', existingSpace.contacto);
              console.log('Redes sociales del espacio:', existingSpace.redesSociales);
              
              // Extraer datos de contacto y redes sociales
              const contacto = {
                email: contactoData.email || (existingSpace.contacto && existingSpace.contacto.email) || '',
                telefono: contactoData.telefono || (existingSpace.contacto && existingSpace.contacto.telefono) || ''
              };
              
              const redesSociales = {
                facebook: (existingSpace.redesSociales && existingSpace.redesSociales.facebook) || '',
                instagram: (existingSpace.redesSociales && existingSpace.redesSociales.instagram) || '',
                twitter: (existingSpace.redesSociales && existingSpace.redesSociales.twitter) || ''
              };
              
              console.log('Datos de contacto procesados:', contacto);
              console.log('Redes sociales procesadas:', redesSociales);
              
              // Combinar datos del perfil del gestor y del espacio cultural
              const updatedData = {
                nombreEspacio: existingSpace.nombre || managerData.nombreEspacio || '',
                direccion: existingSpace.direccion || managerData.direccion || '',
                capacidad: existingSpace.capacidad || managerData.capacidad || '',
                descripcion: existingSpace.descripcion || managerData.descripcion || '',
                instalaciones: existingSpace.instalaciones || managerData.instalaciones || [],
                imagenes: existingSpace.images || managerData.imagenes || [],
                contacto: contacto,
                redesSociales: redesSociales
              };
              
              console.log('Datos actualizados completos:', updatedData);
              setSpaceData(updatedData);
              setIsLoading(false);
              return;
            }
          }
        } catch (spaceError) {
          console.error('Error al buscar espacio cultural:', spaceError);
          // Continuar con los datos del perfil del gestor
        }
        
        // Si no se encuentra un espacio cultural, usar solo los datos del perfil del gestor
        const contacto = {
          email: contactoData.email || '',
          telefono: contactoData.telefono || ''
        };
        
        const redesSociales = {
          facebook: '',
          instagram: '',
          twitter: ''
        };
        
        const updatedData = {
          nombreEspacio: managerData.nombreEspacio || '',
          direccion: managerData.direccion || '',
          capacidad: managerData.capacidad || '',
          descripcion: managerData.descripcion || '',
          instalaciones: managerData.instalaciones || [],
          imagenes: managerData.imagenes || [],
          contacto: contacto,
          redesSociales: redesSociales
        };
        
        console.log('Datos sin espacio cultural:', updatedData);
        setSpaceData(updatedData);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar perfil del gestor:', error);
      Alert.alert('Error', 'No se pudo cargar la información del perfil del gestor');
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validar campos obligatorios
      if (!spaceData.nombreEspacio.trim()) {
        Alert.alert('Error', 'El nombre del espacio es obligatorio');
        return;
      }

      setIsLoading(true);
      
      // Guardar en el perfil del gestor
      const managerProfileData = {
        ...spaceData,
        // Asegurar que los datos de contacto tengan la estructura correcta
        contacto: {
          email: spaceData.contacto?.email || '',
          telefono: spaceData.contacto?.telefono || ''
        }
      };
      
      const response = await axios.put(`${BACKEND_URL}/api/managers/profile/${user.id}`, managerProfileData);
      
      // También guardar en la tabla CulturalSpaces
      try {
        // Intentar obtener todos los espacios y filtrar por managerId
        const allSpacesResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
        
        if (allSpacesResponse.data.spaces && allSpacesResponse.data.spaces.length > 0) {
          // Buscar un espacio con el mismo managerId
          const existingSpace = allSpacesResponse.data.spaces.find(
            space => space.managerId === user.id
          );
          
          // Preparar datos para el espacio cultural
          const spaceData2 = {
            nombre: spaceData.nombreEspacio,
            direccion: spaceData.direccion,
            capacidad: spaceData.capacidad,
            descripcion: spaceData.descripcion,
            instalaciones: spaceData.instalaciones,
            images: spaceData.imagenes,
            managerId: user.id,
            // Asegurar que los datos de contacto tengan la estructura correcta
            contacto: {
              email: spaceData.contacto?.email || '',
              telefono: spaceData.contacto?.telefono || ''
            },
            // Asegurar que las redes sociales tengan la estructura correcta
            redesSociales: {
              facebook: spaceData.redesSociales?.facebook || '',
              instagram: spaceData.redesSociales?.instagram || '',
              twitter: spaceData.redesSociales?.twitter || ''
            }
          };
          
          if (existingSpace) {
            // Si existe, actualizar
            await axios.put(`${BACKEND_URL}/api/cultural-spaces/${existingSpace.id}`, spaceData2);
            console.log('Espacio cultural actualizado en la tabla CulturalSpaces');
          } else {
            // Si no existe, crear nuevo
            await axios.post(`${BACKEND_URL}/api/cultural-spaces`, spaceData2);
            console.log('Espacio cultural creado en la tabla CulturalSpaces');
          }
        } else {
          // Si no hay espacios, crear uno nuevo
          const spaceData2 = {
            nombre: spaceData.nombreEspacio,
            direccion: spaceData.direccion,
            capacidad: spaceData.capacidad,
            descripcion: spaceData.descripcion,
            instalaciones: spaceData.instalaciones,
            images: spaceData.imagenes,
            managerId: user.id,
            contacto: {
              email: spaceData.contacto?.email || '',
              telefono: spaceData.contacto?.telefono || ''
            },
            redesSociales: {
              facebook: spaceData.redesSociales?.facebook || '',
              instagram: spaceData.redesSociales?.instagram || '',
              twitter: spaceData.redesSociales?.twitter || ''
            }
          };
          
          await axios.post(`${BACKEND_URL}/api/cultural-spaces`, spaceData2);
          console.log('Espacio cultural creado en la tabla CulturalSpaces');
        }
      } catch (spaceError) {
        console.error('Error al guardar en la tabla CulturalSpaces:', spaceError);
        // Continuar con el flujo normal aunque haya fallado la actualización del espacio cultural
      }
      
      if (response.data.success) {
        Alert.alert('Éxito', 'Información del espacio actualizada correctamente');
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'No se pudo actualizar la información del espacio');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error al actualizar perfil del gestor:', error);
      Alert.alert('Error', `Error al guardar: ${error.message || 'Verifica la conexión al servidor'}`);
      setIsLoading(false);
    }
  };

  const handleAddInstallation = () => {
    if (newInstallation.trim()) {
      setSpaceData(prev => ({
        ...prev,
        instalaciones: [...prev.instalaciones, newInstallation.trim()]
      }));
      setNewInstallation('');
    }
  };

  const handleRemoveInstallation = (index) => {
    setSpaceData(prev => ({
      ...prev,
      instalaciones: prev.instalaciones.filter((_, i) => i !== index)
    }));
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar imágenes');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        const newImages = result.assets.map(asset => asset.uri);
        setSpaceData(prev => ({
          ...prev,
          imagenes: [...prev.imagenes, ...newImages]
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error);
    }
  };

  const handleRemoveImage = (index) => {
    setSpaceData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3A5E" />
        <Text style={styles.loadingText}>Cargando información del espacio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Espacio Cultural</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {!isEditing ? (
          // Modo visualización
          <View style={styles.profileContainer}>
            <Text style={styles.sectionTitle}>Información del Espacio</Text>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{spaceData.nombreEspacio || 'No especificado'}</Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>{spaceData.direccion || 'No especificada'}</Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Capacidad:</Text>
              <Text style={styles.infoValue}>{spaceData.capacidad ? `${spaceData.capacidad} personas` : 'No especificada'}</Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Descripción:</Text>
              <Text style={styles.infoValue}>{spaceData.descripcion || 'No hay descripción disponible'}</Text>
            </View>
            
            <Text style={styles.sectionTitle}>Instalaciones</Text>
            {spaceData.instalaciones && spaceData.instalaciones.length > 0 ? (
              <View style={styles.installationsContainer}>
                {spaceData.instalaciones.map((item, index) => (
                  <View key={index} style={styles.installationTag}>
                    <Text style={styles.installationText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No hay instalaciones registradas</Text>
            )}
            
            <Text style={styles.sectionTitle}>Datos de Contacto</Text>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>
                {spaceData.contacto && spaceData.contacto.email ? spaceData.contacto.email : 'No especificado'}
              </Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>
                {spaceData.contacto && spaceData.contacto.telefono ? spaceData.contacto.telefono : 'No especificado'}
              </Text>
            </View>
            
            <Text style={styles.sectionTitle}>Redes Sociales</Text>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Facebook:</Text>
              <Text style={styles.infoValue}>
                {spaceData.redesSociales && spaceData.redesSociales.facebook ? spaceData.redesSociales.facebook : 'No especificado'}
              </Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Instagram:</Text>
              <Text style={styles.infoValue}>
                {spaceData.redesSociales && spaceData.redesSociales.instagram ? spaceData.redesSociales.instagram : 'No especificado'}
              </Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Twitter:</Text>
              <Text style={styles.infoValue}>
                {spaceData.redesSociales && spaceData.redesSociales.twitter ? spaceData.redesSociales.twitter : 'No especificado'}
              </Text>
            </View>
            
            <Text style={styles.sectionTitle}>Imágenes</Text>
            {spaceData.imagenes && spaceData.imagenes.length > 0 ? (
              <ScrollView 
                horizontal 
                style={styles.imagesContainer}
                showsHorizontalScrollIndicator={false}
              >
                {spaceData.imagenes.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.spaceImage}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>No hay imágenes disponibles</Text>
            )}
          </View>
        ) : (
          // Modo edición
          <View style={styles.editContainer}>
            <Text style={styles.sectionTitle}>Información del Espacio</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Espacio *</Text>
              <TextInput
                style={styles.textInput}
                value={spaceData.nombreEspacio}
                onChangeText={(text) => setSpaceData(prev => ({ ...prev, nombreEspacio: text }))}
                placeholder="Nombre del espacio cultural"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dirección</Text>
              <TextInput
                style={styles.textInput}
                value={spaceData.direccion}
                onChangeText={(text) => setSpaceData(prev => ({ ...prev, direccion: text }))}
                placeholder="Dirección del espacio"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Capacidad (personas)</Text>
              <TextInput
                style={styles.textInput}
                value={spaceData.capacidad}
                onChangeText={(text) => setSpaceData(prev => ({ ...prev, capacidad: text }))}
                placeholder="Capacidad del espacio"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={spaceData.descripcion}
                onChangeText={(text) => setSpaceData(prev => ({ ...prev, descripcion: text }))}
                placeholder="Descripción del espacio cultural"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <Text style={styles.sectionTitle}>Datos de Contacto</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={spaceData.contacto?.email || ''}
                onChangeText={(text) => setSpaceData(prev => ({ 
                  ...prev, 
                  contacto: { ...prev.contacto, email: text } 
                }))}
                placeholder="Correo electrónico"
                placeholderTextColor="#999"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.textInput}
                value={spaceData.contacto?.telefono || ''}
                onChangeText={(text) => setSpaceData(prev => ({ 
                  ...prev, 
                  contacto: { ...prev.contacto, telefono: text } 
                }))}
                placeholder="Número de teléfono"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
            
            <Text style={styles.sectionTitle}>Redes Sociales (Opcional)</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Facebook</Text>
              <TextInput
                style={styles.textInput}
                value={spaceData.redesSociales?.facebook || ''}
                onChangeText={(text) => setSpaceData(prev => ({ 
                  ...prev, 
                  redesSociales: { ...prev.redesSociales, facebook: text } 
                }))}
                placeholder="URL de Facebook"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instagram</Text>
              <TextInput
                style={styles.textInput}
                value={spaceData.redesSociales?.instagram || ''}
                onChangeText={(text) => setSpaceData(prev => ({ 
                  ...prev, 
                  redesSociales: { ...prev.redesSociales, instagram: text } 
                }))}
                placeholder="URL de Instagram (https://instagram.com/...)"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Twitter</Text>
              <TextInput
                style={styles.textInput}
                value={spaceData.redesSociales?.twitter || ''}
                onChangeText={(text) => setSpaceData(prev => ({ 
                  ...prev, 
                  redesSociales: { ...prev.redesSociales, twitter: text } 
                }))}
                placeholder="URL de Twitter (https://twitter.com/...)"
                placeholderTextColor="#999"
              />
            </View>
            
            <Text style={styles.sectionTitle}>Instalaciones</Text>
            <View style={styles.inputGroup}>
              <View style={styles.installationInputContainer}>
                <TextInput
                  style={styles.installationInput}
                  value={newInstallation}
                  onChangeText={setNewInstallation}
                  placeholder="Añadir instalación"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddInstallation}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            
            {spaceData.instalaciones && spaceData.instalaciones.length > 0 && (
              <View style={styles.installationsContainer}>
                {spaceData.instalaciones.map((item, index) => (
                  <View key={index} style={styles.installationTag}>
                    <Text style={styles.installationText}>{item}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveInstallation(index)}
                    >
                      <Ionicons name="close-circle" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            <Text style={styles.sectionTitle}>Imágenes</Text>
            <TouchableOpacity 
              style={styles.imagePickerButton}
              onPress={handlePickImage}
            >
              <Ionicons name="image" size={24} color="#fff" />
              <Text style={styles.imagePickerText}>Seleccionar imágenes</Text>
            </TouchableOpacity>
            
            {spaceData.imagenes && spaceData.imagenes.length > 0 && (
              <View style={styles.imagesEditContainer}>
                {spaceData.imagenes.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: image }}
                      style={styles.thumbnailImage}
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="trash" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  loadManagerProfile(); // Recargar datos originales
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveFullButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FF3A5E',
    marginTop: 35,         // Margen superior para respetar la barra de estado
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginHorizontal: 5,   // Margen horizontal para que no ocupe todo el ancho
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  profileContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  infoSection: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  installationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  installationTag: {
    backgroundColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  installationText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  removeButton: {
    marginLeft: 5,
  },
  emptyText: {
    color: '#AAAAAA',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  spaceImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  editContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  installationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  installationInput: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  imagesEditContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  thumbnailImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 15,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveFullButton: {
    flex: 1,
    backgroundColor: '#FF3A5E',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SpaceProfile;
