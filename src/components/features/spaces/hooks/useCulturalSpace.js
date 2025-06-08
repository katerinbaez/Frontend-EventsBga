/**
 * Este archivo maneja el hook de espacio cultural
 * - Hooks
 * - Espacios
 * - Gestor
 */

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../../context/AuthContext';
import CulturalSpaceService from '../services/CulturalSpaceService';
import ManagerProfileService from '../services/ManagerProfileService';
import CloudinaryService from '../services/CloudinaryService';

const useCulturalSpace = (navigation, route) => {
  const { user } = useAuth();
  
  const getDisponibilidadValida = (disponibilidadData) => {
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
  const [loading, setLoading] = useState(false);

  const availableTimes = [];
  for (let hour = 0; hour <= 24; hour++) {
    const hourFormatted = hour < 10 ? `0${hour}` : `${hour}`;
    availableTimes.push(`${hourFormatted}:00`);
    if (hour < 24) {
      availableTimes.push(`${hourFormatted}:30`);
    }
  }

  useEffect(() => {
    if (route.params?.spaceId) {
      loadSpaceData();
    } else if (route.params?.userId) {
      loadManagerProfile();
    }
  }, [route.params?.spaceId, route.params?.userId]);

  const loadManagerProfile = async () => {
    try {
      setLoading(true);
      const managerData = await ManagerProfileService.getManagerProfile(route.params.userId);
      
      if (managerData) {
        console.log('Datos del gestor cargados:', managerData); 
        
        const instalaciones = Array.isArray(managerData.instalaciones) ? 
          managerData.instalaciones : 
          (managerData.instalaciones ? [managerData.instalaciones] : []);
          
        const imagenes = Array.isArray(managerData.imagenes) ? 
          managerData.imagenes : 
          (managerData.imagenes ? [managerData.imagenes] : []);
        
        try {
          const existingSpace = await CulturalSpaceService.findSpaceByManagerId(route.params.userId);
          
          if (existingSpace) {
            console.log('Espacio cultural encontrado en la tabla CulturalSpaces:', existingSpace);
            
            const contactoData = managerData.contacto || { email: '', telefono: '' };
            
            console.log('Datos de contacto del gestor:', contactoData);
            
            setSpace(prevState => ({
              ...prevState,
              nombre: existingSpace.nombre || managerData.nombreEspacio || prevState.nombre,
              direccion: existingSpace.direccion || managerData.direccion || prevState.direccion,
              capacidad: String(existingSpace.capacidad || managerData.capacidad || prevState.capacidad || ''),
              descripcion: existingSpace.descripcion || managerData.descripcion || prevState.descripcion,
              instalaciones: existingSpace.instalaciones || instalaciones,
              images: existingSpace.images || imagenes,
              disponibilidad: getDisponibilidadValida(existingSpace.disponibilidad || managerData.disponibilidad || prevState.disponibilidad),
              managerId: route.params.userId,
              contacto: {
                email: contactoData.email || (existingSpace.contacto ? existingSpace.contacto.email : ''),
                telefono: contactoData.telefono || (existingSpace.contacto ? existingSpace.contacto.telefono : '')
              },
              redesSociales: existingSpace.redesSociales || prevState.redesSociales
            }));
            
            setIsEditing(false);
            return;
          }
        } catch (spaceError) {
          console.error('Error al buscar espacio cultural:', spaceError);
          
        }
        
        const contactoData = managerData.contacto || { email: '', telefono: '' };
        
        console.log('Datos de contacto del gestor (sin espacio cultural):', contactoData);
        
        setSpace(prevState => ({
          ...prevState,
          nombre: managerData.nombreEspacio || prevState.nombre,
          direccion: managerData.direccion || prevState.direccion,
          capacidad: String(managerData.capacidad || prevState.capacidad || ''),
          descripcion: managerData.descripcion || prevState.descripcion,
          instalaciones: instalaciones,
          images: imagenes,
          disponibilidad: getDisponibilidadValida(managerData.disponibilidad || prevState.disponibilidad),
          managerId: route.params.userId,
          contacto: {
            email: contactoData.email || '',
            telefono: contactoData.telefono || ''
          },
          redesSociales: prevState.redesSociales
        }));
        
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error al cargar perfil del gestor:', error);
      Alert.alert('Error', 'No se pudo cargar la información del perfil del gestor');
    } finally {
      setLoading(false);
    }
  };

  const loadSpaceData = async () => {
    try {
      setLoading(true);
      const spaceData = await CulturalSpaceService.getSpaceById(route.params.spaceId);
      setSpace(prevState => ({ 
        ...prevState, 
        ...spaceData, 
        disponibilidad: getDisponibilidadValida(spaceData.disponibilidad) 
      }));
    } catch (error) {
      console.error('Error al cargar espacio cultural:', error);
      Alert.alert('Error', 'No se pudo cargar la información del espacio cultural');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      let cloudinaryImages = [];
      try {
        const hasLocalImages = space.images.some(uri => !CloudinaryService.isCloudinaryUrl(uri));
        
        if (hasLocalImages) {
          console.warn('Subiendo imágenes locales a Cloudinary antes de guardar...');
          cloudinaryImages = await CloudinaryService.uploadMultipleImages(space.images);
        } else {
          cloudinaryImages = space.images;
        }
      } catch (imageError) {
        console.warn('Error al subir imágenes a Cloudinary:', imageError);
        cloudinaryImages = space.images;
      }
      
      const updatedSpace = {
        ...space,
        images: cloudinaryImages
      };
      
      let response;
      
      const totalSize = updatedSpace.images.reduce((size, img) => size + (img?.length || 0), 0);
      console.warn(`Tamaño total de imágenes: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
      
      if (route.params?.spaceId) {
        response = await CulturalSpaceService.updateSpace(route.params.spaceId, updatedSpace);
      } else if (route.params?.userId) {
        const managerProfileData = {
          nombreEspacio: updatedSpace.nombre,
          direccion: updatedSpace.direccion,
          capacidad: updatedSpace.capacidad,
          descripcion: updatedSpace.descripcion,
          instalaciones: updatedSpace.instalaciones,
          imagenes: updatedSpace.images,
          disponibilidad: updatedSpace.disponibilidad,
          horarios: updatedSpace.disponibilidad,
          contacto: {
            email: updatedSpace.contacto?.email || '',
            telefono: updatedSpace.contacto?.telefono || ''
          }
        };
        
        console.log('Guardando datos del gestor:', managerProfileData); 
        
        try {
          response = await ManagerProfileService.updateManagerProfile(route.params.userId, managerProfileData);
        } catch (managerError) {
          console.error('Error al actualizar perfil del gestor:', managerError);
          Alert.alert('Error', `No se pudo actualizar el perfil del gestor: ${managerError.message || 'Error de conexión'}`);
          setLoading(false);
          return;
        }
        
        try {
          const spaceData = {
            nombre: updatedSpace.nombre,
            direccion: updatedSpace.direccion,
            capacidad: updatedSpace.capacidad,
            descripcion: updatedSpace.descripcion,
            instalaciones: updatedSpace.instalaciones,
            disponibilidad: updatedSpace.disponibilidad,
            images: updatedSpace.images,
            managerId: route.params.userId,
            contacto: {
              email: updatedSpace.contacto?.email || '',
              telefono: updatedSpace.contacto?.telefono || ''
            },
            redesSociales: {
              facebook: updatedSpace.redesSociales?.facebook || '',
              instagram: updatedSpace.redesSociales?.instagram || '',
              twitter: updatedSpace.redesSociales?.twitter || ''
            }
          };
          
          console.log('Datos a guardar en CulturalSpaces:', spaceData);
          
          const existingSpace = await CulturalSpaceService.findSpaceByManagerId(route.params.userId);
          
          if (existingSpace) {
            console.log('Espacio existente encontrado, actualizando:', existingSpace.id);
            await CulturalSpaceService.updateSpace(existingSpace.id, spaceData);
            console.log('Espacio cultural actualizado en la tabla CulturalSpaces');
          } else {
            console.log('No se encontró espacio existente, creando nuevo');
            await CulturalSpaceService.createSpace(spaceData);
            console.log('Espacio cultural creado en la tabla CulturalSpaces');
          }
        } catch (spaceError) {
          console.error('Error al guardar en la tabla CulturalSpaces:', spaceError);
          Alert.alert('Advertencia', 'Se guardó la información del gestor, pero hubo un problema al actualizar el espacio cultural.');
        }
      } else {
        try {
          response = await CulturalSpaceService.createSpace(updatedSpace);
        } catch (createError) {
          console.error('Error al crear nuevo espacio:', createError);
          Alert.alert('Error', `No se pudo crear el espacio cultural: ${createError.message || 'Error de conexión'}`);
          setLoading(false);
          return;
        }
      }
      
      Alert.alert('Éxito', 'Información guardada correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', `No se pudo guardar la información: ${error.message || 'Verifica la conexión al servidor'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstalacion = () => {
    if (nuevaInstalacion.trim()) {
      setSpace(prevState => ({
        ...prevState,
        instalaciones: [...prevState.instalaciones, nuevaInstalacion.trim()]
      }));
      setNuevaInstalacion('');
    }
  };

  const handleRemoveInstalacion = (index) => {
    setSpace(prevState => ({
      ...prevState,
      instalaciones: prevState.instalaciones.filter((_, i) => i !== index)
    }));
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar imágenes');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        setLoading(true);
        
        try {
          const cloudinaryUrl = await CloudinaryService.uploadImage(selectedImage.uri);
          
          setSpace(prevState => ({
            ...prevState,
            images: [...prevState.images, cloudinaryUrl]
          }));
          
          console.warn('Imagen subida exitosamente a Cloudinary');
        } catch (uploadError) {
          console.warn('Error al subir imagen a Cloudinary:', uploadError);
          Alert.alert('Error', 'No se pudo subir la imagen a la nube. Se guardará localmente por ahora.');
          
          setSpace(prevState => ({
            ...prevState,
            images: [...prevState.images, selectedImage.uri]
          }));
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.warn('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      setLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setSpace(prevState => ({
      ...prevState,
      images: prevState.images.filter((_, i) => i !== index)
    }));
  };

  const toggleDayOpen = (dayIndex) => {
    setSpace(prevState => {
      const newDisponibilidad = [...prevState.disponibilidad];
      newDisponibilidad[dayIndex] = {
        ...newDisponibilidad[dayIndex],
        isOpen: !newDisponibilidad[dayIndex].isOpen
      };
      return { ...prevState, disponibilidad: newDisponibilidad };
    });
  };

  const addTimeSlot = (dayIndex) => {
    setSpace(prevState => {
      const newDisponibilidad = [...prevState.disponibilidad];
      const day = newDisponibilidad[dayIndex];
      
      newDisponibilidad[dayIndex] = {
        ...day,
        timeSlots: [...day.timeSlots, { start: '09:00', end: '18:00' }]
      };
      
      return { ...prevState, disponibilidad: newDisponibilidad };
    });
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    setSpace(prevState => {
      const newDisponibilidad = [...prevState.disponibilidad];
      const day = newDisponibilidad[dayIndex];
      
      if (day.timeSlots.length <= 1) {
        return prevState;
      }
      
      newDisponibilidad[dayIndex] = {
        ...day,
        timeSlots: day.timeSlots.filter((_, i) => i !== slotIndex)
      };
      
      return { ...prevState, disponibilidad: newDisponibilidad };
    });
  };

  const openTimePicker = (dayIndex, slotIndex, isStartTime) => {
    setTimePickerVisible({
      visible: true,
      dayIndex,
      slotIndex,
      isStartTime
    });
  };

  const closeTimePicker = () => {
    setTimePickerVisible({
      visible: false,
      dayIndex: null,
      slotIndex: null,
      isStartTime: true
    });
  };

  const selectTime = (time) => {
    const { dayIndex, slotIndex, isStartTime } = timePickerVisible;
    
    setSpace(prevState => {
      const newDisponibilidad = [...prevState.disponibilidad];
      const day = newDisponibilidad[dayIndex];
      const slots = [...day.timeSlots];
      
      if (isStartTime) {
        slots[slotIndex] = { ...slots[slotIndex], start: time };
      } else {
        slots[slotIndex] = { ...slots[slotIndex], end: time };
      }
      
      newDisponibilidad[dayIndex] = { ...day, timeSlots: slots };
      
      return { ...prevState, disponibilidad: newDisponibilidad };
    });
    
    closeTimePicker();
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSpace(prevState => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value
        }
      }));
    } else {
      setSpace(prevState => ({
        ...prevState,
        [field]: value
      }));
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    space,
    isEditing,
    timePickerVisible,
    nuevaInstalacion,
    availableTimes,
    loading,
    setIsEditing,
    handleInputChange,
    handleAddInstalacion,
    handleRemoveInstalacion,
    handlePickImage,
    handleRemoveImage,
    toggleDayOpen,
    addTimeSlot,
    removeTimeSlot,
    openTimePicker,
    closeTimePicker,
    selectTime,
    setNuevaInstalacion,
    handleSave,
    handleGoBack
  };
};

export default useCulturalSpace;
