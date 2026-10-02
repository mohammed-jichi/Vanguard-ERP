import React from 'react';
import CommercialOilOperationsApp from '@/components/modules/production/CommercialOilOperationsApp';

export const metadata = {
  title: 'Commercial Oil Operations & Packaging - Vanguard Backoffice',
  description: 'Enterprise Backoffice Module for Commercial Oil Operations, Blending, and Packaging',
};

export default function BackofficeOilProductionPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <CommercialOilOperationsApp />
    </main>
  );
}
