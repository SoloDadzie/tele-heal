import { supabase } from './supabase';

export interface MessageData {
  senderId: string;
  recipientId: string;
  messageText: string;
  consultationId?: string;
}

/**
 * Send a message
 */
export const sendMessage = async (message: MessageData) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: message.senderId,
          recipient_id: message.recipientId,
          message_text: message.messageText,
          consultation_id: message.consultationId,
          is_read: false,
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get messages between two users
 */
export const getMessages = async (userId: string, otherUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get unread messages for a user
 */
export const getUnreadMessages = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('recipient_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Mark all messages as read for a conversation
 */
export const markConversationAsRead = async (userId: string, otherUserId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('recipient_id', userId)
      .eq('sender_id', otherUserId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get conversation list for a user
 */
export const getConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_conversations', { user_id: userId });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
