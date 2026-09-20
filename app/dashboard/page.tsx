import { redirect } from 'next/navigation';

interface DashboardPageProps {
  searchParams: Promise<{ tenantId?: string; [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — /dashboard Shortcut Route
 * Forwards directly to the primary Enterprise Overview Portal / Main Hub (/backoffice) with active tenant context.
 */
export default async function DashboardRedirectPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const queryString = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val) queryString.set(key, val);
    });
  }
  const query = queryString.toString();
  redirect(`/backoffice${query ? `?${query}` : ''}`);
}
