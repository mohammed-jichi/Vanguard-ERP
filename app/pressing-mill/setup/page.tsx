import React from 'react';
import MillSettingsView from '@/components/modules/pressing/MillSettingsView';

export const metadata = {
  title: 'Mill Settings & Parameters - Vanguard ERP',
  description: 'Line throughputs, standard retention rates, default fee/kg, and tank capacities',
};

export default function MillSettingsPage() {
  return <MillSettingsView />;
}
