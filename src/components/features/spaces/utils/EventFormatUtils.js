/**
 * Este archivo maneja las utilidades de formato de eventos
 * - UI
 * - Espacios
 * - Eventos
 * - Formato
 * - Utilidades
 */

export const getCategoryColor = (categoryId, categories) => {
  if (!categoryId) return '#FF3A5E';
  
  const category = categories.find(cat => cat.id === categoryId);
  
  if (!category) return '#FF3A5E';
  
  return category.color || '#FF3A5E';
};

export const getCategoryName = (categoryId, categories) => {
  if (!categoryId) return 'General';
  
  let category = categories.find(cat => 
    cat.id === categoryId || 
    cat.id === Number(categoryId) || 
    cat.id === String(categoryId)
  );
  
  if (!category) {
    category = categories.find(cat => cat.nombre === categoryId);
  }
  
  if (!category && typeof categoryId === 'string') {
    category = categories.find(cat => 
      cat.nombre && cat.nombre.toLowerCase().includes(categoryId.toLowerCase())
    );
  }
  
  return category ? category.nombre : categoryId || 'General';
};
