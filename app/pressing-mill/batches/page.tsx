import React from 'react';
import PressingBatchesView from '@/components/modules/pressing/PressingBatchesView';

export const metadata = {
  title: 'Pressing Lines & Batches - Vanguard ERP',
  description: 'Continuous pressing lines, malaxer cold press temperature, and decanter progress',
};

export default function PressingBatchesPage() {
  return <PressingBatchesView />;
}
