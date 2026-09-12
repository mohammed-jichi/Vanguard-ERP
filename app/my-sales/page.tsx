import React from 'react';
import CRMSalesRepDashboardView from '@/components/CRMSalesRepDashboardView';

export const metadata = {
  title: 'My Sales Dashboard - Omega Software CRM - Vanguard ERP',
  description: 'Sales Rep Pipeline, Performance KPIs, Leads and Quotations Tracking',
};

export default function MySalesPage() {
  return <CRMSalesRepDashboardView />;
}
