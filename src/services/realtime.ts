import { supabase } from './supabase';

/**
 * Subscribe to messages for a user
 */
export const subscribeToMessages = (userId: string, callback: (message: any) => void) => {
  const subscription = supabase
    .from(`messages:recipient_id=eq.${userId}`)
    .on('INSERT', (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return subscription;
};

/**
 * Subscribe to appointments for a user
 */
export const subscribeToAppointments = (userId: string, userType: 'patient' | 'provider', callback: (appointment: any) => void) => {
  const column = userType === 'patient' ? 'patient_id' : 'provider_id';
  
  const subscription = supabase
    .from(`appointments:${column}=eq.${userId}`)
    .on('*', (payload) => {
      callback(payload.new || payload.old);
    })
    .subscribe();

  return subscription;
};

/**
 * Subscribe to consultations for a user
 */
export const subscribeToConsultations = (userId: string, userType: 'patient' | 'provider', callback: (consultation: any) => void) => {
  const column = userType === 'patient' ? 'patient_id' : 'provider_id';
  
  const subscription = supabase
    .from(`consultations:${column}=eq.${userId}`)
    .on('*', (payload) => {
      callback(payload.new || payload.old);
    })
    .subscribe();

  return subscription;
};

/**
 * Subscribe to notifications for a user
 */
export const subscribeToNotifications = (userId: string, callback: (notification: any) => void) => {
  const subscription = supabase
    .from(`notifications:user_id=eq.${userId}`)
    .on('INSERT', (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from realtime updates
 */
export const unsubscribe = (subscription: any) => {
  if (subscription) {
    supabase.removeSubscription(subscription);
  }
};
