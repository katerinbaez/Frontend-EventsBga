/**
 * Estilos responsivos con adaptación automática
 * - UI
 * - Estilos
 * - Responsive
 * - TypeScript
 * - Compatibilidad
 */

import { StyleSheet } from 'react-native';
import { makeStylesResponsive } from './ResponsiveUtils';


const ResponsiveStyleSheet = {
  
  create: (styles) => {
    const responsiveStyles = makeStylesResponsive(styles);
    
    return StyleSheet.create(responsiveStyles);
  },
  

  compose: (styles) => {
    return StyleSheet.compose(styles);
  },
  
  
  flatten: (styles) => {
    return StyleSheet.flatten(styles);
  },
  
 
  absoluteFill: StyleSheet.absoluteFill,
  
 
  hairlineWidth: StyleSheet.hairlineWidth,
  
  
  absoluteFillObject: StyleSheet.absoluteFillObject,
};

export default ResponsiveStyleSheet;
