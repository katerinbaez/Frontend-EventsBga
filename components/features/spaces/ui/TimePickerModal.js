import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/CulturalSpaceStyles';

const TimePickerModal = ({ visible, availableTimes, onClose, onSelectTime }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.timePickerModal}>
          <View style={styles.timePickerHeader}>
            <Text style={styles.timePickerTitle}>Seleccionar Hora</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableTimes}
            keyExtractor={(item) => item}
            style={styles.timeList}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.timeItem}
                onPress={() => onSelectTime(item)}
              >
                <Text style={styles.timeItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default TimePickerModal;
