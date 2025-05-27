import { Link, Stack, useSegments } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

export default function NotFoundScreen() {
  const segments = useSegments(); // Array con los segmentos de la ruta actual

  // Reconstruir la ruta como string
  const currentPath = '/' + segments.join('/');

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">
          La pantalla "{currentPath}" no existe.
        </ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Ir a la pantalla principal</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
