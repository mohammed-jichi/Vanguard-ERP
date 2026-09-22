import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Vanguard ERP — Centralized Logout API Route
 * Flushes all authentication and tenant session cookies on server response.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  const cookiesToClear = [
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
    'supabase-auth-token',
  ];

  cookiesToClear.forEach((name) => {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      sameSite: 'lax',
    });
  });

  // Also clear any sb-* cookies
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith('sb-') || cookie.name.startsWith('vanguard_')) {
      response.cookies.set(cookie.name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
      });
    }
  });

  return response;
}

export async function GET(request: NextRequest) {
  const redirectUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(redirectUrl);

  const cookiesToClear = [
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
    'supabase-auth-token',
  ];

  cookiesToClear.forEach((name) => {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      sameSite: 'lax',
    });
  });

  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith('sb-') || cookie.name.startsWith('vanguard_')) {
      response.cookies.set(cookie.name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
      });
    }
  });

  return response;
}
