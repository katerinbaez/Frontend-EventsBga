import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../../context/AuthContext';
import CulturalSpaceService from '../services/CulturalSpaceService';
import ManagerProfileService from '../services/ManagerProfileService';

const useCulturalSpace = (navigation, route) => {
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
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      // Intentar cargar datos del perfil del gestor
      const managerData = await ManagerProfileService.getManagerProfile(route.params.userId);
      
      if (managerData) {
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
          // Buscar un espacio con el mismo managerId
          const existingSpace = await CulturalSpaceService.findSpaceByManagerId(route.params.userId);
          
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
              capacidad: String(existingSpace.capacidad || managerData.capacidad || prevState.capacidad || ''),
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
          capacidad: String(managerData.capacidad || prevState.capacidad || ''),
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
      let response;
      
      if (route.params?.spaceId) {
        // Actualizar espacio existente
        response = await CulturalSpaceService.updateSpace(route.params.spaceId, space);
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
        try {
          response = await ManagerProfileService.updateManagerProfile(route.params.userId, managerProfileData);
        } catch (managerError) {
          console.error('Error al actualizar perfil del gestor:', managerError);
          Alert.alert('Error', `No se pudo actualizar el perfil del gestor: ${managerError.message || 'Error de conexión'}`);
          setLoading(false);
          return;
        }
        
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
          
          // Verificar primero si ya existe un espacio para este gestor
          const existingSpace = await CulturalSpaceService.findSpaceByManagerId(route.params.userId);
          
          if (existingSpace) {
            // Si existe, actualizar
            console.log('Espacio existente encontrado, actualizando:', existingSpace.id);
            await CulturalSpaceService.updateSpace(existingSpace.id, spaceData);
            console.log('Espacio cultural actualizado en la tabla CulturalSpaces');
          } else {
            // Si no existe, crear nuevo
            console.log('No se encontró espacio existente, creando nuevo');
            await CulturalSpaceService.createSpace(spaceData);
            console.log('Espacio cultural creado en la tabla CulturalSpaces');
          }
        } catch (spaceError) {
          console.error('Error al guardar en la tabla CulturalSpaces:', spaceError);
          // No lanzar el error aquí, ya que los datos del gestor se guardaron correctamente
          Alert.alert('Advertencia', 'Se guardó la información del gestor, pero hubo un problema al actualizar el espacio cultural.');
        }
      } else {
        // Crear nuevo espacio (caso poco común)
        try {
          response = await CulturalSpaceService.createSpace(space);
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setSpace(prevState => ({
          ...prevState,
          images: [...prevState.images, selectedImage.uri]
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
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
      
      // Añadir un nuevo slot con horarios predeterminados
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
      
      // Si solo queda un slot, no permitir eliminarlo
      if (day.timeSlots.length <= 1) {
        return prevState;
      }
      
      // Eliminar el slot específico
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
