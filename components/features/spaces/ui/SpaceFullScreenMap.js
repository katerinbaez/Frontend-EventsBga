import React from 'react';
import { View, Modal, TouchableOpacity, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';

const SpaceFullScreenMap = ({
  visible,
  onClose,
  mapRef,
  userLocation,
  spaces,
  selectedPlace,
  onSelectSpace,
  mapRegion,
  styles
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenMapContainer}>
        {Platform.OS === 'web' ? (
          <View style={styles.webMapContainer}>
            <Text style={styles.webMapMessage}>
              <Ionicons name="map-outline" size={24} color="#FF3A5E" /> 
              Usa el buscador de OpenStreetMap para encontrar ubicaciones
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.fullScreenMap}
            initialRegion={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
            showsTraffic={false}
            showsBuildings={true}
            showsIndoors={true}
            loadingEnabled={true}
            loadingIndicatorColor="#FF3A5E"
            loadingBackgroundColor="#1E1E1E"
          >
            {/* Marcador para la ubicación del usuario */}
            {userLocation && (
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude
                }}
                title="Mi ubicación"
                description="Estás aquí"
                pinColor="#FF3A5E"
              />
            )}
            
            {/* Marcadores para espacios culturales */}
            {spaces.map((space, index) => {
              // Convertir coordenadas a números
              const lat = parseFloat(space.latitud);
              const lng = parseFloat(space.longitud);
              
              if (isNaN(lat) || isNaN(lng)) return null;
              
              return (
                <Marker
                  key={`marker-${index}`}
                  coordinate={{
                    latitude: lat,
                    longitude: lng
                  }}
                  title={space.nombreEspacio || 'Espacio Cultural'}
                  description={space.direccion || 'Sin dirección'}
                  pinColor="#4285F4"
                >
                  <Callout onPress={() => onSelectSpace(space)}>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{space.nombreEspacio || 'Espacio Cultural'}</Text>
                      <Text style={styles.calloutSubtitle}>{space.direccion || 'Sin dirección'}</Text>
                      <Text style={styles.calloutAction}>Toca para ver detalles</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
            
            {/* Marcador para la ubicación seleccionada con OpenStreetMap */}
            {selectedPlace && (
              <Marker
                key="selected-place"
                coordinate={{
                  latitude: selectedPlace.latitude,
                  longitude: selectedPlace.longitude
                }}
                title={selectedPlace.name || 'Ubicación seleccionada'}
                description={selectedPlace.address || ''}
                pinColor="#FF3A5E"
              >
                <Callout>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{selectedPlace.name || 'Ubicación seleccionada'}</Text>
                    <Text style={styles.calloutSubtitle}>{selectedPlace.address || ''}</Text>
                  </View>
                </Callout>
              </Marker>
            )}
          </MapView>
        )}
        
        {/* Botón para cerrar el mapa */}
        <TouchableOpacity style={styles.closeMapButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default SpaceFullScreenMap;
