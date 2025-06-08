/**
 * Este archivo maneja el modal de edición de evento
 * - UI
 * - Espacios
 * - Eventos
 * - Edición
 */

import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  ActivityIndicator, 
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/ManageSpaceEventsStyles';

const EventEditModal = ({ 
  visible, 
  currentEvent, 
  setCurrentEvent, 
  onClose, 
  onSave, 
  formatDate, 
  formatTime, 
  loadingSlots, 
  filteredTimeSlots 
}) => {
  if (!currentEvent) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#333'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: '#FFFFFF'}}>Editar Evento</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={{padding: 15}}>
              <Text style={{fontSize: 16, color: '#FFFFFF', marginBottom: 10}}>Título</Text>
              <TextInput
                style={{
                  backgroundColor: '#333',
                  borderRadius: 5,
                  padding: 10,
                  color: '#FFFFFF',
                  marginBottom: 15
                }}
                value={currentEvent.titulo}
                onChangeText={(text) => setCurrentEvent({...currentEvent, titulo: text})}
                placeholder="Título del evento"
                placeholderTextColor="#999"
              />
              
              <Text style={{fontSize: 16, color: '#FFFFFF', marginBottom: 10}}>Descripción</Text>
              <TextInput
                style={{
                  backgroundColor: '#333',
                  borderRadius: 5,
                  padding: 10,
                  color: '#FFFFFF',
                  marginBottom: 15,
                  height: 100,
                  textAlignVertical: 'top'
                }}
                value={currentEvent.descripcion}
                onChangeText={(text) => setCurrentEvent({...currentEvent, descripcion: text})}
                placeholder="Descripción del evento"
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={4}
              />
              
              <Text style={{fontSize: 16, color: '#FFFFFF', marginBottom: 10}}>Asistentes Esperados</Text>
              <TextInput
                style={{
                  backgroundColor: '#333',
                  borderRadius: 5,
                  padding: 10,
                  color: '#FFFFFF',
                  marginBottom: 15
                }}
                value={String(currentEvent.asistentesEsperados)}
                onChangeText={(text) => setCurrentEvent({...currentEvent, asistentesEsperados: parseInt(text) || 0})}
                placeholder="Número de asistentes esperados"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              
              <Text style={{fontSize: 16, color: '#FFFFFF', marginBottom: 10}}>Fecha y Hora del Evento</Text>
              <View style={{flexDirection: 'row', marginBottom: 15}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#333',
                    borderRadius: 5,
                    padding: 10,
                    flex: 1,
                    marginRight: 10
                  }}
                  onPress={() => {
                    const date = new Date();
                    setCurrentEvent({...currentEvent, fechaProgramada: date});
                  }}
                >
                  <Text style={{color: '#FFFFFF'}}>{formatDate(currentEvent.fechaProgramada)}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: '#333',
                    borderRadius: 5,
                    padding: 10,
                    flex: 1
                  }}
                >
                  <Text style={{color: '#FFFFFF'}}>{formatTime(currentEvent.fechaProgramada)}</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={{fontSize: 16, color: '#FFFFFF', marginBottom: 10}}>Disponibilidad de Horarios</Text>
              <View style={{backgroundColor: '#222', borderRadius: 5, padding: 10, marginBottom: 15}}>
                {loadingSlots ? (
                  <ActivityIndicator size="small" color="#FF3A5E" />
                ) : Array.isArray(filteredTimeSlots) && filteredTimeSlots.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {filteredTimeSlots.map((slot, index) => {
                      const isSelected = currentEvent?.fechaProgramada && 
                        new Date(currentEvent.fechaProgramada).getHours() === slot.hour;
                      
                      return (
                        <TouchableOpacity
                          key={index}
                          style={{
                            backgroundColor: isSelected ? '#FF3A5E' : '#333',
                            borderRadius: 5,
                            padding: 10,
                            marginRight: 10,
                            minWidth: 80,
                            alignItems: 'center'
                          }}
                          onPress={() => {
                            try {
                              const newDate = new Date(currentEvent.fechaProgramada);
                              const hour = slot.hour || 0;
                              
                              newDate.setHours(hour, 0, 0, 0);
                              
                              setCurrentEvent({...currentEvent, fechaProgramada: newDate});
                            } catch (error) {
                              console.error('Error al actualizar la hora:', error);
                            }
                          }}
                        >
                          <Text style={{color: '#FFFFFF'}}>{slot.displayTime || slot.formattedHour || `${slot.hour}:00`}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <Text style={{color: '#999', textAlign: 'center'}}>No hay horarios disponibles para esta fecha</Text>
                )}
              </View>
            </View>
            
            <View style={styles.fixedButtonContainer}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => onSave({
                  id: currentEvent.id,
                  titulo: currentEvent.titulo,
                  descripcion: currentEvent.descripcion,
                  asistentesEsperados: currentEvent.asistentesEsperados,
                  fechaProgramada: currentEvent.fechaProgramada,
                  managerId: currentEvent.managerId
                })}
              >
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default EventEditModal;
