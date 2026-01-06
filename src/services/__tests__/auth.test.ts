import { signUp, signIn, signOut, getUser } from '../auth';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123' };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await signUp({
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        fullName: 'Test User',
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
    });

    it('should handle signup errors', async () => {
      const mockError = { message: 'Email already exists' };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await signUp({
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        fullName: 'Test User',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: 'test@example.com' },
              error: null,
            }),
          }),
        }),
      });

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signIn({
        phone: '1234567890',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should handle signin errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Phone number not found' },
            }),
          }),
        }),
      });

      const result = await signIn({
        phone: '1234567890',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Phone number not found');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await signOut();

      expect(result.success).toBe(true);
    });

    it('should handle signout errors', async () => {
      const mockError = { message: 'Sign out failed' };

      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: mockError,
      });

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign out failed');
    });
  });

  describe('getUser', () => {
    it('should successfully get the current user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getUser();

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should handle getUser errors', async () => {
      const mockError = { message: 'Not authenticated' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await getUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });
  });
});
