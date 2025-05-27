const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = config => {
  // Configuración específica para Android
  config = withAndroidManifest(config, async config => {
    // Asegurarse de que estamos utilizando las versiones correctas del SDK
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
