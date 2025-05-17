import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../../../context/AuthContext';
import FavoritesList from './FavoritesList';

const FavoritesScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  return (
    <View style={styles.container}>
      <FavoritesList user={user} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
});

export default FavoritesScreen;
