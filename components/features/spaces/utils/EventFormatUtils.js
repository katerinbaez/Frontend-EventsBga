// Función para obtener el color de una categoría
export const getCategoryColor = (categoryId, categories) => {
  if (!categoryId) return '#FF3A5E'; // Color por defecto
  
  // Buscar la categoría por ID
  const category = categories.find(cat => cat.id === categoryId);
  
  // Si no se encuentra, devolver color por defecto
  if (!category) return '#FF3A5E';
  
  // Devolver el color de la categoría o el color por defecto
  return category.color || '#FF3A5E';
};

// Función para obtener el nombre de una categoría
export const getCategoryName = (categoryId, categories) => {
  if (!categoryId) return 'General';
  
  // Intentar buscar por ID (número o string)
  let category = categories.find(cat => 
    cat.id === categoryId || 
    cat.id === Number(categoryId) || 
    cat.id === String(categoryId)
  );
  
  // Si no se encuentra por ID, intentar buscar por nombre
  if (!category) {
    category = categories.find(cat => cat.nombre === categoryId);
  }
  
  // Si todavía no se encuentra, intentar buscar por coincidencia parcial
  if (!category && typeof categoryId === 'string') {
    category = categories.find(cat => 
      cat.nombre && cat.nombre.toLowerCase().includes(categoryId.toLowerCase())
    );
  }
  
  // Si no se encuentra, devolver nombre por defecto
  return category ? category.nombre : categoryId || 'General';
};
