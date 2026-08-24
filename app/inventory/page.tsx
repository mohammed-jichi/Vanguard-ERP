import MainTileDashboard from '@/components/MainTileDashboard';

export const metadata = {
  title: 'Inventory Stock & Tank Management - Vanguard ERP System',
  description: 'Inventory, Warehouses & Stock Control System',
};

export default function InventoryPage() {
  return <MainTileDashboard initialScreen="inventory-stock" />;
}
