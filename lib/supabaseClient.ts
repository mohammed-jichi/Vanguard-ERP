/**
 * Vanguard ERP - Production Supabase Client Engine
 * Strictly defaults to production Vanguard ERP Supabase project endpoints.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Production Vanguard ERP Supabase Project configuration
export const SUPABASE_URL: string = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  'https://cmntrzsaqapybfhngmdv.supabase.co';

export const SUPABASE_ANON_KEY: string = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  'sb_publishable_iJZBDyMfGUS2d34DI4lRZw_J8fcucuc';

// Safe client-side Supabase client initialization
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'vanguard-erp',
      },
    },
  }
);

export const isSupabaseConfigured: boolean = true;

/**
 * Server-side Supabase client for Next.js API Routes and Server Components.
 * Prioritizes SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security (RLS) policies.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serverUrl = SUPABASE_URL;
  const serverKey = serviceKey || SUPABASE_ANON_KEY;

  return createClient(serverUrl, serverKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Diagnostic utility to inspect active Supabase runtime endpoints.
 */
export function getSupabaseDiagnostics() {
  return {
    url: SUPABASE_URL,
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    isConfigured: true,
    runtime: typeof window !== 'undefined' ? 'browser' : 'server',
  };
}
