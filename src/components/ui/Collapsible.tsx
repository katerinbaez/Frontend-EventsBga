import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import ResponsiveStyleSheet from '../../utils/ResponsiveStyleSheet';
import { moderateScale, verticalScale, horizontalScale } from '../../utils/ResponsiveUtils';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  // Definir estilos inline para evitar problemas de TypeScript
  const headingStyle = {
    flexDirection: 'row' as 'row',
    alignItems: 'center' as 'center',
    gap: horizontalScale(12),
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#FF3A5E', // Color de acento rojo preferido por el usuario
  };

  const contentStyle = {
    marginTop: verticalScale(12),
    marginLeft: horizontalScale(24),
    paddingBottom: verticalScale(8),
  };

  return (
    <ThemedView>
      <TouchableOpacity
        style={headingStyle}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.7}>
        <IconSymbol
          name="chevron.right"
          size={moderateScale(18)}
          weight="medium"
          color={'#FF3A5E'} // Color de acento rojo preferido por el usuario
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={contentStyle}>{children}</ThemedView>}
    </ThemedView>
  );
}

// Los estilos se han movido directamente al componente como estilos inline
// para evitar problemas de TypeScript y mejorar la responsividad
