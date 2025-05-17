// Función para convertir el valor de la categoría a un texto más legible
export const getCategoryLabel = (category) => {
    const categoryLabels = {
      'musica': 'Música',
      'danza': 'Danza',
      'teatro': 'Teatro',
      'artes_visuales': 'Artes Visuales',
      'literatura': 'Literatura',
      'cine': 'Cine',
      'fotografia': 'Fotografía',
      'otro': 'Otro'
    };
    return categoryLabels[category] || (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'No especificada');
  };