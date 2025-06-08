/**
 * Este archivo maneja el gestor de eventos del espacio
 * - UI
 * - Espacios
 * - Eventos
 * - Gestor
 * - CRUD
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { useAuth } from '../../../../context/AuthContext';
import EventForm from '../../events/ui/EventForm';
import { styles } from '../../../../styles/SpaceEventManagerStyles';

const ManageSpaceEvents = ({ navigation, route }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const managerId = route.params?.managerId || user?.id || user?.sub;
  const spaceName = route.params?.spaceName || 'Mi Espacio Cultural';

  useEffect(() => {
    loadData();
  }, [managerId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const eventsResponse = await axios.get(`${BACKEND_URL}/api/events/by-manager/${managerId}`);
      setEvents(eventsResponse.data || []);
      
      const categoriesResponse = await axios.get(`${BACKEND_URL}/api/categories`);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (formData) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/events`, {
        ...formData,
        managerId
      });

      if (response.data.success) {
        Alert.alert('Éxito', 'Evento creado correctamente');
        setShowCreateModal(false);
        loadData();
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      Alert.alert('Error', 'No se pudo crear el evento');
    }
  };

  const handleUpdateEvent = async (formData) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/events/${currentEvent._id}`, formData);

      if (response.data.success) {
        Alert.alert('Éxito', 'Evento actualizado correctamente');
        setShowEditModal(false);
        loadData();
      }
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      Alert.alert('Error', 'No se pudo actualizar el evento');
    }
  };

  const handleDeleteEvent = (eventId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${BACKEND_URL}/api/events/${eventId}`);
              if (response.data.success) {
                Alert.alert('Éxito', 'Evento eliminado correctamente');
                loadData();
              }
            } catch (error) {
              console.error('Error al eliminar evento:', error);
              Alert.alert('Error', 'No se pudo eliminar el evento');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (event) => {
    setCurrentEvent(event);
    setShowEditModal(true);
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.color || '#999';
  };
  
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.nombre || 'Sin categoría';
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Eventos de {spaceName}</Text>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#FF3A5E" />
        </View>
      ) : (
        <ScrollView style={styles.eventsList}>
          {events.length > 0 ? (
            events.map((event) => (
              <View key={event._id} style={styles.eventCard}>
                <View style={styles.eventImageContainer}>
                  {event.imagen ? (
                    <Image source={{ uri: event.imagen }} style={styles.eventImage} />
                  ) : (
                    <View style={styles.eventImagePlaceholder}>
                      <Ionicons name="image" size={50} color="#666" />
                    </View>
                  )}
                  
                  <View 
                    style={[
                      styles.categoryTag, 
                      { backgroundColor: getCategoryColor(event.categoriaId) }
                    ]}
                  >
                    <Text style={styles.categoryTagText}>
                      {getCategoryName(event.categoriaId)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.titulo}</Text>
                  <Text style={styles.eventDate}>
                    <Ionicons name="calendar" size={14} color="#999" /> {formatDate(event.fecha)}
                  </Text>
                  <Text style={styles.eventTime}>
                    <Ionicons name="time" size={14} color="#999" /> {event.horaInicio} - {event.horaFin}
                  </Text>
                  
                  <View style={styles.eventActions}>
                    <TouchableOpacity 
                      style={[styles.eventButton, styles.editButton]}
                      onPress={() => openEditModal(event)}
                    >
                      <Ionicons name="create" size={16} color="#FFF" />
                      <Text style={styles.eventButtonText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.eventButton, styles.deleteButton]}
                      onPress={() => handleDeleteEvent(event._id)}
                    >
                      <Ionicons name="trash" size={16} color="#FFF" />
                      <Text style={styles.eventButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar" size={50} color="#FF3A5E" />
              <Text style={styles.emptyStateTitle}>No hay eventos programados</Text>
              <Text style={styles.emptyStateText}>
                Crea tu primer evento haciendo clic en el botón "+" en la parte superior.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <EventForm 
              onSubmit={handleCreateEvent} 
              onCancel={() => setShowCreateModal(false)}
              categories={categories}
            />
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <EventForm 
              event={currentEvent}
              onSubmit={handleUpdateEvent}
              categories={categories}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManageSpaceEvents;