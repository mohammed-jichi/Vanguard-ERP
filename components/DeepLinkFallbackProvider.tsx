'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { AlertTriangle, Info, CheckCircle2, X, ExternalLink, ArrowRight } from 'lucide-react';

export interface FallbackNotification {
  id: string;
  title: string;
  message: string;
  target?: string;
  fallbackTo?: string;
  severity: 'INFO' | 'WARNING' | 'NOTICE';
  timestamp: string;
}

interface DeepLinkContextType {
  notifications: FallbackNotification[];
  notifyFallback: (item: Omit<FallbackNotification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
}

const DeepLinkFallbackContext = createContext<DeepLinkContextType>({
  notifications: [],
  notifyFallback: () => {},
  dismissNotification: () => {}
});

export const useDeepLinkFallback = () => useContext(DeepLinkFallbackContext);

// List of known/implemented modals and sub-views across Vanguard ERP
const KNOWN_MODALS = new Set([
  'new_jv',
  'new_expense',
  'import_coa',
  'reconcile_bank',
  'filter_drawer',
  'export_dialog',
  'eod_z_report',
  'currency_rates'
]);

const KNOWN_ACCOUNTING_SECTIONS = new Set([
  'dashboard',
  'reports',
  'jv',
  'journal-voucher',
  'module1',
  'purchase',
  'expenses',
  'module2',
  'payments',
  'payment',
  'pv',
  'module3',
  'receipts',
  'receipt',
  'rv',
  'module4',
  'ar',
  'accounts-receivables',
  'module5',
  'ap',
  'accounts-payables',
  'module6',
  'bank_recon',
  'bank-reconciliation',
  'recon',
  'module7',
  'vat_closing',
  'vat-period-closing',
  'vat',
  'module8',
  'accounts',
  'coa',
  'aux_classes',
  'aux_header1',
  'aux_header2',
  'aux_header3',
  'aux_group',
  'aux_jv_desc',
  'aux_jv_types',
  'aux_currency',
  'aux_currency_rates',
  'dept_groups',
  'department',
  'cash_flow_setup',
  'sub_dept'
]);

function DeepLinkListener({ onNotify }: { onNotify: (item: Omit<FallbackNotification, 'id' | 'timestamp'>) => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!searchParams) return;

    // 1. Inspect 'modal' query parameter
    const modalParam = searchParams.get('modal') || searchParams.get('dialog');
    if (modalParam && !KNOWN_MODALS.has(modalParam.toLowerCase())) {
      onNotify({
        title: 'Detailed Modal Notice',
        message: `The modal "${modalParam}" is currently being prepared for the upcoming sprint. You have been directed to the primary inquiry workstation.`,
        target: modalParam,
        fallbackTo: 'Primary Workstation View',
        severity: 'NOTICE'
      });
    }

    // 2. Inspect 'subview' or 'view' query parameter on accounting
    if (pathname.includes('/accounting')) {
      const sectionParam = searchParams.get('section') || searchParams.get('tab') || searchParams.get('module');
      if (sectionParam && !KNOWN_ACCOUNTING_SECTIONS.has(sectionParam.toLowerCase())) {
        onNotify({
          title: 'Accounting Section Redirection',
          message: `The detailed section "${sectionParam}" has not been finalized yet. Gracefully defaulting to the Journal Vouchers & Inquiries list.`,
          target: sectionParam,
          fallbackTo: 'Journal Vouchers (Module 1)',
          severity: 'INFO'
        });
      }
    }

    // 3. Inspect 'action' parameter for unimplemented operations
    const actionParam = searchParams.get('action');
    if (actionParam && ['EXPORT_SAP', 'SYNC_ORACLE', 'ADVANCED_TAX_AUDIT', 'PRINT_BARCODE_BATCH'].includes(actionParam.toUpperCase())) {
      onNotify({
        title: 'Action Staged in Backlog',
        message: `Operation "${actionParam}" is an enterprise extension scheduled for release v2026.9. Standard inquiry tools remain fully active.`,
        target: actionParam,
        fallbackTo: 'Standard Inquiries',
        severity: 'INFO'
      });
    }
  }, [searchParams, pathname, onNotify]);

  return null;
}

export function DeepLinkFallbackProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<FallbackNotification[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notifyFallback = useCallback((item: Omit<FallbackNotification, 'id' | 'timestamp'>) => {
    const id = `flbk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newNotice: FallbackNotification = {
      ...item,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setNotifications((prev) => {
      // Avoid duplicate notices for same target within short window
      if (prev.some((n) => n.target === item.target && n.title === item.title)) {
        return prev;
      }
      return [...prev, newNotice];
    });

    // Auto dismiss after 7 seconds
    setTimeout(() => {
      dismissNotification(id);
    }, 7000);
  }, [dismissNotification]);

  return (
    <DeepLinkFallbackContext.Provider value={{ notifications, notifyFallback, dismissNotification }}>
      <Suspense fallback={null}>
        <DeepLinkListener onNotify={notifyFallback} />
      </Suspense>

      {children}

      {/* Floating Enterprise Toast Banner Stack */}
      {notifications.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none p-2 font-sans dir-ltr">
          {notifications.map((notice) => (
            <div
              key={notice.id}
              className="pointer-events-auto bg-slate-900/95 text-white border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-xs text-amber-300 tracking-wide uppercase">
                      {notice.title}
                    </h5>
                    <span className="text-[10px] font-mono text-slate-400">{notice.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {notice.message}
                  </p>
                  {notice.fallbackTo && (
                    <div className="pt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Active View: {notice.fallbackTo}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismissNotification(notice.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DeepLinkFallbackContext.Provider>
  );
}
