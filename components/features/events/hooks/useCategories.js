import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { fetchCategories } from '../services/EventSearchService';

/**
 * Hook personalizado para gestionar las categorías
 */
const useCategories = () => {
  // Estados
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Cargar categorías al montar el componente
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
