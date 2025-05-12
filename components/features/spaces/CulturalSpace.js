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
  Modal,
  Platform,
  ActivityIndicator,
  Linking,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';

const CulturalSpace = ({ navigation, route }) => {
  const { user } = useAuth();
  
  // Función para asegurar que disponibilidad siempre tenga un formato válido
  const getDisponibilidadValida = (disponibilidadData) => {
    // Si disponibilidad no existe o no es un array, devolver estructura predeterminada
    if (!disponibilidadData || !Array.isArray(disponibilidadData) || disponibilidadData.length === 0) {
      return [
        { dayOfWeek: 'Lunes', isOpen: true, timeSlots: [{ start: '08:00', end: '18:00' }] },
        { dayOfWeek: 'Martes', isOpen: true, timeSlots: [{ start: '08:00', end: '18:00' }] },
        { dayOfWeek: 'Miércoles', isOpen: true, timeSlots: [{ start: '08:00', end: '18:00' }] },
        { dayOfWeek: 'Jueves', isOpen: true, timeSlots: [{ start: '08:00', end: '18:00' }] },
        { dayOfWeek: 'Viernes', isOpen: true, timeSlots: [{ start: '08:00', end: '18:00' }] },
        { dayOfWeek: 'Sábado', isOpen: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
        { dayOfWeek: 'Domingo', isOpen: true, timeSlots: [{ start: '09:00', end: '17:00' }] }
      ];
    }
    
    // Si disponibilidad existe pero algún día no tiene timeSlots válidos, corregirlo
    return disponibilidadData.map(dia => {
      if (!dia.timeSlots || !Array.isArray(dia.timeSlots) || dia.timeSlots.length === 0) {
        return {
          ...dia,
          timeSlots: [{ start: '09:00', end: '18:00' }]
        };
      }
      return dia;
    });
  };
  
  const [space, setSpace] = useState({
    nombre: '',
    direccion: '',
    capacidad: '',
    descripcion: '',
    instalaciones: [],
    disponibilidad: getDisponibilidadValida([]),
    images: [],
    managerId: user?.id || '',
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

  const [isEditing, setIsEditing] = useState(!route.params?.spaceId);
  const [timePickerVisible, setTimePickerVisible] = useState({
    visible: false,
    dayIndex: null,
    slotIndex: null,
    isStartTime: true
  });
  const [nuevaInstalacion, setNuevaInstalacion] = useState('');

  // Generar horas disponibles para seleccionar (de 00:00 a 24:00 en incrementos de 30 min)
  const availableTimes = [];
  for (let hour = 0; hour <= 24; hour++) {
    const hourFormatted = hour < 10 ? `0${hour}` : `${hour}`;
    availableTimes.push(`${hourFormatted}:00`);
    // Sólo agregar minutos :30 si no es la hora 24
    if (hour < 24) {
      availableTimes.push(`${hourFormatted}:30`);
    }
  }

  useEffect(() => {
    if (route.params?.spaceId) {
      loadSpaceData();
    } else if (route.params?.userId) {
      // Si se proporciona userId, cargar datos del perfil del gestor
      loadManagerProfile();
    }
  }, [route.params?.spaceId, route.params?.userId]);

  const loadManagerProfile = async () => {
    try {
      // Intentar cargar datos del perfil del gestor
      const response = await axios.get(`${BACKEND_URL}/api/managers/profile/${route.params.userId}`);
      
      if (response.data.success && response.data.manager) {
        // Cargar los datos del perfil del gestor en el estado del espacio
        const managerData = response.data.manager;
        console.log('Datos del gestor cargados:', managerData); // Log para depuración
        
        // Asegurarse de que las instalaciones y las imágenes sean arrays
        const instalaciones = Array.isArray(managerData.instalaciones) ? 
          managerData.instalaciones : 
          (managerData.instalaciones ? [managerData.instalaciones] : []);
          
        const imagenes = Array.isArray(managerData.imagenes) ? 
          managerData.imagenes : 
          (managerData.imagenes ? [managerData.imagenes] : []);
        
        // También intentar cargar datos del espacio cultural si existe
        try {
          // Intentar obtener todos los espacios y filtrar por managerId
          const allSpacesResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
          
          if (allSpacesResponse.data.spaces && allSpacesResponse.data.spaces.length > 0) {
            // Buscar un espacio con el mismo managerId
            const existingSpace = allSpacesResponse.data.spaces.find(
              space => space.managerId === route.params.userId
            );
            
            if (existingSpace) {
              console.log('Espacio cultural encontrado en la tabla CulturalSpaces:', existingSpace);
              
              // Combinar datos del perfil del gestor y del espacio cultural
              // Asegurarse de que los datos de contacto se carguen correctamente
              const contactoData = managerData.contacto || { email: '', telefono: '' };
              
              console.log('Datos de contacto del gestor:', contactoData);
              
              setSpace(prevState => ({
                ...prevState,
                nombre: existingSpace.nombre || managerData.nombreEspacio || prevState.nombre,
                direccion: existingSpace.direccion || managerData.direccion || prevState.direccion,
                capacidad: existingSpace.capacidad || managerData.capacidad || prevState.capacidad,
                descripcion: existingSpace.descripcion || managerData.descripcion || prevState.descripcion,
                instalaciones: existingSpace.instalaciones || instalaciones,
                images: existingSpace.images || imagenes,
                disponibilidad: getDisponibilidadValida(existingSpace.disponibilidad || managerData.disponibilidad || prevState.disponibilidad),
                managerId: route.params.userId,
                // Priorizar datos de contacto del gestor sobre los del espacio cultural
                contacto: {
                  email: contactoData.email || (existingSpace.contacto ? existingSpace.contacto.email : ''),
                  telefono: contactoData.telefono || (existingSpace.contacto ? existingSpace.contacto.telefono : '')
                },
                // Cargar redes sociales del espacio cultural
                redesSociales: existingSpace.redesSociales || prevState.redesSociales
              }));
              
              // Activar modo visualización inicialmente
              setIsEditing(false);
              return;
            }
          }
        } catch (spaceError) {
          console.error('Error al buscar espacio cultural:', spaceError);
          // Continuar con los datos del perfil del gestor si no se puede cargar el espacio cultural
        }
        
        // Si no se encuentra un espacio cultural, usar solo los datos del perfil del gestor
        // Asegurarse de que los datos de contacto se carguen correctamente
        const contactoData = managerData.contacto || { email: '', telefono: '' };
        
        console.log('Datos de contacto del gestor (sin espacio cultural):', contactoData);
        
        setSpace(prevState => ({
          ...prevState,
          nombre: managerData.nombreEspacio || prevState.nombre,
          direccion: managerData.direccion || prevState.direccion,
          capacidad: managerData.capacidad || prevState.capacidad,
          descripcion: managerData.descripcion || prevState.descripcion,
          instalaciones: instalaciones,
          images: imagenes,
          disponibilidad: getDisponibilidadValida(managerData.disponibilidad || prevState.disponibilidad),
          managerId: route.params.userId,
          // Cargar datos de contacto del gestor
          contacto: {
            email: contactoData.email || '',
            telefono: contactoData.telefono || ''
          },
          // Mantener las redes sociales vacías si no existen
          redesSociales: prevState.redesSociales
        }));
        
        // Activar modo edición para permitir actualizar los datos
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error al cargar perfil del gestor:', error);
      Alert.alert('Error', 'No se pudo cargar la información del perfil del gestor');
    }
  };

  const loadSpaceData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces/${route.params.spaceId}`);
      setSpace(prevState => ({ ...prevState, ...response.data, disponibilidad: getDisponibilidadValida(response.data.disponibilidad) }));
    } catch (error) {
      console.error('Error al cargar espacio cultural:', error);
      Alert.alert('Error', 'No se pudo cargar la información del espacio cultural');
    }
  };

  const handleSave = async () => {
    try {
      let response;
      
      if (route.params?.spaceId) {
        // Actualizar espacio existente
        response = await axios.put(`${BACKEND_URL}/api/cultural-spaces/${route.params.spaceId}`, space);
      } else if (route.params?.userId) {
        // Actualizar perfil del gestor con los datos del espacio
        const managerProfileData = {
          nombreEspacio: space.nombre,
          direccion: space.direccion,
          capacidad: space.capacidad,
          descripcion: space.descripcion,
          instalaciones: space.instalaciones,
          imagenes: space.images,
          disponibilidad: space.disponibilidad, // Incluir la disponibilidad en la actualización
          horarios: space.disponibilidad, // Guardar también en la columna horarios de Managers
          contacto: {
            email: space.contacto?.email || '',
            telefono: space.contacto?.telefono || ''
          } // Asegurar que los datos de contacto tengan la estructura correcta
        };
        
        console.log('Guardando datos del gestor:', managerProfileData); // Log para depuración
        
        // Guardar en el perfil del gestor
        response = await axios.put(`${BACKEND_URL}/api/managers/profile/${route.params.userId}`, managerProfileData);
        
        // También guardar en la tabla CulturalSpaces
        try {
          // Crear directamente un nuevo espacio cultural con el managerId correcto
          const spaceData = {
            nombre: space.nombre,
            direccion: space.direccion,
            capacidad: space.capacidad,
            descripcion: space.descripcion,
            instalaciones: space.instalaciones,
            disponibilidad: space.disponibilidad,
            images: space.images,
            managerId: route.params.userId, // Asegurar que el managerId se envíe correctamente
            // Asegurar que los datos de contacto tengan la estructura correcta
            contacto: {
              email: space.contacto?.email || '',
              telefono: space.contacto?.telefono || ''
            },
            // Asegurar que las redes sociales tengan la estructura correcta
            redesSociales: {
              facebook: space.redesSociales?.facebook || '',
              instagram: space.redesSociales?.instagram || '',
              twitter: space.redesSociales?.twitter || ''
            }
          };
          
          console.log('Datos a guardar en CulturalSpaces:', spaceData);
          
          // Intentar crear un nuevo espacio cultural
          try {
            await axios.post(`${BACKEND_URL}/api/cultural-spaces`, spaceData);
            console.log('Espacio cultural creado en la tabla CulturalSpaces');
          } catch (createError) {
            // Si falla la creación, podría ser porque ya existe uno para este gestor
            // Intentar obtener todos los espacios y filtrar por managerId
            console.log('Error al crear, intentando actualizar espacio existente...');
            const allSpacesResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
            
            if (allSpacesResponse.data.spaces && allSpacesResponse.data.spaces.length > 0) {
              // Buscar un espacio con el mismo managerId
              const existingSpace = allSpacesResponse.data.spaces.find(
                space => space.managerId === route.params.userId
              );
              
              if (existingSpace) {
                // Si existe, actualizar
                await axios.put(`${BACKEND_URL}/api/cultural-spaces/${existingSpace.id}`, spaceData);
                console.log('Espacio cultural actualizado en la tabla CulturalSpaces');
              } else {
                // Si no se encuentra, reportar el error original
                throw createError;
              }
            } else {
              // Si no hay espacios, reportar el error original
              throw createError;
            }
          }
        } catch (spaceError) {
          console.error('Error al guardar en la tabla CulturalSpaces:', spaceError);
          // No interrumpir el flujo principal si falla esta parte
        }
      } else {
        // Crear nuevo espacio
        response = await axios.post(`${BACKEND_URL}/api/cultural-spaces`, space);
        
        // También actualizar el campo horarios en la tabla Managers si hay un managerId
        if (space.managerId) {
          try {
            // Verificar si existe un perfil de gestor para este managerId
            const managerResponse = await axios.get(`${BACKEND_URL}/api/managers/profile/${space.managerId}`);
            
            if (managerResponse.data.success && managerResponse.data.manager) {
              // Actualizar solo el campo horarios en el perfil del gestor
              await axios.put(`${BACKEND_URL}/api/managers/profile/${space.managerId}`, {
                horarios: space.disponibilidad
              });
              console.log('Campo horarios actualizado en la tabla Managers');
            }
          } catch (managerError) {
            console.error('Error al actualizar horarios en el perfil del gestor:', managerError);
            // No interrumpir el flujo principal si falla esta parte
          }
        }
      }

      if (response.data.success) {
        // Guardar los datos actualizados en el estado local para que se mantengan en el formulario
        const updatedData = { ...space };
        setSpace(updatedData);
        
        // Mostrar mensaje de éxito
        Alert.alert('Éxito', 'Información guardada correctamente');
        
        // Cambiar al modo visualización pero mantener los datos
        setIsEditing(false);
        
        // Solo navegar hacia atrás si es un nuevo espacio y no estamos editando un perfil existente
        if (!route.params?.spaceId && !route.params?.userId) {
          navigation.goBack();
        }
      } else {
        Alert.alert('Error', 'No se pudo guardar la información');
      }
    } catch (error) {
      console.error('Error al guardar espacio cultural:', error);
      Alert.alert('Error', `Error al guardar: ${error.message || 'Verifica la conexión al servidor'}`);
    }
  };

  // Función simplificada para manejar imágenes
  const processImageForPersistence = (imageUri) => {
    // Simplemente devolver la URI original
    return imageUri;
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: false, // No necesitamos base64 para esta implementación
      });

      if (!result.canceled) {
        // Procesar cada imagen para hacerla persistente
        const newImages = result.assets.map(asset => {
          // Registrar la imagen seleccionada para depuración
          console.log('Imagen seleccionada:', asset.uri);
          return processImageForPersistence(asset.uri);
        });
        
        console.log('Imágenes procesadas para persistencia:', newImages);
        
        setSpace(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error);
    }
  };

  // Determinar el título según el contexto
  const getHeaderTitle = () => {
    if (route.params?.userId) {
      return 'Mi Espacio Cultural';
    } else if (route.params?.spaceId) {
      return 'Detalles del Espacio';
    } else {
      return 'Nuevo Espacio Cultural';
    }
  };

  const renderViewMode = () => (
    <ScrollView style={styles.contentContainer}>
      <View style={styles.infoHeader}>
        <Text style={styles.title}>{space.nombre}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="create-outline" size={24} color="#4A90E2" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <View>
        <ScrollView 
          horizontal 
          style={styles.imageGallery}
          showsHorizontalScrollIndicator={false}
        >
          {space.images.map((image, index) => (
            <Image
              key={index}
              source={{ 
                uri: image,
                cache: 'force-cache'
              }}
              style={styles.spaceImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      </View>

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
        {space.disponibilidad.map((dia, index) => (
          <View key={index} style={styles.scheduleItem}>
            <Text style={styles.dayText}>{dia.dayOfWeek}</Text>
            {dia.isOpen ? (
              <View>
                {dia.timeSlots.map((slot, slotIndex) => (
                  <Text key={slotIndex} style={styles.timeText}>
                    {slot.start} - {slot.end}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={[styles.timeText, { color: '#FF3A5E' }]}>Cerrado</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos de Contacto</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={24} color="#FF3A5E" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>
                {space.contacto && space.contacto.email ? space.contacto.email : 'No especificado'}
              </Text>
            </View>
          </View>
          
          <View style={styles.contactDivider} />
          
          <View style={styles.contactRow}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={24} color="#FF3A5E" />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Teléfono</Text>
              <Text style={styles.contactValue}>
                {space.contacto && space.contacto.telefono ? space.contacto.telefono : 'No especificado'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Redes Sociales</Text>
        <View style={styles.socialCardContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.socialScrollContainer}>
            {space.redesSociales && space.redesSociales.facebook ? (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL(space.redesSociales.facebook)}
              >
                <Ionicons name="logo-facebook" size={28} color="#3b5998" />
              </TouchableOpacity>
            ) : null}
            
            {space.redesSociales && space.redesSociales.instagram ? (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL(space.redesSociales.instagram)}
              >
                <Ionicons name="logo-instagram" size={28} color="#C13584" />
              </TouchableOpacity>
            ) : null}
            
            {space.redesSociales && space.redesSociales.twitter ? (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL(space.redesSociales.twitter)}
              >
                <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
              </TouchableOpacity>
            ) : null}
          </ScrollView>
          
          {(!space.redesSociales || 
            (!space.redesSociales.facebook && 
             !space.redesSociales.instagram && 
             !space.redesSociales.twitter)) && (
            <Text style={styles.noSocialText}>No hay redes sociales especificadas</Text>
          )}
        </View>
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

      {/* Sección de Datos de Contacto */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Datos de Contacto</Text>
        <View style={styles.contactContainer}>
          <View style={styles.contactField}>
            <Text style={styles.contactLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={space.contacto?.email || ''}
              onChangeText={(text) => setSpace(prev => ({ 
                ...prev, 
                contacto: { ...prev.contacto, email: text } 
              }))}
              placeholder="Correo electrónico"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.contactField}>
            <Text style={styles.contactLabel}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={space.contacto?.telefono || ''}
              onChangeText={(text) => setSpace(prev => ({ 
                ...prev, 
                contacto: { ...prev.contacto, telefono: text } 
              }))}
              placeholder="Número de teléfono"
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>

      {/* Sección de Redes Sociales (no obligatorias) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Redes Sociales (Opcional)</Text>
        <View style={styles.socialContainer}>
          <View style={styles.socialField}>
            <Text style={styles.socialLabel}>Facebook</Text>
            <TextInput
              style={styles.input}
              value={space.redesSociales?.facebook || ''}
              onChangeText={(text) => setSpace(prev => ({ 
                ...prev, 
                redesSociales: { ...prev.redesSociales, facebook: text } 
              }))}
              placeholder="URL de Facebook"
            />
          </View>
          
          <View style={styles.socialField}>
            <Text style={styles.socialLabel}>Instagram</Text>
            <TextInput
              style={styles.input}
              value={space.redesSociales?.instagram || ''}
              onChangeText={(text) => setSpace(prev => ({ 
                ...prev, 
                redesSociales: { ...prev.redesSociales, instagram: text } 
              }))}
              placeholder="URL de Instagram (https://instagram.com/...)"
            />
          </View>
          
          <View style={styles.socialField}>
            <Text style={styles.socialLabel}>Twitter</Text>
            <TextInput
              style={styles.input}
              value={space.redesSociales?.twitter || ''}
              onChangeText={(text) => setSpace(prev => ({ 
                ...prev, 
                redesSociales: { ...prev.redesSociales, twitter: text } 
              }))}
              placeholder="URL de Twitter (https://twitter.com/...)"
            />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Instalaciones</Text>
        <View style={styles.facilitiesInputContainer}>
          <TextInput
            style={styles.facilitiesInput}
            value={nuevaInstalacion}
            onChangeText={setNuevaInstalacion}
            placeholder="Ejemplo: Escenario"
          />
          <TouchableOpacity 
            style={styles.addFacilityButton}
            onPress={() => {
              if (nuevaInstalacion.trim() !== '') {
                setSpace(prev => ({
                  ...prev,
                  instalaciones: [...prev.instalaciones, nuevaInstalacion.trim()]
                }));
                setNuevaInstalacion('');
              }
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.facilitiesTagsContainer}>
          {Array.isArray(space.instalaciones) && space.instalaciones.map((instalacion, index) => (
            <View key={index} style={styles.facilityTagEditable}>
              <Text style={styles.facilityText}>{instalacion}</Text>
              <TouchableOpacity
                onPress={() => {
                  const nuevasInstalaciones = [...space.instalaciones];
                  nuevasInstalaciones.splice(index, 1);
                  setSpace(prev => ({ ...prev, instalaciones: nuevasInstalaciones }));
                }}
              >
                <Ionicons name="close-circle" size={20} color="#FF3A5E" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
              <Image 
                source={{ 
                  uri: image,
                  cache: 'force-cache'
                }} 
                style={styles.previewImage} 
                resizeMode="cover"
              />
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
            <View style={styles.dayContainer}>
              <Text style={styles.dayText}>{horario.dayOfWeek}</Text>
              <TouchableOpacity
                style={[styles.toggleButton, horario.isOpen ? styles.toggleActive : styles.toggleInactive]}
                onPress={() => {
                  const newDisponibilidad = [...space.disponibilidad];
                  newDisponibilidad[index] = { 
                    ...horario, 
                    isOpen: !horario.isOpen 
                  };
                  setSpace(prev => ({ ...prev, disponibilidad: newDisponibilidad }));
                }}
              >
                <Text style={styles.toggleText}>{horario.isOpen ? 'Abierto' : 'Cerrado'}</Text>
              </TouchableOpacity>
            </View>
            
            {horario.isOpen && horario.timeSlots.map((slot, slotIndex) => (
              <View key={slotIndex} style={styles.timeSlotContainer}>
                <View style={styles.timeInputContainer}>
                  <TouchableOpacity
                    style={styles.timePickerButton}
                    onPress={() => {
                      setTimePickerVisible({
                        visible: true,
                        dayIndex: index,
                        slotIndex: slotIndex,
                        isStartTime: true
                      });
                    }}
                  >
                    <Text style={styles.timePickerButtonText}>{slot.start}</Text>
                    <Ionicons name="time" size={20} color="#FF3A5E" />
                  </TouchableOpacity>
                  <Text style={styles.timeText}>-</Text>
                  <TouchableOpacity
                    style={styles.timePickerButton}
                    onPress={() => {
                      setTimePickerVisible({
                        visible: true,
                        dayIndex: index,
                        slotIndex: slotIndex,
                        isStartTime: false
                      });
                    }}
                  >
                    <Text style={styles.timePickerButtonText}>{slot.end}</Text>
                    <Ionicons name="time" size={20} color="#FF3A5E" />
                  </TouchableOpacity>
                </View>
                
                {slotIndex === horario.timeSlots.length - 1 && (
                  <TouchableOpacity
                    style={styles.addSlotButton}
                    onPress={() => {
                      const newDisponibilidad = [...space.disponibilidad];
                      newDisponibilidad[index].timeSlots.push({ start: '09:00', end: '18:00' });
                      setSpace(prev => ({ ...prev, disponibilidad: newDisponibilidad }));
                    }}
                  >
                    <Ionicons name="add-circle" size={24} color="#FF3A5E" />
                  </TouchableOpacity>
                )}
                
                {horario.timeSlots.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeSlotButton}
                    onPress={() => {
                      const newDisponibilidad = [...space.disponibilidad];
                      newDisponibilidad[index].timeSlots.splice(slotIndex, 1);
                      setSpace(prev => ({ ...prev, disponibilidad: newDisponibilidad }));
                    }}
                  >
                    <Ionicons name="remove-circle" size={24} color="#FF3A5E" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // Renderizar el componente principal
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
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

      {isEditing ? renderEditMode() : renderViewMode()}
      
      {/* Modal para seleccionar hora */}
      <Modal
        visible={timePickerVisible.visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTimePickerVisible({ ...timePickerVisible, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>
                Selecciona {timePickerVisible.isStartTime ? 'hora de inicio' : 'hora de cierre'}
              </Text>
              <TouchableOpacity
                onPress={() => setTimePickerVisible({ ...timePickerVisible, visible: false })}
              >
                <Ionicons name="close" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableTimes}
              keyExtractor={(item) => item}
              style={styles.timeList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.timeItem}
                  onPress={() => {
                    const { dayIndex, slotIndex, isStartTime } = timePickerVisible;
                    const newDisponibilidad = [...space.disponibilidad];
                    
                    if (isStartTime) {
                      newDisponibilidad[dayIndex].timeSlots[slotIndex].start = item;
                    } else {
                      newDisponibilidad[dayIndex].timeSlots[slotIndex].end = item;
                    }
                    
                    setSpace(prev => ({ ...prev, disponibilidad: newDisponibilidad }));
                    setTimePickerVisible({ ...timePickerVisible, visible: false });
                  }}
                >
                  <Text style={styles.timeItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
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
  facilityTagEditable: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityText: {
    color: '#4A90E2',
    fontSize: 14,
    marginRight: 5,
  },
  facilitiesInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  facilitiesInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginRight: 10,
  },
  addFacilityButton: {
    backgroundColor: '#FF3A5E',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilitiesTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
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
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  contactDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  socialCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  noSocialText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginTop: 8,
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
  contactContainer: {
    marginBottom: 10,
  },
  contactField: {
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  socialContainer: {
    marginBottom: 10,
  },
  socialField: {
    marginBottom: 12,
  },
  socialLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
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
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingRight: 10,
    width: '100%',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },
  toggleActive: {
    backgroundColor: '#FF3A5E',
  },
  toggleInactive: {
    backgroundColor: '#34495E',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 20,
  },
  addSlotButton: {
    marginLeft: 10,
    padding: 5,
  },
  removeSlotButton: {
    marginLeft: 10,
    padding: 5,
  },
  scheduleInputContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    width: 100,
    backgroundColor: '#F8F9FA',
  },
  timePickerButtonText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  timeList: {
    maxHeight: 300,
  },
  timeItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeItemText: {
    fontSize: 18,
    color: '#2C3E50',
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 10,
  },
});

export default CulturalSpace;
