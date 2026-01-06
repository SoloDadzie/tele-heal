import {
  getVideoToken,
  startConsultation,
  endConsultation,
  addConsultationNotes,
  startRecording,
  stopRecording,
  createPrescription,
  getConsultationStatus,
} from '../video';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
  },
}));

describe('Video Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVideoToken', () => {
    it('should successfully get video token', async () => {
      const mockToken = 'twilio-token-123';

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { token: mockToken },
        error: null,
      });

      const result = await getVideoToken('user-123', 'room-123');

      expect(result.success).toBe(true);
      expect(result.token).toBe(mockToken);
    });

    it('should handle token generation errors', async () => {
      const mockError = { message: 'Token generation failed' };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await getVideoToken('user-123', 'room-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token generation failed');
    });
  });

  describe('startConsultation', () => {
    it('should successfully start consultation', async () => {
      const mockConsultation = {
        id: 'consult-1',
        patient_id: 'patient-1',
        provider_id: 'provider-1',
        status: 'in_progress',
        start_time: new Date().toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockConsultation,
              error: null,
            }),
          }),
        }),
      });

      const result = await startConsultation('patient-1', 'provider-1', 'Migraine follow-up');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConsultation);
    });

    it('should handle consultation start errors', async () => {
      const mockError = { message: 'Start failed' };

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

      const result = await startConsultation('patient-1', 'provider-1', 'Migraine follow-up');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Start failed');
    });
  });

  describe('endConsultation', () => {
    it('should successfully end consultation', async () => {
      const mockEndedConsultation = {
        id: 'consult-1',
        status: 'completed',
        end_time: new Date().toISOString(),
        notes: 'Patient improving',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockEndedConsultation,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await endConsultation('consult-1', 'Patient improving');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEndedConsultation);
    });

    it('should handle consultation end errors', async () => {
      const mockError = { message: 'End failed' };

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

      const result = await endConsultation('consult-1', 'Patient improving');

      expect(result.success).toBe(false);
      expect(result.error).toBe('End failed');
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

  describe('startRecording', () => {
    it('should successfully start recording', async () => {
      const mockRecording = {
        id: 'recording-1',
        status: 'recording',
        start_time: new Date().toISOString(),
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockRecording,
        error: null,
      });

      const result = await startRecording();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRecording);
    });

    it('should handle recording start errors', async () => {
      const mockError = { message: 'Recording start failed' };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await startRecording();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Recording start failed');
    });
  });

  describe('stopRecording', () => {
    it('should successfully stop recording', async () => {
      const mockRecording = {
        id: 'recording-1',
        status: 'completed',
        end_time: new Date().toISOString(),
        url: 'https://example.com/recording.mp4',
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockRecording,
        error: null,
      });

      const result = await stopRecording();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRecording);
    });

    it('should handle recording stop errors', async () => {
      const mockError = { message: 'Recording stop failed' };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await stopRecording();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Recording stop failed');
    });
  });

  describe('createPrescription', () => {
    it('should successfully create prescription', async () => {
      const mockPrescription = {
        id: 'rx-1',
        consultation_id: 'consult-1',
        medication: 'Aspirin',
        dosage: '500mg',
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

      const result = await createPrescription('consult-1', 'Aspirin', '500mg', 'Twice daily', '7 days');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPrescription);
    });
  });

  describe('getConsultationStatus', () => {
    it('should successfully get consultation status', async () => {
      const mockStatus = {
        id: 'consult-1',
        status: 'in_progress',
        patient_ready: true,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockStatus,
              error: null,
            }),
          }),
        }),
      });

      const result = await getConsultationStatus('consult-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStatus);
    });

    it('should handle status fetch errors', async () => {
      const mockError = { message: 'Status fetch failed' };

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

      const result = await getConsultationStatus('consult-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Status fetch failed');
    });
  });
});
