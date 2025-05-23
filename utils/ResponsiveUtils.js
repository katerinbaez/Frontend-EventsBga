import { Dimensions, PixelRatio, Platform } from 'react-native';
import { scale, verticalScale as rvScale, moderateScale as rmScale } from 'react-native-size-matters';

// Obtener dimensiones de la pantalla
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions donde se diseñó la aplicación (iPhone 11)
const baseWidth = 375;
const baseHeight = 812;

/**
 * Escala un valor de acuerdo al ancho de la pantalla
 * @param {number} size - Tamaño a escalar
 * @returns {number} - Tamaño escalado
 */
export const horizontalScale = (size) => {
  return scale(size);
};

/**
 * Escala un valor de acuerdo al alto de la pantalla
 * @param {number} size - Tamaño a escalar
 * @returns {number} - Tamaño escalado
 */
export const verticalScale = (size) => {
  return rvScale(size);
};

/**
 * Escala moderada que evita que los elementos sean demasiado grandes en tablets
 * @param {number} size - Tamaño a escalar
 * @param {number} factor - Factor de escala (por defecto 0.5)
 * @returns {number} - Tamaño escalado
 */
export const moderateScale = (size, factor = 0.5) => {
  return rmScale(size, factor);
};

/**
 * Obtiene el tamaño de fuente adaptado a la pantalla
 * @param {number} fontSize - Tamaño base de la fuente
 * @returns {number} - Tamaño de fuente adaptado
 */
export const adaptiveFontSize = (fontSize) => {
  return rmScale(fontSize, 0.3); // Factor más bajo para fuentes
};

/**
 * Devuelve dimensiones responsivas para diferentes tamaños de pantalla
 */
export const getResponsiveDimensions = () => {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmallDevice: SCREEN_WIDTH < 375,
    isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
    isLargeDevice: SCREEN_WIDTH >= 414,
    isTablet: SCREEN_WIDTH >= 768,
  };
};

/**
 * Ajusta el padding y márgenes para diferentes tamaños de pantalla
 */
export const getResponsiveSpacing = () => {
  const { isSmallDevice, isMediumDevice, isLargeDevice, isTablet } = getResponsiveDimensions();
  
  return {
    tiny: rmScale(isSmallDevice ? 4 : isMediumDevice ? 6 : isLargeDevice ? 8 : 12),
    small: rmScale(isSmallDevice ? 8 : isMediumDevice ? 12 : isLargeDevice ? 16 : 20),
    medium: rmScale(isSmallDevice ? 16 : isMediumDevice ? 20 : isLargeDevice ? 24 : 32),
    large: rmScale(isSmallDevice ? 24 : isMediumDevice ? 32 : isLargeDevice ? 40 : 48),
    extraLarge: rmScale(isSmallDevice ? 32 : isMediumDevice ? 40 : isLargeDevice ? 48 : 64),
  };
};

/**
 * Función para transformar estilos normales en estilos responsivos
 * @param {Object} styles - Objeto de estilos
 * @returns {Object} - Objeto de estilos transformados
 */
export const makeStylesResponsive = (styles) => {
  const responsiveStyles = {};
  
  Object.keys(styles).forEach(key => {
    const style = styles[key];
    const transformedStyle = {};
    
    Object.keys(style).forEach(prop => {
      const value = style[prop];
      
      // Propiedades que deben usar horizontalScale
      if (
        prop.includes('Width') || 
        prop.includes('Horizontal') || 
        prop === 'left' || 
        prop === 'right' || 
        prop === 'marginLeft' || 
        prop === 'marginRight' || 
        prop === 'paddingLeft' || 
        prop === 'paddingRight'
      ) {
        transformedStyle[prop] = typeof value === 'number' ? horizontalScale(value) : value;
      }
      // Propiedades que deben usar verticalScale
      else if (
        prop.includes('Height') || 
        prop.includes('Vertical') || 
        prop === 'top' || 
        prop === 'bottom' || 
        prop === 'marginTop' || 
        prop === 'marginBottom' || 
        prop === 'paddingTop' || 
        prop === 'paddingBottom'
      ) {
        transformedStyle[prop] = typeof value === 'number' ? verticalScale(value) : value;
      }
      // Propiedades que deben usar moderateScale
      else if (
        prop === 'margin' || 
        prop === 'padding' || 
        prop === 'borderRadius' || 
        prop === 'borderWidth'
      ) {
        transformedStyle[prop] = typeof value === 'number' ? moderateScale(value) : value;
      }
      // Tamaños de fuente
      else if (prop === 'fontSize') {
        transformedStyle[prop] = typeof value === 'number' ? adaptiveFontSize(value) : value;
      }
      // Otras propiedades sin transformar
      else {
        transformedStyle[prop] = value;
      }
    });
    
    responsiveStyles[key] = transformedStyle;
  });
  
  return responsiveStyles;
};

export default {
  horizontalScale,
  verticalScale,
  moderateScale,
  adaptiveFontSize,
  getResponsiveDimensions,
  getResponsiveSpacing,
  makeStylesResponsive
};
