import SuperSonicFleetManager from '@/components/SuperSonicFleetManager';

export const metadata = {
  title: 'SuperSonic Driver App - Vanguard Enterprise Solutions',
  description: 'SuperSonic Mobile Delivery Driver Application & Fleet Telemetry System',
};

export default function SupersonicPage() {
  return (
    <main className="min-h-screen bg-[#070d08] text-white">
      <SuperSonicFleetManager currentUserRole="Driver" />
    </main>
  );
}
