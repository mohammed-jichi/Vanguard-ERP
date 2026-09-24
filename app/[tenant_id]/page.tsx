import { redirect } from 'next/navigation';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';

interface TenantPageProps {
  params: Promise<{ tenant_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — Dynamic Tenant Root Route (/[tenant_id])
 * Forwards directly to the tenant's workspace dashboard route (e.g. /1300/dashboard) with active tenant context.
 */
export default async function TenantRootPage({ params, searchParams }: TenantPageProps) {
  const { tenant_id } = await params;
  const extra = await searchParams;
  const routeCode = resolveTenantRouteCode(tenant_id);
  const qs = new URLSearchParams();
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v && k !== 'tenantId') qs.set(k, v);
    });
  }
  const queryStr = qs.toString();
  redirect(`/${routeCode}/dashboard${queryStr ? `?${queryStr}` : ''}`);
}
