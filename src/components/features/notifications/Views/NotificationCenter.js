import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { styles } from '../../../../styles/NotificationCenterStyles';
import NotificationItem from '../ui/NotificationItem';
import EmptyNotificationView from '../ui/EmptyNotificationView';
import useNotifications from '../hooks/useNotifications';

const NotificationCenter = ({ onAction, onProfileNavigation, onDismiss, onArtistProfileClick }) => {
  const {
    notifications,
    refreshing,
    onRefresh,
    handleMarkAsRead,
    handleDismissNotification,
    handleRoleNavigation
  } = useNotifications(onAction);

  const renderNotificationItem = ({ item }) => (
    <NotificationItem
      notification={item}
      onDismiss={(id) => handleDismissNotification(id, item.isLocal)}
      onNavigate={handleRoleNavigation}
      onMarkAsRead={handleMarkAsRead}
      onRequestRole={onAction}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#FFFFFF"
          />
        }
      />
    </View>
  );
};

export default NotificationCenter;