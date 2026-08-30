import SocialMediaManagementHub from '@/components/modules/social/SocialMediaManagementHub';

export const metadata = {
  title: 'Social CRM & Unified Inbox - Southern Olive Oil Products S.A.R.L - Vanguard ERP',
  description: 'Omnichannel Social Media Management, Orders, Calendar, and Support Portal',
};

export default function SocialCrmPage() {
  return <SocialMediaManagementHub initialTab="inbox" />;
}
