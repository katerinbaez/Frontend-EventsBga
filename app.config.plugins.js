/**
 * Configuración de plugins y SDK para Android
 * - Plugins
 * - Android
 * - SDK
 * - Configuración
 * - Versiones
 */

const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = config => {
  config = withAndroidManifest(config, async config => {
    if (!config.modResults.manifest.$['android:compileSdkVersion']) {
      config.modResults.manifest.$['android:compileSdkVersion'] = '35';
    }
    
    if (!config.modResults.manifest.$['android:targetSdkVersion']) {
      config.modResults.manifest.$['android:targetSdkVersion'] = '34';
    }
    
    return config;
  });

  return config;
};
