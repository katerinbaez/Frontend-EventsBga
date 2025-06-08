/**
 * Runner de pruebas de seguridad
 * - Seguridad
 * - Pruebas
 * - Consola
 * - Colores
 * - Ejecución
 * - Script
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m'
  }
};

function runCommand(command, description) {
  console.log(`\n${colors.fg.cyan}${colors.bright}=== ${description} ===${colors.reset}\n`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    console.log(`\n${colors.fg.green}✓ Prueba completada con éxito${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`\n${colors.fg.red}✗ Error en la prueba: ${error.message}${colors.reset}\n`);
    return false;
  }
}

function waitForUserInput(prompt) {
  return new Promise((resolve) => {
    console.log(`\n${colors.fg.yellow}${prompt} (Presiona Enter para continuar)${colors.reset}`);
    process.stdin.once('data', () => {
      resolve();
    });
  });
}

async function runSecurityTests() {
  console.log(`\n${colors.fg.magenta}${colors.bright}========================================${colors.reset}`);
  console.log(`${colors.fg.magenta}${colors.bright}   PRUEBAS DE SEGURIDAD PARA EVENTSBGA   ${colors.reset}`);
  console.log(`${colors.fg.magenta}${colors.bright}========================================${colors.reset}\n`);
  
  console.log(`${colors.fg.white}Este script ejecutará una serie de pruebas de seguridad para la aplicación EventsBga.${colors.reset}`);
  console.log(`${colors.fg.white}Las pruebas se ejecutarán paso a paso, permitiéndote revisar los resultados antes de continuar.${colors.reset}\n`);
  
  await waitForUserInput('¿Listo para comenzar las pruebas de seguridad del frontend?');
  
  console.log(`\n${colors.fg.cyan}${colors.bright}PASO 1: Verificación de dependencias${colors.reset}`);
  const auditSuccess = runCommand('npm audit', 'Verificando vulnerabilidades en dependencias');
  
  if (!auditSuccess) {
    console.log(`\n${colors.fg.yellow}Se encontraron vulnerabilidades en las dependencias. Se recomienda actualizar los paquetes afectados.${colors.reset}`);
    await waitForUserInput('¿Deseas continuar con las pruebas a pesar de las vulnerabilidades?');
  }
  
  console.log(`\n${colors.fg.cyan}${colors.bright}PASO 2: Pruebas de autenticación${colors.reset}`);
  await waitForUserInput('¿Listo para ejecutar las pruebas de autenticación?');
  
  runCommand('npx jest --config=jest.config.js --testMatch="**/__tests__/security/auth0.security.test.js"', 'Ejecutando pruebas de autenticación con Auth0');
  
  console.log(`\n${colors.fg.cyan}${colors.bright}PASO 3: Pruebas de seguridad de datos${colors.reset}`);
  await waitForUserInput('¿Listo para ejecutar las pruebas de seguridad de datos?');
  
  runCommand('npx jest --config=jest.config.js --testMatch="**/__tests__/security/data.security.test.js"', 'Ejecutando pruebas de seguridad de datos');
  
  console.log(`\n${colors.fg.cyan}${colors.bright}PASO 4: Análisis estático de código${colors.reset}`);
  await waitForUserInput('¿Listo para ejecutar el análisis estático de código?');
  
  console.log(`\n${colors.fg.yellow}Este análisis identificará posibles vulnerabilidades como:${colors.reset}`);
  console.log(`${colors.fg.white}- Uso inseguro de eval y funciones similares${colors.reset}`);
  console.log(`${colors.fg.white}- Expresiones regulares potencialmente vulnerables${colors.reset}`);
  console.log(`${colors.fg.white}- Posibles inyecciones de objetos${colors.reset}`);
  console.log(`${colors.fg.white}- Problemas con CSRF y XSS${colors.reset}\n`);
  
  runCommand('npx eslint --config eslint.config.js App.js __tests__/security/ --ext .js,.jsx', 'Ejecutando análisis estático con ESLint');
  
  console.log(`\n${colors.fg.cyan}${colors.bright}PASO 5: Pruebas de integración Frontend-Backend${colors.reset}`);
  await waitForUserInput('¿Listo para ejecutar las pruebas de integración?');
  
  runCommand('npx jest --config=jest.config.js --testMatch="**/__tests__/security/integration.security.test.js"', 'Ejecutando pruebas de integración Frontend-Backend');
  
  console.log(`\n${colors.fg.cyan}${colors.bright}PASO 6: Pruebas de seguridad en la red${colors.reset}`);
  await waitForUserInput('¿Listo para ejecutar las pruebas de seguridad en la red?');
  
  runCommand('npx jest --config=jest.config.js --testMatch="**/__tests__/security/network.security.test.js"', 'Ejecutando pruebas de seguridad en la red');
  
  console.log(`\n${colors.fg.magenta}${colors.bright}========================================${colors.reset}`);
  console.log(`${colors.fg.magenta}${colors.bright}   RESUMEN DE PRUEBAS DE SEGURIDAD   ${colors.reset}`);
  console.log(`${colors.fg.magenta}${colors.bright}========================================${colors.reset}\n`);
  
  console.log(`${colors.fg.white}Se han completado todas las pruebas de seguridad para el frontend.${colors.reset}`);
  console.log(`${colors.fg.white}Revisa los resultados para identificar posibles vulnerabilidades y áreas de mejora.${colors.reset}\n`);
  
  console.log(`${colors.fg.yellow}Próximos pasos recomendados:${colors.reset}`);
  console.log(`${colors.fg.white}1. Corregir cualquier vulnerabilidad identificada en las dependencias.${colors.reset}`);
  console.log(`${colors.fg.white}2. Resolver problemas identificados en el análisis estático de código.${colors.reset}`);
  console.log(`${colors.fg.white}3. Mejorar la integración entre frontend y backend según los resultados de las pruebas.${colors.reset}`);
  console.log(`${colors.fg.white}4. Implementar pruebas de seguridad en la red (rate limiting, encabezados de seguridad).${colors.reset}`);
  console.log(`${colors.fg.white}5. Reforzar la protección contra XSS y la validación de datos.${colors.reset}\n`);
  
  await waitForUserInput('Presiona Enter para finalizar');
  
  console.log(`\n${colors.fg.green}${colors.bright}¡Pruebas de seguridad completadas!${colors.reset}\n`);
}

runSecurityTests().catch(console.error);
