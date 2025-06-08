/**
 * Este archivo maneja el hook personalizado para eventos
 * - Estado
 * - Carga
 * - Filtrado
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

const useEvents = (categories, externalSelectedCategory) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(externalSelectedCategory || '');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [location, setLocation] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  const searchEvents = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Buscando eventos con filtros:', {
        searchQuery,
        selectedCategory,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        location
      });
      
      const params = {};
      
      if (searchQuery) {
        params.query = searchQuery;
      }
      
      if (startDate) {
        const dateString = startDate.toISOString().split('T')[0];
        params.fechaInicio = dateString;
        console.log('Fecha inicio (parámetro):', params.fechaInicio);
        console.log('Día del mes (inicio):', new Date(dateString).getUTCDate());
      }
      
      if (endDate) {
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
      
      allEvents.sort((a, b) => {
        const dateA = new Date(a.fechaProgramada || a.fechaInicio || a.fecha || 0);
        const dateB = new Date(b.fechaProgramada || b.fechaInicio || b.fecha || 0);
        
        return dateB - dateA;
      });
      
      console.log('Eventos ordenados de más recientes a más antiguos');
      
      console.log(`Se encontraron ${allEvents.length} eventos en total`);
      
      if (selectedCategory) {
        console.log('Filtrando por categoría:', selectedCategory);
        
        let categoryName = selectedCategory;
        if (categories && Array.isArray(categories) && categories.length > 0) {
          const category = categories.find(cat => 
            cat && (cat.id === selectedCategory || 
            cat._id === selectedCategory || 
            cat.nombre === selectedCategory)
          );
          
          if (category) {
            categoryName = category.nombre;
          }
        }
        
        const filteredEvents = allEvents.filter(event => {
          const eventCategory = event.categoria || event.category;
          if (!eventCategory) return false;
          
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
        allEvents = filteredEvents;
      }
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Error searching events:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory, startDate, endDate, location, categories]);
  
  useEffect(() => {
    if (externalSelectedCategory !== undefined && externalSelectedCategory !== selectedCategory) {
      setSelectedCategory(externalSelectedCategory);
    }
  }, [externalSelectedCategory]);
  
  useEffect(() => {
    searchEvents();
  }, [searchEvents]);
  
  const refreshEvents = useCallback(() => {
    setRefreshing(true);
    searchEvents();
  }, [searchEvents]);
  
  const applyFilters = useCallback(() => {
    setFiltersApplied(true);
    searchEvents();
  }, [searchEvents]);
  
  const clearFilters = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setLocation('');
    setSelectedCategory('');
    setFiltersApplied(false);
    searchEvents();
  }, [searchEvents]);
  
  return {
    events,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    location,
    setLocation,
    filtersApplied,
    refreshEvents,
    applyFilters,
    clearFilters
  };
};

export default useEvents;
