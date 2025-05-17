import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../../../../constants/config';
import { styles } from '../../../../styles/UserManagementStyles';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estado para el usuario en edición
  const [editedUser, setEditedUser] = useState({
    id: '',
    name: '',
    email: '',
    role: ''
  });

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Obtener todos los usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setUsers([]); // Limpiar la lista actual para mostrar visualmente que se está recargando
      
      // Mostrar un indicador de carga
      Alert.alert('Cargando', 'Actualizando lista de usuarios...');
      
      const response = await fetch(`${BACKEND_URL}/api/users`);
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const data = await response.json();
      setUsers(data);
      setError(null);
      
      // Mostrar un mensaje de éxito al recargar
      Alert.alert('Éxito', 'Lista de usuarios actualizada');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('No se pudieron cargar los usuarios. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manejar la edición de un usuario
  const handleEditUser = (user) => {
    setEditedUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    setModalVisible(true);
  };

  // Actualizar un usuario
  const updateUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${editedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: editedUser.role }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }

      // Actualizar la lista de usuarios
      fetchUsers();
      setModalVisible(false);
      Alert.alert('Éxito', 'Usuario actualizado correctamente');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'No se pudo actualizar el usuario');
    }
  };

  // Eliminar un usuario
  const deleteUser = async (userId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de que desea eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Error al eliminar usuario');
              }

              // Actualizar la lista de usuarios
              fetchUsers();
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          },
        },
      ]
    );
  };

  // Renderizar cada usuario en la lista
  const renderUserItem = ({ item }) => {
    // Mapear el rol a un nombre más legible
    let roleDisplay = 'Usuario';
    let roleBgColor = '#757575';
    
    if (item.role === 'artist') {
      roleDisplay = 'Artista';
      roleBgColor = '#4CAF50';
    } else if (item.role === 'manager') {
      roleDisplay = 'Gestor Cultural';
      roleBgColor = '#2196F3';
    } else if (item.role === 'admin') {
      roleDisplay = 'Administrador';
      roleBgColor = '#FF3A5E';
    }
    
    return (
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={[styles.userRole, { backgroundColor: roleBgColor }]}>{roleDisplay}</Text>
        </View>
        <View style={styles.userActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditUser(item)}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteUser(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Renderizado condicional para estado de carga
  if (loading && users.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF3A5E" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  // Renderizado condicional para estado de error
  if (error && users.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={50} color="#FF3A5E" />
        <View style={[styles.refreshingIndicator, { backgroundColor: 'rgba(244, 67, 54, 0.2)', borderColor: 'rgba(244, 67, 54, 0.5)' }]}>
          <Ionicons name="alert-circle" size={24} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#FF3A5E', marginTop: 20, padding: 12, borderRadius: 6 }]} 
          onPress={fetchUsers}
        >
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Renderizado principal
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchUsers}
          disabled={refreshing}
        >
          {refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF3A5E" />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          ) : (
            <Ionicons name="refresh" size={24} color="#FF3A5E" />
          )}
        </TouchableOpacity>
      </View>

      {refreshing && (
        <View style={styles.refreshingIndicator}>
          <ActivityIndicator size="large" color="#FF3A5E" />
          <Text style={styles.refreshingText}>Actualizando usuarios...</Text>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id || item._id}
        renderItem={renderUserItem}
        ListEmptyComponent={loading ? null : <Text style={styles.emptyText}>No hay usuarios disponibles</Text>}
      />

      {/* Modal de edición de usuario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Usuario</Text>

            <Text style={styles.inputLabel}>Nombre</Text>
            <Text style={styles.infoText}>{editedUser.name}</Text>

            <Text style={styles.inputLabel}>Email</Text>
            <Text style={styles.infoText}>{editedUser.email}</Text>

            <Text style={styles.inputLabel}>Rol</Text>
            <View style={styles.roleSelector}>
              {['user', 'artist', 'manager', 'admin'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    editedUser.role === role && styles.selectedRole
                  ]}
                  onPress={() => setEditedUser({ ...editedUser, role })}
                >
                  <Text style={[
                    styles.roleText,
                    editedUser.role === role && styles.selectedRoleText
                  ]}>
                    {role === 'user' ? 'Usuario' : 
                     role === 'artist' ? 'Artista' : 
                     role === 'manager' ? 'Gestor' : 'Admin'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateUser}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserManagement;
