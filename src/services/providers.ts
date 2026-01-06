import { supabase } from './supabase';

export interface ProviderProfile {
  specialization?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  bio?: string;
}

export interface ProviderAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

/**
 * Create provider profile
 */
export const createProviderProfile = async (userId: string, profile: ProviderProfile) => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .insert([
        {
          user_id: userId,
          specialization: profile.specialization,
          license_number: profile.licenseNumber,
          years_of_experience: profile.yearsOfExperience,
          bio: profile.bio,
          is_available: true,
          rating: 0,
          total_reviews: 0,
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
 * Get provider profile
 */
export const getProviderProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('providers')
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
 * Update provider profile
 */
export const updateProviderProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .update(updates)
      .eq('user_id', userId)
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
 * Get provider availability
 */
export const getProviderAvailability = async (providerId: string) => {
  try {
    const { data, error } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_id', providerId)
      .order('day_of_week', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Update provider availability
 */
export const updateProviderAvailability = async (providerId: string, availability: ProviderAvailability[]) => {
  try {
    // Delete existing availability
    await supabase
      .from('provider_availability')
      .delete()
      .eq('provider_id', providerId);

    // Insert new availability
    const { data, error } = await supabase
      .from('provider_availability')
      .insert(
        availability.map((av) => ({
          provider_id: providerId,
          day_of_week: av.dayOfWeek,
          start_time: av.startTime,
          end_time: av.endTime,
          is_available: av.isAvailable,
        }))
      )
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get provider appointments
 */
export const getProviderAppointments = async (providerId: string) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('provider_id', providerId)
      .order('appointment_date', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get provider consultations
 */
export const getProviderConsultations = async (providerId: string) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('provider_id', providerId)
      .order('start_time', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Create task for provider
 */
export const createTask = async (providerId: string, task: any) => {
  try {
    const { data, error } = await supabase
      .from('provider_tasks')
      .insert([
        {
          provider_id: providerId,
          title: task.title,
          description: task.description,
          status: 'pending',
          due_date: task.dueDate,
          priority: task.priority,
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
export const getTasks = async (providerId: string) => {
  try {
    const { data, error } = await supabase
      .from('provider_tasks')
      .select('*')
      .eq('provider_id', providerId)
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
 * Update task
 */
export const updateTask = async (taskId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('provider_tasks')
      .update(updates)
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
 * Get provider rating
 */
export const getProviderRating = async (providerId: string) => {
  try {
    const { data, error } = await supabase
      .from('provider_reviews')
      .select('rating')
      .eq('provider_id', providerId);

    if (error) {
      return { success: false, error: error.message };
    }

    const ratings = data?.map((r: any) => r.rating) || [];
    const averageRating = ratings.length > 0
      ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
      : 0;

    return { success: true, data: { averageRating, totalReviews: ratings.length } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
