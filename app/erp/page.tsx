import { redirect } from 'next/navigation';

interface ErpPageProps {
  searchParams: Promise<{ tenantId?: string; [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — /erp Workspace Redirect Route
 * Smoothly forwards to the primary Enterprise Overview Portal with active tenant context.
 */
export default async function ErpRedirectPage({ searchParams }: ErpPageProps) {
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
