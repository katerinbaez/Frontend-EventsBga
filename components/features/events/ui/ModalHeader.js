import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../../styles/AvaiableEventsModalStyles';

const ModalHeader = ({ title, onClose }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="#FF3A5E" />
      </TouchableOpacity>
    </View>
  );
};

export default ModalHeader;
