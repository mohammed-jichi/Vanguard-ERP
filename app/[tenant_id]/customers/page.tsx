import { redirect } from 'next/navigation';
import { resolveEffectiveTenantId } from '@/lib/authTenantResolver';

interface TenantCustomersProps {
  params: Promise<{ tenant_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — Module 3: Customer Management & AR (/[tenant_id]/customers)
 * Loads Customer Directory, KYC Onboarding, Aging & AR Ledgers with active tenant context.
 */
export default async function TenantCustomersPage({ params, searchParams }: TenantCustomersProps) {
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
  redirect(`/backoffice/customers?${qs.toString()}`);
}
