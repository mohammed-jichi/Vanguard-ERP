import { redirect } from 'next/navigation';
import { resolveEffectiveTenantId } from '@/lib/authTenantResolver';

interface TenantDashboardProps {
  params: Promise<{ tenant_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — Dynamic Tenant Workspace Dashboard Route (/[tenant_id]/dashboard)
 * Forwards directly to the primary Enterprise Overview Portal / Main Hub with active tenant context.
 */
export default async function TenantDashboardPage({ params, searchParams }: TenantDashboardProps) {
  const { tenant_id } = await params;
  const extra = await searchParams;
  const qs = new URLSearchParams();
  const effectiveId = resolveEffectiveTenantId(tenant_id);
  qs.set('tenantId', effectiveId);
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v && k !== 'tenantId') qs.set(k, v);
    });
  }
  redirect(`/backoffice?${qs.toString()}`);
}
