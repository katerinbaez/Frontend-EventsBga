import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

/**
 * Busca eventos según los parámetros proporcionados
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.searchQuery - Texto de búsqueda
 * @param {string} params.selectedCategory - Categoría seleccionada
 * @param {Date} params.startDate - Fecha de inicio
 * @param {Date} params.endDate - Fecha de fin
 * @param {string} params.location - ID de la ubicación
 * @param {Array} params.categories - Lista de categorías disponibles
 * @returns {Promise<Array>} Lista de eventos filtrados
 */
export const searchEvents = async ({ 
  searchQuery, 
  selectedCategory, 
  startDate, 
  endDate, 
  location,
  categories
}) => {
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
    if (selectedCategory && categories.length > 0) {
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
      return filteredEvents;
    } else {
      // Si no hay categoría seleccionada, mostrar todos los eventos
      return allEvents;
    }
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
};

/**
 * Obtiene las categorías disponibles
 * @returns {Promise<Array>} Lista de categorías
 */
export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/categories`);
    // Asegurarse de que cada categoría tenga un ID válido
    const validCategories = response.data.map(cat => ({
      ...cat,
      id: cat.id || cat._id || cat.nombre // Usar un ID alternativo si no existe
    }));
    console.log('Categorías cargadas:', validCategories);
    return validCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Obtiene las ubicaciones disponibles
 * @returns {Promise<Array>} Lista de ubicaciones
 */
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
