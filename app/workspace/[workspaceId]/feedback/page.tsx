import { redirect } from 'next/navigation';
import { resolveEffectiveTenantId } from '@/lib/authTenantResolver';

interface WorkspaceFeedbackProps {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function WorkspaceFeedbackPage({ params, searchParams }: WorkspaceFeedbackProps) {
  const { workspaceId } = await params;
  const extra = await searchParams;
  const qs = new URLSearchParams();
  const effectiveId = resolveEffectiveTenantId(workspaceId);
  qs.set('tenantId', effectiveId);
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v && k !== 'tenantId') qs.set(k, v);
    });
  }
  redirect(`/backoffice/feedback?${qs.toString()}`);
}
