import React from 'react';
import { SafeAreaView } from 'react-native';
import ResponsiveStyleSheet from '../../utils/ResponsiveStyleSheet';
import App from '../../App';

function HomeScreen() {
  return (
    <SafeAreaView style={styles.container as any}>
      <App />
    </SafeAreaView>
  );
}

const styles = ResponsiveStyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;