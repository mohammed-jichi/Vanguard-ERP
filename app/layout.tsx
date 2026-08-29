import React from 'react';
import { LiveAssistantWidget } from '@/components/voice/LiveAssistantWidget';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../css/style.css';
import './globals.css';

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
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="bg-white text-black min-h-screen">
        {children}
        <LiveAssistantWidget />
        <SpeedInsights />
      </body>
    </html>
  );
}