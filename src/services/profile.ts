import { supabase } from './supabase';

export interface PatientProfile {
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface MedicalData {
  medicalHistory?: string[];
  allergies?: Array<{ allergen: string; severity: string; reaction?: string }>;
  medications?: Array<{ name: string; dosage: string; frequency: string }>;
}

export interface InsuranceInfo {
  providerName?: string;
  memberId?: string;
  groupNumber?: string;
  policyStartDate?: string;
  policyEndDate?: string;
}

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
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
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
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
 * Create or update patient profile
 */
export const upsertPatientProfile = async (userId: string, profile: PatientProfile) => {
  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .upsert(
        {
          user_id: userId,
          date_of_birth: profile.dateOfBirth,
          gender: profile.gender,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          postal_code: profile.postalCode,
          country: profile.country,
          emergency_contact_name: profile.emergencyContactName,
          emergency_contact_phone: profile.emergencyContactPhone,
        },
        { onConflict: 'user_id' }
      )
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
 * Get patient profile
 */
export const getPatientProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Add medical history
 */
export const addMedicalHistory = async (userId: string, condition: string, notes?: string) => {
  try {
    const { data, error } = await supabase
      .from('medical_history')
      .insert([
        {
          user_id: userId,
          condition,
          notes,
          status: 'active',
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
 * Get medical history
 */
export const getMedicalHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('medical_history')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Add allergy
 */
export const addAllergy = async (userId: string, allergen: string, severity: string, reaction?: string) => {
  try {
    const { data, error } = await supabase
      .from('allergies')
      .insert([
        {
          user_id: userId,
          allergen,
          severity,
          reaction,
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
 * Get allergies
 */
export const getAllergies = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('allergies')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Add medication
 */
export const addMedication = async (
  userId: string,
  medicationName: string,
  dosage?: string,
  frequency?: string,
  reason?: string
) => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .insert([
        {
          user_id: userId,
          medication_name: medicationName,
          dosage,
          frequency,
          reason,
          start_date: new Date().toISOString().split('T')[0],
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
 * Get medications
 */
export const getMedications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Upsert insurance information
 */
export const upsertInsuranceInfo = async (userId: string, insurance: InsuranceInfo) => {
  try {
    const { data, error } = await supabase
      .from('insurance_info')
      .upsert(
        {
          user_id: userId,
          provider_name: insurance.providerName,
          member_id: insurance.memberId,
          group_number: insurance.groupNumber,
          policy_start_date: insurance.policyStartDate,
          policy_end_date: insurance.policyEndDate,
        },
        { onConflict: 'user_id' }
      )
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
 * Get insurance information
 */
export const getInsuranceInfo = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('insurance_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Create or update consent
 */
export const upsertConsent = async (userId: string, consentType: string, isAccepted: boolean) => {
  try {
    const { data, error } = await supabase
      .from('consents')
      .upsert(
        {
          user_id: userId,
          consent_type: consentType,
          is_accepted: isAccepted,
          accepted_at: isAccepted ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,consent_type' }
      )
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
 * Get consents
 */
export const getConsents = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('consents')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
