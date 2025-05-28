import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

const NotificationService = {
  getNotifications: async (user) => {
    return await axios.get(`${BACKEND_URL}/api/notifications/${user.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
    });
  },

  markAsRead: async (notificationId, user) => {
    const response = await axios.patch(
      `${BACKEND_URL}/api/notifications/${notificationId}/read`,
      { read: true },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      }
    );
    return response.status === 200;
  },

  deleteNotification: async (notificationId, user) => {
    await axios.delete(`${BACKEND_URL}/api/notifications/${notificationId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
    });
  },

  checkManagerProfile: async (userId) => {
    return await axios.get(`${BACKEND_URL}/api/managers/profile/${userId}`);
  },

  checkArtistProfile: async (userId) => {
    return await axios.get(`${BACKEND_URL}/api/artists/profile/${userId}`);
  }
};

export default NotificationService;