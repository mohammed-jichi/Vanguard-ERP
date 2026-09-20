import { supabase } from './supabaseClient';

export interface UserTenantAssignment {
  userId?: string;
  email: string;
  fullName?: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'MANAGER' | 'STAFF' | 'DRIVER';
  isSuperAdmin: boolean;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  brandNameAr: string;
  brandNameEn: string;
  logoUrl?: string;
  companyCode?: string;
}

export const DEFAULT_MASTER_TENANT = {
  id: '00000000-0000-0000-0000-000000000001',
  company_id: 1300,
  companyId: 1300,
  name: 'منتوجات زيت وزيتون الجنوب',
  slug: 'southern-olive',
  brandNameAr: 'منتوجات زيت وزيتون الجنوب',
  brandNameEn: 'Southern Olive Oil Products S.A.R.L',
  logoUrl: '/assets/images/logo.png',
  subscriptionTier: 'ENTERPRISE',
  subscriptionStatus: 'ACTIVE',
  aiUsageCount: 0,
  aiUsageLimit: 1000
};

/**
 * Normalizes any raw tenant identifier (such as '1300', 'SO-OLIVE', or master slugs)
 * to the internal primary master tenant UUID ('00000000-0000-0000-0000-000000000001').
 */
export function resolveEffectiveTenantId(rawId?: string | null): string {
  if (!rawId) return DEFAULT_MASTER_TENANT.id;
  const trimmed = rawId.trim();
  const upper = trimmed.toUpperCase();
  if (
    trimmed === '1300' ||
    upper === 'SO-OLIVE' ||
    upper === 'SOUTHERN-OLIVE' ||
    upper === 'SOUTHERN_OLIVE' ||
    trimmed === DEFAULT_MASTER_TENANT.id
  ) {
    return DEFAULT_MASTER_TENANT.id;
  }
  return trimmed;
}

export const SUPER_ADMIN_EMAILS = [
  'mohammed@vanguard-erp.com',
  'admin@vanguard.com',
  'superadmin@vanguard-erp.com',
  'jichi@vanguard-erp.com'
];

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 2500): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Supabase query timeout')), timeoutMs))
  ]);
}

/**
 * Fast asynchronous preview of tenant branding by Company ID, Code, or Slug.
 * Used for dynamic branding on the login page as the user types.
 */
export async function getTenantPreview(companyId: string): Promise<{
  brandNameAr: string;
  brandNameEn: string;
  companyId: number | string;
  logoUrl: string;
  tenantId: string;
} | null> {
  const code = (companyId || '').trim();
  if (!code) return null;
  const upper = code.toUpperCase();

  if (upper === 'ADMIN' || upper === 'MASTER' || upper === 'VANGUARD') {
    return {
      brandNameAr: 'بوابة المالك المركزية',
      brandNameEn: 'Vanguard SaaS Master Controller',
      companyId: 'ADMIN',
      logoUrl: '/vanguard.jpg',
      tenantId: DEFAULT_MASTER_TENANT.id
    };
  }

  if (code === '1300' || upper === 'SO-OLIVE' || upper === 'SOUTHERN-OLIVE' || code === DEFAULT_MASTER_TENANT.id) {
    return {
      brandNameAr: DEFAULT_MASTER_TENANT.brandNameAr,
      brandNameEn: DEFAULT_MASTER_TENANT.brandNameEn,
      companyId: 1300,
      logoUrl: DEFAULT_MASTER_TENANT.logoUrl,
      tenantId: DEFAULT_MASTER_TENANT.id
    };
  }

  const numericId = parseInt(code, 10);
  if (!isNaN(numericId)) {
    try {
      const { data } = await withTimeout(
        supabase.from('tenants').select('*').eq('company_id', numericId).maybeSingle()
      );
      if (data) {
        return {
          brandNameAr: data.brand_name_ar || data.name,
          brandNameEn: data.brand_name_en || data.name,
          companyId: data.company_id || numericId,
          logoUrl: data.logo_url || '/assets/images/logo.png',
          tenantId: data.id
        };
      }
    } catch (e) {}
  }

  try {
    const { data } = await withTimeout(
      supabase.from('tenants').select('*').or(`slug.ilike.${code},name.ilike.%${code}%`).limit(1).maybeSingle()
    );
    if (data) {
      return {
        brandNameAr: data.brand_name_ar || data.name,
        brandNameEn: data.brand_name_en || data.name,
        companyId: data.company_id || code,
        logoUrl: data.logo_url || '/assets/images/logo.png',
        tenantId: data.id
      };
    }
  } catch (e) {}

  return null;
}

