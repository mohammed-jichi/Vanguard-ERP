import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vanguard ERP | Southern Olive Oil Products S.A.R.L',
  description: 'Enterprise Resource Planning & Production Operations System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f8fafc] text-slate-800 antialiased font-sans m-0 p-0">
        {children}
      </body>
    </html>
  );
}