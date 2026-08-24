import MainTileDashboard from '@/components/MainTileDashboard';

export const metadata = {
  title: 'Operation Center & Plant Control - Vanguard ERP System',
  description: 'Plant Operation, Press & Receive Control System',
};

export default function ControlPage() {
  return <MainTileDashboard initialScreen="oil-pressing" />;
}
