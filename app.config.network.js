/**
 * Configuración de red para conexiones HTTPS
 * - Red
 * - HTTPS
 * - Permisos
 * - Android
 * - Seguridad
 */

module.exports = config => {
  if (config.android) {
    config.android.usesCleartextTraffic = false;
    
    if (!config.android.permissions) {
      config.android.permissions = [];
    }
    
    const requiredPermissions = ["INTERNET", "ACCESS_NETWORK_STATE"];
    requiredPermissions.forEach(permission => {
      if (!config.android.permissions.includes(permission)) {
        config.android.permissions.push(permission);
      }
    });
  }
  
  if (config.plugins) {
    for (let i = 0; i < config.plugins.length; i++) {
      const plugin = config.plugins[i];
      
      if (Array.isArray(plugin) && 
          plugin.length > 0 && 
          plugin[0] === "expo-build-properties" &&
          plugin.length > 1) {
        
        const pluginConfig = plugin[1];
        if (pluginConfig && Object.prototype.hasOwnProperty.call(pluginConfig, 'android')) {
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
