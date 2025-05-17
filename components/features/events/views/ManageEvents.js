import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import ManageSpaceEvents from '../../../features/spaces/views/ManageSpaceEvents';

const ManageEvents = ({ navigation, route }) => {
  // Extraer parámetros de navegación
  const managerId = route.params?.managerId || '';
  const spaceId = route.params?.spaceId || '';
  const spaceName = route.params?.spaceName || 'Mi Espacio Cultural';

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent={true} />
      <ManageSpaceEvents 
        navigation={navigation}
        route={route}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default ManageEvents;
