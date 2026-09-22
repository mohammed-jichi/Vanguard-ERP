import React from 'react';
import PressingDashboardView from '@/components/modules/pressing/PressingDashboardView';

export const metadata = {
  title: 'Pressing Mill Dashboard - Vanguard ERP',
  description: 'Daily olive intake, crushing throughput, tanks level, and dispatch summary',
};

export default function PressingDashboardPage() {
  return <PressingDashboardView />;
}
