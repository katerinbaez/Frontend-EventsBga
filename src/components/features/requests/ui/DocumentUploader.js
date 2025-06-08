/**
 * Este archivo maneja el subidor de documentos
 * - UI
 * - Roles
 * - Subidor
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../../styles/RoleRequestFormStyles';

const DocumentUploader = ({ documents, onPickDocument, onRemoveDocument }) => {
  return (
    <>
      <TouchableOpacity style={styles.documentButton} onPress={onPickDocument}>
        <Ionicons name="document-attach" size={24} color="#4A90E2" />
        <Text style={styles.documentButtonText}>Adjuntar Documentos de Respaldo</Text>
      </TouchableOpacity>

      {documents.length > 0 && (
        <View style={styles.documentsList}>
          <Text style={styles.documentsTitle}>Documentos adjuntos:</Text>
          {documents.map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <Ionicons name="document" size={20} color="#4A90E2" />
              <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
              <TouchableOpacity 
                style={styles.removeDocumentButton}
                onPress={() => onRemoveDocument(index)}
              >
                <Ionicons name="close-circle" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </>
  );
};

export default DocumentUploader;