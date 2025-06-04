const config = {
  expo: {
    owner: "developerkate",
    name: "EventsBga",
    slug: "EventsBga",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1A0011"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.katerinbaez.EventsBga"
    },
    scheme: "myapp",
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.katerinbaez.EventsBga",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || "AIzaSyCMU89H8fISyKNOMSt2bSy0wtWdfFjs4Ag",
        },
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "INTERNET",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_NETWORK_STATE"
      ],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "myapp",
              host: "auth"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ],
      softwareKeyboardLayoutMode: "pan",
      allowBackup: true,
      buildToolsVersion: "34.0.0",
      gradlePluginVersion: "8.6.0",
      compileSdkVersion: 35,
      targetSdkVersion: 34,
      usesCleartextTraffic: false
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      router: {
        origin: false
      },
      "eas": {
        "projectId": "08ace7e4-1145-4097-9436-68b4ba1e5b0c"
      }
    },
    jsEngine: "hermes",
    plugins: [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0",
            "enableProguardInReleaseBuilds": true,
            "usesCleartextTraffic": false
          }
        }
      ]
    ]
  }
};

// Importar los archivos de configuración
const withPlugins = require('./app.config.plugins');
const withNetworkConfig = require('./app.config.network');

// Configuración específica para resolver el problema de alias @
module.exports = ({ config: _config }) => {
  // Asegúrate de que se utilice la configuración correcta
  let updatedConfig = {
    ...config,
    // Añadir configuración para resolver alias @
    hooks: {
      postPublish: [
        {
          file: "metro.config.js",
          config: {
            resolver: {
              extraNodeModules: {
                '@': __dirname,
              },
            },
          },
        },
      ],
    },
  };
  
  // Aplicar los plugins y configuraciones
  updatedConfig = withPlugins(updatedConfig);
  updatedConfig = withNetworkConfig(updatedConfig);
  
  return updatedConfig;
};
