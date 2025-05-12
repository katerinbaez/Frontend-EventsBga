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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/config';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../../context/AuthContext';

const EventSearch = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  
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
    loadFavorites(); // Cargar favoritos iniciales
  }, []); // Dependencia vacía para que solo se ejecute al montar el componente
  
  // Función para cargar los favoritos del usuario
  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      setLoadingFavorites(true);
      const userId = user.id || user.sub || user._id;
      
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        params: {
          userId: userId,
          targetType: 'event'
        }
      });
      
      if (Array.isArray(response.data)) {
        // Extraer los IDs de los eventos favoritos
        const favoriteIds = response.data.map(fav => fav.targetId);
        console.log('Eventos favoritos cargados:', favoriteIds);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    // Ejecutar búsqueda cada vez que cambie la categoría seleccionada
    searchEvents();
    console.log('Categoría cambiada a:', selectedCategory);
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
      // Asegurarse de que cada categoría tenga un ID válido
      const validCategories = response.data.map(cat => ({
        ...cat,
        id: cat.id || cat._id || cat.nombre // Usar un ID alternativo si no existe
      }));
      console.log('Categorías cargadas:', validCategories);
      setCategories(validCategories);
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
      // Primero, obtener todos los eventos sin filtro de categoría
      const params = {};
      
      if (searchQuery) {
        params.query = searchQuery;
      }
      
      // Ajustar las fechas para evitar problemas de zona horaria
      if (startDate) {
        // Usar directamente el formato YYYY-MM-DD sin ajustes adicionales
        const dateString = startDate.toISOString().split('T')[0];
        params.fechaInicio = dateString;
        console.log('Fecha inicio (parámetro):', params.fechaInicio);
        console.log('Día del mes (inicio):', new Date(dateString).getUTCDate());
      }
      
      if (endDate) {
        // Usar directamente el formato YYYY-MM-DD sin ajustes adicionales
        const dateString = endDate.toISOString().split('T')[0];
        params.fechaFin = dateString;
        console.log('Fecha fin (parámetro):', params.fechaFin);
        console.log('Día del mes (fin):', new Date(dateString).getUTCDate());
      }
      
      if (location) {
        params.espacioId = location;
      }
      
      console.log('Parámetros de búsqueda:', JSON.stringify(params));
      const response = await axios.get(`${BACKEND_URL}/api/events/dashboard/search`, { params });
      
      let allEvents = [];
      
      // Verificar la estructura de la respuesta
      if (Array.isArray(response.data)) {
        allEvents = response.data;
        console.log('Eventos encontrados (total):', allEvents.length);
      } else if (response.data && Array.isArray(response.data.events)) {
        allEvents = response.data.events;
        console.log('Eventos encontrados (total):', allEvents.length);
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        allEvents = [];
      }
      
      // Ordenar todos los eventos por fecha (más recientes primero)
      allEvents.sort((a, b) => {
        // Obtener las fechas de los eventos, considerando diferentes formatos posibles
        const dateA = new Date(a.fechaProgramada || a.fechaInicio || a.fecha || 0);
        const dateB = new Date(b.fechaProgramada || b.fechaInicio || b.fecha || 0);
        
        // Ordenar de más reciente a más antiguo
        return dateB - dateA;
      });
      
      console.log('Eventos ordenados de más recientes a más antiguos');
      
      // Ahora, filtrar los eventos por categoría si hay una categoría seleccionada
      if (selectedCategory) {
        console.log('Filtrando eventos por categoría:', selectedCategory);
        
        // Buscar el nombre de la categoría seleccionada
        const selectedCat = categories.find(c => (c.id || c._id || c.nombre) === selectedCategory);
        const categoryName = selectedCat ? selectedCat.nombre : selectedCategory;
        console.log('Nombre de la categoría seleccionada:', categoryName);
        
        // Filtrar los eventos que coincidan con la categoría seleccionada
        // Intentar coincidir tanto por ID como por nombre de categoría
        const filteredEvents = allEvents.filter(event => {
          // Verificar si el evento tiene una propiedad de categoría
          if (!event.categoria && !event.category) {
            return false;
          }
          
          // Obtener la categoría del evento (puede estar en diferentes propiedades)
          const eventCategory = event.categoria || event.category;
          
          // La categoría puede ser un objeto o un string
          if (typeof eventCategory === 'object') {
            return (eventCategory.id === selectedCategory || 
                   eventCategory._id === selectedCategory || 
                   eventCategory.nombre === categoryName);
          } else {
            // Si es un string, puede ser el ID o el nombre
            return (eventCategory === selectedCategory || 
                   eventCategory === categoryName);
          }
        });
        
        console.log('Eventos filtrados por categoría:', filteredEvents.length);
        setEvents(filteredEvents);
      } else {
        // Si no hay categoría seleccionada, mostrar todos los eventos
        setEvents(allEvents);
      }
    } catch (error) {
      console.error('Error searching events:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  // Función para ajustar la fecha y asegurar que se use el día correcto
  const adjustDateForTimezone = (date) => {
    if (!date) return null;
    
    // Crear una nueva fecha usando el formato YYYY-MM-DD para evitar problemas de zona horaria
    const dateString = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    console.log('Fecha original:', dateString);
    
    // Crear una nueva fecha con la hora establecida a mediodía en UTC
    const adjustedDate = new Date(`${dateString}T12:00:00Z`);
    console.log('Fecha ajustada:', adjustedDate.toISOString());
    
    return adjustedDate;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
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

  // Función para verificar si un evento ha terminado (fecha vencida)
  const isEventExpired = (event) => {
    if (!event.fechaFin) {
      // Si no hay fecha de fin, verificamos si la fecha de inicio ya pasó
      return new Date(event.fechaInicio) < new Date();
    }
    // Si hay fecha de fin, verificamos si ya pasó
    return new Date(event.fechaFin) < new Date();
  };

  // Función para manejar la selección de categoría
  const handleCategorySelect = (categoryId) => {
    console.log('Seleccionando categoría con ID:', categoryId);
    setSelectedCategory(selectedCategory === categoryId ? '' : categoryId);
    // No llamamos a searchEvents() aquí porque el useEffect se encargará de eso
  };

  // Función para renderizar un chip de categoría
  const renderCategoryChip = (category) => {
    // Asegurarse de que la categoría tenga un ID válido
    const categoryId = category.id || category._id || category.nombre;
    
    return (
      <TouchableOpacity
        key={categoryId || 'category-' + Math.random()}
        style={[
          styles.categoryChip,
          selectedCategory === categoryId && styles.selectedCategoryChip
        ]}
        onPress={() => handleCategorySelect(categoryId)}
      >
        <Text style={[
          styles.categoryChipText,
          selectedCategory === categoryId && styles.selectedCategoryChipText
        ]}>
          {category.nombre}
        </Text>
      </TouchableOpacity>
    );
  };

  // Función para marcar/desmarcar favoritos
  const toggleFavorite = async (event) => {
    try {
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para agregar eventos a favoritos');
        return;
      }
      
      const eventId = String(event.id);
      const isFavorite = favorites.includes(eventId);
      const userId = user.id || user.sub || user._id;
      
      // Actualizar el estado de favoritos inmediatamente para una respuesta UI más rápida
      if (isFavorite) {
        // Eliminar de favoritos localmente primero
        setFavorites(prevFavorites => prevFavorites.filter(id => id !== eventId));
      } else {
        // Agregar a favoritos localmente primero
        setFavorites(prevFavorites => [...prevFavorites, eventId]);
      }
      
      try {
        if (isFavorite) {
          // Eliminar de favoritos en el servidor
          const response = await axios.delete(`${BACKEND_URL}/api/favorites`, {
            data: { 
              userId: userId,
              targetType: 'event',
              targetId: eventId 
            }
          });
          console.log('Respuesta al eliminar favorito:', response.data);
          // No mostrar alerta para no interrumpir la experiencia del usuario
        } else {
          // Agregar a favoritos en el servidor
          const response = await axios.post(`${BACKEND_URL}/api/favorites`, {
            userId: userId,
            targetType: 'event',
            targetId: eventId
          });
          console.log('Respuesta al agregar favorito:', response.data);
          // No mostrar alerta para no interrumpir la experiencia del usuario
        }
        
        // Recargar los favoritos para asegurarse de que estén actualizados
        await loadFavorites();
      } catch (serverError) {
        // Si hay un error en el servidor, revertir el cambio local
        console.error('Error en el servidor:', serverError);
        
        if (isFavorite) {
          // Restaurar como favorito si falló al eliminar
          setFavorites(prevFavorites => [...prevFavorites, eventId]);
        } else {
          // Quitar de favoritos si falló al agregar
          setFavorites(prevFavorites => prevFavorites.filter(id => id !== eventId));
        }
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      Alert.alert('Error', 'No se pudo actualizar tus favoritos. Por favor, intenta de nuevo más tarde.');
    }
  };

  const renderEventItem = ({ item }) => {
    const eventId = String(item.id);
    const isFavorite = favorites.includes(eventId);
    const isExpired = isEventExpired(item);
    
    return (
      <View style={[
        styles.eventCard, 
        isExpired ? styles.expiredEventCard : {}
      ]}>
        <TouchableOpacity
          style={styles.eventCardContent}
          onPress={() => {
            // Navegar a la pantalla de detalles con el ID del evento
            console.log('Navegando a detalles del evento:', item.id);
            console.log('Tipo de ID:', typeof item.id);
            
            // Verificar si estamos en desarrollo o producción
            if (__DEV__) {
              console.log('Datos completos del evento:', JSON.stringify(item, null, 2));
            }
            
            // Usar el ID del evento para la navegación
            navigation.navigate('EventDetails', { eventId });
          }}
        >
          <View style={styles.eventHeader}>
            <Text style={[
              styles.eventTitle,
              isExpired ? styles.expiredEventText : {}
            ]}>
              {item.titulo || 'Evento sin título'}
            </Text>
            <View style={[
              styles.eventCategory,
              isExpired ? styles.expiredEventCategory : {}
            ]}>
              {isExpired ? (
                <Text style={styles.expiredEventCategoryText}>Terminado</Text>
              ) : (
                <Text style={styles.eventCategoryText}>{item.categoria || 'Sin categoría'}</Text>
              )}
            </View>
          </View>

          <View style={styles.eventInfo}>
            <View style={styles.eventInfoItem}>
              <Ionicons name="calendar" size={16} color={isExpired ? "#A0A0A0" : "#7F8C8D"} />
              <Text style={[
                styles.eventInfoText,
                isExpired ? styles.expiredEventText : {}
              ]}>
                {formatDate(item.fechaInicio)}
              </Text>
            </View>

            <View style={styles.eventInfoItem}>
              <Ionicons name="time" size={16} color={isExpired ? "#A0A0A0" : "#7F8C8D"} />
              <Text style={[
                styles.eventInfoText,
                isExpired ? styles.expiredEventText : {}
              ]}>
                {formatTime(item.fechaInicio)}
              </Text>
            </View>

            <View style={styles.eventInfoItem}>
              <Ionicons name="location" size={16} color={isExpired ? "#A0A0A0" : "#7F8C8D"} />
              <Text style={[
                styles.eventInfoText,
                isExpired ? styles.expiredEventText : {}
              ]}>
                {item.space?.nombre || 'Espacio por confirmar'}
              </Text>
            </View>
          </View>

          <View style={styles.eventFooter}>
            <View style={styles.eventInfoItem}>
              <Ionicons name="person" size={16} color={isExpired ? "#A0A0A0" : "#7F8C8D"} />
              <Text style={[
                styles.eventInfoText,
                isExpired ? styles.expiredEventText : {}
              ]}>
                {item.isEventRequest 
                  ? (item.artist?.nombreArtistico || 'Artista por confirmar')
                  : (item.space?.nombre || 'Espacio por confirmar')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Botón de favorito */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#FF3A5E" : (isExpired ? "#C0C0C0" : "#95A5A6")}
          />
        </TouchableOpacity>
      </View>
    );
  };

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
      <StatusBar backgroundColor="#1A1A1A" barStyle="light-content" />
      
      {/* Encabezado personalizado mejorado */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buscar Eventos</Text>
          <View style={styles.headerRight}>
            {/* Espacio para mantener el título centrado */}
            <View style={{width: 24}} />
          </View>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#95A5A6" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos..."
            placeholderTextColor="#95A5A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
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
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContentContainer}
      >
        {/* Categoría "Todo" */}
        <TouchableOpacity
          key="all"
          style={[
            styles.categoryChip,
            selectedCategory === '' && styles.selectedCategoryChip
          ]}
          onPress={() => handleCategorySelect('')}
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
          {selectedCategory && categories.find(c => (c.id || c._id || c.nombre) === selectedCategory) && (
            <View style={styles.appliedFilterChip}>
              <Text style={styles.appliedFilterText}>
                Categoría: {categories.find(c => (c.id || c._id || c.nombre) === selectedCategory).nombre}
              </Text>
              <TouchableOpacity onPress={() => handleCategorySelect('')}>
                <Ionicons name="close-circle" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
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
                onDayPress={(day) => {
                  console.log('Día seleccionado (calendario):', day.dateString);
                  
                  // Crear la fecha directamente del string YYYY-MM-DD sin conversión de zona horaria
                  const [year, month, dayOfMonth] = day.dateString.split('-').map(Number);
                  // Crear fecha con año, mes (0-11), día, y hora fija (mediodía UTC)
                  const selectedDate = new Date(Date.UTC(year, month - 1, dayOfMonth, 12, 0, 0));
                  
                  console.log('Fecha seleccionada (inicio):', selectedDate.toISOString());
                  console.log('Día del mes seleccionado:', selectedDate.getUTCDate());
                  
                  setStartDate(selectedDate);
                }}
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
                onDayPress={(day) => {
                  console.log('Día seleccionado (calendario):', day.dateString);
                  
                  // Crear la fecha directamente del string YYYY-MM-DD sin conversión de zona horaria
                  const [year, month, dayOfMonth] = day.dateString.split('-').map(Number);
                  // Crear fecha con año, mes (0-11), día, y hora fija (mediodía UTC)
                  const selectedDate = new Date(Date.UTC(year, month - 1, dayOfMonth, 12, 0, 0));
                  
                  console.log('Fecha seleccionada (fin):', selectedDate.toISOString());
                  console.log('Día del mes seleccionado:', selectedDate.getUTCDate());
                  
                  setEndDate(selectedDate);
                }}
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
    backgroundColor: '#1A1A1A',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FF3A5E',
  },
  categoriesContainer: {
    marginTop: 10,
    marginBottom: 10,
    maxHeight: 40,
  },
  categoriesContentContainer: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: '#2C2C2C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3E3E3E',
    height: 32,
    justifyContent: 'center',
  },
  selectedCategoryChip: {
    backgroundColor: '#FF3A5E',
    borderColor: '#FF3A5E',
  },
  categoryChipText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#FFF',
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
    padding: 15,
  },
  categoriesContentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
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
    position: 'relative',
  },
  eventCardContent: {
    flex: 1,
    marginRight: 30, // Espacio para el botón de favorito
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
  // Estilos para eventos expirados
  expiredEventCard: {
    opacity: 0.8,
    borderColor: '#D0D0D0',
  },
  expiredEventText: {
    color: '#A0A0A0',
  },
  expiredEventCategory: {
    backgroundColor: '#D0D0D0',
  },
  expiredEventCategoryText: {
    color: '#505050',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default EventSearch;
