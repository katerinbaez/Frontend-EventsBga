/**
 * Configuración de Babel para transpilación
 * - Babel
 * - Presets
 * - Plugins
 * - Aliases
 * - Rutas
 */

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
    ],
  };
};
