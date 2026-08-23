import React from 'react';
import '@/css/style.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: "Vanguard ERP System",
  description: "Enterprise Resource Planning platform for Restaurants, Hotels, and Retail.",
};

export default function TenantErpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
