import { Suspense } from 'react';
import SocialMediaManagementHub from '@/components/modules/social/SocialMediaManagementHub';

export const metadata = {
  title: 'V-Connect - Omnichannel Social CRM & WhatsApp - Vanguard ERP',
  description: 'V-Connect Omnichannel & Social CRM portal: WhatsApp, Meta Messenger, Instagram, Orders, and Support Desk',
};

export default function VConnectStandalonePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading V-Connect Portal...</div>}>
      <SocialMediaManagementHub initialTab="inbox" />
    </Suspense>
  );
}
