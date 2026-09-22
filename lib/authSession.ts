/**
 * Vanguard ERP — Centralized Authentication & Session Management
 * 
 * Strict Session & Security Protocol:
 * 1. Auth cookies are purely session-based (no max-age / no expires),
 *    ensuring the browser automatically flushes authentication upon tab/window closure.
 * 2. Provides deterministic session clearing on explicit logout across cookies,
 *    sessionStorage, localStorage, Supabase auth, and server-side response headers.
 */

import { supabase } from './supabaseClient';

export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  // 1. Clear session storage (session-scoped memory)
  try {
    sessionStorage.clear();
  } catch (e) {}

  // 2. Clear authentication keys from local storage
  const authKeys = [
    'so_authenticated',
    'vanguard_user_role',
    'vanguard_user_email',
    'vanguard_user_name',
    'vanguard_user_id',
    'vanguard_is_super_admin',
    'vanguard_is_impersonating',
    'vanguard_auth_session',
    'vanguard_company_code',
    'vanguard_token'
  ];
  authKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  });

  // 3. Expire all session cookies immediately on client
  const cookieNames = [
    'so_authenticated',
    'vanguard_tenant_id',
    'vanguard_user_role',
    'vanguard_auth_session',
    'vanguard_is_super_admin',
    'vanguard_is_impersonating',
    'vanguard_company_code',
    'vanguard_token',
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token'
  ];

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  });

  // Expire any dynamic sb-*-auth-token cookies
  try {
    document.cookie.split(';').forEach((cookie) => {
      const trimmed = cookie.trim().split('=')[0];
      if (trimmed && (trimmed.startsWith('sb-') || trimmed.startsWith('vanguard_'))) {
        document.cookie = `${trimmed}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
    });
  } catch (e) {}

  // 4. Safely terminate Supabase session
  try {
    supabase.auth.signOut().catch(() => {});
  } catch (e) {}

  // 5. Fire server-side logout route to clear HTTP-only cookies
  try {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  } catch (e) {}

  // 6. Direct user to login screen
  window.location.href = '/login';
}

/**
 * Checks whether client carries an active session cookie.
 */
export function hasClientSession(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => {
    const [name, val] = c.trim().split('=');
    return (
      (name === 'so_authenticated' && (val === 'true' || val === '1')) ||
      (name === 'vanguard_auth_session' && Boolean(val)) ||
      (name === 'sb-access-token' && Boolean(val))
    );
  });
}
