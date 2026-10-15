import React from 'react';
import CRMSalesRepDashboardView from '@/components/CRMSalesRepDashboardView';

export const metadata = {
  title: 'My Sales Dashboard — Vanguard ERP — Enterprise Operations System',
  description: 'Sales Rep Pipeline, Performance KPIs, Leads and Quotations Tracking — Southern Olive and Oil Products S.A.R.L.',
};

export default function MySalesPage() {
  return <CRMSalesRepDashboardView />;
}
