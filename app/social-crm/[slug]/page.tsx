import SocialMediaManagementHub from '@/components/modules/social/SocialMediaManagementHub';

export const metadata = {
  title: 'Social CRM & Support - Southern Olive Oil Products S.A.R.L - Vanguard ERP',
  description: 'Omnichannel Social Media Management Portal',
};

const SLUG_TO_TAB_MAP: Record<string, 'inbox' | 'orders' | 'calendar' | 'cpl' | 'agents' | 'distributors'> = {
  'inbox': 'inbox',
  'social-inbox': 'inbox',
  'orders': 'orders',
  'platform-orders': 'orders',
  'social-orders': 'orders',
  'calendar': 'calendar',
  'publishing-calendar': 'calendar',
  'social-calendar': 'calendar',
  'cpl': 'cpl',
  'campaigns': 'cpl',
  'ad-campaigns': 'cpl',
  'social-campaigns': 'cpl',
  'agents': 'agents',
  'support-agents': 'agents',
  'social-agents': 'agents',
  'distributors': 'distributors',
  'distributors-directory': 'distributors',
  'social-distributors': 'distributors'
};

export default async function SocialCrmSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const activeTab = SLUG_TO_TAB_MAP[slug?.toLowerCase()] || 'inbox';

  return <SocialMediaManagementHub initialTab={activeTab} />;
}
