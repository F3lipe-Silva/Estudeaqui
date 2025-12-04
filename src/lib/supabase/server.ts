import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// NOTE: You need to add SUPABASE_SERVICE_ROLE_KEY to your .env.local file
// You can find this in your Supabase dashboard under Project Settings > API
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);