import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import { Calendar } from 'react-native-calendars';

const EventSearch = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Estados para los filtros
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
    searchEvents(); // Cargar eventos iniciales
  }, []); // Dependencia vacía para que solo se ejecute al montar el componente

  useEffect(() => {
    if (selectedCategory !== undefined) {
      searchEvents();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (searchQuery !== undefined) {
      searchEvents();
    }
  }, [searchQuery]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
      if (response.data && Array.isArray(response.data)) {
        setLocations(response.data);
      } else if (response.data && response.data.success && Array.isArray(response.data.spaces)) {
        setLocations(response.data.spaces);
      }
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
    }
  };

  const searchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (searchQuery) {
        params.query = searchQuery;
      }
      
      if (selectedCategory) {
        params.categoria = selectedCategory;
        console.log('Buscando eventos con categoría:', selectedCategory);
      }
      
      if (startDate) {
        params.fechaInicio = startDate.toISOString().split('T')[0];
      }
      
      if (endDate) {
        params.fechaFin = endDate.toISOString().split('T')[0];
      }
      
      if (location) {
        params.espacioId = location;
      }
      
      console.log('Parámetros de búsqueda:', params);
      const response = await axios.get(`${BACKEND_URL}/api/events/dashboard/search`, { params });
      console.log('Eventos encontrados:', response.data.length);
      
      // Verificar la estructura de la respuesta
      if (Array.isArray(response.data)) {
        setEvents(response.data);
      } else if (response.data && Array.isArray(response.data.events)) {
        setEvents(response.data.events);
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error searching events:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Hora no disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear hora:', error);
      return 'Hora no disponible';
    }
  };

  const renderCategoryChip = (category) => (
    <TouchableOpacity
      key={category.id || 'all'}
      style={[
        styles.categoryChip,
        selectedCategory === category.id && styles.selectedCategoryChip
      ]}
      onPress={() => {
        console.log('Categoría seleccionada:', category.nombre, 'ID:', category.id);
        setSelectedCategory(
          selectedCategory === category.id ? '' : category.id
        );
      }}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === category.id && styles.selectedCategoryChipText
      ]}>
        {category.nombre}
      </Text>
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => {
        // Navegar a la pantalla de detalles con el ID del evento
        console.log('Navegando a detalles del evento:', item.id);
        console.log('Tipo de ID:', typeof item.id);
        
        // Verificar si estamos en desarrollo o producción
        if (__DEV__) {
          console.log('Datos completos del evento:', JSON.stringify(item, null, 2));
        }
        
        // Asegurarse de que el ID sea una cadena
        const eventId = String(item.id);
        
        // Usar el ID del evento para la navegación
        navigation.navigate('EventDetails', { eventId });
      }}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.titulo || 'Evento sin título'}</Text>
        <View style={styles.eventCategory}>
          <Text style={styles.eventCategoryText}>{item.categoria || 'Sin categoría'}</Text>
        </View>
      </View>

      <View style={styles.eventInfo}>
        <View style={styles.eventInfoItem}>
          <Ionicons name="calendar" size={16} color="#7F8C8D" />
          <Text style={styles.eventInfoText}>
            {formatDate(item.fechaInicio)}
          </Text>
        </View>

        <View style={styles.eventInfoItem}>
          <Ionicons name="time" size={16} color="#7F8C8D" />
          <Text style={styles.eventInfoText}>
            {formatTime(item.fechaInicio)}
          </Text>
        </View>

        <View style={styles.eventInfoItem}>
          <Ionicons name="location" size={16} color="#7F8C8D" />
          <Text style={styles.eventInfoText}>
            {item.space?.nombre || 'Espacio por confirmar'}
          </Text>
        </View>
      </View>

      <View style={styles.eventFooter}>
        <View style={styles.eventInfoItem}>
          <Ionicons name="person" size={16} color="#7F8C8D" />
          <Text style={styles.eventInfoText}>
            {item.isEventRequest 
              ? (item.artist?.nombreArtistico || 'Artista por confirmar')
              : (item.space?.nombre || 'Espacio por confirmar')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const applyFilters = () => {
    setFiltersApplied(true);
    setShowFilters(false);
    searchEvents();
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setLocation('');
    setSelectedCategory('');
    setFiltersApplied(false);
    searchEvents();
  };

  const onStartDateChange = (date) => {
    setStartDate(date);
  };

  const onEndDateChange = (date) => {
    setEndDate(date);
  };

  return (
    <View style={styles.container}>
      {/* Encabezado personalizado */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar Eventos</Text>
        <View style={{width: 40}} />
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#95A5A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#95A5A6"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#95A5A6" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            filtersApplied && styles.filterButtonActive
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons 
            name="options" 
            size={24} 
            color={filtersApplied ? "#FFF" : "#95A5A6"} 
          />
        </TouchableOpacity>
      </View>

      {/* Mostrar chips de categorías */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {/* Categoría "Todo" */}
        <TouchableOpacity
          key="all"
          style={[
            styles.categoryChip,
            selectedCategory === '' && styles.selectedCategoryChip
          ]}
          onPress={() => setSelectedCategory('')}
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === '' && styles.selectedCategoryChipText
          ]}>
            Todo
          </Text>
        </TouchableOpacity>
        
        {categories.map(category => renderCategoryChip(category))}
      </ScrollView>

      {/* Indicadores de filtros aplicados */}
      {filtersApplied && (
        <View style={styles.appliedFiltersContainer}>
          {startDate && (
            <View style={styles.appliedFilterChip}>
              <Text style={styles.appliedFilterText}>Desde: {formatDate(startDate)}</Text>
              <TouchableOpacity onPress={() => { setStartDate(null); searchEvents(); }}>
                <Ionicons name="close-circle" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
          {endDate && (
            <View style={styles.appliedFilterChip}>
              <Text style={styles.appliedFilterText}>Hasta: {formatDate(endDate)}</Text>
              <TouchableOpacity onPress={() => { setEndDate(null); searchEvents(); }}>
                <Ionicons name="close-circle" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
          {location && (
            <View style={styles.appliedFilterChip}>
              <Text style={styles.appliedFilterText}>
                Ubicación: {locations.find(loc => loc.id === location)?.nombre || 'Seleccionada'}
              </Text>
              <TouchableOpacity onPress={() => { setLocation(''); searchEvents(); }}>
                <Ionicons name="close-circle" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
          {(startDate || endDate || location) && (
            <TouchableOpacity 
              style={styles.clearAllFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearAllFiltersText}>Limpiar todo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Lista de eventos */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF3A5E" style={styles.loader} />
      ) : events.length > 0 ? (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => (item.id ? item.id.toString() : Math.random().toString())}
          style={styles.eventList}
          contentContainerStyle={styles.eventListContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color="#95A5A6" />
              <Text style={styles.emptyText}>
                No se encontraron eventos
              </Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.noEventsContainer}>
          <Ionicons name="calendar-outline" size={64} color="#95A5A6" />
          <Text style={styles.noEventsTitle}>No hay eventos</Text>
          <Text style={styles.noEventsText}>
            No se encontraron eventos que coincidan con tu búsqueda. Intenta con otros filtros.
          </Text>
        </View>
      )}

      {/* Modal de filtros */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros de búsqueda</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#95A5A6" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Filtro por categoría */}
              <Text style={styles.filterLabel}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContentContainer}>
                {categories.map(category => renderCategoryChip(category))}
              </ScrollView>

              {/* Filtro por fecha de inicio */}
              <Text style={styles.filterLabel}>Fecha de inicio</Text>
              <Calendar
                style={styles.calendar}
                minDate={new Date().toISOString().split('T')[0]}
                onDayPress={(day) => onStartDateChange(new Date(day.dateString))}
                markedDates={{
                  [startDate ? startDate.toISOString().split('T')[0] : '']: { selected: true, selectedColor: '#FF3A5E' }
                }}
                theme={{
                  calendarBackground: '#2C2C2C',
                  textSectionTitleColor: '#FFF',
                  selectedDayBackgroundColor: '#FF3A5E',
                  selectedDayTextColor: '#FFF',
                  todayTextColor: '#FF3A5E',
                  dayTextColor: '#FFF',
                  textDisabledColor: '#666',
                  arrowColor: '#FF3A5E',
                  monthTextColor: '#FFF'
                }}
              />

              {/* Filtro por fecha de fin */}
              <Text style={styles.filterLabel}>Fecha de fin</Text>
              <Calendar
                style={styles.calendar}
                minDate={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                onDayPress={(day) => onEndDateChange(new Date(day.dateString))}
                markedDates={{
                  [endDate ? endDate.toISOString().split('T')[0] : '']: { selected: true, selectedColor: '#FF3A5E' }
                }}
                theme={{
                  calendarBackground: '#2C2C2C',
                  textSectionTitleColor: '#FFF',
                  selectedDayBackgroundColor: '#FF3A5E',
                  selectedDayTextColor: '#FFF',
                  todayTextColor: '#FF3A5E',
                  dayTextColor: '#FFF',
                  textDisabledColor: '#666',
                  arrowColor: '#FF3A5E',
                  monthTextColor: '#FFF'
                }}
              />

              {/* Filtro por ubicación */}
              <Text style={styles.filterLabel}>Ubicación</Text>
              <View style={styles.locationsContainer}>
                {locations.map(loc => (
                  <TouchableOpacity
                    key={loc.id}
                    style={[
                      styles.locationChip,
                      location === loc.id && styles.selectedLocationChip
                    ]}
                    onPress={() => setLocation(
                      location === loc.id ? '' : loc.id
                    )}
                  >
                    <Text style={[
                      styles.locationChipText,
                      location === loc.id && styles.selectedLocationChipText
                    ]}>
                      {loc.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingTop: Platform.OS === 'ios' ? 50 : 0, // Añadir padding en iOS para evitar el notch
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#2C2C2C',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#222',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FF3A5E',
  },
  categoriesContainer: {
    backgroundColor: '#222',
    paddingVertical: 12,
  },
  categoryChip: {
    backgroundColor: '#3E3E3E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    minWidth: 80,
  },
  selectedCategoryChip: {
    backgroundColor: '#FF3A5E',
  },
  categoryChipText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedCategoryChipText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  appliedFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#222',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  appliedFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3A5E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  appliedFilterText: {
    color: '#FFF',
    fontSize: 12,
    marginRight: 4,
  },
  clearAllFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  clearAllFiltersText: {
    color: '#FFF',
    fontSize: 12,
  },
  eventList: {
    flex: 1,
  },
  eventListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noEventsTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noEventsText: {
    color: '#95A5A6',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2C2C2C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
    maxHeight: '70%',
  },
  filterLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  calendar: {
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#333',
  },
  locationsContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  locationChip: {
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLocationChip: {
    backgroundColor: '#FF3A5E',
  },
  locationChipText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedLocationChipText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  clearButton: {
    backgroundColor: '#333',
    borderRadius: 25,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#FF3A5E',
    borderRadius: 25,
    padding: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventCategory: {
    backgroundColor: '#FF3A5E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eventCategoryText: {
    color: '#FFF',
    fontSize: 12,
  },
  eventInfo: {
    marginTop: 16,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventInfoText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 8,
  },
  eventFooter: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#95A5A6',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default EventSearch;
