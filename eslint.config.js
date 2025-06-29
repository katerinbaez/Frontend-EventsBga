/**
 * Configuración de ESLint para análisis estático
 * - ESLint
 * - Reglas
 * - Seguridad
 * - React
 * - React Native
 * - Testing
 */
const reactPlugin = require('eslint-plugin-react');
const reactNativePlugin = require('eslint-plugin-react-native');
const securityPlugin = require('eslint-plugin-security');

module.exports = [
  {
    files: ['**/*.{js,jsx}', 'app/**/*.{js,jsx}'],
    ignores: ['**/node_modules/**', '**/coverage/**'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        __DEV__: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    plugins: {
      react: reactPlugin,
      'react-native': reactNativePlugin,
      security: securityPlugin
    },
    rules: {
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',
      
      'react-native/no-unused-styles': 'error',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-raw-text': 'warn',
      
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
