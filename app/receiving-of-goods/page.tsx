'use client';

import React from 'react';
import ReceivingOfGoodsView from '@/components/ReceivingOfGoodsView';
import { useTenant } from '@/lib/TenantContext';
import ModuleNotLicensedScreen from '@/components/ModuleNotLicensedScreen';

export default function ReceivingOfGoodsStandalonePage() {
  const { isModuleEnabled } = useTenant();

  if (!isModuleEnabled('purchasing')) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <ModuleNotLicensedScreen moduleKey="purchasing" />
      </div>
    );
  }

  return <ReceivingOfGoodsView />;
}
