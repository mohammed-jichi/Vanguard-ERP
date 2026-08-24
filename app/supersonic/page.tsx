import SuperSonicFleetManager from '@/components/SuperSonicFleetManager';

export const metadata = {
  title: 'SuperSonic Fleet Management - Vanguard Enterprise Solutions',
  description: 'SuperSonic Fleet Management & Dispatch Telemetry System',
};

export default function SupersonicPage() {
  return (
    <main className="min-h-screen bg-[#070d08] text-white">
      <SuperSonicFleetManager currentUserRole="Supersonic Management" />
    </main>
  );
}
