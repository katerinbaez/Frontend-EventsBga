import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import App from '../../App';

function HomeScreen() {
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

export default HomeScreen;
