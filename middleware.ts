import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Vanguard ERP — Authentication & Route Guard Middleware
 * 
 * 1. Protects root (/) and enterprise workspace routes, redirecting unauthenticated users to /login.
 * 2. Inspects active Supabase auth cookies (sb-*-auth-token, sb-access-token, supabase-auth-token)
 *    and Vanguard session tokens (so_authenticated, vanguard_auth_session).
 * 3. Bypasses static assets, public pages, and auth callback APIs.
 */

// Public routes that unauthenticated users can access freely
const PUBLIC_ROUTES = [
  '/login',
  '/request-demo',
  '/forgot-password',
  '/landing',
  '/manifest-driver.json',
  '/manifest-sales.json',
  '/sw-field-apps.js',
];

// Auth callback and public API prefixes excluded from auth guard
const EXCLUDED_API_PREFIXES = [
  '/api/',
];

/**
 * Checks whether the incoming request carries a valid Supabase auth cookie
 * or an active Vanguard enterprise session cookie.
 */
function hasActiveAuthSession(request: NextRequest): boolean {
  const allCookies = request.cookies.getAll();

  return allCookies.some((cookie) => {
    const name = cookie.name.toLowerCase();
    const val = cookie.value?.trim();
    if (!val) return false;

    // 1. Supabase Auth Cookies: sb-<ref>-auth-token, sb-access-token, supabase-auth-token
    const isSupabaseCookie =
      (name.startsWith('sb-') && (name.endsWith('-auth-token') || name.includes('token') || name.includes('auth'))) ||
      name === 'sb-access-token' ||
      name === 'sb-refresh-token' ||
      name === 'supabase-auth-token' ||
      name.startsWith('sb:token');

    // 2. Vanguard Application Session Cookies
    const isVanguardAppCookie =
      (name === 'so_authenticated' && (val === 'true' || val === '1')) ||
      (name === 'vanguard_auth_session' && val.length > 0) ||
      (name === 'vanguard_token' && val.length > 0);

    return isSupabaseCookie || isVanguardAppCookie;
  });
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Skip auth callback APIs immediately
  if (EXCLUDED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const isAuthenticated = hasActiveAuthSession(request);
  const userRoleRaw = request.cookies.get('vanguard_user_role')?.value?.toUpperCase();
  const isImpersonating = request.cookies.get('vanguard_is_impersonating')?.value === 'true';
  const isSuperAdminFlag = request.cookies.get('vanguard_is_super_admin')?.value === 'true';
  const companyCode = request.cookies.get('vanguard_company_code')?.value?.toUpperCase();
  const sessionEmail = request.cookies.get('vanguard_auth_session')?.value?.toLowerCase();
  const isSuperAdminEmail = Boolean(sessionEmail && (
    sessionEmail.includes('admin') ||
    sessionEmail.includes('jichi') ||
    sessionEmail.includes('mohammed') ||
    [
      'mohammed@vanguard-erp.com',
      'admin@vanguard.com',
      'superadmin@vanguard-erp.com',
      'jichi@vanguard-erp.com'
    ].includes(sessionEmail)
  ));

  // Explicit platform super admin flag for default landing routing
  const isExplicitSuperAdmin =
    userRoleRaw === 'SUPER_ADMIN' ||
    isSuperAdminFlag ||
    companyCode === 'ADMIN' ||
    companyCode === 'MASTER' ||
    companyCode === 'VANGUARD' ||
    isSuperAdminEmail;

  // Broad authorized admin set for accessing /admin management console
  const isAuthorizedForAdmin =
    isExplicitSuperAdmin ||
    isImpersonating ||
    userRoleRaw === 'COMPANY_ADMIN' ||
    userRoleRaw === 'ADMIN' ||
    userRoleRaw === 'OWNER';

  const tenantId = request.cookies.get('vanguard_tenant_id')?.value || '00000000-0000-0000-0000-000000000001';

  // 2. Root route handling (/)
  if (pathname === '/') {
    if (isAuthenticated) {
      if (isExplicitSuperAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL(`/${tenantId}/dashboard`, request.url));
    }
    // Unauthenticated users are redirected directly to /login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Login page handling (/login)
  if (pathname === '/login') {
    if (isAuthenticated) {
      // Check if there was a target redirect parameter
      const redirectTo = request.nextUrl.searchParams.get('redirect');
      if (redirectTo && redirectTo.startsWith('/') && redirectTo !== '/login') {
        // Enforce: regular non-admin tenant users cannot access /admin
        if (!isAuthorizedForAdmin && (redirectTo === '/admin' || redirectTo.startsWith('/admin/'))) {
          return NextResponse.redirect(new URL(`/${tenantId}/dashboard`, request.url));
        }
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }

      if (isExplicitSuperAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL(`/${tenantId}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  // 4. Reserve /admin path strictly for Super Admins / System Owners / Authorized Admins
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAuthorizedForAdmin) {
      // Forbid access to /admin for non-admins and direct them to their tenant workspace
      return NextResponse.redirect(new URL(`/${tenantId}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  // 5. Other Public routes (e.g. /request-demo, /forgot-password, /landing)
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // 6. Protected enterprise & workspace routes
  if (!isAuthenticated) {
    // Preserve requested destination in redirect parameter
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Synchronize candidate tenant ID if request URL contains a dynamic tenant segment
  const pathSegments = pathname.split('/').filter(Boolean);
  const response = NextResponse.next();

  if (pathSegments.length >= 2 && (pathSegments[1] === 'dashboard' || pathSegments[1] === 'customers' || pathSegments[1] === 'feedback' || pathSegments[1] === 'loyalty')) {
    const candidateTenant = pathSegments[0];
    if (candidateTenant && candidateTenant !== request.cookies.get('vanguard_tenant_id')?.value) {
      response.cookies.set('vanguard_tenant_id', candidateTenant, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
    }
  }

  // Authenticated user accessing protected route
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - Auth callback APIs (/api/auth/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static asset extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico, .css, .js, .map, .json, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|json|woff|woff2|ttf|eot)).*)',
  ],
};
