/**
 * Este archivo maneja el modal de detalles del espacio
 * - UI
 * - Espacios
 * - Detalles
 * - Modal
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpacesModalStyles';
import SpaceImages from './SpaceImages';
import SpaceInfo from './SpaceInfo';
import SpaceFacilities from './SpaceFacilities';
import SpaceContact from './SpaceContact';
import SpaceSocial from './SpaceSocial';


const SpaceDetailsModal = ({ space, loading, onClose, initialSelectedSpaceId }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3A5E" />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (!space) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <SafeAreaView style={styles.detailsContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>Detalles del Espacio Cultural</Text>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeDetailsButton}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="close" size={24} color="#FF3A5E" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.detailsScrollView}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={{paddingBottom: 30}}
        bounces={true}
        overScrollMode="always"
        nestedScrollEnabled={true}
        alwaysBounceVertical={true}
      >
        <SpaceImages images={space.images} />
        <SpaceInfo space={space} />
        <SpaceFacilities facilities={space.instalaciones} />
        <SpaceContact contacto={space.contacto} />
        <SpaceSocial redesSociales={space.redesSociales} />
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SpaceDetailsModal;
