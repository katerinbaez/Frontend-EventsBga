// Configuración específica para el manejo de red en la aplicación
module.exports = config => {
  // Asegurarse de que la aplicación esté configurada para manejar correctamente las conexiones HTTPS
  if (config.android) {
    // Asegurarse de que usesCleartextTraffic esté establecido en false para forzar conexiones HTTPS
    config.android.usesCleartextTraffic = false;
    
    // Asegurarse de que los permisos de red estén configurados correctamente
    if (!config.android.permissions) {
      config.android.permissions = [];
    }
    
    // Asegurarse de que INTERNET y ACCESS_NETWORK_STATE estén en los permisos
    const requiredPermissions = ["INTERNET", "ACCESS_NETWORK_STATE"];
    requiredPermissions.forEach(permission => {
      if (!config.android.permissions.includes(permission)) {
        config.android.permissions.push(permission);
      }
    });
  }
  
  // Configurar el plugin expo-build-properties para manejar correctamente las conexiones HTTPS
  if (config.plugins) {
    // Buscar el plugin expo-build-properties
    for (let i = 0; i < config.plugins.length; i++) {
      const plugin = config.plugins[i];
      
      // Verificar si es el plugin expo-build-properties
      if (Array.isArray(plugin) && 
          plugin.length > 0 && 
          plugin[0] === "expo-build-properties" &&
          plugin.length > 1) {
        
        // Acceder de manera segura a la configuración
        const pluginConfig = plugin[1];
        if (pluginConfig && Object.prototype.hasOwnProperty.call(pluginConfig, 'android')) {
          // Actualizar la configuración de manera segura usando Object.defineProperty
          if (Object.prototype.hasOwnProperty.call(pluginConfig.android, 'usesCleartextTraffic')) {
            Object.defineProperty(pluginConfig.android, 'usesCleartextTraffic', {
              value: false,
              writable: true,
              enumerable: true
            });
          } else {
            pluginConfig.android.usesCleartextTraffic = false;
          }
          
          if (Object.prototype.hasOwnProperty.call(pluginConfig.android, 'enableProguardInReleaseBuilds')) {
            Object.defineProperty(pluginConfig.android, 'enableProguardInReleaseBuilds', {
              value: true,
              writable: true,
              enumerable: true
            });
          } else {
            pluginConfig.android.enableProguardInReleaseBuilds = true;
          }
        }
      }
    }
  }
  
  return config;
};
