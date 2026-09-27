import React from 'react';
import VMenuQrGeneratorConsole from '@/components/modules/sales/VMenuQrGeneratorConsole';

export const metadata = {
  title: 'V-Menu & QR Generator — Vanguard ERP',
  description: 'Generate dynamic QR codes for showroom tables and sales representative attribution links.',
};

export default function BackofficeSalesQrPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <VMenuQrGeneratorConsole />
    </div>
  );
}
