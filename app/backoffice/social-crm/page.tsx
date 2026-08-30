import SocialMediaManagementHub from '@/components/modules/social/SocialMediaManagementHub';

export const metadata = {
  title: 'Social CRM - Backoffice - Southern Olive Oil Products S.A.R.L - Vanguard ERP',
  description: 'Omnichannel Social Media Management Portal',
};

export default function BackofficeSocialCrmPage() {
  return <SocialMediaManagementHub initialTab="inbox" />;
}
