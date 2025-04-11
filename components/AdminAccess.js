import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Keyboard,
  Vibration,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import CustomInput from './common/CustomInput';
import CustomButton from './common/CustomButton';
import { COLORS, COMMON_STYLES, SIZES } from '../styles/theme';
import { styles } from '../styles/AdminAccessStyles';

const AdminAccess = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();
  const { handleLogin } = useAuth();

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [modalVisible]);

  const handleVerifyCode = async () => {
    if (isVerifying) return;
    
    Vibration.vibrate(50);
    setIsVerifying(true);
    const adminCode = 'Admin1234';

    try {
      if (code === adminCode) {
        setShowSuccess(true);
        const result = await handleLogin({
          id: 'admin-user',
          name: 'Administrador',
          email: 'admin@eventsbga.com',
          role: 'admin'
        });
        
        setTimeout(() => {
          setError('');
          setCode('');
          setModalVisible(false);
          setShowSuccess(false);
          navigation.replace('DashboardAdmin');
        }, 1000);
      } else {
        Vibration.vibrate([0, 50, 100, 50]);
        setError('Código incorrecto');
        setCode('');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={[COMMON_STYLES.button.primary, styles.adminButton]}
        onPress={() => {
          Vibration.vibrate(50);
          setModalVisible(true);
        }}
      >
        <Ionicons 
          name={modalVisible ? "key" : "key-outline"} 
          size={28} 
          color="#FFF"
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !isVerifying && setModalVisible(false)}
      >
        <Animated.View 
          style={[
            COMMON_STYLES.modal.container,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [SIZES.screenHeight, 0]
                })
              }]
            }
          ]}
        >
          <View style={[COMMON_STYLES.modal.content, styles.modalContent]}>
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={40} color="#FF0000" />
              </View>
              <Text style={styles.modalTitle}>Acceso Administrativo</Text>
            </View>
            
            <Text style={styles.welcomeText}>¡Bienvenido!</Text>
            <Text style={styles.instructionText}>Por favor, ingrese el código de administrador</Text>
            
            <CustomInput
              icon="lock-closed"
              placeholder="Ingrese el código"
              value={code}
              onChangeText={setCode}
              secureTextEntry
              editable={!isVerifying}
              returnKeyType="done"
              onSubmitEditing={handleVerifyCode}
              autoFocus={true}
              style={{
                backgroundColor: '#2c2c2c',
                borderColor: COLORS.primary,
                borderWidth: 1,
                marginBottom: 16
              }}
            />

            {error ? (
              <Animated.View 
                style={[COMMON_STYLES.feedback.container, COMMON_STYLES.feedback.error, { opacity: fadeAnim }]}
              >
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={[COMMON_STYLES.feedback.text, { color: COLORS.error }]}>{error}</Text>
              </Animated.View>
            ) : null}

            {showSuccess && (
              <View style={[COMMON_STYLES.feedback.container, COMMON_STYLES.feedback.success]}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={[COMMON_STYLES.feedback.text, { color: COLORS.success }]}>¡Acceso concedido!</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <CustomButton
                title="Cancelar"
                type="secondary"
                icon="close-circle"
                onPress={() => {
                  if (!isVerifying) {
                    Vibration.vibrate(50);
                    Keyboard.dismiss();
                    setModalVisible(false);
                    setError('');
                    setCode('');
                  }
                }}
                disabled={isVerifying}
              />
              
              <CustomButton
                title="Verificar"
                icon="enter"
                onPress={handleVerifyCode}
                loading={isVerifying}
                disabled={isVerifying || code.length === 0}
              />
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

export default AdminAccess;
