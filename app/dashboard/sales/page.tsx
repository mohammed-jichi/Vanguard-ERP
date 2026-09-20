import { redirect } from 'next/navigation';

interface SalesDashboardProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/**
 * Vanguard ERP — Dedicated Sales Dashboard Route (/dashboard/sales)
 * Forwards directly into the authenticated Backoffice Sales Control Dashboard.
 */
export default async function SalesDashboardForwarderPage({ searchParams }: SalesDashboardProps) {
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
