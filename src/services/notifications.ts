import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

export interface NotificationData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Register device token for push notifications
 */
export const registerDeviceToken = async (userId: string, token: string) => {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .upsert([
        {
          user_id: userId,
          token,
          platform: 'expo',
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return { success: status === 'granted', status };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get notification token
 */
export const getNotificationToken = async () => {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return { success: true, token: token.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Send local notification
 */
export const sendLocalNotification = async (title: string, body: string, data?: Record<string, any>) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: null,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get notifications for user
 */
export const getNotifications = async (userId: string, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
