/**
 * Vanguard ERP - Production Supabase Client Engine
 * Strictly defaults to production Vanguard ERP Supabase project endpoints.
 * Configured with session-scoped cookie & sessionStorage persistence (no permanent localStorage).
 */

import { createClient, SupabaseClient, SupportedStorage } from '@supabase/supabase-js';

// Production Vanguard ERP Supabase Project configuration
export const SUPABASE_URL: string = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  'https://cmntrzsaqapybfhngmdv.supabase.co';

export const SUPABASE_ANON_KEY: string = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  'sb_publishable_iJZBDyMfGUS2d34DI4lRZw_J8fcucuc';

/**
 * Ephemeral Session Storage Adapter for Supabase Auth
 * 
 * 1. Synchronized across all open tabs via session cookies (no Max-Age / no Expires).
 * 2. When all tabs/windows for the domain are closed, the browser flushes session cookies completely.
 * 3. Never stores authentication secrets in permanent localStorage.
 */
export const sessionCookieStorage: SupportedStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;
    try {
      const cookies = document.cookie ? document.cookie.split(';') : [];
      for (const cookie of cookies) {
        const parts = cookie.trim().split('=');
        const name = parts[0];
        const val = parts.slice(1).join('=');
        if (name === key || decodeURIComponent(name) === key) {
          return decodeURIComponent(val);
        }
      }
    } catch (e) {}

    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return;
    try {
      // Ephemeral session cookie: strictly omitted Expires and Max-Age
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
    } catch (e) {}

    try {
      sessionStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return;
    try {
      document.cookie = `${encodeURIComponent(key)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    } catch (e) {}

    try {
      sessionStorage.removeItem(key);
    } catch (e) {}
  },
};

// Proactively purge any residual auth tokens from permanent localStorage
if (typeof window !== 'undefined') {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('sb-') || k.includes('auth-token') || k === 'supabase-auth-token' || k === 'so_authenticated')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
}

// Safe client-side Supabase client initialization using session-scoped storage
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: sessionCookieStorage,
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
