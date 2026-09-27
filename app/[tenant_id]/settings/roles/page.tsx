import { redirect } from 'next/navigation';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';

interface TenantRolesProps {
  params: Promise<{ tenant_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — Dynamic Tenant Roles & Permissions Route (/[tenant_id]/settings/roles)
 * Forwards directly to the backoffice Roles & Permissions console with active tenant context.
 */
export default async function TenantRolesPage({ params, searchParams }: TenantRolesProps) {
  const { tenant_id } = await params;
  const extra = await searchParams;
  const qs = new URLSearchParams();
  const routeCode = resolveTenantRouteCode(tenant_id);
  qs.set('tenantId', routeCode);

  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v && k !== 'tenantId') qs.set(k, v);
    });
  }

  redirect(`/backoffice/settings/roles?${qs.toString()}`);
}
