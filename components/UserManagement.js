import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../constants/config';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FF3A5E',
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
  },
  refreshingIndicator: {
    backgroundColor: 'rgba(255, 58, 94, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.5)',
  },
  refreshingText: {
    marginLeft: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3A5E',
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
    fontWeight: 'bold',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FF3A5E',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    color: '#ff4757',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 20,
    backgroundColor: 'rgba(255, 58, 94, 0.1)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.3)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(208, 9, 9, 0.9)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3A5E',
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  roleOption: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#333333',
    marginRight: 8,
    marginBottom: 8,
    minWidth: 70,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  selectedRole: {
    backgroundColor: '#FF3A5E',
    borderColor: '#FF3A5E',
  },
  roleText: {
    color: '#FFFFFF',
  },
  selectedRoleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    padding: 12,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 100,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default UserManagement;
