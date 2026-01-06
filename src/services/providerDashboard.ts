import { supabase } from './supabase';

export interface ConsultationQueue {
  id: string;
  patientId: string;
  patientName: string;
  reason: string;
  scheduledTime: string;
  status: 'waiting' | 'live' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface ProviderTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  patientId?: string;
}

export interface ProviderConsultation {
  id: string;
  patientId: string;
  patientName: string;
  reason: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  prescriptions?: string[];
  labOrders?: string[];
}

/**
 * Get provider consultation queue
 */
export const getConsultationQueue = async (providerId: string) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('provider_id', providerId)
      .in('status', ['waiting', 'live'])
      .order('scheduled_time', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get provider consultation history
 */
export const getConsultationHistory = async (providerId: string, limit: number = 20) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('provider_id', providerId)
      .eq('status', 'completed')
      .order('end_time', { ascending: false })
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
 * Update consultation status
 */
export const updateConsultationStatus = async (
  consultationId: string,
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update({
        status,
        updated_at: new Date().toISOString(),
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
 * Add consultation notes
 */
export const addConsultationNotes = async (consultationId: string, notes: string) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update({
        notes,
        updated_at: new Date().toISOString(),
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
 * Create prescription from consultation
 */
export const createPrescription = async (
  consultationId: string,
  patientId: string,
  medication: string,
  dosage: string,
  frequency: string,
  duration: string
) => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([
        {
          consultation_id: consultationId,
          patient_id: patientId,
          medication,
          dosage,
          frequency,
          duration,
          status: 'active',
          created_at: new Date().toISOString(),
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
 * Order lab test from consultation
 */
export const orderLabTest = async (
  consultationId: string,
  patientId: string,
  testName: string,
  instructions: string
) => {
  try {
    const { data, error } = await supabase
      .from('lab_orders')
      .insert([
        {
          consultation_id: consultationId,
          patient_id: patientId,
          test_name: testName,
          instructions,
          status: 'pending',
          created_at: new Date().toISOString(),
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
 * Get provider tasks
 */
export const getProviderTasks = async (providerId: string) => {
  try {
    const { data, error } = await supabase
      .from('provider_tasks')
      .select('*')
      .eq('provider_id', providerId)
      .in('status', ['pending', 'in_progress'])
      .order('due_date', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Create provider task
 */
export const createProviderTask = async (
  providerId: string,
  title: string,
  description: string,
  dueDate: string,
  priority: 'low' | 'medium' | 'high',
  patientId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('provider_tasks')
      .insert([
        {
          provider_id: providerId,
          title,
          description,
          due_date: dueDate,
          priority,
          patient_id: patientId,
          status: 'pending',
          created_at: new Date().toISOString(),
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
 * Update task status
 */
export const updateTaskStatus = async (
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed'
) => {
  try {
    const { data, error } = await supabase
      .from('provider_tasks')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
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
 * Get provider statistics
 */
export const getProviderStats = async (providerId: string) => {
  try {
    // Get total consultations
    const { count: totalConsultations } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId);

    // Get completed consultations
    const { count: completedConsultations } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'completed');

    // Get pending tasks
    const { count: pendingTasks } = await supabase
      .from('provider_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'pending');

    return {
      success: true,
      data: {
        totalConsultations: totalConsultations || 0,
        completedConsultations: completedConsultations || 0,
        pendingTasks: pendingTasks || 0,
        completionRate: totalConsultations ? ((completedConsultations || 0) / totalConsultations) * 100 : 0,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get patient details for consultation
 */
export const getPatientDetails = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', patientId)
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
 * Get patient medical history
 */
export const getPatientMedicalHistory = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('medical_history')
      .select('*')
      .eq('patient_id', patientId)
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
 * Schedule follow-up appointment
 */
export const scheduleFollowUp = async (
  patientId: string,
  providerId: string,
  scheduledTime: string,
  reason: string
) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .insert([
        {
          patient_id: patientId,
          provider_id: providerId,
          scheduled_time: scheduledTime,
          reason,
          status: 'scheduled',
          created_at: new Date().toISOString(),
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
