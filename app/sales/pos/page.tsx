import MainTileDashboard from '@/components/MainTileDashboard';

export const metadata = {
  title: 'POS Touch Terminal - Vanguard ERP System',
  description: 'Point of Sale Cashier Terminal',
};

export default function POSTerminalPage() {
  return <MainTileDashboard initialScreen="sales-pos" />;
}
