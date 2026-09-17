import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Vanguard POS Touch Terminal',
  description: 'Commercial Retail Touch POS Terminal - Vanguard ERP',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vanguard POS',
  },
  icons: {
    icon: '/vanguard-emblem.jpg',
    apple: '/vanguard-emblem.jpg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0e14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pos-terminal-root min-h-screen bg-[#0b0e14] text-slate-100 select-none overflow-hidden">
      {children}
    </div>
  );
}
