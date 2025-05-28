import { Text, type TextProps } from 'react-native';
import ResponsiveStyleSheet from '../../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale } from '../../utils/ResponsiveUtils';

import { useThemeColor } from '@/src/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'body';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Seleccionar el estilo correcto basado en el tipo
  let typeStyle: any = {};
  if (type === 'title') {
    typeStyle = {
      fontSize: moderateScale(32),
      fontWeight: 'bold',
      lineHeight: verticalScale(32),
    };
  } else if (type === 'defaultSemiBold') {
    typeStyle = {
      fontSize: moderateScale(16),
      lineHeight: verticalScale(24),
      fontWeight: '600',
    };
  } else if (type === 'subtitle') {
    typeStyle = {
      fontSize: moderateScale(20),
      fontWeight: 'bold',
      lineHeight: verticalScale(24),
    };
  } else if (type === 'link') {
    typeStyle = {
      lineHeight: verticalScale(30),
      fontSize: moderateScale(16),
      color: '#FF3A5E', // Color de acento rojo preferido por el usuario
    };
  } else {
    typeStyle = {
      fontSize: moderateScale(16),
      lineHeight: verticalScale(24),
    };
  }

  return (
    <Text
      style={[
        { color },
        typeStyle,
        style,
      ]}
      {...rest}
    />
  );
}

// Los estilos se han movido directamente al componente como estilos inline
// para evitar problemas de TypeScript y mejorar la responsividad
