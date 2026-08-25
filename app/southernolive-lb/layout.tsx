import React from 'react';
import { TenantProvider } from '@/lib/TenantContext';
import { LanguageProvider } from '@/lib/LanguageContext';

export default function TenantWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </TenantProvider>
  );
}
