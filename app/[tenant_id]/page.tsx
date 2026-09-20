import { redirect } from 'next/navigation';
import { resolveEffectiveTenantId } from '@/lib/authTenantResolver';

interface TenantPageProps {
  params: Promise<{ tenant_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — Dynamic Tenant Root Route (/[tenant_id])
 * Forwards directly to the tenant's workspace Enterprise Overview Portal with active tenant context.
 */
export default async function TenantRootPage({ params, searchParams }: TenantPageProps) {
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
