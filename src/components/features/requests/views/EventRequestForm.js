import React from 'react';
import { View, Modal, TouchableOpacity, Text, ScrollView, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../../../../styles/EventRequestFormStyles';

// Hooks
import useEventRequest from '../hooks/useEventRequest';

const EventRequestForm = ({ visible, onClose, spaceId, spaceName, managerId }) => {
  const {
    // Estados
    loading,
    loadingSlots,
    filteredTimeSlots,
    confirmModalVisible,
    capacityExceeded,
    eventName,
    eventDescription,
    eventDate,
    showDatePicker,
    selectedTimeSlots,
    expectedAttendees,
    eventType,
    eventCategory,
    customCategory,
    additionalRequirements,
    spaceCapacity,
    
    // Métodos
    setEventName,
    setEventDescription,
    setEventType,
    setAdditionalRequirements,
    handleDateChange,
    handleTimeSlotSelection,
    handleExpectedAttendeesChange,
    handleCategoryChange,
    setCustomCategory,
    handleSubmit,
    setConfirmModalVisible,
    getTimeRange,
    calculateTotalDuration
  } = useEventRequest({ visible, onClose, spaceId, spaceName, managerId });
  
  // Función para convertir el valor de la categoría a un texto más legible
  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'musica': 'Música',
      'danza': 'Danza',
      'teatro': 'Teatro',
      'artes_visuales': 'Artes Visuales',
      'literatura': 'Literatura',
      'cine': 'Cine',
      'fotografia': 'Fotografía',
      'otro': 'Otro'
    };
    return categoryLabels[category] || (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'No especificada');
  };
  
  // Mostrar resumen y confirmar envío
  const showSummaryAndConfirm = () => {
    if (!eventName || !eventDescription || selectedTimeSlots.length === 0 || !expectedAttendees || !eventType) {
      Alert.alert('Campos incompletos', 'Por favor complete todos los campos obligatorios');
      return;
    }
    
    // Calcular la duración total del evento
    const totalDuration = calculateTotalDuration();
    
    // Formatear la hora para mostrar en formato más amigable
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
    };
    
    // Verificar si se excede la capacidad
    let warningMessage = '';
    const defaultCapacity = 100; // Capacidad predeterminada si no se puede obtener del servidor
    const capacity = spaceCapacity || defaultCapacity;
    if (parseInt(expectedAttendees, 10) > capacity) {
      warningMessage = `\n\n⚠️ ADVERTENCIA: El número de asistentes (${expectedAttendees}) excede la capacidad del espacio (${capacity} personas).`;
    }
    
    // Obtener el rango de tiempo seleccionado
    const timeRange = getTimeRange();
    
    Alert.alert(
      'Confirmar solicitud',
      `Por favor, verifica los detalles de tu solicitud:
      
Nombre del evento: ${eventName}
Fecha: ${eventDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Horario: ${formatTime(timeRange.start)} - ${formatTime(timeRange.end)}
Duración: ${calculateTotalDuration()} horas
Asistentes esperados: ${expectedAttendees}
Tipo de evento: ${eventType}
Categoría: ${getCategoryLabel(eventCategory)}
${eventCategory === 'otro' ? `Categoría personalizada: ${customCategory}` : ''}${warningMessage}

¿Deseas enviar esta solicitud?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Enviar',
          onPress: () => handleSubmit()
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Solicitar Evento</Text>
              <Text style={styles.spaceName}>{spaceName}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FF3A5E" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerDivider} />
          
          <ScrollView 
            showsVerticalScrollIndicator={true} 
            persistentScrollbar={true} 
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del evento *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Concierto de Jazz"
                placeholderTextColor="#999"
                value={eventName}
                onChangeText={setEventName}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe brevemente el evento"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={eventDescription}
                onChangeText={setEventDescription}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha *</Text>
              <View style={styles.dateContainer}>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => handleDateChange(null, null, true)}
                >
                  <Ionicons name="calendar" size={20} color="#FF3A5E" style={styles.dateIcon} />
                  <Text style={styles.dateText}>
                    {eventDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                  <View style={styles.dateIndicator}>
                    <Ionicons name="chevron-down" size={16} color="#FF3A5E" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.dateHint}>Selecciona una fecha para ver los horarios disponibles</Text>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={eventDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  themeVariant="dark"
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.label}>Horario disponible *</Text>
                {filteredTimeSlots.length > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{filteredTimeSlots.length}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.infoText}>Selecciona un horario disponible para tu evento</Text>
              
              {/* Indicador de selección múltiple */}
              {selectedTimeSlots.length > 0 && (
                <View style={styles.multiSelectInfo}>
                  <Ionicons name="information-circle" size={16} color="#FF3A5E" style={{marginRight: 6}} />
                  <Text style={styles.multiSelectText}>
                    {selectedTimeSlots.length === 1 
                      ? "Puedes seleccionar slots adicionales consecutivos si necesitas más tiempo" 
                      : `Has seleccionado ${selectedTimeSlots.length} slots consecutivos (${calculateTotalDuration()} horas)`}
                  </Text>
                </View>
              )}
              
              {loadingSlots ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF3A5E" />
                  <Text style={styles.loadingText}>Cargando horarios disponibles...</Text>
                </View>
              ) : filteredTimeSlots.length > 0 ? (
                <View style={styles.timeSlotListContainer}>
                  <View style={styles.timeSlotHeader}>
                    <View style={styles.timeSlotHeaderLeft}>
                      <Ionicons name="calendar" size={18} color="#FF3A5E" style={{marginRight: 8}} />
                      <Text style={styles.timeSlotHeaderText}>{eventDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</Text>
                    </View>
                    <View style={styles.timeSlotHeaderRight}>
                      <Ionicons name="time-outline" size={16} color="#FF3A5E" style={{marginRight: 4}} />
                      <Text style={styles.timeSlotCount}>{filteredTimeSlots.length} franjas</Text>
                    </View>
                  </View>
                  
                  <View style={styles.timeSlotScrollContainer}>
                    <ScrollView 
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                      persistentScrollbar={true}
                      contentContainerStyle={styles.timeSlotContentContainer}
                    >
                      {filteredTimeSlots.map((slot, index) => (
                        <TouchableOpacity
                          key={`time-slot-${index}`}
                          style={[
                            styles.timeSlot,
                            selectedTimeSlots.some(s => s.hour === slot.hour) ? styles.selectedTimeSlot : null
                          ]}
                          onPress={() => handleTimeSlotSelection(slot)}
                        >
                          <View style={styles.timeSlotIconContainer}>
                            <Ionicons 
                              name={selectedTimeSlots.some(s => s.hour === slot.hour) ? "checkmark-circle" : "time-outline"} 
                              size={20} 
                              color={selectedTimeSlots.some(s => s.hour === slot.hour) ? "white" : "#FF3A5E"} 
                            />
                          </View>
                          <Text 
                            style={[
                              styles.timeSlotText,
                              selectedTimeSlots.some(s => s.hour === slot.hour) ? styles.selectedTimeSlotText : null
                            ]}
                          >
                            {slot.start}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              ) : (
                <View style={styles.noSlotsContainer}>
                  <Ionicons name="alert-circle-outline" size={24} color="#FF3A5E" />
                  <View style={styles.noSlotsTextContainer}>
                    <Text style={styles.noSlotsTitle}>No hay horarios disponibles</Text>
                    <Text style={styles.noSlotsText}>
                      No se encontraron franjas horarias disponibles para esta fecha. Por favor, selecciona otra fecha.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Asistentes esperados *</Text>
              <TextInput
                style={[
                  styles.input,
                  capacityExceeded && {borderColor: '#FF3A5E', borderWidth: 1}
                ]}
                placeholder="Ej. 50"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={expectedAttendees}
                onChangeText={handleExpectedAttendeesChange}
              />
              {capacityExceeded && (
                <View style={styles.warningContainer}>
                  <Ionicons name="warning-outline" size={16} color="#FF3A5E" />
                  <Text style={styles.warningText}>
                    El número de asistentes excede la capacidad del espacio ({spaceCapacity || 100} personas).
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de evento *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Concierto, exposición, taller"
                placeholderTextColor="#999"
                value={eventType}
                onChangeText={setEventType}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoría *</Text>
              <View style={styles.categoryContainer}>
                {['musica', 'danza', 'teatro', 'artes_visuales', 'literatura', 'cine', 'fotografia', 'otro'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      eventCategory === cat && styles.categoryButtonActive
                    ]}
                    onPress={() => handleCategoryChange(cat)}
                  >
                    <Text 
                      style={[
                        styles.categoryButtonText,
                        eventCategory === cat && styles.categoryButtonTextActive
                      ]}
                    >
                      {getCategoryLabel(cat)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {eventCategory === 'otro' && (
                <View style={styles.customCategoryContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Especifica la categoría"
                    placeholderTextColor="#999"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                  />
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Requerimientos adicionales</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ej. Equipo de sonido, proyector, etc. o ninguno"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={additionalRequirements}
                onChangeText={setAdditionalRequirements}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={showSummaryAndConfirm}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Procesando...</Text>
                </View>
              ) : (
                <View style={styles.submitButtonContent}>
                  <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={styles.submitButtonIcon} />
                  <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
          
          {/* No se necesita el modal de confirmación ya que usamos Alert.alert */}
        </View>
      </View>
    </Modal>
  );
};

export default EventRequestForm;