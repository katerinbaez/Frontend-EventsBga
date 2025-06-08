/**
 * Configuración de Metro bundler para Expo
 * - Metro
 * - Bundler
 * - Resolución
 * - Módulos
 * - Transformación
 * - Rendimiento
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json'];
config.resolver.assetExts = ['ttf', 'woff', 'woff2', 'eot', 'svg', 'png', 'jpg', 'jpeg', 'gif'];

config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
};
config.resolver.symlinks = true;

config.maxWorkers = 4;
config.transformer.workerThreads = 4;
config.transformer.minifierConfig = {
  compress: {
    drop_console: false,
  },
};

module.exports = config;
