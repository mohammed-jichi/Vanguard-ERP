import React from 'react';
import CommercialOilOperationsApp from '@/components/modules/production/CommercialOilOperationsApp';

export const metadata = {
  title: 'Commercial Oil Operations Dashboard - Vanguard ERP',
  description: 'Operations Dashboard for Commercial Oil Receiving, Blending, and Packaging',
};

export default function OilHubDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <CommercialOilOperationsApp />
    </main>
  );
}
