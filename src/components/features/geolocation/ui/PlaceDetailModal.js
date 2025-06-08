/**
 * Este archivo maneja el modal de detalles del lugar
 * - UI
 * - Lugares
 * - Detalles
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/OpenSteetMapStyles';

const PlaceDetailModal = ({ visible, place, onClose, onSelect }) => {
  if (!place) return null;

  const getIconForType = (type) => {
    switch (type) {
      case 'Restaurante': return 'restaurant';
      case 'Café': return 'cafe';
      case 'Bar': return 'wine';
      case 'Museo': return 'business';
      case 'Biblioteca': return 'book';
      case 'Teatro': return 'film';
      case 'Cine': return 'videocam';
      case 'Centro Cultural': return 'color-palette';
      case 'Galería': return 'images';
      case 'Hotel': return 'bed';
      case 'Tienda': return 'cart';
      case 'Espacio Cultural': return 'color-palette';
      default: return 'location';
    }
  };

  const formatDistance = (distance) => {
    if (distance === null) return null;
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const openInMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log('No se puede abrir el mapa');
      }
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView style={styles.detailsScrollView}>
            <View style={styles.detailsHeader}>
              <Ionicons
                name={getIconForType(place.type)}
                size={40}
                color="#FF3A5E"
                style={styles.detailsIcon}
              />
              <Text style={styles.detailsTitle}>{place.name}</Text>
              <View style={styles.detailsTypeContainer}>
                <Text style={styles.detailsType}>{place.type}</Text>
              </View>
            </View>

            <View style={styles.detailsInfoContainer}>
              {place.distance && (
                <View style={styles.detailsInfoItem}>
                  <Ionicons name="navigate" size={16} color="#FF3A5E" />
                  <Text style={styles.detailsInfoText}>{formatDistance(place.distance)}</Text>
                </View>
              )}
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Dirección</Text>
              <Text style={styles.detailsSectionText}>{place.address}</Text>
            </View>

            <View style={styles.detailsButtonsContainer}>
              <TouchableOpacity
                style={[styles.detailsButton, styles.detailsButtonPrimary]}
                onPress={() => onSelect(place)}
              >
                <Text style={styles.detailsButtonTextPrimary}>Seleccionar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.detailsButton, styles.detailsButtonSecondary]}
                onPress={openInMap}
              >
                <Text style={styles.detailsButtonTextSecondary}>Abrir en Mapa</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PlaceDetailModal;
