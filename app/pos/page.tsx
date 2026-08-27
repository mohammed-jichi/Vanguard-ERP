import MainTileDashboard from '@/components/MainTileDashboard';

export const metadata = {
  title: 'POS Terminal - Front Office - Vanguard ERP System',
  description: 'Point of Sale Cashier Terminal',
};

export default function PosTerminalPage() {
  return <MainTileDashboard initialScreen="sales-pos" />;
}
