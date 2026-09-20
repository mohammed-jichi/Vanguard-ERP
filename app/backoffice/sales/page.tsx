import { redirect } from 'next/navigation';

interface SalesProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — Backoffice Sales Route Alias (/backoffice/sales)
 * Forwards directly to /backoffice/dashboard/sales
 */
export default async function BackofficeSalesAliasPage({ searchParams }: SalesProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
  }
  const query = qs.toString();
  redirect(`/backoffice/dashboard/sales${query ? `?${query}` : ''}`);
}
