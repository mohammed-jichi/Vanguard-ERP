import React from 'react';
import SettlementsEngineView from '@/components/modules/pressing/SettlementsEngineView';

export const metadata = {
  title: 'Settlements & Milling Fees - Vanguard ERP',
  description: 'Triple payment settlement engine (Cash, In-Kind Oil %, Mixed Split) and grower statements',
};

export default function SettlementsPage() {
  return <SettlementsEngineView />;
}
