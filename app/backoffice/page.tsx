import React from 'react';
import EnterpriseOverviewHub from '@/components/EnterpriseOverviewHub';

export const metadata = {
  title: 'Enterprise Overview Hub | Vanguard ERP',
  description: 'Primary enterprise overview portal and main operational hub for Vanguard ERP.',
};

/**
 * Vanguard ERP — Primary Enterprise Post-Signin Landing Page / Main Hub (/backoffice)
 */
export default function BackofficeMainHubPage() {
  return <EnterpriseOverviewHub />;
}
