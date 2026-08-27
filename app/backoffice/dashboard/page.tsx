import MainTileDashboard from '@/components/MainTileDashboard';

export const metadata = {
  title: 'Executive Dashboard - Back Office - Vanguard ERP System',
  description: 'Executive Sales & Operations Dashboard',
};

export default function BackofficeDashboardPage() {
  return <MainTileDashboard initialScreen="sales-dash" />;
}
