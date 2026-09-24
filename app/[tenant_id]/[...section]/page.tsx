import { redirect } from 'next/navigation';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';

interface TenantSectionProps {
  params: Promise<{ tenant_id: string; section: string[] }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — Dynamic Tenant Route Catch-All (/[tenant_id]/[...section])
 * Forwards any tenant-specific module or subsection request directly to the
 * corresponding backoffice route with active tenant context, eliminating 404 errors.
 */
export default async function TenantCatchAllSectionPage({ params, searchParams }: TenantSectionProps) {
  const { tenant_id, section } = await params;
  const extra = await searchParams;
  const qs = new URLSearchParams();
  const routeCode = resolveTenantRouteCode(tenant_id);
  qs.set('tenantId', routeCode);

  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v && k !== 'tenantId') qs.set(k, v);
    });
  }

  const subpath = Array.isArray(section) && section.length > 0 ? section.join('/') : 'dashboard';
  redirect(`/backoffice/${subpath}?${qs.toString()}`);
}
