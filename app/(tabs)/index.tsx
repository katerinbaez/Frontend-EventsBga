import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import App from '../../App';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <App />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
