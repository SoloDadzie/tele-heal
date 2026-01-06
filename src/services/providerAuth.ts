import { supabase } from './supabase';

export interface ProviderSignUpData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
}

export interface ProviderLoginData {
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: any;
  session?: any;
}

/**
 * Sign up a new provider with email and password
 */
export const providerSignUp = async (data: ProviderSignUpData): Promise<AuthResponse> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          phone: data.phone,
          full_name: data.fullName,
          user_type: 'provider',
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create provider account' };
    }

    // Create provider profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: data.email,
          phone_number: data.phone,
          full_name: data.fullName,
          user_type: 'provider',
        },
      ]);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // Create provider details
    const { error: detailsError } = await supabase
      .from('provider_profiles')
      .insert([
        {
          user_id: authData.user.id,
          license_number: data.licenseNumber,
          specialization: data.specialization,
          years_of_experience: data.yearsOfExperience,
          is_verified: false,
          is_active: true,
        },
      ]);

    if (detailsError) {
      return { success: false, error: detailsError.message };
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Sign in provider with email and password
 */
export const providerSignIn = async (data: ProviderLoginData): Promise<AuthResponse> => {
  try {
    // First, get the provider's email from phone number
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, user_type')
      .eq('phone_number', data.phone)
      .eq('user_type', 'provider')
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Provider account not found' };
    }

    if (userData.user_type !== 'provider') {
      return { success: false, error: 'This account is not a provider account' };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: data.password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get provider profile details
 */
export const getProviderProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', userId)
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
 * Update provider profile
 */
export const updateProviderProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('provider_profiles')
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
 * Verify provider license
 */
export const verifyProviderLicense = async (userId: string, licenseNumber: string) => {
  try {
    // This would typically call an external verification service
    // For now, we'll just mark it as verified in the database
    const { data, error } = await supabase
      .from('provider_profiles')
      .update({ is_verified: true })
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
export const getProviderAvailability = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_id', userId);

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
export const updateProviderAvailability = async (userId: string, availability: any) => {
  try {
    const { data, error } = await supabase
      .from('provider_availability')
      .upsert({
        provider_id: userId,
        ...availability,
      })
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
 * Get provider rating and reviews
 */
export const getProviderRating = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('provider_ratings')
      .select('*')
      .eq('provider_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Calculate average rating
    const avgRating = data && data.length > 0
      ? data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length
      : 0;

    return { success: true, data, averageRating: avgRating };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
