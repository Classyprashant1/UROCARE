import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client using the SERVICE ROLE KEY.
 * WARNING: This client bypasses all Row Level Security (RLS) policies.
 * It should NEVER be exposed to the client-side and should only be used
 * in secure Server Actions or API routes after verifying the user's admin privileges.
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables for Admin Client.');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
