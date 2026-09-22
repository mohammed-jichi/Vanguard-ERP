import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { resolveUserTenantAndRole, getPostLoginDestination } from '@/lib/authTenantResolver';

/**
 * Vanguard ERP — Supabase Auth Callback Route
 * 
 * Handles OAuth redirects, magic links, and email confirmation code exchange.
 * Resolves the user's assigned tenant workspace from Supabase and redirects directly
 * to their tenant dashboard, strictly reserving /admin for Super Admins.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Supabase code exchange error:', error);
      } else if (data?.session?.user) {
        const userEmail = data.session.user.email || '';
        const userId = data.session.user.id;

        const companyId = requestUrl.searchParams.get('companyId') || requestUrl.searchParams.get('tenant') || undefined;

        // Query user's assigned tenant workspace & authorization role from Supabase
        const assignment = await resolveUserTenantAndRole(userEmail, userId, companyId);

        // Determine destination: tenant workspace dashboard vs /admin
        const destination = getPostLoginDestination(assignment, next);
        const redirectUrl = new URL(destination, request.url);

        const response = NextResponse.redirect(redirectUrl);

        response.cookies.set('so_authenticated', 'true', {
          path: '/',
          sameSite: 'lax',
        });
        response.cookies.set('vanguard_tenant_id', assignment.tenantId, {
          path: '/',
          sameSite: 'lax',
        });
        if (assignment.companyCode) {
          response.cookies.set('vanguard_company_code', assignment.companyCode, {
            path: '/',
            sameSite: 'lax',
          });
        }
        response.cookies.set('vanguard_user_role', assignment.role, {
          path: '/',
          sameSite: 'lax',
        });
        response.cookies.set('vanguard_auth_session', assignment.email, {
          path: '/',
          sameSite: 'lax',
        });
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          sameSite: 'lax',
        });
        response.cookies.set(`sb-${userId}-auth-token`, data.session.access_token, {
          path: '/',
          sameSite: 'lax',
        });

        return response;
      }
    } catch (err) {
      console.error('Error during auth code exchange:', err);
    }
  }

  // Fallback: If no code or exchange failed, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}
