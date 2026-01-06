import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signUp, signIn, signOut, getUser, getSession } from '../services/auth';

export interface User {
  id: string;
  email: string;
  phone_number?: string;
  full_name?: string;
  user_type?: 'patient' | 'provider' | 'admin';
  is_verified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signUp: (email: string, phone: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the app and provides authentication state
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize auth state on app launch
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if session exists
        const sessionResult = await getSession();
        if (sessionResult.success && sessionResult.session) {
          // Get user data
          const userResult = await getUser();
          if (userResult.success && userResult.user) {
            setUser({
              id: userResult.user.id,
              email: userResult.user.email || '',
              phone_number: userResult.user.user_metadata?.phone,
              full_name: userResult.user.user_metadata?.full_name,
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle user sign up
   */
  const handleSignUp = useCallback(
    async (email: string, phone: string, password: string, fullName: string) => {
      try {
        setIsLoading(true);
        const result = await signUp({ email, phone, password, fullName });

        if (result.success && result.user) {
          setUser({
            id: result.user.id,
            email: result.user.email || '',
            phone_number: phone,
            full_name: fullName,
          });
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Handle user sign in
   */
  const handleSignIn = useCallback(
    async (phone: string, password: string) => {
      try {
        setIsLoading(true);
        const result = await signIn({ phone, password });

        if (result.success && result.user) {
          setUser({
            id: result.user.id,
            email: result.user.email || '',
            phone_number: phone,
          });
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Handle user sign out
   */
  const handleSignOut = useCallback(
    async () => {
      try {
        setIsLoading(true);
        const result = await signOut();

        if (result.success) {
          setUser(null);
          await AsyncStorage.removeItem('auth_session');
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Refresh session before token expiry
   */
  const refreshSession = useCallback(
    async () => {
      try {
        const sessionResult = await getSession();
        if (sessionResult.success && sessionResult.session) {
          const userResult = await getUser();
          if (userResult.success && userResult.user) {
            setUser({
              id: userResult.user.id,
              email: userResult.user.email || '',
              phone_number: userResult.user.user_metadata?.phone,
              full_name: userResult.user.user_metadata?.full_name,
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error refreshing session:', error);
      }
    },
    []
  );

  const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn: !!user,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
