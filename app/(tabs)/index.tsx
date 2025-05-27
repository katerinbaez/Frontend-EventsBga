import React from 'react';
import { SafeAreaView } from 'react-native';
import ResponsiveStyleSheet from '../../utils/ResponsiveStyleSheet';
import App from '../../App';

function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <App />
    </SafeAreaView>
  );
}

const rawStyles = {
  container: {
    flex: 1,
  },
};

const styles = ResponsiveStyleSheet.create(rawStyles) as typeof rawStyles;


export default HomeScreen;