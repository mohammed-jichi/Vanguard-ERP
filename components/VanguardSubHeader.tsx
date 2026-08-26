'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckSquare, Video, Edit2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import EndOfMonthModal from './EndOfMonthModal';
import ChecklistModal from './ChecklistModal';
import AlertsModal from './AlertsModal';

interface VanguardSubHeaderProps {
  activeScreen: string;
  onSelectScreen: (screen: string) => void;
}

export default function VanguardSubHeader({ activeScreen, onSelectScreen }: VanguardSubHeaderProps) {
  const { language } = useLanguage();
  const [recentlyVisited, setRecentlyVisited] = useState<Array<{ key: string; titleEn: string; titleAr: string }>>([
    { key: 'grid-dash', titleEn: 'Overview', titleAr: 'الرئيسية' },
    { key: 'sales-pos', titleEn: 'POS Touch Terminal', titleAr: 'نقطة البيع الكاشير' },
    { key: 'sc-reports', titleEn: 'Sales Reports', titleAr: 'تقارير المبيعات' },
    { key: 'op-purchases', titleEn: 'Purchases Ledger', titleAr: 'فواتير المشتريات' },
    { key: 'acc-coa', titleEn: 'Chart of Accounts', titleAr: 'شجرة الحسابات' }
  ]);

  const [isMonthPendingClose, setIsMonthPendingClose] = useState<boolean>(false);
  const [alertsCount, setAlertsCount] = useState<number>(3);
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
  const [isTutorialsOpen, setIsTutorialsOpen] = useState<boolean>(false);
  const [isEndOfMonthOpen, setIsEndOfMonthOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!activeScreen) return;
    setRecentlyVisited(prev => {
      const titleMap: Record<string, { en: string; ar: string }> = {
        'grid-dash': { en: 'Overview', ar: 'الرئيسية' },
        'sales-pos': { en: 'POS Touch', ar: 'نقطة البيع' },
        'sc-reports': { en: 'Sales Reports', ar: 'تقارير المبيعات' },
        'sc-dashboard': { en: 'Sales Dashboard', ar: 'لوحة المبيعات' },
        'setup-payment-types': { en: 'Payment Types', ar: 'أنواع الدفع' },
        'setup-screens': { en: 'Screens Config', ar: 'إعداد الشاشات' },
        'more-currency': { en: 'Currency Setup', ar: 'تهيئة العملات' }
      };

      const title = titleMap[activeScreen] || { en: activeScreen, ar: activeScreen };
      const filtered = prev.filter(item => item.key !== activeScreen);
      return [{ key: activeScreen, titleEn: title.en, titleAr: title.ar }, ...filtered].slice(0, 5);
    });
  }, [activeScreen]);

  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs shrink-0 select-none mt-6">
      
      {/* LEFT SIDE: RECENTLY VISITED DYNAMIC BREADCRUMBS */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full text-xs text-gray-700 font-medium">
        <span className="text-black font-semibold shrink-0">Recently Visited:</span>
        {recentlyVisited.map((item, idx) => (
          <React.Fragment key={item.key}>
            {idx > 0 && <span className="text-gray-300 text-[10px] shrink-0">›</span>}
            <button
              onClick={() => onSelectScreen(item.key)}
              className={`hover:text-amber-600 truncate transition-colors ${
                activeScreen === item.key ? 'text-amber-600 font-bold underline' : 'text-gray-700 font-medium'
              }`}
            >
              {language === 'ar' ? item.titleAr : item.titleEn}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* RIGHT SIDE: ACTION BUTTONS & LINKS */}
      <div className="flex items-center gap-2 shrink-0 text-xs font-semibold">
        
        {/* DYNAMIC ACTION BUTTON: ALERTS (REMAINS VISIBLE UNTIL ALERTSMODAL IS VIEWED AND CLOSED) */}
        {alertsCount > 0 && (
          <button
            onClick={() => setShowAlertsModal(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-2.5 py-1 rounded-lg shadow-2xs transition-all flex items-center gap-1"
            title="Click to view active system alerts"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts ({alertsCount})</span>
          </button>
        )}

        {/* SINGLE SMART LINK: END OF MONTH (REACTS TO ISMONTHPENDINGCLOSE WITHOUT BOUNCING) */}
        <button
          onClick={() => setIsEndOfMonthOpen(true)}
          className={`px-2 py-1 rounded-md transition-colors ${
            isMonthPendingClose
              ? 'text-red-600 font-bold hover:bg-rose-50'
              : 'text-slate-700 font-semibold hover:text-amber-600 hover:bg-gray-100'
          }`}
          title="End of Month Inventory Closing"
        >
          End of Month
        </button>
        
        <button
          onClick={() => onSelectScreen('sales-dash')}
          className="text-gray-700 hover:text-amber-600 px-2 py-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          Latest Transactions
        </button>

        <button
          onClick={() => setIsChecklistOpen(true)}
          className="text-gray-700 hover:text-amber-600 px-2 py-1 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
        >
          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Check List</span>
        </button>

        {/* WATCH TUTORIALS POPUP MODAL BUTTON */}
        <button
          onClick={() => setIsTutorialsOpen(true)}
          className="bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
        >
          <Video className="w-3.5 h-3.5 text-amber-600" />
          <span>Watch Tutorials</span>
        </button>

        {/* CURRENCY RATE DISPLAY & EDIT PENCIL */}
        <div className="bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg text-gray-800 flex items-center gap-1.5 font-mono text-[11px]">
          <span>USD rate: 90,000.00</span>
          <button
            onClick={() => onSelectScreen('more-currency')}
            title="Edit official currency rate"
            className="text-amber-600 hover:text-amber-800 p-0.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* SYSTEM ALERTS POPUP MODAL */}
      <AlertsModal
        isOpen={showAlertsModal}
        onClose={() => {
          setShowAlertsModal(false);
          setAlertsCount(0);
        }}
      />

      {/* REUSABLE CHECKLIST ITEMS MODAL */}
      <ChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        onWatchTutorial={() => setIsTutorialsOpen(true)}
      />

      {/* TUTORIALS MODAL */}
      {isTutorialsOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-sans">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-amber-600" /> Vanguard ERP Video Guides
            </h3>
            <p className="text-xs text-gray-500">
              Learn how to navigate Vanguard ERP, manage olive oil pressing inventory, configure payment types, and run End of Day reports.
            </p>
            <div className="space-y-2 text-xs">
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="block p-3 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 font-semibold text-amber-950">
                🎬 1. Setting up POS Touch Terminal & Cashier Workstations
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="block p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 font-semibold text-emerald-950">
                🫒 2. Managing Olive Oil Pressing, Extraction & Tanks
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 font-semibold text-purple-950">
                📊 3. End of Month Financial & VAT Tax Closings
              </a>
            </div>
            <div className="pt-2 text-right">
              <button onClick={() => setIsTutorialsOpen(false)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold">
                Close Video Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REUSABLE END OF MONTH MODAL */}
      <EndOfMonthModal
        isOpen={isEndOfMonthOpen}
        onClose={() => setIsEndOfMonthOpen(false)}
        onWatchTutorials={() => setIsTutorialsOpen(true)}
      />

    </div>
  );
}
