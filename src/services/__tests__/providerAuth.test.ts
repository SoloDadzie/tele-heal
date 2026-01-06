import { providerSignUp, providerSignIn, getProviderProfile, updateProviderProfile } from '../providerAuth';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('Provider Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('providerSignUp', () => {
    it('should successfully sign up a new provider', async () => {
      const mockUser = { id: 'provider-123', email: 'provider@example.com' };
      const mockSession = { access_token: 'token-123' };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await providerSignUp({
        email: 'provider@example.com',
        phone: '1234567890',
        password: 'password123',
        fullName: 'Dr. Test',
        licenseNumber: 'LIC-123456',
        specialization: 'General Practice',
        yearsOfExperience: 10,
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should handle provider signup errors', async () => {
      const mockError = { message: 'Email already exists' };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await providerSignUp({
        email: 'provider@example.com',
        phone: '1234567890',
        password: 'password123',
        fullName: 'Dr. Test',
        licenseNumber: 'LIC-123456',
        specialization: 'General Practice',
        yearsOfExperience: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('providerSignIn', () => {
    it('should successfully sign in a provider', async () => {
      const mockUser = { id: 'provider-123', email: 'provider@example.com' };
      const mockSession = { access_token: 'token-123' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: 'provider@example.com', user_type: 'provider' },
              error: null,
            }),
          }),
        }),
      });

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await providerSignIn({
        phone: '1234567890',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should reject non-provider accounts', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: 'patient@example.com', user_type: 'patient' },
              error: null,
            }),
          }),
        }),
      });

      const result = await providerSignIn({
        phone: '1234567890',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('This account is not a provider account');
    });
  });

  describe('getProviderProfile', () => {
    it('should successfully get provider profile', async () => {
      const mockProfile = {
        user_id: 'provider-123',
        license_number: 'LIC-123456',
        specialization: 'General Practice',
        years_of_experience: 10,
        is_verified: true,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const result = await getProviderProfile('provider-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
    });

    it('should handle profile fetch errors', async () => {
      const mockError = { message: 'Profile not found' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await getProviderProfile('provider-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Profile not found');
    });
  });

  describe('updateProviderProfile', () => {
    it('should successfully update provider profile', async () => {
      const mockUpdatedProfile = {
        user_id: 'provider-123',
        license_number: 'LIC-123456',
        specialization: 'Cardiology',
        years_of_experience: 15,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedProfile,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updateProviderProfile('provider-123', {
        specialization: 'Cardiology',
        years_of_experience: 15,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedProfile);
    });

    it('should handle profile update errors', async () => {
      const mockError = { message: 'Update failed' };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: mockError,
              }),
            }),
          }),
        }),
      });

      const result = await updateProviderProfile('provider-123', {
        specialization: 'Cardiology',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });
});
