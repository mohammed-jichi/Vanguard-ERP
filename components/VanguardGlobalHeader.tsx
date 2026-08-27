'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  Mail,
  Settings as SettingsIcon,
  HelpCircle,
  User,
  LayoutGrid,
  X,
  ExternalLink,
  Phone,
  Download,
  Video,
  CheckSquare,
  Edit2,
  Bell,
  AlertTriangle,
  ChevronDown,
  Globe,
  Shield,
  Users as UsersIcon,
  LogOut,
  RefreshCw,
  Sparkles,
  Search,
  MessageSquare,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage, LanguageCode } from '@/lib/LanguageContext';

interface VanguardGlobalHeaderProps {
  activeScreen: string;
  onSelectScreen: (screenKey: string) => void;
}

interface VisitedItem {
  key: string;
  titleAr: string;
}

export default function VanguardGlobalHeader({ activeScreen, onSelectScreen }: VanguardGlobalHeaderProps) {
  const { currentTenant, currentUser } = useTenant();
  const { language, dir, setLanguage, t } = useLanguage();

  // Language Switcher Dropdown State
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);

  // Sub-header dynamic action button state
  const [hasPendingEndOfMonth, setHasPendingEndOfMonth] = useState<boolean>(true);
  const [alertCount, setAlertCount] = useState<number>(3);

  // Recently visited dynamic history state (last 5 routes)
  const [recentlyVisited, setRecentlyVisited] = useState<VisitedItem[]>([
    { key: 'oil-pressing', titleAr: t('olive_pressing', 'Olive Pressing & Production') },
    { key: 'sales-pos', titleAr: t('pos_terminal', 'POS Cashier Terminal') },
    { key: 'inventory', titleAr: t('uom_tanks', 'Units of Measure & Tanks') },
    { key: 'acc-jv', titleAr: t('journal_vouchers', 'Journal Vouchers (JV)') },
    { key: 'cust-dir', titleAr: t('customer_directory', 'Customer Directory') }
  ]);

  // Unread Inbox Status state (default: false since inbox is empty)
  const [hasUnread, setHasUnread] = useState<boolean>(false);

  // Dropdown & Modal Toggle States
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<'general' | 'sales' | 'inventory' | 'accounting' | 'interface'>('general');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState<boolean>(false);
  const [quickMenuTab, setQuickMenuTab] = useState<'updates' | 'alerts' | 'activities' | 'help' | 'theme'>('help');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showMoreUpdates, setShowMoreUpdates] = useState<boolean>(false);
  const [showMoreActivities, setShowMoreActivities] = useState<boolean>(false);

  // Alerts state for safe conditional rendering
  const [alertsList, setAlertsList] = useState<Array<{ id: string; titleEn: string; titleAr: string; descEn: string; descAr: string }>>([
    {
      id: 'alt-1',
      titleEn: '⚠️ End of Month Closure Alert',
      titleAr: '⚠️ تنبيه إغلاق الشهر المحاسبي',
      descEn: 'Please reconcile JV entries and bank accounts prior to closure.',
      descAr: 'يرجى مطابقة قيود JV وحسابات البنوك قبل الإغلاق.'
    },
    {
      id: 'alt-2',
      titleEn: '🫒 Pressing Tank #4 Capacity Warning',
      titleAr: '🫒 تنبيه سعة خزان المعصرة #4',
      descEn: 'Tank #4 has reached 85% maximum storage capacity threshold.',
      descAr: 'وصل خزان المعصرة رقم 4 إلى نسبة 85% من سعة التخزين.'
    }
  ]);
  
  // Dialog Modals
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
  const [isTutorialsOpen, setIsTutorialsOpen] = useState<boolean>(false);

  // Track recently visited routes dynamically
  useEffect(() => {
    if (!activeScreen || activeScreen === 'grid-dash') return;

    const screenTitles: Record<string, string> = {
      'oil-pressing': 'معصرة الزيت والإنتاج',
      'sales-pos': 'نقطة البيع الكاشير',
      'sales-dash': 'لوحة تحكم المبيعات',
      'inventory': 'المخزون والخزانات',
      'acc-jv': 'سندات اليومية JV',
      'acc-dash': 'لوحة المحاسبة',
      'cust-dir': 'دليل العملاء',
      'hr-payroll-dash': 'مسير الرواتب',
      'supersonic-fleet': 'أسطول الشحن',
      'delivery-goods': 'تسليم البضائع'
    };

    const title = screenTitles[activeScreen] || activeScreen;

    setRecentlyVisited(prev => {
      const filtered = prev.filter(item => item.key !== activeScreen);
      return [{ key: activeScreen, titleAr: title }, ...filtered].slice(0, 5);
    });
  }, [activeScreen]);

  return (
    <div className="w-full flex flex-col font-sans dir-rtl select-none">
      
      {/* 1. TOP MAIN HEADER (DARK CHARCOAL/BLACK - VANGUARD BRANDED) */}
      <header className="w-full h-16 bg-[#181824] text-white border-b border-[#2b2b40] px-4 md:px-6 flex items-center justify-between shadow-md top-0 left-0 right-0 z-50 shrink-0 select-none">
        
        {/* LEFT: VANGUARD BRANDING - LINK TO / WITH HEAVY WIDE SANS-SERIF TEXT */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); onSelectScreen('grid-dash'); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="/assets/images/vanguard_logo.png"
              alt="Vanguard ERP Logo"
              className="w-10 h-10 rounded-full object-cover shadow-xs shrink-0 border border-amber-500/40 p-0.5 bg-slate-900 group-hover:border-amber-400 transition-all"
              onError={e => {
                (e.target as HTMLImageElement).src = '/assets/images/vanguard_logo.png';
              }}
            />
            <span className="font-black tracking-widest text-white text-lg md:text-xl font-sans uppercase group-hover:text-amber-400 transition-colors">
              VANGUARD ERP
            </span>
          </a>
        </div>

        {/* CENTER: TENANT LICENSE AND NAME (FORCE PURE WHITE TEXT FOR HIGH CONTRAST) */}
        <div className="hidden md:flex items-center gap-2.5 bg-[#252538] border border-[#373752] px-4 py-1.5 rounded-full text-xs shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-white font-black text-sm" style={{ color: '#ffffff' }}>001</span>
          <span className="text-white font-bold" style={{ color: '#ffffff' }}>-</span>
          <span className="font-semibold text-white tracking-wide" style={{ color: '#ffffff' }}>Southern Olive Oil S.A.R.L</span>
          <span className="text-[11px] text-white font-bold bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-2xs" style={{ color: '#ffffff' }}>
            منتوجات زيت وزيتون الجنوب
          </span>
        </div>

        {/* RIGHT ICONS ACTION BAR (PREMIUM GOLD THEME - text-amber-400 / text-amber-500) */}
        <div className="flex items-center gap-1.5 md:gap-2">

          {/* HOME ICON */}
          <button
            onClick={() => onSelectScreen('grid-dash')}
            title="Home Dashboard"
            className="p-2 hover:bg-[#252538] text-amber-400 hover:text-amber-300 rounded-xl transition-colors"
          >
            <Home className="w-4.5 h-4.5 text-amber-400" />
          </button>

          {/* MAIL / INBOX ICON */}
          <button
            onClick={() => {
              setIsInboxOpen(true);
              setHasUnread(false);
            }}
            title="Inbox between locations"
            className="p-2 hover:bg-[#252538] text-amber-400 hover:text-amber-300 rounded-xl transition-colors relative"
          >
            <Mail className="w-4.5 h-4.5 text-amber-400" />
            {hasUnread && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full"></span>
              </>
            )}
          </button>

          {/* SYSTEM SETTINGS GEAR ICON */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="System Settings"
              className={`p-2 rounded-xl transition-colors ${
                isSettingsOpen ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-[#252538] text-amber-400 hover:text-amber-300'
              }`}
            >
              <SettingsIcon className={`w-4.5 h-4.5 ${isSettingsOpen ? 'text-slate-950' : 'text-amber-400'}`} />
            </button>

            {/* SYSTEM SETTINGS MEGA MENU (3-COLUMN ENGLISH-ONLY WIDE OVERLAY - ANCHORED RIGHT) */}
            {isSettingsOpen && (
              <div className="absolute top-full right-0 mt-2 w-[720px] max-w-[90vw] bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl z-50 p-6 font-sans dir-ltr text-left animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* MEGA MENU HEADER */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <SettingsIcon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">System Settings</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Enterprise core configuration, accounting parameters, and sales control rules</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 3-COLUMN MEGA MENU GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* COLUMN 1: GENERAL & ACCOUNTING */}
                  <div className="space-y-5">
                    {/* GENERAL */}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                        General
                      </h4>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { onSelectScreen('settings'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors flex items-center justify-between"
                        >
                          <span>Company Information</span>
                        </button>
                        <button
                          onClick={() => { alert('Email Templates Configuration'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors flex items-center justify-between"
                        >
                          <span>Email Templates</span>
                        </button>
                      </div>
                    </div>

                    {/* ACCOUNTING */}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                        Accounting
                      </h4>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { onSelectScreen('acc-coa'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          Company Configuration
                        </button>
                        <button
                          onClick={() => { alert('Accounts Balances Recalculated Successfully!'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          Recalculate Accounts Balances
                        </button>
                        <button
                          onClick={() => { onSelectScreen('acc-aux-rates'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          Difference of Exchange
                        </button>
                        <button
                          onClick={() => { onSelectScreen('acc-vat'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          End of Year
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: SALES CONTROL & ACCOUNTING INTERFACE */}
                  <div className="space-y-5">
                    {/* SALES CONTROL */}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                        Sales Control
                      </h4>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { onSelectScreen('sales-setup-screen'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          General Configuration
                        </button>
                        <button
                          onClick={() => { onSelectScreen('hr-orgsetup-permissions'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          Employee Configuration
                        </button>
                        <button
                          onClick={() => { onSelectScreen('hr-attendancelog'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          Employee Attendance
                        </button>
                      </div>
                    </div>

                    {/* ACCOUNTING INTERFACE */}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                        Accounting Interface
                      </h4>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { alert('Opening Accounting Link Setup'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          Accounting Link
                        </button>
                        <button
                          onClick={() => { alert('Transferring entries to General Ledger'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          Transfer to Accounting
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 3: INVENTORY */}
                  <div className="space-y-5">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                        Inventory
                      </h4>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { onSelectScreen('inventory'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          General Configuration
                        </button>
                        <button
                          onClick={() => { alert('Inventory Stock Balances Recalculated!'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          Recalculate
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* HELP / SUPPORT ICON */}
          <a
            href="/support"
            target="_blank"
            rel="noreferrer"
            title="Help & Support"
            className="p-2 hover:bg-[#252538] text-amber-400 hover:text-amber-300 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4.5 h-4.5 text-amber-400" />
          </a>

          {/* USER PROFILE DROPDOWN (STRICTLY MOHAMMED) */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1.5 hover:bg-[#252538] text-white rounded-xl transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center border border-amber-300 shadow-xs">
                M
              </div>
              <span className="font-bold text-xs text-white hidden sm:inline">
                Mohammed
              </span>
              <ChevronDown className="w-3 h-3 text-amber-400" />
            </button>

            {/* PROFILE DROPDOWN MENU */}
            {isProfileOpen && (
              <div className={`absolute right-0 mt-2 w-60 bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs font-semibold ${language === 'ar' ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
                <div className="p-2 border-b border-gray-100">
                  <p className="text-gray-900 font-bold">
                    Mohammed
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    Southern Olive Oil S.A.R.L
                  </p>
                </div>

                <button onClick={() => { onSelectScreen('settings'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Organization</span>
                </button>
                <button onClick={() => { setIsQuickMenuOpen(true); setQuickMenuTab('alerts'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Alerts & Notifications</span>
                </button>
                {/* 5-LANGUAGE SELECTOR SYSTEM */}
                <div className="p-2 border-t border-b border-gray-100 my-1 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block px-1 mb-1">
                    Select Language / اختر اللغة
                  </span>
                  {[
                    { code: 'en', label: 'English (US)', flag: '🇺🇸' },
                    { code: 'fr', label: 'Français', flag: '🇫🇷' },
                    { code: 'es', label: 'Español', flag: '🇪🇸' },
                    { code: 'ar', label: 'العربية (RTL)', flag: '🇸🇦' },
                    { code: 'fa', label: 'فارسی (RTL)', flag: '🇮🇷' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code as any);
                        setIsProfileOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                        language === item.code
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {language === item.code && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
                    </button>
                  ))}
                </div>
                <button onClick={() => { onSelectScreen('settings'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>My Account</span>
                </button>
                <button onClick={() => { onSelectScreen('hr-orgsetup-permissions'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Roles</span>
                </button>
                <button onClick={() => { onSelectScreen('hr-dir'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <UsersIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Users</span>
                </button>
                <button onClick={() => { setIsQuickMenuOpen(true); setQuickMenuTab('updates'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Latest Updates</span>
                </button>
                <a href="/support" target="_blank" rel="noreferrer" className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Support Center</span>
                </a>
                
                <div className="border-t border-gray-100 pt-1">
                  <a href="/login" className="w-full p-2 hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 font-bold">
                    <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Logout</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* QUICK MENU TOGGLE ICON (9-CUBES - GOLD THEME) */}
          <button
            onClick={() => setIsQuickMenuOpen(true)}
            title="Quick Menu"
            className="p-2 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/40 rounded-xl transition-colors shadow-2xs ml-1"
          >
            <LayoutGrid className="w-4.5 h-4.5 text-amber-400 hover:text-slate-950" />
          </button>

        </div>
      </header>

      {/* 3. QUICK MENU RIGHT-DRAWER (FROM 9-CUBES ICON) */}
      {isQuickMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col dir-rtl font-sans animate-in slide-in-from-right duration-200">
            
            {/* DRAWER HEADER */}
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">{language === 'ar' ? 'القائمة السريعة (Vanguard Quick Menu)' : 'Vanguard Quick Menu'}</h3>
              </div>
              <button onClick={() => setIsQuickMenuOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TOP TABS HEADER (WITH DARK MODE TOGGLE BUTTON) */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 text-xs font-bold px-1">
              <div className="flex items-center overflow-x-auto">
                <button
                  onClick={() => setQuickMenuTab('updates')}
                  className={`p-3 text-center border-b-2 shrink-0 transition-colors ${quickMenuTab === 'updates' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  Latest Updates
                </button>
                <button
                  onClick={() => setQuickMenuTab('alerts')}
                  className={`p-3 text-center border-b-2 shrink-0 transition-colors ${quickMenuTab === 'alerts' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  Alerts {alertsList && alertsList.length > 0 && `(${alertsList.length})`}
                </button>
                <button
                  onClick={() => setQuickMenuTab('activities')}
                  className={`p-3 text-center border-b-2 shrink-0 transition-colors ${quickMenuTab === 'activities' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  Last Activities
                </button>
                <button
                  onClick={() => setQuickMenuTab('help')}
                  className={`p-3 text-center border-b-2 shrink-0 transition-colors ${quickMenuTab === 'help' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  Help
                </button>
              </div>

              {/* DARK MODE TOGGLE BUTTON */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 text-gray-600 hover:text-amber-600 rounded-lg hover:bg-gray-200/60 transition-colors shrink-0 ml-1"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-bold text-gray-800">
              
              {/* LATEST UPDATES TAB (WITH SHOW MORE SCROLLABLE AREA) */}
              {quickMenuTab === 'updates' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
                    <span className="text-[10px] text-amber-700 font-bold font-mono uppercase tracking-wider">v2026.8.26 Release</span>
                    <h5 className="font-black text-amber-950 text-xs">Vanguard ERP Accounting & UOM Engine</h5>
                    <p className="text-gray-600 font-medium text-[11px] leading-relaxed">
                      Integrated 18 multi-unit conversions (Tanks, Drums, Gallons, Liters, Kilos) with dynamic landed cost calculations.
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
                    <span className="text-[10px] text-emerald-600 font-bold font-mono uppercase tracking-wider">v2026.8.20 Release</span>
                    <h5 className="font-black text-gray-900 text-xs">SuperSonic Driver Fleet Real-Time GPS Tracking</h5>
                    <p className="text-gray-600 font-medium text-[11px] leading-relaxed">
                      Enabled live driver mobile dispatching and automated proof of delivery receipt generation.
                    </p>
                  </div>

                  {showMoreUpdates && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <span className="text-[10px] text-sky-600 font-bold font-mono uppercase tracking-wider">v2026.8.10 Release</span>
                        <h5 className="font-black text-slate-900 text-xs">POS Touch Terminal Multi-Currency Checkout</h5>
                        <p className="text-gray-600 font-medium text-[11px] leading-relaxed">
                          Dual cash drawer support handling simultaneous LBP and USD cash change logic.
                        </p>
                      </div>
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <span className="text-[10px] text-indigo-600 font-bold font-mono uppercase tracking-wider">v2026.8.01 Release</span>
                        <h5 className="font-black text-slate-900 text-xs">Social CRM & Customer WhatsApp Integration</h5>
                        <p className="text-gray-600 font-medium text-[11px] leading-relaxed">
                          Automated WhatsApp invoice PDF dispatching directly to registered customer numbers.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowMoreUpdates(!showMoreUpdates)}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors text-center border border-gray-200"
                  >
                    {showMoreUpdates ? 'Show Less Updates' : 'Show More Updates (2)'}
                  </button>
                </div>
              )}

              {/* ALERTS TAB (SAFE CONDITIONAL RENDERING) */}
              {quickMenuTab === 'alerts' && (
                <div className="space-y-3">
                  {(!alertsList || alertsList.length === 0) ? (
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-2">
                      <Bell className="w-6 h-6 text-gray-400 mx-auto" />
                      <p className="font-semibold text-gray-600 text-xs">No active alerts right now.</p>
                      <button
                        onClick={() => setAlertsList([
                          {
                            id: 'alt-1',
                            titleEn: '⚠️ End of Month Closure Alert',
                            titleAr: '⚠️ تنبيه إغلاق الشهر المحاسبي',
                            descEn: 'Please reconcile JV entries and bank accounts prior to closure.',
                            descAr: 'يرجى مطابقة قيود JV وحسابات البنوك قبل الإغلاق.'
                          }
                        ])}
                        className="text-[11px] text-amber-600 hover:underline font-bold pt-1"
                      >
                        + Restore Sample Alert
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alertsList.map(alt => (
                        <div key={alt.id} className="p-3.5 bg-rose-50/80 border border-rose-200 text-rose-950 rounded-2xl space-y-1">
                          <p className="font-black text-xs">{language === 'ar' ? alt.titleAr : alt.titleEn}</p>
                          <p className="text-[11px] font-medium text-rose-800">{language === 'ar' ? alt.descAr : alt.descEn}</p>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setAlertsList([])}
                          className="text-[11px] text-gray-500 hover:text-rose-600 underline font-medium"
                        >
                          Clear all alerts
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LAST ACTIVITIES TAB (RECENTLY VISITED VANGUARD ACTIONS WITH SHOW MORE) */}
              {quickMenuTab === 'activities' && (
                <div className="space-y-3 text-[11px]">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono">Today, 10:45 AM</span>
                    <p className="font-bold text-gray-800">
                      {language === 'ar' ? 'تحديث شعار الشركة لـ منتوجات زيت وزيتون الجنوب SARL' : 'Updated tenant branding & license settings'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono">Today, 09:30 AM</span>
                    <p className="font-bold text-gray-800">
                      {language === 'ar' ? 'إنشاء إرسالية استلام زيت زيتون بكر ممتاز - 16 لتر' : 'Processed Extra Virgin Olive Oil Receipt Voucher #RC-9042'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono">Yesterday, 04:15 PM</span>
                    <p className="font-bold text-gray-800">
                      {language === 'ar' ? 'تحديث قائمة أسعار المبيعات لنقطة البيع POS' : 'Updated POS Touch Terminal cashier price modes'}
                    </p>
                  </div>

                  {showMoreActivities && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                        <span className="text-[10px] text-gray-400 font-mono">Yesterday, 02:00 PM</span>
                        <p className="font-bold text-gray-800">Approved End of Day Cashier Z-Report for Station #2</p>
                      </div>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                        <span className="text-[10px] text-gray-400 font-mono">Aug 24, 11:20 AM</span>
                        <p className="font-bold text-gray-800">Dispatched SuperSonic Delivery Fleet Order #FLEET-849</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowMoreActivities(!showMoreActivities)}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors text-center border border-gray-200"
                  >
                    {showMoreActivities ? 'Show Less Activities' : 'Show More Activities (2)'}
                  </button>
                </div>
              )}

              {/* HELP TAB CONTENT */}
              {quickMenuTab === 'help' && (
                <div className="space-y-4">
                  {/* SUPPORT CENTER */}
                  <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl space-y-2">
                    <h4 className="font-black text-amber-900 text-sm">
                      {language === 'ar' ? 'مركز الدعم الفني والتعليمات (Support Center)' : 'Support Center'}
                    </h4>
                    <p className="text-gray-600 font-medium text-[11px]">
                      {language === 'ar' ? 'افتح صفحة الدعم الرئيسية لمشاهدة الأدلة، الفيديو، والتعليمات.' : 'Open the main support page for guides, videos, and product help.'}
                    </p>
                    <a
                      href="/support"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> {language === 'ar' ? 'الانتقال إلى Support Center' : 'Go to Support Center'}
                    </a>
                  </div>

                  {/* LIVE CHAT */}
                  <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl space-y-2">
                    <h4 className="font-black text-emerald-900 text-sm">
                      {language === 'ar' ? 'المحادثة المباشرة (Live WhatsApp Chat)' : 'Live WhatsApp Chat'}
                    </h4>
                    <p className="text-gray-600 font-medium text-[11px]">
                      {language === 'ar' ? 'تواصل مباشرة مع فريق دعم Vanguard عبر واتساب.' : 'Connect directly with the Vanguard Support team via WhatsApp.'}
                    </p>
                    <a
                      href="https://wa.me/96170000000"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> {language === 'ar' ? 'فتح الدردشة المباشرة' : 'Open WhatsApp Chat'}
                    </a>
                  </div>

                  {/* PHONE CALL */}
                  <div className="bg-sky-50/60 border border-sky-200 p-4 rounded-2xl space-y-2">
                    <h4 className="font-black text-sky-900 text-sm">
                      {language === 'ar' ? 'الاتصال الفوري للدعم (Phone Support)' : 'Phone Support'}
                    </h4>
                    <p className="text-gray-600 font-medium text-[11px]">
                      {language === 'ar' ? 'تفعيل رابط الاتصال السريع بخط الدعم الفني.' : 'Direct telephone hotline for urgent Vanguard support.'}
                    </p>
                    <a
                      href="tel:+96170000000"
                      className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-black px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" /> {language === 'ar' ? 'اتصال بـ Vanguard (+961 70 000 000)' : 'Call Vanguard (+961 70 000 000)'}
                    </a>
                  </div>

                  {/* QUICK TIPS & DOWNLOADS */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                    <h4 className="font-black text-slate-900 text-sm">
                      Quick Tips & Downloads
                    </h4>
                    <div className="space-y-1.5 pt-1 text-[11px]">
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('Download Vanguard POS Desktop v4.2'); }} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-xl hover:text-amber-600">
                        <span>Vanguard POS Desktop Terminal v4.2</span>
                        <Download className="w-3.5 h-3.5 text-amber-600" />
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('Download Vanguard Thermal Print Server'); }} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-xl hover:text-amber-600">
                        <span>Vanguard Thermal Invoice Print Agent</span>
                        <Download className="w-3.5 h-3.5 text-amber-600" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: INBOX OVERLAY (ENTERPRISE ERP UI - ZERO ARABIC & EMPTY STATE DEFAULT) */}
      {isInboxOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl font-sans dir-ltr text-left overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* SUBTLE MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-500" />
                <span>Inbox</span>
              </h3>
              <button
                onClick={() => setIsInboxOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TOP TOOLBAR */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* LEFT TOOLBAR: CHECKBOX ALL, REFRESH, MORE DROPDOWN */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
                  <input type="checkbox" className="rounded text-amber-500 border-slate-300 focus:ring-amber-500" />
                  <span>All</span>
                </label>
                <button
                  onClick={() => alert('Inbox refreshed!')}
                  title="Refresh Inbox"
                  className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-200 bg-white shadow-2xs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* CENTER TOOLBAR: SEARCH INPUT FIELD */}
              <div className="flex-1 max-w-sm relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Message.."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors font-medium shadow-2xs"
                />
              </div>

              {/* RIGHT TOOLBAR: PAGINATION ARROWS < > */}
              <div className="flex items-center gap-1">
                <button
                  disabled
                  title="Previous Page"
                  className="p-1.5 text-slate-300 bg-white border border-slate-200 rounded-lg cursor-not-allowed shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled
                  title="Next Page"
                  className="p-1.5 text-slate-300 bg-white border border-slate-200 rounded-lg cursor-not-allowed shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* DATA TABLE (EMPTY STATE DEFAULT) */}
            <div className="w-full overflow-x-auto min-h-[300px] flex flex-col justify-between">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-6 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>Title</span>
                        <span className="text-slate-400 text-[10px]">▲▼</span>
                      </div>
                    </th>
                    <th className="py-3 px-6 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>Message</span>
                        <span className="text-slate-400 text-[10px]">▲▼</span>
                      </div>
                    </th>
                    <th className="py-3 px-6 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <span className="text-slate-400 text-[10px]">▲▼</span>
                      </div>
                    </th>
                    <th className="py-3 px-6 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>Created At</span>
                        <span className="text-slate-400 text-[10px]">▲▼</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* EMPTY STATE */}
                  <tr>
                    <td colSpan={4} className="py-24 text-center text-slate-400 font-semibold text-sm">
                      No Messages
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* FOOTER BAR */}
              <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex justify-end">
                <button
                  onClick={() => setIsInboxOpen(false)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CHECKLIST UI */}
      {isChecklistOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl font-sans dir-rtl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" /> قائمة تفقد مهام الورديات (Check List)
              </h3>
              <button onClick={() => setIsChecklistOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs font-bold text-gray-700">
              <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <input type="checkbox" defaultChecked className="rounded text-amber-600" />
                <span>مطابقة رصيد الصندوق مع Z-Report اليومي</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <input type="checkbox" defaultChecked className="rounded text-amber-600" />
                <span>فحص نسبة الحموضة الحمضية لصهاريج الزيت</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <input type="checkbox" className="rounded text-amber-600" />
                <span>إرسال إشعارات تسليم البضائع لسائقي SuperSonic</span>
              </label>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsChecklistOpen(false)} className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs">حفظ وإغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: WATCH TUTORIALS POPUP */}
      {isTutorialsOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl font-sans dir-rtl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-600" /> دروس وسلسلة شرح Vanguard ERP (Watch Tutorials)
              </h3>
              <button onClick={() => setIsTutorialsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center text-white relative">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
                title="Vanguard ERP Tutorials"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="pt-2 flex justify-between items-center text-xs font-bold text-gray-500">
              <span>دروس شرح المعاصر ونظام الكاشير المباشر</span>
              <button onClick={() => setIsTutorialsOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-xl text-xs">إغلاق الفيديو</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
