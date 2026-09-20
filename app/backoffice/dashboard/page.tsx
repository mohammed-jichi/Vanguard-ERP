import React from 'react';
import EnterpriseOverviewHub from '@/components/EnterpriseOverviewHub';

export const metadata = {
  title: 'Enterprise Overview Hub | Vanguard ERP',
  description: 'Primary enterprise overview portal and main operational hub for Vanguard ERP.',
};

/**
 * Vanguard ERP — Backoffice Dashboard Route (/backoffice/dashboard)
 * Renders the primary Enterprise Overview Portal / Main Hub.
 * (The Sales Control Dashboard is located at /dashboard/sales and /backoffice/dashboard/sales).
 */
export default function BackofficeDashboardHubPage() {
  return <EnterpriseOverviewHub />;
}