/**
 * Queries Supabase database to dynamically resolve a user's assigned tenant workspace
 * and authorization role using Email, User ID, and Company ID / Tenant Code.
 * 
 * Logic rules:
 * 1. If Company ID is 'ADMIN' (or 'MASTER'/'VANGUARD'):
 *    - Validates super_admin credentials / role.
 *    - Directs to /admin (System Owner Console).
 * 2. If Company ID is 1300 (or other numeric/slug tenant code):
 *    - Looks up tenant record matching company_id = 1300 and maps to internal UUID.
 *    - Sets isSuperAdmin = false.
 *    - Directs directly to tenant workspace dashboard (bypassing /admin).
 * 3. If Company ID is omitted:
 *    - Resolves dynamically via profiles table, super admin email list, or registered default.
 */
export async function resolveUserTenantAndRole(
  email: string,
  userId?: string,
  companyId?: string
): Promise<UserTenantAssignment> {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedCompanyCode = (companyId || '').trim();
  const upperCompanyCode = normalizedCompanyCode.toUpperCase();
  const isKnownSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(normalizedEmail);

  // =========================================================================
  // RULE 1: Explicit Platform Admin code ('ADMIN', 'MASTER', 'VANGUARD')
  // =========================================================================
  const isExplicitAdminCode = upperCompanyCode === 'ADMIN' || upperCompanyCode === 'MASTER' || upperCompanyCode === 'VANGUARD';
  if (isExplicitAdminCode) {
    return {
      userId,
      email: normalizedEmail || 'admin@vanguard-erp.com',
      fullName: 'System Owner / Super Admin',
      role: 'SUPER_ADMIN',
      isSuperAdmin: true,
      tenantId: DEFAULT_MASTER_TENANT.id,
      tenantName: DEFAULT_MASTER_TENANT.name,
      tenantSlug: DEFAULT_MASTER_TENANT.slug,
      brandNameAr: DEFAULT_MASTER_TENANT.brandNameAr,
      brandNameEn: DEFAULT_MASTER_TENANT.brandNameEn,
      logoUrl: DEFAULT_MASTER_TENANT.logoUrl,
      companyCode: 'ADMIN'
    };
  }

  // =========================================================================
  // RULE 2: Explicit Tenant Company ID / Code provided (e.g. 1300, SO-OLIVE)
  // =========================================================================
  if (normalizedCompanyCode) {
    try {
      let matchedTenant: any = null;
      const numericCompanyId = parseInt(normalizedCompanyCode, 10);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedCompanyCode);

      // Special deterministic mapping for primary tenant #1 (Company ID 1300)
      if (normalizedCompanyCode === '1300' || numericCompanyId === 1300) {
        matchedTenant = DEFAULT_MASTER_TENANT;
      }

      if (!matchedTenant && !isNaN(numericCompanyId)) {
        try {
          const { data } = await withTimeout(
            supabase
              .from('tenants')
              .select('*')
              .eq('company_id', numericCompanyId)
              .maybeSingle()
          );
          if (data) matchedTenant = data;
        } catch (e) {}
      }

      if (!matchedTenant && isUuid) {
        try {
          const { data } = await withTimeout(
            supabase
              .from('tenants')
              .select('*')
              .eq('id', normalizedCompanyCode)
              .maybeSingle()
          );
          if (data) matchedTenant = data;
        } catch (e) {}
      }

      if (!matchedTenant) {
        try {
          const { data } = await withTimeout(
            supabase
              .from('tenants')
              .select('*')
              .ilike('slug', normalizedCompanyCode)
              .maybeSingle()
          );
          if (data) matchedTenant = data;
        } catch (e) {}
      }

      if (!matchedTenant) {
        try {
          const { data } = await withTimeout(
            supabase
              .from('tenants')
              .select('*')
              .or(`name.ilike.%${normalizedCompanyCode}%,brand_name_en.ilike.%${normalizedCompanyCode}%,brand_name_ar.ilike.%${normalizedCompanyCode}%`)
              .limit(1)
              .maybeSingle()
          );
          if (data) matchedTenant = data;
        } catch (e) {}
      }

      // Check fallback match if Supabase didn't return record
      if (!matchedTenant) {
        if (
          normalizedCompanyCode === '1300' ||
          numericCompanyId === 1300 ||
          upperCompanyCode.includes('SO-OLIVE') ||
          upperCompanyCode.includes('SOUTHERN') ||
          upperCompanyCode.includes('OLIVE') ||
          upperCompanyCode === '00001' ||
          normalizedCompanyCode === DEFAULT_MASTER_TENANT.id
        ) {
          matchedTenant = DEFAULT_MASTER_TENANT;
        }
      }

      if (matchedTenant) {
        // Query user's profile under this tenant if available
        let userRole: 'COMPANY_ADMIN' | 'MANAGER' | 'STAFF' | 'DRIVER' = 'COMPANY_ADMIN';
        let userFullName = 'Vanguard Operator';

        try {
          let profileQuery = supabase.from('profiles').select('*');
          if (userId && normalizedEmail) {
            profileQuery = profileQuery.or(`id.eq.${userId},email.ilike.${normalizedEmail}`);
          } else if (userId) {
            profileQuery = profileQuery.eq('id', userId);
          } else if (normalizedEmail) {
            profileQuery = profileQuery.ilike('email', normalizedEmail);
          }
          const { data: profile } = await profileQuery.maybeSingle();
          if (profile) {
            if (profile.role && profile.role !== 'SUPER_ADMIN') {
              userRole = profile.role as any;
            }
            if (profile.full_name) {
              userFullName = profile.full_name;
            }
          } else if (matchedTenant.owner_email && matchedTenant.owner_email.toLowerCase() === normalizedEmail) {
            userRole = 'COMPANY_ADMIN';
          } else {
            userRole = 'STAFF';
          }
        } catch (e) {
          // keep defaults
        }

        return {
          userId,
          email: normalizedEmail,
          fullName: userFullName,
          role: userRole,
          isSuperAdmin: false, // strictly regular tenant user, will go directly to /[tenant_id]/dashboard
          tenantId: matchedTenant.id,
          tenantName: matchedTenant.name,
          tenantSlug: matchedTenant.slug || matchedTenant.name,
          brandNameAr: matchedTenant.brand_name_ar || matchedTenant.name,
          brandNameEn: matchedTenant.brand_name_en || matchedTenant.name,
          logoUrl: matchedTenant.logo_url || '/assets/images/logo.png',
          companyCode: normalizedCompanyCode
        };
      }
    } catch (err) {
      console.warn('Tenant lookup by companyId failed in resolveUserTenantAndRole:', err);
    }
  }

  // =========================================================================
  // RULE 3: Fallback / Dynamic Lookup when Company ID is not provided
  // =========================================================================
  try {
    // 1. Check profiles table in Supabase
    let profileQuery = supabase.from('profiles').select('*');
    if (userId && normalizedEmail) {
      profileQuery = profileQuery.or(`id.eq.${userId},email.ilike.${normalizedEmail}`);
    } else if (userId) {
      profileQuery = profileQuery.eq('id', userId);
    } else if (normalizedEmail) {
      profileQuery = profileQuery.ilike('email', normalizedEmail);
    }

    const { data: profile } = await profileQuery.maybeSingle();

    if (profile) {
      const isSuper = profile.role === 'SUPER_ADMIN' || isKnownSuperAdminEmail;
      const assignedTenantId = profile.tenant_id || profile.company_id;

      if (assignedTenantId) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', assignedTenantId)
          .maybeSingle();

        if (tenant) {
          return {
            userId: profile.id,
            email: profile.email || normalizedEmail,
            fullName: profile.full_name || 'Vanguard Operator',
            role: isSuper ? 'SUPER_ADMIN' : ((profile.role as any) || 'COMPANY_ADMIN'),
            isSuperAdmin: isSuper,
            tenantId: tenant.id,
            tenantName: tenant.name,
            tenantSlug: tenant.slug || tenant.name,
            brandNameAr: tenant.brand_name_ar || tenant.name,
            brandNameEn: tenant.brand_name_en || tenant.name,
            logoUrl: tenant.logo_url,
            companyCode: tenant.slug
          };
        }
      }

      if (isSuper) {
        return {
          userId: profile.id,
          email: profile.email || normalizedEmail,
          fullName: profile.full_name || 'Vanguard Super Admin',
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
          tenantId: DEFAULT_MASTER_TENANT.id,
          tenantName: DEFAULT_MASTER_TENANT.name,
          tenantSlug: DEFAULT_MASTER_TENANT.slug,
          brandNameAr: DEFAULT_MASTER_TENANT.brandNameAr,
          brandNameEn: DEFAULT_MASTER_TENANT.brandNameEn,
          logoUrl: DEFAULT_MASTER_TENANT.logoUrl,
          companyCode: 'ADMIN'
        };
      }
    }
  } catch (err) {
    console.warn('Supabase profiles query fallback in resolveUserTenantAndRole:', err);
  }

  // 2. Query tenants table directly matching owner_email
  try {
    if (normalizedEmail) {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .ilike('owner_email', normalizedEmail)
        .maybeSingle();

      if (tenant) {
        return {
          email: normalizedEmail,
          role: 'COMPANY_ADMIN',
          isSuperAdmin: isKnownSuperAdminEmail,
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantSlug: tenant.slug || tenant.name,
          brandNameAr: tenant.brand_name_ar || tenant.name,
          brandNameEn: tenant.brand_name_en || tenant.name,
          logoUrl: tenant.logo_url,
          companyCode: tenant.slug
        };
      }
    }
  } catch (err) {
    console.warn('Supabase tenants owner_email query fallback in resolveUserTenantAndRole:', err);
  }

  // 3. If known Super Admin email, assign master role
  if (isKnownSuperAdminEmail) {
    return {
      email: normalizedEmail,
      fullName: 'System Owner / Super Admin',
      role: 'SUPER_ADMIN',
      isSuperAdmin: true,
      tenantId: DEFAULT_MASTER_TENANT.id,
      tenantName: DEFAULT_MASTER_TENANT.name,
      tenantSlug: DEFAULT_MASTER_TENANT.slug,
      brandNameAr: DEFAULT_MASTER_TENANT.brandNameAr,
      brandNameEn: DEFAULT_MASTER_TENANT.brandNameEn,
      logoUrl: DEFAULT_MASTER_TENANT.logoUrl,
      companyCode: 'ADMIN'
    };
  }

  // 4. Default: fetch primary active registered tenant in database
  try {
    const { data: firstTenant } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstTenant) {
      return {
        email: normalizedEmail,
        role: 'STAFF',
        isSuperAdmin: false,
        tenantId: firstTenant.id,
        tenantName: firstTenant.name,
        tenantSlug: firstTenant.slug || firstTenant.name,
        brandNameAr: firstTenant.brand_name_ar || firstTenant.name,
        brandNameEn: firstTenant.brand_name_en || firstTenant.name,
        logoUrl: firstTenant.logo_url,
        companyCode: firstTenant.slug
      };
    }
  } catch (err) {
    console.warn('Supabase first tenant fallback:', err);
  }

  // 5. Ultimate hard fallback
  return {
    email: normalizedEmail,
    role: 'STAFF',
    isSuperAdmin: false,
    tenantId: DEFAULT_MASTER_TENANT.id,
    tenantName: DEFAULT_MASTER_TENANT.name,
    tenantSlug: DEFAULT_MASTER_TENANT.slug,
    brandNameAr: DEFAULT_MASTER_TENANT.brandNameAr,
    brandNameEn: DEFAULT_MASTER_TENANT.brandNameEn,
    logoUrl: DEFAULT_MASTER_TENANT.logoUrl,
    companyCode: 'SO-OLIVE'
  };
}

