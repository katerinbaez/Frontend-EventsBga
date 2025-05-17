import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../../../../styles/EventFormStyles';

const EventForm = ({ 
  event, 
  onSubmit, 
  categories = [], 
  filteredTimeSlots = [], 
  selectedTimeSlots = [], 
  loadingSlots = false,
  onTimeSlotSelect = () => {},
  onDateChange = () => {}
}) => {
  // Estados para los campos del formulario
  const [titulo, setTitulo] = useState(event?.titulo || '');
  const [descripcion, setDescripcion] = useState(event?.descripcion || '');
  const [fecha, setFecha] = useState(event?.fecha || new Date());
  const [horaInicio, setHoraInicio] = useState(event?.horaInicio || '12:00');
  const [horaFin, setHoraFin] = useState(event?.horaFin || '14:00');
  const [categoria, setCategoria] = useState(event?.categoria || '');
  const [tipoEvento, setTipoEvento] = useState(event?.tipoEvento || '');
  const [asistentesEsperados, setAsistentesEsperados] = useState(event?.asistentesEsperados?.toString() || '');
  const [requerimientosAdicionales, setRequerimientosAdicionales] = useState(event?.requerimientosAdicionales || '');
  
  // Estados para los pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState('inicio'); // 'inicio' o 'fin'
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  // Inicializar datos si estamos en modo edición
  useEffect(() => {
    if (event) {
      console.log('Inicializando formulario con datos:', event);
      
      // Establecer los valores iniciales
      setTitulo(event.titulo || '');
      setDescripcion(event.descripcion || '');
      
      // Manejar la fecha correctamente
      if (event.fecha) {
        try {
          const fechaObj = new Date(event.fecha);
          if (!isNaN(fechaObj.getTime())) { // Verificar que la fecha sea válida
            setFecha(fechaObj);
          } else {
            console.warn('Fecha inválida:', event.fecha);
            setFecha(new Date());
          }
        } catch (error) {
          console.error('Error al parsear fecha:', error);
          setFecha(new Date());
        }
      } else {
        setFecha(new Date());
      }
      
      // Establecer horas
      setHoraInicio(event.horaInicio || '18:00');
      setHoraFin(event.horaFin || '20:00');
      
      // Establecer campos del modelo Event
      setCategoria(event.categoria || '');
      setTipoEvento(event.tipoEvento || 'General');
      setAsistentesEsperados(event.asistentesEsperados?.toString() || '0');
      setRequerimientosAdicionales(event.requerimientosAdicionales || '');
    }
  }, [event]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      setFecha(selectedDate);
      
      // Notificar al componente padre sobre el cambio de fecha
      // para que pueda cargar los horarios disponibles
      onDateChange(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      if (timePickerMode === 'inicio') {
        setHoraInicio(timeString);
      } else {
        setHoraFin(timeString);
      }
    }
  };

  const handleSubmit = () => {
    // Validar campos requeridos
    if (!titulo.trim()) {
      alert('Por favor, ingresa un título para el evento');
      return;
    }
    
    if (!descripcion.trim()) {
      alert('Por favor, ingresa una descripción para el evento');
      return;
    }
    
    // Preparar los datos básicos del evento
    const eventData = {
      // Si estamos editando un evento existente, incluir su ID
      ...(event && event.id && { id: event.id }),
      titulo,
      descripcion,
      fecha,
      categoria,
      tipoEvento,
      asistentesEsperados,
      requerimientosAdicionales
    };
    
    // Verificar si hay horarios seleccionados
    if (selectedTimeSlots.length > 0) {
      // Ordenar los slots por hora
      const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.hour - b.hour);
      
      // Usar el primer y último slot para determinar el rango de horas
      const firstSlot = sortedSlots[0];
      const lastSlot = sortedSlots[sortedSlots.length - 1];
      
      // Actualizar las horas de inicio y fin basadas en los slots seleccionados
      eventData.horaInicio = firstSlot.formattedHour || firstSlot.start || horaInicio;
      eventData.horaFin = lastSlot.end || horaFin;
      eventData.selectedTimeSlots = sortedSlots; // Incluir los slots seleccionados para referencia
    } else {
      // Si no hay slots seleccionados, usar las horas ingresadas manualmente
      eventData.horaInicio = horaInicio;
      eventData.horaFin = horaFin;
    }
    
    console.log('Enviando datos del evento:', eventData);
    
    // Enviar datos al componente padre
    onSubmit(eventData);
  };

  const getCategoryName = (categoryId) => {
    // Si no hay ID de categoría, mostrar 'General'
    if (!categoryId) return 'General';
    
    // Buscar la categoría por ID
    const category = categories.find(c => c._id === categoryId);
    
    // Si se encuentra la categoría, usar su nombre, de lo contrario usar el ID como nombre
    return category?.nombre || categoryId;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { textAlign: 'center', fontSize: 24, color: '#FF3A5E', fontWeight: 'bold', marginBottom: 10 }]}>
          {event ? 'Editar Evento' : 'Crear Evento'}
        </Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Título del evento *</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ej. Concierto de Jazz"
          placeholderTextColor="#999"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe el evento..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha *</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerText}>
            {fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Ionicons name="calendar" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {/* Se eliminó la sección de Horario del evento ya que se muestra en Horarios disponibles */}
      
      {/* Sección de horarios disponibles */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Horarios disponibles</Text>
        {loadingSlots ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3A5E" />
            <Text style={styles.loadingText}>Cargando horarios disponibles...</Text>
          </View>
        ) : filteredTimeSlots.length > 0 ? (
          <View style={styles.timeSlotsContainer}>
            {filteredTimeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.hour}
                style={[
                  styles.timeSlot,
                  selectedTimeSlots.some(s => s.hour === slot.hour) && styles.timeSlotSelected
                ]}
                onPress={() => onTimeSlotSelect(slot)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTimeSlots.some(s => s.hour === slot.hour) && styles.timeSlotTextSelected
                  ]}
                >
                  {slot.displayTime}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noSlotsText}>
            No hay horarios disponibles para la fecha seleccionada
          </Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Categoría</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <Text style={styles.datePickerText}>
            {categoria ? getCategoryName(categoria) : 'Seleccionar categoría'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#FFF" />
        </TouchableOpacity>
        
        {showCategoryPicker && (
          <View style={styles.categoryList}>
            {categories.map(category => (
              <TouchableOpacity
                key={category._id}
                style={[styles.categoryItem, categoria === category._id && styles.selectedCategory]}
                onPress={() => {
                  setCategoria(category._id);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={styles.categoryText}>{category.nombre}</Text>
                {categoria === category._id && (
                  <Ionicons name="checkmark" size={20} color="#FF3A5E" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tipo de Evento</Text>
        <TextInput
          style={styles.input}
          value={tipoEvento}
          onChangeText={setTipoEvento}
          placeholder="Ej. Concierto, Exposición, etc."
          placeholderTextColor="#999"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Asistentes Esperados</Text>
        <TextInput
          style={styles.input}
          value={asistentesEsperados}
          onChangeText={setAsistentesEsperados}
          placeholder="Número esperado de asistentes"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>
      
      <View style={[styles.formGroup, { marginBottom: 100 }]}>
        <Text style={styles.label}>Requerimientos Adicionales</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={requerimientosAdicionales}
          onChangeText={setRequerimientosAdicionales}
          placeholder="Describe cualquier requerimiento adicional para el evento"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>
      
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, marginBottom: 20 }}>
        <TouchableOpacity 
          style={[styles.submitButton, { 
            height: 55, 
            borderRadius: 10, 
            backgroundColor: '#FF3A5E', // Color de acento rojo según las preferencias del usuario
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5
          }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitButtonText, { 
            fontSize: 18, 
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center'
          }]}>{event ? 'Guardar Cambios' : 'Crear Evento'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* DatePicker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {/* TimePicker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date(fecha.setHours(
            timePickerMode === 'inicio' 
              ? parseInt(horaInicio.split(':')[0]) 
              : parseInt(horaFin.split(':')[0]),
            timePickerMode === 'inicio' 
              ? parseInt(horaInicio.split(':')[1]) 
              : parseInt(horaFin.split(':')[1])
          ))}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

export default EventForm;
