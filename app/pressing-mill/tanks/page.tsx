import React from 'react';
import TanksMatrixView from '@/components/modules/pressing/TanksMatrixView';

export const metadata = {
  title: 'Stainless Tanks Matrix (1-50) - Vanguard ERP',
  description: 'Visual grid of 50 stainless steel tanks, capacity, acidity %, and quality allocations',
};

export default function TanksMatrixPage() {
  return <TanksMatrixView />;
}
