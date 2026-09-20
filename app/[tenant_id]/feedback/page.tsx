import { redirect } from 'next/navigation';
import { resolveEffectiveTenantId } from '@/lib/authTenantResolver';

interface TenantFeedbackProps {
  params: Promise<{ tenant_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — Module 4: Feedback & Surveys (/[tenant_id]/feedback)
 * Loads Customer Complaints, CSAT/NPS Surveys & Customer Care consoles with active tenant context.
 */
export default async function TenantFeedbackPage({ params, searchParams }: TenantFeedbackProps) {
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
  redirect(`/backoffice/feedback?${qs.toString()}`);
}
