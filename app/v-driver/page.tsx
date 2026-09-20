import React from 'react';
import { Metadata } from 'next';
import VDriverApp from '@/components/modules/driver/VDriverApp';

export const metadata: Metadata = {
  title: 'V-Driver — SuperSonic Fleet Mobile PWA',
  description: 'Vanguard ERP & SuperSonic Fleet Mobile Driver App with Offline Sync',
  manifest: '/manifest-driver.json',
  themeColor: '#0f172a',
};

export default function VDriverPage() {
  return <VDriverApp />;
}
