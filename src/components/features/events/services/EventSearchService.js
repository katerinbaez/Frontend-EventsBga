/**
 * Este archivo maneja el servicio de búsqueda de eventos
 * - API
 * - Búsqueda
 * - Filtros
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';


export const searchEvents = async ({ 
  searchQuery, 
  selectedCategory, 
  startDate, 
  endDate, 
  location,
  categories
}) => {
  try {
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
    
    if (selectedCategory && categories.length > 0) {
      console.log('Filtrando eventos por categoría:', selectedCategory);
      
      const selectedCat = categories.find(c => (c.id || c._id || c.nombre) === selectedCategory);
      const categoryName = selectedCat ? selectedCat.nombre : selectedCategory;
      console.log('Nombre de la categoría seleccionada:', categoryName);
      
      const filteredEvents = allEvents.filter(event => {
        if (!event.categoria && !event.category) {
          return false;
        }
        
        const eventCategory = event.categoria || event.category;
        
        if (typeof eventCategory === 'object') {
          return (eventCategory.id === selectedCategory || 
                 eventCategory._id === selectedCategory || 
                 eventCategory.nombre === categoryName);
        } else {
          return (eventCategory === selectedCategory || 
                 eventCategory === categoryName);
        }
      });
      
      console.log('Eventos filtrados por categoría:', filteredEvents.length);
      return filteredEvents;
    } else {
      return allEvents;
    }
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/categories`);
    const validCategories = response.data.map(cat => ({
      ...cat,
      id: cat.id || cat._id || cat.nombre
    }));
    console.log('Categorías cargadas:', validCategories);
    return validCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchLocations = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.success && Array.isArray(response.data.spaces)) {
      return response.data.spaces;
    }
    return [];
  } catch (error) {
    console.error('Error al cargar ubicaciones:', error);
    throw error;
  }
};
