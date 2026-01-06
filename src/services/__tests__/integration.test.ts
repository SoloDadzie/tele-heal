import { signUp, signIn } from '../auth';
import { providerSignUp, providerSignIn, getProviderProfile } from '../providerAuth';
import { getConsultationQueue, createPrescription } from '../providerDashboard';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('Service Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Patient Authentication Flow', () => {
    it('should complete patient signup and signin flow', async () => {
      const mockUser = { id: 'patient-1', email: 'patient@example.com' };
      const mockSession = { access_token: 'token-123' };

      // Signup
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const signupResult = await signUp({
        email: 'patient@example.com',
        phone: '1234567890',
        password: 'password123',
        fullName: 'John Doe',
      });

      expect(signupResult.success).toBe(true);

      // Signin
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: 'patient@example.com' },
              error: null,
            }),
          }),
        }),
      });

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const signinResult = await signIn({
        phone: '1234567890',
        password: 'password123',
      });

      expect(signinResult.success).toBe(true);
      expect(signinResult.user.id).toBe('patient-1');
    });
  });

  describe('Provider Authentication Flow', () => {
    it('should complete provider signup and profile retrieval', async () => {
      const mockUser = { id: 'provider-1', email: 'provider@example.com' };
      const mockSession = { access_token: 'token-123' };
      const mockProfile = {
        user_id: 'provider-1',
        license_number: 'LIC-123456',
        specialization: 'General Practice',
        is_verified: true,
      };

      // Signup
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        });

      const signupResult = await providerSignUp({
        email: 'provider@example.com',
        phone: '1234567890',
        password: 'password123',
        fullName: 'Dr. Test',
        licenseNumber: 'LIC-123456',
        specialization: 'General Practice',
        yearsOfExperience: 10,
      });

      expect(signupResult.success).toBe(true);

      // Get Profile
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const profileResult = await getProviderProfile('provider-1');

      expect(profileResult.success).toBe(true);
      expect(profileResult.data.license_number).toBe('LIC-123456');
    });
  });

  describe('Consultation Workflow', () => {
    it('should handle complete consultation workflow', async () => {
      const mockQueue = [
        {
          id: 'consult-1',
          patient_id: 'patient-1',
          status: 'waiting',
          scheduled_time: '2026-01-07T09:00:00',
        },
      ];

      const mockPrescription = {
        id: 'rx-1',
        consultation_id: 'consult-1',
        patient_id: 'patient-1',
        medication: 'Aspirin',
        status: 'active',
      };

      // Get consultation queue
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockQueue,
                error: null,
              }),
            }),
          }),
        }),
      });

      const queueResult = await getConsultationQueue('provider-1');
      expect(queueResult.success).toBe(true);
      expect(queueResult.data.length).toBe(1);

      // Create prescription
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockPrescription,
              error: null,
            }),
          }),
        }),
      });

      const prescriptionResult = await createPrescription(
        'consult-1',
        'patient-1',
        'Aspirin',
        '500mg',
        'Twice daily',
        '7 days'
      );

      expect(prescriptionResult.success).toBe(true);
      expect(prescriptionResult.data.medication).toBe('Aspirin');
    });
  });

  describe('Error Recovery', () => {
    it('should handle and recover from service errors', async () => {
      const mockError = { message: 'Service unavailable' };

      // First attempt fails
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      });

      const firstAttempt = await signUp({
        email: 'patient@example.com',
        phone: '1234567890',
        password: 'password123',
        fullName: 'John Doe',
      });

      expect(firstAttempt.success).toBe(false);

      // Second attempt succeeds
      const mockUser = { id: 'patient-1', email: 'patient@example.com' };
      const mockSession = { access_token: 'token-123' };

      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const secondAttempt = await signUp({
        email: 'patient@example.com',
        phone: '1234567890',
        password: 'password123',
        fullName: 'John Doe',
      });

      expect(secondAttempt.success).toBe(true);
    });
  });

  describe('Data Flow Validation', () => {
    it('should validate data flow through multiple services', async () => {
      const mockUser = { id: 'patient-1', email: 'patient@example.com' };
      const mockSession = { access_token: 'token-123' };

      // Signup with user data
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const signupResult = await signUp({
        email: 'patient@example.com',
        phone: '1234567890',
        password: 'password123',
        fullName: 'John Doe',
      });

      expect(signupResult.success).toBe(true);
      expect(signupResult.user.id).toBe('patient-1');

      // Verify user data is passed correctly
      expect(signupResult.user.email).toBe('patient@example.com');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent service calls', async () => {
      const mockUser = { id: 'patient-1', email: 'patient@example.com' };
      const mockSession = { access_token: 'token-123' };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: 'patient@example.com' },
              error: null,
            }),
          }),
        }),
      });

      // Run multiple operations concurrently
      const [signupResult1, signupResult2] = await Promise.all([
        signUp({
          email: 'patient1@example.com',
          phone: '1234567890',
          password: 'password123',
          fullName: 'John Doe',
        }),
        signUp({
          email: 'patient2@example.com',
          phone: '0987654321',
          password: 'password123',
          fullName: 'Jane Doe',
        }),
      ]);

      expect(signupResult1.success).toBe(true);
      expect(signupResult2.success).toBe(true);
    });
  });
});
