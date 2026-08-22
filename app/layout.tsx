import React from 'react';
import { LiveAssistantWidget } from '@/components/voice/LiveAssistantWidget';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../css/style.css';

export const metadata = {
  title: 'منتوجات زيت وزيتون الجنوب V2 - Vanguard ERP',
  description: 'Refinery & Enterprise Resource Planning Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <LiveAssistantWidget />
        <SpeedInsights />
      </body>
    </html>
  );
}