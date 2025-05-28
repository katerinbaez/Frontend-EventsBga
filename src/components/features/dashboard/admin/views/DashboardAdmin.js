import React from 'react';
import { ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../../context/AuthContext';
import AdminHeader from '../elements/AdminHeader';
import AdminWelcomeMessage from '../elements/AdminWelcomeMessage';
import AdminOptionsContainer from '../elements/AdminOptionsContainer';
import { styles } from '../../../../../styles/DashboardAdminStyles';

const DashboardAdmin = () => {
  const { user, handleLogout } = useAuth();
  const navigation = useNavigation();

  const handleLogoutAndNavigate = async () => {
    await handleLogout();
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <AdminHeader onLogout={handleLogoutAndNavigate} />
        
        <AdminWelcomeMessage userName={user?.nombre} />
        
        <AdminOptionsContainer navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardAdmin;
