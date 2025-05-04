// Script para eliminar funciones duplicadas en SpaceSchedule.js
const fs = require('fs');
const path = require('path');

// Leer el archivo original
const filePath = path.join(__dirname, 'components', 'SpaceSchedule.js');
let content = fs.readFileSync(filePath, 'utf8');

// Crear una copia de seguridad
fs.writeFileSync(filePath + '.backup', content, 'utf8');
console.log('Copia de seguridad creada: SpaceSchedule.js.backup');

// Funciones a buscar y eliminar duplicados
const functionsToCheck = [
  'handleUpdateAvailability',
  'debugBlockedSlots',
  'debugBlockedSlotsForDate',
  'initializeDefaultAvailability',
  'handleDaySelect'
];

// Encontrar la primera ocurrencia de cada función
const firstOccurrences = {};
functionsToCheck.forEach(funcName => {
  const regex = new RegExp(`const ${funcName} = \\([^)]*\\) => {`, 'g');
  const match = regex.exec(content);
  if (match) {
    firstOccurrences[funcName] = match.index;
    console.log(`Primera ocurrencia de ${funcName} encontrada en posición ${match.index}`);
  }
});

// Encontrar y eliminar las segundas ocurrencias
functionsToCheck.forEach(funcName => {
  if (firstOccurrences[funcName]) {
    // Buscar desde después de la primera ocurrencia
    const searchStart = firstOccurrences[funcName] + 1;
    const partToSearch = content.substring(searchStart);
    
    const regex = new RegExp(`const ${funcName} = \\([^)]*\\) => {`, 'g');
    const match = regex.exec(partToSearch);
    
    if (match) {
      const secondOccurrencePos = searchStart + match.index;
      console.log(`Segunda ocurrencia de ${funcName} encontrada en posición ${secondOccurrencePos}`);
      
      // Encontrar el final de la función (el cierre de llave correspondiente)
      let braceCount = 1;
      let endPos = secondOccurrencePos + match[0].length;
      
      while (braceCount > 0 && endPos < content.length) {
        if (content[endPos] === '{') braceCount++;
        if (content[endPos] === '}') braceCount--;
        endPos++;
      }
      
      if (braceCount === 0) {
        // Eliminar la función duplicada
        const beforeDuplicate = content.substring(0, secondOccurrencePos);
        const afterDuplicate = content.substring(endPos);
        content = beforeDuplicate + afterDuplicate;
        console.log(`Función duplicada ${funcName} eliminada`);
      } else {
        console.log(`No se pudo encontrar el final de la función ${funcName}`);
      }
    } else {
      console.log(`No se encontró una segunda ocurrencia de ${funcName}`);
    }
  }
});

// Guardar el archivo modificado
fs.writeFileSync(filePath, content, 'utf8');
console.log('Archivo actualizado: SpaceSchedule.js');
