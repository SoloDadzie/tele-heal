import * as Notifications from 'expo-notifications';
import { registerDeviceToken, getNotificationToken, requestNotificationPermissions } from '../services/notifications';

/**
 * Configure notification handler
 */
export const configurePushNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

/**
 * Initialize push notifications
 */
export const initializePushNotifications = async (userId: string) => {
  try {
    // Request permissions
    const permissionResult = await requestNotificationPermissions();
    if (!permissionResult.success) {
      console.warn('Notification permissions not granted');
      return { success: false, error: 'Permissions not granted' };
    }

    // Get device token
    const tokenResult = await getNotificationToken();
    if (!tokenResult.success || !tokenResult.token) {
      return { success: false, error: 'Failed to get notification token' };
    }

    // Register device token
    const registerResult = await registerDeviceToken(userId, tokenResult.token);
    if (!registerResult.success) {
      return { success: false, error: 'Failed to register device token' };
    }

    return { success: true, token: tokenResult.token };
  } catch (error: any) {
    console.error('Error initializing push notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle notification response (when user taps notification)
 */
export const handleNotificationResponse = (
  response: Notifications.NotificationResponse,
  onNavigate?: (screen: string, params?: any) => void
) => {
  const { notification } = response;
  const { data } = notification.request.content;

  // Handle different notification types
  if (data?.type === 'appointment') {
    onNavigate?.('Schedule', { appointmentId: data.appointmentId });
  } else if (data?.type === 'message') {
    onNavigate?.('Chat', { threadId: data.threadId });
  } else if (data?.type === 'consultation') {
    onNavigate?.('VirtualConsultation', { consultationId: data.consultationId });
  } else if (data?.type === 'prescription') {
    onNavigate?.('Prescriptions', { prescriptionId: data.prescriptionId });
  } else if (data?.type === 'lab_result') {
    onNavigate?.('Labs', { labRequestId: data.labRequestId });
  }
};

/**
 * Setup notification listeners
 */
export const setupNotificationListeners = (
  onNavigate?: (screen: string, params?: any) => void
) => {
  // Listen for notifications received while app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
  });

  // Listen for notification responses (when user taps notification)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationResponse(response, onNavigate);
  });

  // Return cleanup function
  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
};

/**
 * Send local notification for testing
 */
export const sendTestNotification = async (title: string, body: string) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'test' },
      },
      trigger: { seconds: 1 },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Schedule notification for later
 */
export const scheduleNotification = async (
  title: string,
  body: string,
  delaySeconds: number,
  data?: Record<string, any>
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: { seconds: delaySeconds },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Cancel specific notification
 */
export const cancelNotification = async (notificationId: string) => {
  try {
    await Notifications.dismissNotificationAsync(notificationId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
