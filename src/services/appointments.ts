import { supabase } from './supabase';

export interface AppointmentData {
  patientId: string;
  providerId: string;
  appointmentDate: string;
  durationMinutes?: number;
  appointmentType: 'consultation' | 'follow_up' | 'check_up';
  notes?: string;
}

export interface ConsultationData {
  appointmentId: string;
  patientId: string;
  providerId: string;
  startTime?: string;
  endTime?: string;
  consultationNotes?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpDate?: string;
}

export interface PrescriptionData {
  consultationId: string;
  patientId: string;
  providerId: string;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  notes?: string;
}

export interface LabRequestData {
  patientId: string;
  providerId: string;
  testName: string;
  testDescription?: string;
  scheduledDate?: string;
  notes?: string;
  consultationId?: string;
}

/**
 * Create an appointment
 */
export const createAppointment = async (appointment: AppointmentData) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          patient_id: appointment.patientId,
          provider_id: appointment.providerId,
          appointment_date: appointment.appointmentDate,
          duration_minutes: appointment.durationMinutes || 30,
          appointment_type: appointment.appointmentType,
          notes: appointment.notes,
          status: 'scheduled',
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
 * Get appointments for a user
 */
export const getAppointments = async (userId: string, userType: 'patient' | 'provider') => {
  try {
    const query = supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });

    const { data, error } = userType === 'patient'
      ? await query.eq('patient_id', userId)
      : await query.eq('provider_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
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
 * Create a consultation
 */
export const createConsultation = async (consultation: ConsultationData) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .insert([
        {
          appointment_id: consultation.appointmentId,
          patient_id: consultation.patientId,
          provider_id: consultation.providerId,
          start_time: consultation.startTime,
          end_time: consultation.endTime,
          status: 'scheduled',
          consultation_notes: consultation.consultationNotes,
          diagnosis: consultation.diagnosis,
          treatment_plan: consultation.treatmentPlan,
          follow_up_date: consultation.followUpDate,
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
 * Get consultations for a user
 */
export const getConsultations = async (userId: string, userType: 'patient' | 'provider') => {
  try {
    const query = supabase
      .from('consultations')
      .select('*')
      .order('start_time', { ascending: false });

    const { data, error } = userType === 'patient'
      ? await query.eq('patient_id', userId)
      : await query.eq('provider_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Update consultation
 */
export const updateConsultation = async (consultationId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update(updates)
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
 * Create a prescription
 */
export const createPrescription = async (prescription: PrescriptionData) => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([
        {
          consultation_id: prescription.consultationId,
          patient_id: prescription.patientId,
          provider_id: prescription.providerId,
          medication_name: prescription.medicationName,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          quantity: prescription.quantity,
          notes: prescription.notes,
          status: 'active',
          refills_remaining: 3,
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
 * Get prescriptions for a user
 */
export const getPrescriptions = async (userId: string, userType: 'patient' | 'provider') => {
  try {
    const query = supabase
      .from('prescriptions')
      .select('*')
      .order('created_at', { ascending: false });

    const { data, error } = userType === 'patient'
      ? await query.eq('patient_id', userId)
      : await query.eq('provider_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Create a lab request
 */
export const createLabRequest = async (labRequest: LabRequestData) => {
  try {
    const { data, error } = await supabase
      .from('lab_requests')
      .insert([
        {
          patient_id: labRequest.patientId,
          provider_id: labRequest.providerId,
          consultation_id: labRequest.consultationId,
          test_name: labRequest.testName,
          test_description: labRequest.testDescription,
          scheduled_date: labRequest.scheduledDate,
          notes: labRequest.notes,
          status: 'requested',
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
 * Get lab requests for a user
 */
export const getLabRequests = async (userId: string, userType: 'patient' | 'provider') => {
  try {
    const query = supabase
      .from('lab_requests')
      .select('*')
      .order('created_at', { ascending: false });

    const { data, error } = userType === 'patient'
      ? await query.eq('patient_id', userId)
      : await query.eq('provider_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Update lab request status
 */
export const updateLabRequestStatus = async (labRequestId: string, status: string, resultsUrl?: string) => {
  try {
    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        status,
        results_url: resultsUrl,
        completed_date: status === 'completed' ? new Date().toISOString().split('T')[0] : null,
      })
      .eq('id', labRequestId)
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
