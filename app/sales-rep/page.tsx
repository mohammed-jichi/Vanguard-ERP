import React from 'react';
import { Metadata, Viewport } from 'next';
import SalesRepMobileApp from '@/components/modules/sales/SalesRepMobileApp';

export const metadata: Metadata = {
  title: 'Sales Rep Mobile PWA — Vanguard ERP & Social CRM',
  description: 'Vanguard ERP & Social CRM Mobile Field Representative App',
  manifest: '/manifest-sales.json',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default function SalesRepPage() {
  return <SalesRepMobileApp />;
}
