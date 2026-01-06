import { signUp, signIn } from '../auth';
import { providerSignUp, providerSignIn } from '../providerAuth';
import { uploadLabResult } from '../storage';
import { initializePayment, verifyPayment } from '../payments';
import { startConsultation, endConsultation, createPrescription } from '../video';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
    functions: {
      invoke: jest.fn(),
    },
  },
}));

describe('E2E User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Patient Journey', () => {
    it('should complete patient signup, appointment booking, and payment flow', async () => {
      const mockUser = { id: 'patient-1', email: 'patient@example.com' };
      const mockSession = { access_token: 'token-123' };

      // Step 1: Patient signup
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

      // Step 2: Patient signin
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

      // Step 3: Initialize payment
      (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
        data: {
          reference: 'TH-1234567890',
          authorization_url: 'https://checkout.paystack.com/...',
        },
        error: null,
      });

      const paymentResult = await initializePayment(
        'patient-1',
        'patient@example.com',
        'John Doe',
        3900,
        'GHS'
      );

      expect(paymentResult.success).toBe(true);

      // Step 4: Verify payment
      (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
        data: {
          status: 'success',
          reference: 'TH-1234567890',
          amount: 3900,
        },
        error: null,
      });

      const verifyResult = await verifyPayment('TH-1234567890');

      expect(verifyResult.success).toBe(true);
    });
  });

  describe('Complete Provider Journey', () => {
    it('should complete provider signup, consultation, and prescription flow', async () => {
      const mockUser = { id: 'provider-1', email: 'provider@example.com' };
      const mockSession = { access_token: 'token-123' };

      // Step 1: Provider signup
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

      // Step 2: Provider signin
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: 'provider@example.com', user_type: 'provider' },
              error: null,
            }),
          }),
        }),
      });

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const signinResult = await providerSignIn({
        phone: '1234567890',
        password: 'password123',
      });

      expect(signinResult.success).toBe(true);

      // Step 3: Start consultation
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'consult-1',
                patient_id: 'patient-1',
                provider_id: 'provider-1',
                status: 'in_progress',
              },
              error: null,
            }),
          }),
        }),
      });

      const consultResult = await startConsultation(
        'patient-1',
        'provider-1',
        'Migraine follow-up'
      );

      expect(consultResult.success).toBe(true);

      // Step 4: Create prescription
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'rx-1',
                consultation_id: 'consult-1',
                medication: 'Aspirin',
                status: 'active',
              },
              error: null,
            }),
          }),
        }),
      });

      const prescriptionResult = await createPrescription(
        'consult-1',
        'Aspirin',
        '500mg',
        'Twice daily',
        '7 days'
      );

      expect(prescriptionResult.success).toBe(true);

      // Step 5: End consultation
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'consult-1',
                  status: 'completed',
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const endResult = await endConsultation('consult-1', 'Patient improving');

      expect(endResult.success).toBe(true);
    });
  });

  describe('Lab Result Upload Flow', () => {
    it('should complete lab result upload and verification flow', async () => {
      const mockFile = {
        uri: 'file:///path/to/result.jpg',
        name: 'result.jpg',
        type: 'image/jpeg',
      };

      // Step 1: Upload lab result
      (supabase.storage.from as jest.Mock).mockReturnValueOnce({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'lab-results/patient-1/result.jpg' },
          error: null,
        }),
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'lab-1',
                user_id: 'patient-1',
                file_path: 'lab-results/patient-1/result.jpg',
                status: 'pendingReview',
              },
              error: null,
            }),
          }),
        }),
      });

      const uploadResult = await uploadLabResult('patient-1', mockFile);

      expect(uploadResult.success).toBe(true);
      expect(uploadResult.data.status).toBe('pendingReview');
    });
  });

  describe('Error Handling in User Flows', () => {
    it('should handle and recover from errors in patient flow', async () => {
      const mockError = { message: 'Service unavailable' };

      // First signup attempt fails
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

      // Retry succeeds
      const mockUser = { id: 'patient-1', email: 'patient@example.com' };
      const mockSession = { access_token: 'token-123' };

      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const retryResult = await signUp({
        email: 'patient@example.com',
        phone: '1234567890',
        password: 'password123',
        fullName: 'John Doe',
      });

      expect(retryResult.success).toBe(true);
    });
  });

  describe('Multi-User Concurrent Flows', () => {
    it('should handle multiple users in concurrent flows', async () => {
      const mockUser1 = { id: 'patient-1', email: 'patient1@example.com' };
      const mockUser2 = { id: 'patient-2', email: 'patient2@example.com' };
      const mockSession = { access_token: 'token-123' };

      (supabase.auth.signUp as jest.Mock)
        .mockResolvedValueOnce({
          data: { user: mockUser1, session: mockSession },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { user: mockUser2, session: mockSession },
          error: null,
        });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        });

      // Concurrent signups
      const [result1, result2] = await Promise.all([
        signUp({
          email: 'patient1@example.com',
          phone: '1111111111',
          password: 'password123',
          fullName: 'Patient One',
        }),
        signUp({
          email: 'patient2@example.com',
          phone: '2222222222',
          password: 'password123',
          fullName: 'Patient Two',
        }),
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.user.id).toBe('patient-1');
      expect(result2.user.id).toBe('patient-2');
    });
  });

  describe('Data Integrity in Flows', () => {
    it('should maintain data integrity through complete flow', async () => {
      const mockUser = { id: 'patient-1', email: 'patient@example.com' };
      const mockSession = { access_token: 'token-123' };
      const originalData = {
        email: 'patient@example.com',
        phone: '1234567890',
        fullName: 'John Doe',
      };

      // Signup with original data
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const signupResult = await signUp({
        email: originalData.email,
        phone: originalData.phone,
        password: 'password123',
        fullName: originalData.fullName,
      });

      expect(signupResult.success).toBe(true);
      expect(signupResult.user.email).toBe(originalData.email);

      // Verify data integrity
      expect(signupResult.user.id).toBe('patient-1');
    });
  });
});