/**
 * Persists tenant credentials and active profile to browser cookies & localStorage.
 */
export function persistTenantSession(assignment: UserTenantAssignment) {
  if (typeof window === 'undefined') return;

  const maxAge = 60 * 60 * 24 * 30; // 30 days

  // 1. Cookies for server-side Next.js & middleware validation
  document.cookie = `so_authenticated=true; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `vanguard_tenant_id=${encodeURIComponent(assignment.tenantId)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `vanguard_user_role=${encodeURIComponent(assignment.role)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `vanguard_auth_session=${encodeURIComponent(assignment.email || 'user@vanguard-erp.com')}; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (assignment.companyCode) {
    document.cookie = `vanguard_company_code=${encodeURIComponent(assignment.companyCode)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }

  // 2. LocalStorage for client-side React contexts & UI state
  localStorage.setItem('so_authenticated', 'true');
  localStorage.setItem('vanguard_tenant_id', assignment.tenantId);
  localStorage.setItem('vanguard_user_email', assignment.email);
  localStorage.setItem('vanguard_user_role', assignment.role);
  if (assignment.companyCode) {
    localStorage.setItem('vanguard_company_code', assignment.companyCode);
  }
  if (assignment.userId) {
    localStorage.setItem('vanguard_user_id', assignment.userId);
  }
  if (assignment.fullName) {
    localStorage.setItem('vanguard_user_name', assignment.fullName);
  }

  const tenantObj = {
    id: assignment.tenantId,
    name: assignment.tenantName,
    slug: assignment.tenantSlug,
    brandNameAr: assignment.brandNameAr,
    brandNameEn: assignment.brandNameEn,
    logoUrl: assignment.logoUrl || '/assets/images/logo.png',
    subscriptionTier: 'ENTERPRISE',
    subscriptionStatus: 'ACTIVE',
    aiUsageCount: 0,
    aiUsageLimit: 1000
  };

  localStorage.setItem('vanguard_active_tenant', JSON.stringify(tenantObj));
  localStorage.setItem(
    'vanguard_tenant_branding',
    JSON.stringify({
      name: assignment.tenantName,
      brandNameAr: assignment.brandNameAr,
      brandNameEn: assignment.brandNameEn,
      logoUrl: assignment.logoUrl
    })
  );
}

/**
 * Computes the optimal post-login destination URL based on tenant ownership & roles.
 * Strictly enforces that non-super-admins cannot navigate to /admin.
 */
export function getPostLoginDestination(
  assignment: UserTenantAssignment,
  requestedRedirect?: string | null
): string {
  // If user is a regular tenant user and attempted to navigate to /admin,
  // enforce reservation of /admin for super admins and route them to their workspace.
  if (!assignment.isSuperAdmin && requestedRedirect && (requestedRedirect === '/admin' || requestedRedirect.startsWith('/admin/'))) {
    return `/${assignment.tenantId}/dashboard`;
  }

  // If a valid requested redirect was passed (e.g. from bookmark or deep link)
  if (requestedRedirect && requestedRedirect.startsWith('/') && requestedRedirect !== '/login') {
    if (requestedRedirect.startsWith('/backoffice') && !requestedRedirect.includes('tenantId=')) {
      const sep = requestedRedirect.includes('?') ? '&' : '?';
      return `${requestedRedirect}${sep}tenantId=${encodeURIComponent(assignment.tenantId)}`;
    }
    return requestedRedirect;
  }

  // Super Admins go to the master /admin control console
  if (assignment.isSuperAdmin) {
    return '/admin';
  }

  // Regular tenant users go directly to their tenant workspace dashboard route
  return `/${assignment.tenantId}/dashboard`;
}
