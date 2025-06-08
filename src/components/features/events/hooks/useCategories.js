/**
 * Este archivo maneja el hook personalizado para categorías
 * - Estado
 * - Carga
 * - Selección
 */

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { fetchCategories } from '../services/EventSearchService';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'No se pudieron cargar las categorías');
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);
  
  return {
    categories,
    loading,
    selectedCategory,
    setSelectedCategory
  };
};

export default useCategories;
