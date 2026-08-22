import React from 'react';
import { LiveAssistantWidget } from '@/components/voice/LiveAssistantWidget';
import '../css/style.css';
export const metadata = {
  title: 'Southern Olive & Oil Product V2 - Vanguard ERP',
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
      </body>
    </html>
  );
}
