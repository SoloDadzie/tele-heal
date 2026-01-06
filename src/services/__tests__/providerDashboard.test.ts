import {
  getConsultationQueue,
  getConsultationHistory,
  updateConsultationStatus,
  addConsultationNotes,
  createPrescription,
  orderLabTest,
  getProviderTasks,
  createProviderTask,
  updateTaskStatus,
  getProviderStats,
} from '../providerDashboard';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Provider Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConsultationQueue', () => {
    it('should successfully get consultation queue', async () => {
      const mockQueue = [
        {
          id: 'consult-1',
          patient_id: 'patient-1',
          status: 'waiting',
          scheduled_time: '2026-01-07T09:00:00',
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
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

      const result = await getConsultationQueue('provider-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQueue);
    });

    it('should handle queue fetch errors', async () => {
      const mockError = { message: 'Failed to fetch queue' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: mockError,
              }),
            }),
          }),
        }),
      });

      const result = await getConsultationQueue('provider-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch queue');
    });
  });

  describe('updateConsultationStatus', () => {
    it('should successfully update consultation status', async () => {
      const mockUpdated = {
        id: 'consult-1',
        status: 'completed',
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

      const result = await updateConsultationStatus('consult-1', 'completed');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdated);
    });

    it('should handle status update errors', async () => {
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

      const result = await updateConsultationStatus('consult-1', 'completed');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('addConsultationNotes', () => {
    it('should successfully add consultation notes', async () => {
      const mockNotes = {
        id: 'consult-1',
        notes: 'Patient reports improvement',
        updated_at: new Date().toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockNotes,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await addConsultationNotes('consult-1', 'Patient reports improvement');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockNotes);
    });
  });

  describe('createPrescription', () => {
    it('should successfully create prescription', async () => {
      const mockPrescription = {
        id: 'rx-1',
        consultation_id: 'consult-1',
        patient_id: 'patient-1',
        medication: 'Aspirin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '7 days',
        status: 'active',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockPrescription,
              error: null,
            }),
          }),
        }),
      });

      const result = await createPrescription(
        'consult-1',
        'patient-1',
        'Aspirin',
        '500mg',
        'Twice daily',
        '7 days'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPrescription);
    });

    it('should handle prescription creation errors', async () => {
      const mockError = { message: 'Creation failed' };

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

      const result = await createPrescription(
        'consult-1',
        'patient-1',
        'Aspirin',
        '500mg',
        'Twice daily',
        '7 days'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('orderLabTest', () => {
    it('should successfully order lab test', async () => {
      const mockLabOrder = {
        id: 'lab-1',
        consultation_id: 'consult-1',
        patient_id: 'patient-1',
        test_name: 'Complete Blood Count',
        instructions: 'Fasting required',
        status: 'pending',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockLabOrder,
              error: null,
            }),
          }),
        }),
      });

      const result = await orderLabTest(
        'consult-1',
        'patient-1',
        'Complete Blood Count',
        'Fasting required'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLabOrder);
    });
  });

  describe('getProviderTasks', () => {
    it('should successfully get provider tasks', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          provider_id: 'provider-1',
          title: 'Review lab results',
          status: 'pending',
          due_date: '2026-01-07',
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockTasks,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getProviderTasks('provider-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTasks);
    });
  });

  describe('createProviderTask', () => {
    it('should successfully create provider task', async () => {
      const mockTask = {
        id: 'task-1',
        provider_id: 'provider-1',
        title: 'Review lab results',
        description: 'Review patient lab results',
        due_date: '2026-01-07',
        priority: 'high',
        status: 'pending',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockTask,
              error: null,
            }),
          }),
        }),
      });

      const result = await createProviderTask(
        'provider-1',
        'Review lab results',
        'Review patient lab results',
        '2026-01-07',
        'high'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTask);
    });
  });

  describe('updateTaskStatus', () => {
    it('should successfully update task status', async () => {
      const mockUpdatedTask = {
        id: 'task-1',
        status: 'completed',
        updated_at: new Date().toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedTask,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updateTaskStatus('task-1', 'completed');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedTask);
    });
  });

  describe('getProviderStats', () => {
    it('should successfully get provider statistics', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            count: jest.fn().mockResolvedValue({
              count: 10,
              error: null,
            }),
          }),
        }),
      });

      const result = await getProviderStats('provider-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalConsultations');
      expect(result.data).toHaveProperty('completedConsultations');
      expect(result.data).toHaveProperty('pendingTasks');
      expect(result.data).toHaveProperty('completionRate');
    });
  });
});
