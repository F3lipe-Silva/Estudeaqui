// Supabase configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};

// Type definition for Supabase client
export type { SupabaseClient } from '@supabase/supabase-js';

// Re-export the clients
export { supabase } from './client';
export { supabaseAdmin } from './server';

// Export study management service
export { studyService } from './study-service';