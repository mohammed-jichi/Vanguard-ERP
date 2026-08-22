import React from 'react';
import { LiveAssistantWidget } from '@/components/voice/LiveAssistantWidget';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../css/style.css';

export const metadata = {
  title: 'Vanguard ERP',
  description: 'Enterprise Resource Planning Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black min-h-screen">
        {children}
        <LiveAssistantWidget />
        <SpeedInsights />
      </body>
    </html>
  );
}