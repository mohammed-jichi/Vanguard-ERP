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

const DEFAULT_MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';

function resolveEffectiveTenantId(rawId?: string | null): string {
  if (!rawId) return DEFAULT_MASTER_TENANT_ID;
  const trimmed = rawId.trim();
  const upper = trimmed.toUpperCase();
  if (
    trimmed === '1300' ||
    upper === 'SO-OLIVE' ||
    upper === 'SOUTHERN-OLIVE' ||
    upper === 'SOUTHERN_OLIVE' ||
    trimmed === DEFAULT_MASTER_TENANT_ID
  ) {
    return DEFAULT_MASTER_TENANT_ID;
  }
  return trimmed;
}

function resolveTenantRouteCode(rawId?: string | null): string {
  if (!rawId) return '1300';
  const trimmed = rawId.trim();
  const upper = trimmed.toUpperCase();
  if (
    trimmed === DEFAULT_MASTER_TENANT_ID ||
    trimmed === '1300' ||
    upper === 'SO-OLIVE' ||
    upper === 'SOUTHERN-OLIVE' ||
    upper === 'SOUTHERN_OLIVE'
  ) {
    return '1300';
  }
  return trimmed;
}

const NON_TENANT_PREFIXES = new Set([
  'admin', 'api', 'backoffice', 'dashboard', 'login', 'landing', 'workspace',
  'request-demo', 'forgot-password', 'setup', 'settings', 'contacts',
  'customersrecview', 'quotationsview', 'purchaseorder', 'editevent',
  'accounting', 'adjustments', 'connect', 'customer-insights',
  'delivery-of-goods', 'erp', 'inventory', 'journal-voucher', 'ledger',
  'loyalty', 'manage-product-requests', 'my-sales', 'operations-center',
  'pos', 'pressing', 'pressing-mill', 'product-insights',
  'product-req-preparation', 'product-request', 'product-request-reports',
  'purchase', 'purchase-orders', 'purchases', 'quotations', 'receipt',
  'receiving-of-goods', 'request-reject-reasons', 'sales', 'sales-control',
  'sales-manager-dashboard', 'sales-rep', 'schedule', 'social-crm',
  'southernolive-lb', 'supersonic', 'v-driver', 'v-store', 'vanguard-hub',
  'vtrack', '_next', 'favicon.ico'
]);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Skip auth callback APIs immediately
  if (EXCLUDED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Smoothly redirect any zero-filled UUID in route to short tenant code 1300
  if (pathname.startsWith('/00000000-0000-0000-0000-000000000001')) {
    const newPath = pathname.replace('/00000000-0000-0000-0000-000000000001', '/1300');
    return NextResponse.redirect(new URL(newPath + search, request.url));
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

  const rawTenantCookie = request.cookies.get('vanguard_tenant_id')?.value;
  const tenantRouteCode = resolveTenantRouteCode(rawTenantCookie);

  // 2. Root route & Login handling for authenticated users
  if (isAuthenticated && (pathname === '/' || pathname === '/login')) {
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    if (redirectTo && redirectTo.startsWith('/') && redirectTo !== '/login' && redirectTo !== '/') {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.redirect(new URL('/1300/dashboard', request.url));
  }

  // Unauthenticated users on root are redirected to /login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Unauthenticated users on /login proceed to login page
  if (pathname === '/login') {
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
      return NextResponse.redirect(new URL(`/${tenantRouteCode}/dashboard`, request.url));
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

  // 7. Dynamic tenant workspace routing & slug resolution
  const pathSegments = pathname.split('/').filter(Boolean);
  const candidateTenant = pathSegments[0];

  if (candidateTenant && !NON_TENANT_PREFIXES.has(candidateTenant.toLowerCase())) {
    const routeCode = resolveTenantRouteCode(candidateTenant);
    const effectiveUuid = resolveEffectiveTenantId(candidateTenant);

    // If user accesses just /1300 or /southern-olive, redirect to /1300/dashboard
    if (pathSegments.length === 1) {
      return NextResponse.redirect(new URL(`/${routeCode}/dashboard${search}`, request.url));
    }

    const subpath = pathSegments.slice(1).join('/');

    // Smoothly rewrite tenant workspace routes (e.g. /1300/dashboard, /1300/customers) to /backoffice
    // while keeping /1300/dashboard cleanly in the browser URL
    const targetBackofficePath = subpath === 'dashboard' ? '/backoffice' : `/backoffice/${subpath}`;
    const rewriteUrl = new URL(targetBackofficePath, request.url);
    rewriteUrl.searchParams.set('tenantId', routeCode);
    request.nextUrl.searchParams.forEach((val, key) => {
      if (key !== 'tenantId') rewriteUrl.searchParams.set(key, val);
    });

    const rewriteResponse = NextResponse.rewrite(rewriteUrl);
    // Ensure the effective tenant UUID is persisted in background context/cookie
    rewriteResponse.cookies.set('vanguard_tenant_id', effectiveUuid, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    rewriteResponse.cookies.set('vanguard_company_code', routeCode, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return rewriteResponse;
  }

  return NextResponse.next();
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
