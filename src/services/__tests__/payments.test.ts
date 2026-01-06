import {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
  processRefund,
  createPaymentRecord,
  updateAppointmentPaymentStatus,
} from '../payments';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
  },
}));

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializePayment', () => {
    it('should successfully initialize payment', async () => {
      const mockPayment = {
        reference: 'TH-1234567890',
        authorization_url: 'https://checkout.paystack.com/...',
        access_code: 'access-code-123',
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockPayment,
        error: null,
      });

      const result = await initializePayment(
        'patient-1',
        'patient@example.com',
        'John Doe',
        3900,
        'GHS'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPayment);
    });

    it('should handle payment initialization errors', async () => {
      const mockError = { message: 'Payment initialization failed' };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await initializePayment(
        'patient-1',
        'patient@example.com',
        'John Doe',
        3900,
        'GHS'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment initialization failed');
    });
  });

  describe('verifyPayment', () => {
    it('should successfully verify payment', async () => {
      const mockVerification = {
        status: 'success',
        reference: 'TH-1234567890',
        amount: 3900,
        currency: 'GHS',
        paid_at: new Date().toISOString(),
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockVerification,
        error: null,
      });

      const result = await verifyPayment('TH-1234567890');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVerification);
    });

    it('should handle payment verification errors', async () => {
      const mockError = { message: 'Payment verification failed' };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await verifyPayment('TH-1234567890');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment verification failed');
    });

    it('should handle failed payment status', async () => {
      const mockVerification = {
        status: 'failed',
        reference: 'TH-1234567890',
        message: 'Payment declined',
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockVerification,
        error: null,
      });

      const result = await verifyPayment('TH-1234567890');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Payment declined');
    });
  });

  describe('getPaymentHistory', () => {
    it('should successfully get payment history', async () => {
      const mockHistory = [
        {
          id: 'payment-1',
          reference: 'TH-1234567890',
          amount: 3900,
          status: 'success',
          created_at: new Date().toISOString(),
        },
        {
          id: 'payment-2',
          reference: 'TH-1234567891',
          amount: 2500,
          status: 'success',
          created_at: new Date().toISOString(),
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockHistory,
              error: null,
            }),
          }),
        }),
      });

      const result = await getPaymentHistory('patient-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHistory);
      expect(result.data.length).toBe(2);
    });

    it('should handle payment history fetch errors', async () => {
      const mockError = { message: 'History fetch failed' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await getPaymentHistory('patient-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('History fetch failed');
    });
  });

  describe('processRefund', () => {
    it('should successfully process refund', async () => {
      const mockRefund = {
        id: 'refund-1',
        reference: 'TH-1234567890',
        amount: 3900,
        status: 'success',
        processed_at: new Date().toISOString(),
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockRefund,
        error: null,
      });

      const result = await processRefund('TH-1234567890', 3900);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRefund);
    });

    it('should handle refund processing errors', async () => {
      const mockError = { message: 'Refund processing failed' };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await processRefund('TH-1234567890', 3900);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Refund processing failed');
    });
  });

  describe('createPaymentRecord', () => {
    it('should successfully create payment record', async () => {
      const mockRecord = {
        id: 'payment-1',
        patient_id: 'patient-1',
        appointment_id: 'appt-1',
        reference: 'TH-1234567890',
        amount: 3900,
        currency: 'GHS',
        status: 'success',
        created_at: new Date().toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockRecord,
              error: null,
            }),
          }),
        }),
      });

      const result = await createPaymentRecord(
        'patient-1',
        'appt-1',
        'TH-1234567890',
        3900,
        'GHS',
        'success'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRecord);
    });

    it('should handle payment record creation errors', async () => {
      const mockError = { message: 'Record creation failed' };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await createPaymentRecord(
        'patient-1',
        'appt-1',
        'TH-1234567890',
        3900,
        'GHS',
        'success'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Record creation failed');
    });
  });

  describe('updateAppointmentPaymentStatus', () => {
    it('should successfully update appointment payment status', async () => {
      const mockUpdated = {
        id: 'appt-1',
        status: 'paid',
        updated_at: new Date().toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdated,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updateAppointmentPaymentStatus('appt-1', 'paid');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdated);
    });

    it('should handle appointment update errors', async () => {
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

      const result = await updateAppointmentPaymentStatus('appt-1', 'paid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });
});
