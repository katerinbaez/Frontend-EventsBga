/**
 * Este archivo maneja la vista del modal de detalles del espacio
 * - UI
 * - Espacios
 * - Detalles
 * - Modal
 * - Vista
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SpaceDetailsModalView = ({ 
  visible, 
  space, 
  onClose, 
  onRequestEvent,
  onViewLocation,
  styles 
}) => {
  if (!space) return null;
  
  const hasImage = space.imagen && space.imagen.trim() !== '';
  
  const hasPhone = space.telefono && space.telefono.trim() !== '';
  const hasEmail = space.correo && space.correo.trim() !== '';
  const hasWebsite = space.sitioWeb && space.sitioWeb.trim() !== '';
  
  const hasFacebook = space.facebook && space.facebook.trim() !== '';
  const hasInstagram = space.instagram && space.instagram.trim() !== '';
  const hasTwitter = space.twitter && space.twitter.trim() !== '';
  
  const hasLocation = space.latitud && space.longitud;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Cabecera del modal con botón de cierre */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{space.nombreEspacio || 'Espacio Cultural'}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {/* Imagen del espacio */}
            <View style={styles.modalImageContainer}>
              {hasImage ? (
                <Image 
                  source={{ uri: space.imagen }} 
                  style={styles.modalImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.modalPlaceholderImage}>
                  <Ionicons name="image-outline" size={50} color="#ccc" />
                  <Text style={styles.placeholderText}>Sin imagen</Text>
                </View>
              )}
            </View>
            
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Información</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#FF3A5E" style={styles.infoIcon} />
                <Text style={styles.infoText}>{space.direccion || 'Sin dirección'}</Text>
              </View>
              
              {space.categoria && (
                <View style={styles.infoRow}>
                  <Ionicons name="pricetag-outline" size={20} color="#FF3A5E" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{space.categoria}</Text>
                </View>
              )}
              
              {space.descripcion && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>{space.descripcion}</Text>
                </View>
              )}
            </View>
            
            {(hasPhone || hasEmail || hasWebsite) && (
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Contacto</Text>
                
                {hasPhone && (
                  <TouchableOpacity 
                    style={styles.contactRow}
                    onPress={() => Linking.openURL(`tel:${space.telefono}`)}
                  >
                    <Ionicons name="call-outline" size={20} color="#FF3A5E" style={styles.contactIcon} />
                    <Text style={styles.contactText}>{space.telefono}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                  </TouchableOpacity>
                )}
                
                {hasEmail && (
                  <TouchableOpacity 
                    style={styles.contactRow}
                    onPress={() => Linking.openURL(`mailto:${space.correo}`)}
                  >
                    <Ionicons name="mail-outline" size={20} color="#FF3A5E" style={styles.contactIcon} />
                    <Text style={styles.contactText}>{space.correo}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                  </TouchableOpacity>
                )}
                
                {hasWebsite && (
                  <TouchableOpacity 
                    style={styles.contactRow}
                    onPress={() => Linking.openURL(space.sitioWeb.startsWith('http') ? space.sitioWeb : `https://${space.sitioWeb}`)}
                  >
                    <Ionicons name="globe-outline" size={20} color="#FF3A5E" style={styles.contactIcon} />
                    <Text style={styles.contactText}>{space.sitioWeb}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {(hasFacebook || hasInstagram || hasTwitter) && (
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Redes Sociales</Text>
                
                {hasFacebook && (
                  <TouchableOpacity 
                    style={styles.socialRow}
                    onPress={() => Linking.openURL(space.facebook.startsWith('http') ? space.facebook : `https://${space.facebook}`)}
                  >
                    <Ionicons name="logo-facebook" size={20} color="#3b5998" style={styles.socialIcon} />
                    <Text style={styles.socialText}>Facebook</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                  </TouchableOpacity>
                )}
                
                {hasInstagram && (
                  <TouchableOpacity 
                    style={styles.socialRow}
                    onPress={() => Linking.openURL(space.instagram.startsWith('http') ? space.instagram : `https://${space.instagram}`)}
                  >
                    <Ionicons name="logo-instagram" size={20} color="#e4405f" style={styles.socialIcon} />
                    <Text style={styles.socialText}>Instagram</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                  </TouchableOpacity>
                )}
                
                {hasTwitter && (
                  <TouchableOpacity 
                    style={styles.socialRow}
                    onPress={() => Linking.openURL(space.twitter.startsWith('http') ? space.twitter : `https://${space.twitter}`)}
                  >
                    <Ionicons name="logo-twitter" size={20} color="#1da1f2" style={styles.socialIcon} />
                    <Text style={styles.socialText}>Twitter</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
          
          <View style={styles.actionButtonsContainer}>
            {hasLocation && (
              <TouchableOpacity 
                style={styles.viewLocationButton}
                onPress={() => onViewLocation(parseFloat(space.latitud), parseFloat(space.longitud))}
              >
                <Ionicons name="location-outline" size={20} color="#FFFFFF" />
                <Text style={styles.viewLocationButtonText}>
                  {Platform.OS === 'web' ? 'Ver Ubicación' : 'Abrir en OpenStreetMap'}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.requestEventButton}
              onPress={() => onRequestEvent(space)}
            >
              <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
              <Text style={styles.requestEventButtonText}>Solicitar Evento</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SpaceDetailsModalView;
