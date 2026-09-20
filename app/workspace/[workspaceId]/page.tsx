import { redirect } from 'next/navigation';
import { resolveEffectiveTenantId } from '@/lib/authTenantResolver';

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — /workspace/[workspaceId] Route
 * Loads the workspace Enterprise Overview Portal with the active tenant ID.
 */
export default async function WorkspaceByIdPage({ params, searchParams }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const extraParams = await searchParams;
  const queryString = new URLSearchParams();
  const effectiveId = resolveEffectiveTenantId(workspaceId);
  queryString.set('tenantId', effectiveId);
  if (extraParams) {
    Object.entries(extraParams).forEach(([key, val]) => {
      if (val && key !== 'tenantId') queryString.set(key, val);
    });
  }
  redirect(`/backoffice?${queryString.toString()}`);
}
