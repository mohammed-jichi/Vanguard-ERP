import MainTileDashboard from '@/components/MainTileDashboard';

export const metadata = {
  title: 'Sales & POS Terminal - Vanguard ERP System',
  description: 'Point of Sale & Sales Control Center',
};

export default function SalesPage() {
  return <MainTileDashboard initialScreen="sales-pos" />;
}
