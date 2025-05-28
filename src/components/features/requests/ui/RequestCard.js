import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../../styles/ViewsRoleRequestStyles';

const RequestCard = ({ request, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(request)}
    >
      <Text style={styles.name}>Usuario: {request.userName || request.userId}</Text>
      <Text style={styles.text}>Rol: {request.rolSolicitado}</Text>
      <Text style={styles.text}>Estado: {request.estado}</Text>
      <Text style={styles.text}>Justificación: {request.justificacion}</Text>
      <Text style={styles.fecha}>Fecha: {new Date(request.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );
};

export default RequestCard;
