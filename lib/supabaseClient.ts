/**
 * Vanguard ERP - Resilient Supabase Client Engine
 * Provides safe client and server initialization, graceful fallback to production project,
 * CORS-safe configurations, and environment variable diagnostics.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Production Vanguard ERP Supabase Project configuration
// Used as resilient fallback if environment variables are not injected into the client bundle at build-time.
export const VANGUARD_DEFAULT_SUPABASE_URL = 'https://cmntrzsaqapybfhngmdv.supabase.co';
export const VANGUARD_DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_iJZBDyMfGUS2d34DI4lRZw_J8fcucuc';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Validate whether environment provided a valid, non-placeholder URL
const isPlaceholderUrl = !rawUrl || rawUrl.includes('placeholder.supabase.co') || rawUrl.trim() === '';
const isPlaceholderKey = !rawAnonKey || rawAnonKey.includes('placeholder-key') || rawAnonKey.trim() === '';

if (isPlaceholderUrl || isPlaceholderKey) {
  if (typeof window !== 'undefined') {
    console.warn(
      '[Vanguard Supabase Client] ⚠️ Warning: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from environment. ' +
      'Using verified project fallback. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel Project Settings.'
    );
  }
}

export const SUPABASE_URL: string = isPlaceholderUrl ? VANGUARD_DEFAULT_SUPABASE_URL : rawUrl;
export const SUPABASE_ANON_KEY: string = isPlaceholderKey ? VANGUARD_DEFAULT_SUPABASE_ANON_KEY : rawAnonKey;

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

export const isSupabaseConfigured: boolean = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('placeholder')
);

/**
 * Server-side Supabase client for Next.js API Routes and Server Components.
 * Prioritizes SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security (RLS) policies.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serverUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || SUPABASE_URL;
  const serverKey = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

  if (!serviceKey && typeof window === 'undefined') {
    console.info('[Vanguard Supabase Server] Running with anon key. If RLS restrictions apply, configure SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.');
  }

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
    isFallback: isPlaceholderUrl,
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    isConfigured: isSupabaseConfigured,
    runtime: typeof window !== 'undefined' ? 'browser' : 'server',
  };
}
