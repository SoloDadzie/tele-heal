import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qtdzmmeupgyxpkjofhor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZHptbWV1cGd5eHBram9maG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTE3MTgsImV4cCI6MjA4MzI4NzcxOH0.aNL5xBzMTRNq_wZRv6ZGk0AOtga2p4hGxdlxC_9TjhI';

/**
 * Supabase client instance
 * Used for authentication and database operations
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Get the current session
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};
