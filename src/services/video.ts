import { supabase } from './supabase';

export interface VideoRoomConfig {
  consultationId: string;
  userId: string;
  userName: string;
  roomName: string;
}

export interface VideoCallState {
  isConnected: boolean;
  isRecording: boolean;
  participants: string[];
  error?: string;
}

/**
 * Get video token for Twilio access
 */
export const getVideoToken = async (consultationId: string, userId: string, userName: string) => {
  try {
    // Call edge function to generate Twilio token
    const { data, error } = await supabase.functions.invoke('generate-video-token', {
      body: {
        consultationId,
        userId,
        userName,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { token: data.token, roomName: data.roomName } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Start video recording for consultation
 */
export const startVideoRecording = async (consultationId: string) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update({ is_recording: true, recording_started_at: new Date().toISOString() })
      .eq('id', consultationId)
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
 * Stop video recording for consultation
 */
export const stopVideoRecording = async (consultationId: string) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update({ is_recording: false, recording_ended_at: new Date().toISOString() })
      .eq('id', consultationId)
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
 * Update consultation status to in-progress
 */
export const startConsultation = async (consultationId: string) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', consultationId)
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
 * End consultation
 */
export const endConsultation = async (consultationId: string, notes?: string) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', consultationId)
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
 * Create prescription after consultation
 */
export const createPrescriptionFromConsultation = async (
  consultationId: string,
  providerId: string,
  patientId: string,
  medications: Array<{ name: string; dosage: string; frequency: string; duration: string }>
) => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([
        {
          consultation_id: consultationId,
          provider_id: providerId,
          patient_id: patientId,
          medications,
          status: 'active',
          issued_at: new Date().toISOString(),
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
 * Add consultation notes
 */
export const addConsultationNotes = async (consultationId: string, notes: string) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update({ notes })
      .eq('id', consultationId)
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
 * Get consultation details
 */
export const getConsultationDetails = async (consultationId: string) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
