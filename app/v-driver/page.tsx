import React from 'react';
import { Metadata, Viewport } from 'next';
import VDriverApp from '@/components/modules/driver/VDriverApp';

export const metadata: Metadata = {
  title: 'V-Driver — SuperSonic Fleet Mobile PWA',
  description: 'Vanguard ERP & SuperSonic Fleet Mobile Driver App with Offline Sync',
  manifest: '/manifest-driver.json',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default function VDriverPage() {
  return <VDriverApp />;
}
