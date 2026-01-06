import { supabase } from './supabase';

export interface SignUpData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
}

export interface LoginData {
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
 * Sign up a new user with email and password
 */
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          phone: data.phone,
          full_name: data.fullName,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: data.email,
          phone_number: data.phone,
          full_name: data.fullName,
          user_type: 'patient',
        },
      ]);

    if (profileError) {
      return { success: false, error: profileError.message };
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
 * Sign in with email and password
 */
export const signIn = async (data: LoginData): Promise<AuthResponse> => {
  try {
    // First, get the user's email from phone number
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('phone_number', data.phone)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Phone number not found' };
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
 * Sign out the current user
 */
export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get the current authenticated user
 */
export const getUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get the current session
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Reset password with email
 */
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://tele-heal.app/reset-password',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
