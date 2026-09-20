import { redirect } from 'next/navigation';
import { DEFAULT_MASTER_TENANT } from '@/lib/authTenantResolver';

interface WorkspacePageProps {
  searchParams: Promise<{ tenantId?: string; [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — /workspace Shortcut Route
 * Resolves active tenant workspace or forwards to master workspace Enterprise Overview Hub.
 */
export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const params = await searchParams;
  const queryString = new URLSearchParams();
  const effectiveId = params?.tenantId || DEFAULT_MASTER_TENANT.id;
  queryString.set('tenantId', effectiveId);

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val && key !== 'tenantId') queryString.set(key, val);
    });
  }

  redirect(`/backoffice?${queryString.toString()}`);
}
