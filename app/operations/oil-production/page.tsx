import React from 'react';
import CommercialOilOperationsApp from '@/components/modules/production/CommercialOilOperationsApp';

export const metadata = {
  title: 'Commercial Oil Operations & Packaging Hub - Vanguard ERP',
  description: 'Standalone Commercial Olive Oil Operations, Blending, and Dynamic Packaging Hub',
};

export default function CommercialOilProductionPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <CommercialOilOperationsApp />
    </main>
  );
}
