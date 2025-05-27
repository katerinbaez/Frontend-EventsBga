const fs = require('fs');
const path = require('path');

// Archivos que necesitan ser modificados
const filesToFix = [
  path.join(__dirname, 'app', '(tabs)', '_layout.tsx'),
  path.join(__dirname, 'app', '_layout.tsx')
];

// Función para reemplazar las importaciones con alias @ por rutas relativas
function fixImports(filePath) {
  console.warn(`Fixing imports in ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Determinar el nivel de profundidad para las rutas relativas
  const relativePath = path.relative(path.dirname(filePath), __dirname);
  const depth = relativePath.split(path.sep).length;
  const prefix = '../'.repeat(depth - 1);
  
  // Reemplazar importaciones con alias @ por rutas relativas
  content = content.replace(/@\/components\//g, `${prefix}components/`);
  content = content.replace(/@\/constants\//g, `${prefix}constants/`);
  content = content.replace(/@\/hooks\//g, `${prefix}hooks/`);
  content = content.replace(/@\/assets\//g, `${prefix}assets/`);
  content = content.replace(/@\/utils\//g, `${prefix}utils/`);
  
  // Guardar el archivo modificado
  fs.writeFileSync(filePath, content, 'utf8');
  console.warn(`Fixed imports in ${filePath}`);
}

// Ejecutar la función para cada archivo
filesToFix.forEach(fixImports);

console.warn('All imports fixed successfully!');
