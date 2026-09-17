import React, { Suspense } from 'react';
import SocialMediaManagementHub from '@/components/modules/social/SocialMediaManagementHub';

export const metadata = {
  title: 'Social CRM - Backoffice - Southern Olive Oil Products S.A.R.L - Vanguard ERP',
  description: 'Omnichannel Social Media Management Portal',
};

export default function BackofficeSocialCrmPage() {
  return (
    <Suspense fallback={<div className="p-6 font-sans text-slate-500">Loading Social CRM Hub...</div>}>
      <SocialMediaManagementHub initialTab="inbox" />
    </Suspense>
  );
}

