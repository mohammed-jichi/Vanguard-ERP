import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vanguard ERP | Southern Olive Oil Products S.A.R.L',
  description: 'Enterprise Resource Planning & Production Operations System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="bg-[#f8fafc] text-slate-800 antialiased font-sans m-0 p-0">
        {children}
      </body>
    </html>
  );
}