import { StyleSheet } from 'react-native';
import { makeStylesResponsive } from './ResponsiveUtils';

/**
 * ResponsiveStyleSheet - Versión responsiva de StyleSheet
 * Permite crear estilos que se adaptan automáticamente a diferentes tamaños de pantalla
 * Mantiene la misma API que StyleSheet para facilitar la integración
 */
/**
 * ResponsiveStyleSheet - Versión responsiva de StyleSheet que mantiene compatibilidad con TypeScript
 */
const ResponsiveStyleSheet = {
  /**
   * Crea un objeto de estilos responsivos
   * @param {Object} styles - Objeto de estilos normal
   * @returns {Object} - Objeto de estilos transformados para ser responsivos
   */
  /**
   * Crea un objeto de estilos responsivos
   * @param {Object} styles - Objeto de estilos normal
   * @returns {Object} - Objeto de estilos transformados para ser responsivos
   */
  create: (styles) => {
    // Transformar los estilos para hacerlos responsivos
    const responsiveStyles = makeStylesResponsive(styles);
    
    // Crear un StyleSheet normal con los estilos transformados
    // Esto mantiene la compatibilidad con TypeScript
    return StyleSheet.create(responsiveStyles);
  },
  
  /**
   * Aplica estilos responsivos a un estilo existente
   * @param {Object|Array} styles - Estilo o array de estilos
   * @returns {Object} - Estilos combinados
   */
  compose: (styles) => {
    return StyleSheet.compose(styles);
  },
  
  /**
   * Aplana un array de estilos en un único objeto
   * @param {Array} styles - Array de estilos
   * @returns {Object} - Estilos combinados
   */
  flatten: (styles) => {
    return StyleSheet.flatten(styles);
  },
  
  /**
   * Obtiene el valor absoluto de un estilo
   * @param {Object} style - Objeto de estilo
   * @returns {Object} - Estilo absoluto
   */
  absoluteFill: StyleSheet.absoluteFill,
  
  /**
   * Obtiene el ID de un estilo
   * @param {Object} style - Objeto de estilo
   * @returns {number} - ID del estilo
   */
  hairlineWidth: StyleSheet.hairlineWidth,
  
  /**
   * Obtiene el ancho de una línea fina
   * @returns {number} - Ancho de la línea
   */
  absoluteFillObject: StyleSheet.absoluteFillObject,
};

export default ResponsiveStyleSheet;
