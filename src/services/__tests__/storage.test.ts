import {
  uploadDocument,
  uploadInsuranceCard,
  uploadLabResult,
  deleteFile,
  getFileUrl,
  listFiles,
} from '../storage';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadDocument', () => {
    it('should successfully upload document', async () => {
      const mockFile = {
        uri: 'file:///path/to/document.pdf',
        name: 'document.pdf',
        type: 'application/pdf',
      };

      const mockUploadResponse = {
        data: { path: 'documents/user-1/document.pdf' },
        error: null,
      };

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: jest.fn().mockResolvedValue(mockUploadResponse),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'doc-1',
                user_id: 'user-1',
                file_path: 'documents/user-1/document.pdf',
                file_name: 'document.pdf',
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await uploadDocument('user-1', mockFile);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('file_path');
    });

    it('should handle document upload errors', async () => {
      const mockFile = {
        uri: 'file:///path/to/document.pdf',
        name: 'document.pdf',
        type: 'application/pdf',
      };

      const mockError = { message: 'Upload failed' };

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await uploadDocument('user-1', mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });
  });

  describe('uploadInsuranceCard', () => {
    it('should successfully upload insurance card', async () => {
      const mockFile = {
        uri: 'file:///path/to/card.jpg',
        name: 'card.jpg',
        type: 'image/jpeg',
      };

      const mockUploadResponse = {
        data: { path: 'insurance/user-1/card.jpg' },
        error: null,
      };

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: jest.fn().mockResolvedValue(mockUploadResponse),
      });

      const result = await uploadInsuranceCard('user-1', mockFile, 'front');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('path');
    });

    it('should handle insurance card upload errors', async () => {
      const mockFile = {
        uri: 'file:///path/to/card.jpg',
        name: 'card.jpg',
        type: 'image/jpeg',
      };

      const mockError = { message: 'Upload failed' };

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await uploadInsuranceCard('user-1', mockFile, 'front');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });
  });

  describe('uploadLabResult', () => {
    it('should successfully upload lab result', async () => {
      const mockFile = {
        uri: 'file:///path/to/result.jpg',
        name: 'result.jpg',
        type: 'image/jpeg',
      };

      const mockUploadResponse = {
        data: { path: 'lab-results/user-1/result.jpg' },
        error: null,
      };

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: jest.fn().mockResolvedValue(mockUploadResponse),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'lab-1',
                user_id: 'user-1',
                file_path: 'lab-results/user-1/result.jpg',
                status: 'pendingReview',
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await uploadLabResult('user-1', mockFile);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('file_path');
    });

    it('should handle lab result upload errors', async () => {
      const mockFile = {
        uri: 'file:///path/to/result.jpg',
        name: 'result.jpg',
        type: 'image/jpeg',
      };

      const mockError = { message: 'Upload failed' };

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await uploadLabResult('user-1', mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });
  });

  describe('deleteFile', () => {
    it('should successfully delete file', async () => {
      (supabase.storage.from as jest.Mock).mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          data: { deleted: ['documents/user-1/document.pdf'] },
          error: null,
        }),
      });

      const result = await deleteFile('documents', 'documents/user-1/document.pdf');

      expect(result.success).toBe(true);
    });

    it('should handle file deletion errors', async () => {
      const mockError = { message: 'Deletion failed' };

      (supabase.storage.from as jest.Mock).mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await deleteFile('documents', 'documents/user-1/document.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Deletion failed');
    });
  });

  describe('getFileUrl', () => {
    it('should successfully get file URL', async () => {
      const mockUrl = 'https://example.com/documents/user-1/document.pdf';

      (supabase.storage.from as jest.Mock).mockReturnValue({
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: mockUrl },
        }),
      });

      const result = await getFileUrl('documents', 'documents/user-1/document.pdf');

      expect(result.success).toBe(true);
      expect(result.url).toBe(mockUrl);
    });

    it('should handle file URL retrieval errors', async () => {
      (supabase.storage.from as jest.Mock).mockReturnValue({
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: null },
        }),
      });

      const result = await getFileUrl('documents', 'documents/user-1/document.pdf');

      expect(result.success).toBe(false);
    });
  });

  describe('listFiles', () => {
    it('should successfully list files', async () => {
      const mockFiles = [
        { name: 'document1.pdf', id: 'file-1', updated_at: new Date().toISOString() },
        { name: 'document2.pdf', id: 'file-2', updated_at: new Date().toISOString() },
      ];

      (supabase.storage.from as jest.Mock).mockReturnValue({
        list: jest.fn().mockResolvedValue({
          data: mockFiles,
          error: null,
        }),
      });

      const result = await listFiles('documents', 'user-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFiles);
      expect(result.data.length).toBe(2);
    });

    it('should handle file listing errors', async () => {
      const mockError = { message: 'Listing failed' };

      (supabase.storage.from as jest.Mock).mockReturnValue({
        list: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      const result = await listFiles('documents', 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Listing failed');
    });
  });
});
