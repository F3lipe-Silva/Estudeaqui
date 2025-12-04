import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get the current user session on the server side
export async function getCurrentUser() {
  try {
    // In a server component, this won't work directly
    // You'll need to handle session differently in server components
    // This is a placeholder for server-side auth handling
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// For server components, you might need to handle session with cookies
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  if (token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  return supabase;
}