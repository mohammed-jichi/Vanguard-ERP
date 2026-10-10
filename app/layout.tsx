import type { Metadata } from 'next';
import './globals.css';
import '@/components/reports/PrintStyles.css';
import { DeepLinkFallbackProvider } from '@/components/DeepLinkFallbackProvider';
import { LanguageProvider } from '@/lib/LanguageContext';
import { PermissionProvider } from '@/lib/PermissionContext';
import { ToastContainer } from '@/lib/toast';
import { LocalStorageSanitizer } from '@/components/common/LocalStorageSanitizer';

export const metadata: Metadata = {
  title: 'Vanguard ERP | Southern Olive Oil Products S.A.R.L',
  description: 'Enterprise Resource Planning & Production Operations System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className="bg-[#f8fafc] text-slate-800 antialiased font-sans m-0 p-0">
        <LanguageProvider>
          <PermissionProvider>
            <DeepLinkFallbackProvider>
              {children}
            </DeepLinkFallbackProvider>
            <ToastContainer />
            <LocalStorageSanitizer />
          </PermissionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}