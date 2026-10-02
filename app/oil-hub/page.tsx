import React from 'react';
import CommercialOilOperationsApp from '@/components/modules/production/CommercialOilOperationsApp';

export const metadata = {
  title: 'Commercial Oil Operations Hub - Vanguard ERP',
  description: 'Direct Access Hub for Commercial Oil Receiving, Blending, and Packaging',
};

export default function OilHubPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <CommercialOilOperationsApp />
    </main>
  );
}
