import { redirect } from 'next/navigation';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';

interface WorkspaceCustomersProps {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function WorkspaceCustomersPage({ params, searchParams }: WorkspaceCustomersProps) {
  const { workspaceId } = await params;
  const extra = await searchParams;
  const qs = new URLSearchParams();
  const routeCode = resolveTenantRouteCode(workspaceId);
  qs.set('tenantId', routeCode);
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v && k !== 'tenantId') qs.set(k, v);
    });
  }
  redirect(`/backoffice/customers?${qs.toString()}`);
}
