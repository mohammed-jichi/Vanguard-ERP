import MainTileDashboard from '@/components/MainTileDashboard';

export const metadata = {
  title: 'System Settings - Back Office - Vanguard ERP System',
  description: 'Tenant identity, system configurations, and license settings',
};

export default function BackofficeSettingsPage() {
  return <MainTileDashboard initialScreen="settings" />;
}
