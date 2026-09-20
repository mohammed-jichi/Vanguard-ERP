import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Vanguard ERP — Root Entry Route (/)
 * 
 * 1. Checks for active Supabase auth cookies or Vanguard enterprise session cookies.
 * 2. If unauthenticated, redirects directly to /login.
 * 3. If authenticated, redirects directly to /admin (or the active workspace).
 */
export default async function RootEntryPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const isAuthenticated = allCookies.some((cookie) => {
    const name = cookie.name.toLowerCase();
    const val = cookie.value?.trim();
    if (!val) return false;

    const isSupabase =
      (name.startsWith('sb-') && (name.endsWith('-auth-token') || name.includes('token') || name.includes('auth'))) ||
      name === 'sb-access-token' ||
      name === 'sb-refresh-token' ||
      name === 'supabase-auth-token' ||
      name.startsWith('sb:token');

    const isAppAuth =
      (name === 'so_authenticated' && (val === 'true' || val === '1')) ||
      (name === 'vanguard_auth_session' && val.length > 0) ||
      (name === 'vanguard_token' && val.length > 0);

    return isSupabase || isAppAuth;
  });

  if (isAuthenticated) {
    const userRole = cookieStore.get('vanguard_user_role')?.value;
    const isSuperAdmin = userRole === 'SUPER_ADMIN';

    if (isSuperAdmin) {
      redirect('/admin');
    } else {
      const tenantId = cookieStore.get('vanguard_tenant_id')?.value || '00000000-0000-0000-0000-000000000001';
      redirect(`/${tenantId}/dashboard`);
    }
  } else {
    redirect('/login');
  }
}
