/**
 * Utilidades para manejo de dimensiones responsivas
 * - UI
 * - Dimensiones
 * - Escala
 * - Pantalla
 * - Responsive
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';
import { scale, verticalScale as rvScale, moderateScale as rmScale } from 'react-native-size-matters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const baseWidth = 375;
const baseHeight = 812;


export const horizontalScale = (size) => {
  return scale(size);
};


export const verticalScale = (size) => {
  return rvScale(size);
};


export const moderateScale = (size, factor = 0.5) => {
  return rmScale(size, factor);
};


export const adaptiveFontSize = (fontSize) => {
  return rmScale(fontSize, 0.3); 
};


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

export const makeStylesResponsive = (styles) => {
  const responsiveStyles = {};
  
  Object.keys(styles).forEach(key => {
    const style = styles[key];
    const transformedStyle = {};
    
    Object.keys(style).forEach(prop => {
      const value = style[prop];
      
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
      else if (
        prop === 'margin' || 
        prop === 'padding' || 
        prop === 'borderRadius' || 
        prop === 'borderWidth'
      ) {
        transformedStyle[prop] = typeof value === 'number' ? moderateScale(value) : value;
      }
      else if (prop === 'fontSize') {
        transformedStyle[prop] = typeof value === 'number' ? adaptiveFontSize(value) : value;
      }
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
