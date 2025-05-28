import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../../../styles/ViewsRoleRequestStyles';

const DocumentsList = ({ documentos, onDocumentPress, downloading }) => {
  console.log('Renderizando documentos:', documentos);

  if (!documentos || (Array.isArray(documentos) && documentos.length === 0) || Object.keys(documentos).length === 0) {
    return <Text style={styles.modalText}>No hay documentos adjuntos</Text>;
  }

  return (
    <View>
      <Text style={styles.modalSubHeader}>Documentos:</Text>
      {Array.isArray(documentos) ? (
        documentos.map((url, index) => {
          console.log('Documento array:', index, url);
          return (
            <TouchableOpacity 
              key={index}
              onPress={() => onDocumentPress(url)}
              disabled={downloading}
            >
              <Text style={styles.link}>
                {downloading ? 'Procesando documento...' : `Documento ${index + 1}`}
              </Text>
            </TouchableOpacity>
          );
        })
      ) : (
        Object.entries(documentos).map(([key, url], index) => {
          console.log('Documento objeto:', key, url);
          return (
            <TouchableOpacity 
              key={index}
              onPress={() => onDocumentPress(url)}
              disabled={downloading}
            >
              <Text style={styles.link}>
                {downloading ? 'Procesando documento...' : (key || `Documento ${index + 1}`)}
              </Text>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
};

export default DocumentsList;
