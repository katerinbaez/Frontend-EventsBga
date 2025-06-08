/**
 * Este archivo maneja el modal de espacios culturales
 * - UI
 * - Espacios
 * - Modal
 * - Lista
 * - Detalles
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpacesModalStyles';
import useCulturalSpaces from '../hooks/useCulturalSpaces';
import SpacesList from '../ui/SpacesList';
import SpaceDetailsModal from '../ui/SpaceDetailsModal';

const CulturalSpacesModal = ({ visible = true, onClose, initialSelectedSpaceId }) => {
  const {
    spaces,
    loading,
    favorites,
    selectedSpaceId,
    selectedSpaceDetails,
    loadingDetails,
    toggleFavorite,
    handleViewSpaceDetails,
    closeDetails
  } = useCulturalSpaces(initialSelectedSpaceId);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleCloseDetails = () => {
    if (initialSelectedSpaceId) {
      handleClose();
    } else {
      closeDetails();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
      <SafeAreaView style={styles.modalContainer}>
        {!selectedSpaceId ? (
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Espacios Culturales</Text>
              <TouchableOpacity 
                onPress={handleClose} 
                style={styles.closeButton}
                activeOpacity={0.7}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Ionicons name="close" size={24} color="#FF3A5E" />
              </TouchableOpacity>
            </View>
            
            <SpacesList
              spaces={spaces}
              loading={loading}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onViewDetails={handleViewSpaceDetails}
            />
          </View>
        ) : (
          <SpaceDetailsModal
            space={selectedSpaceDetails}
            loading={loadingDetails}
            onClose={handleCloseDetails}
            initialSelectedSpaceId={initialSelectedSpaceId}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default CulturalSpacesModal;
