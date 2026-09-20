import { redirect } from 'next/navigation';
import { resolveEffectiveTenantId } from '@/lib/authTenantResolver';

interface TenantLoyaltyProps {
  params: Promise<{ tenant_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — Module 5: Loyalty Management (/[tenant_id]/loyalty)
 * Loads Reward Programs, VIP Tiers, Digital Passports & Loyalty Ledgers with active tenant context.
 */
export default async function TenantLoyaltyPage({ params, searchParams }: TenantLoyaltyProps) {
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
  redirect(`/backoffice/loyalty?${qs.toString()}`);
}
