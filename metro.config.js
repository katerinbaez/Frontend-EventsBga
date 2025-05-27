// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for "Unable to resolve module" errors
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json'];
config.resolver.assetExts = ['ttf', 'woff', 'woff2', 'eot', 'svg', 'png', 'jpg', 'jpeg', 'gif'];

// Configure module resolution for @ alias
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
};

// Support symlinks (important for monorepos)
config.resolver.symlinks = true;

// Increase the max workers
config.maxWorkers = 4;

// Increase the CPU and heap memory
config.transformer.workerThreads = 4;
config.transformer.minifierConfig = {
  compress: {
    drop_console: false,
  },
};

module.exports = config;
