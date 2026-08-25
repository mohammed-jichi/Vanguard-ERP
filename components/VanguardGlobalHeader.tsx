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
  MessageSquare
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

  // Dropdown & Modal Toggle States
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<'general' | 'sales' | 'inventory' | 'accounting' | 'interface'>('general');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState<boolean>(false);
  const [quickMenuTab, setQuickMenuTab] = useState<'updates' | 'alerts' | 'activities' | 'help' | 'theme'>('help');
  
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
      
      {/* 1. TOP MAIN HEADER (LIGHT CREAM THEME bg-[#FDFBF7] - VANGUARD BRANDED WITH SEPARATOR LINE) */}
      <header className="w-full h-16 bg-[#FDFBF7] text-black border-b-2 border-[#E5DCC3] shadow-xs px-4 md:px-6 flex items-center justify-between top-0 left-0 right-0 z-50 shrink-0 select-none">
        
        {/* LEFT: VANGUARD BRANDING - PURE CIRCULAR LOGO & CONTINUOUS NON-BOLD TITLE */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectScreen('grid-dash')}>
            <img
              src="/assets/images/vanguard_logo.png"
              alt="Vanguard ERP Logo"
              className="w-11 h-11 rounded-full object-cover shadow-xs shrink-0 border border-stone-300/80 p-0.5 bg-white"
              onError={e => {
                (e.target as HTMLImageElement).src = '/assets/images/vanguard_logo.png';
              }}
            />
            <span className="text-lg md:text-xl font-normal text-black tracking-normal">
              Vanguard ERP System
            </span>
          </div>
        </div>

        {/* CENTER: TENANT LICENSE AND NAME (BLACK CONTRAST ON CREAM BACKGROUND) */}
        <div className="hidden md:flex items-center gap-2.5 bg-stone-200/70 border border-stone-300 px-4 py-1.5 rounded-full text-xs shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-black font-extrabold text-sm">22901</span>
          <span className="text-stone-400 font-bold">-</span>
          <span className="font-semibold text-black tracking-wide">{currentTenant?.brandNameEn || 'Southern Olive Oil & Products SARL'}</span>
          <span className="text-[11px] text-emerald-950 font-bold bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-2xs">
            {currentTenant?.brandNameAr || 'منتوجات زيت وزيتون الجنوب'}
          </span>
        </div>

        {/* RIGHT ICONS ACTION BAR (ALL PURE BLACK ICONS) */}
        <div className="flex items-center gap-2">

          {/* HOME ICON */}
          <button
            onClick={() => onSelectScreen('grid-dash')}
            title="Home Dashboard"
            className="p-2 hover:bg-stone-200/80 text-black hover:text-amber-700 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4 text-black" />
          </button>

          {/* MAIL ICON */}
          <button
            onClick={() => setIsInboxOpen(true)}
            title="Inbox between locations"
            className="p-2 hover:bg-stone-200/80 text-black hover:text-amber-700 rounded-xl transition-colors relative"
          >
            <Mail className="w-4 h-4 text-black" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
          </button>

          {/* SETTINGS GEAR ICON */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="System Settings"
              className={`p-2 rounded-xl transition-colors ${
                isSettingsOpen ? 'bg-amber-500 text-black font-bold' : 'hover:bg-stone-200/80 text-black hover:text-amber-700'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-black" />
            </button>

            {/* SETTINGS MODAL / DROPDOWN WITH 5 EXACT SECTIONS */}
            {isSettingsOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-2xl z-50 p-3 space-y-3 font-sans dir-rtl">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-black text-xs text-gray-900 flex items-center gap-1.5">
                    <SettingsIcon className="w-4 h-4 text-amber-600" /> إعدادات النظام الشاملة (System Settings)
                  </span>
                  <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 5 EXACT SECTIONS ACCORDION / TABS */}
                <div className="space-y-1 text-xs font-bold">
                  
                  {/* 1. GENERAL */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveSettingsSection('general')}
                      className={`w-full text-right p-2 flex items-center justify-between ${
                        activeSettingsSection === 'general' ? 'bg-amber-50 text-amber-900' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span>1. العامة (General)</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeSettingsSection === 'general' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeSettingsSection === 'general' && (
                      <div className="p-2 bg-white space-y-1 text-[11px] text-gray-600 pr-4">
                        <button onClick={() => { onSelectScreen('settings'); setIsSettingsOpen(false); }} className="w-full text-right py-1 hover:text-amber-600">معلومات الشركة والترخيص (Company Information)</button>
                        <button onClick={() => alert('إدارة قوالب البريد الإلكتروني')} className="w-full text-right py-1 hover:text-amber-600">قوالب البريد الإلكتروني (Email Templates)</button>
                      </div>
                    )}
                  </div>

                  {/* 2. SALES CONTROL */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveSettingsSection('sales')}
                      className={`w-full text-right p-2 flex items-center justify-between ${
                        activeSettingsSection === 'sales' ? 'bg-amber-50 text-amber-900' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span>2. إدارة المبيعات (Sales Control)</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeSettingsSection === 'sales' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeSettingsSection === 'sales' && (
                      <div className="p-2 bg-white space-y-1 text-[11px] text-gray-600 pr-4">
                        <button onClick={() => { onSelectScreen('sales-setup-screen'); setIsSettingsOpen(false); }} className="w-full text-right py-1 hover:text-amber-600">التهيئات العامة للمبيعات (General Configuration)</button>
                        <button onClick={() => { onSelectScreen('hr-orgsetup-permissions'); setIsSettingsOpen(false); }} className="w-full text-right py-1 hover:text-amber-600">تهيئة الموظفين والكاشير (Employee Configuration)</button>
                        <button onClick={() => { onSelectScreen('hr-attendancelog'); setIsSettingsOpen(false); }} className="w-full text-right py-1 hover:text-amber-600">حضور ودوام الموظفين (Employee Attendance)</button>
                      </div>
                    )}
                  </div>

                  {/* 3. INVENTORY */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveSettingsSection('inventory')}
                      className={`w-full text-right p-2 flex items-center justify-between ${
                        activeSettingsSection === 'inventory' ? 'bg-amber-50 text-amber-900' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span>3. إدارة المخزون (Inventory)</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeSettingsSection === 'inventory' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeSettingsSection === 'inventory' && (
                      <div className="p-2 bg-white space-y-1 text-[11px] text-gray-600 pr-4">
                        <button onClick={() => { onSelectScreen('inventory'); setIsSettingsOpen(false); }} className="w-full text-right py-1 hover:text-amber-600">التهيئات العامة للمخازن (General Configuration)</button>
                        <button onClick={() => alert('تمت عملية إعادة احتساب أرصدة المخزون')} className="w-full text-right py-1 hover:text-amber-600 text-amber-700 font-bold">إعادة احتساب الأرصدة (Recalculate)</button>
                      </div>
                    )}
                  </div>

                  {/* 4. ACCOUNTING */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveSettingsSection('accounting')}
                      className={`w-full text-right p-2 flex items-center justify-between ${
                        activeSettingsSection === 'accounting' ? 'bg-amber-50 text-amber-900' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span>4. المحاسبة والمالية (Accounting)</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeSettingsSection === 'accounting' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeSettingsSection === 'accounting' && (
                      <div className="p-2 bg-white space-y-1 text-[11px] text-gray-600 pr-4">
                        <button onClick={() => { onSelectScreen('acc-coa'); setIsSettingsOpen(false); }} className="w-full text-right py-1 hover:text-amber-600">تهيئة النظام المحاسبي (Company Configuration)</button>
                        <button onClick={() => alert('تمت عملية إعادة احتساب الأرصدة المحاسبية بنجاح!')} className="w-full text-right py-1 hover:text-amber-600 font-bold text-amber-700">إعادة احتساب الأرصدة (Recalculate Accounts Balances)</button>
                        <button onClick={() => { onSelectScreen('acc-aux-rates'); setIsSettingsOpen(false); }} className="w-full text-right py-1 hover:text-amber-600">فروقات أسعار الصرف (Difference of Exchange)</button>
                        <button onClick={() => { onSelectScreen('acc-vat'); setIsSettingsOpen(false); }} className="w-full text-right py-1 hover:text-amber-600 font-bold text-rose-700">إغلاق السنة المالية (End of Year)</button>
                      </div>
                    )}
                  </div>

                  {/* 5. ACCOUNTING INTERFACE */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveSettingsSection('interface')}
                      className={`w-full text-right p-2 flex items-center justify-between ${
                        activeSettingsSection === 'interface' ? 'bg-amber-50 text-amber-900' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span>5. الربط المحاسبي (Accounting Interface)</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeSettingsSection === 'interface' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeSettingsSection === 'interface' && (
                      <div className="p-2 bg-white space-y-1 text-[11px] text-gray-600 pr-4">
                        <button onClick={() => alert('فتح شاشة الربط المحاسبي المباشر')} className="w-full text-right py-1 hover:text-amber-600 font-bold">الربط المحاسبي (Accounting Link)</button>
                        <button onClick={() => alert('ترحيل الحركات إلى الحسابات')} className="w-full text-right py-1 hover:text-amber-600 font-bold text-emerald-700">ترحيل القيود للمحاسبة (Transfer to Accounting)</button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* HELP ICON (?) */}
          <a
            href="/support"
            target="_blank"
            rel="noreferrer"
            title="Support Center"
            className="p-2 hover:bg-stone-200/80 text-black hover:text-amber-700 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-black" />
          </a>

          {/* LANGUAGE SWITCHER DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              title="Select System Language"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-200/80 hover:bg-stone-300 text-black border border-stone-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-black shrink-0" />
              <span className="uppercase font-mono font-bold tracking-wider text-black">{language}</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-2xl z-50 p-1.5 text-xs font-bold space-y-1">
                <button
                  onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left p-2 rounded-xl flex items-center justify-between hover:bg-amber-50 ${language === 'en' ? 'bg-amber-50 text-amber-900 font-bold' : ''}`}
                >
                  <span>🇺🇸 English (Default)</span>
                  {language === 'en' && <span className="text-amber-600 font-black">✓</span>}
                </button>
                <button
                  onClick={() => { setLanguage('ar'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left p-2 rounded-xl flex items-center justify-between hover:bg-amber-50 ${language === 'ar' ? 'bg-amber-50 text-amber-900 font-bold' : ''}`}
                >
                  <span>🇱🇧 العربية (Arabic)</span>
                  {language === 'ar' && <span className="text-amber-600 font-black">✓</span>}
                </button>
                <button
                  onClick={() => { setLanguage('fr'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left p-2 rounded-xl flex items-center justify-between hover:bg-amber-50 ${language === 'fr' ? 'bg-amber-50 text-amber-900 font-bold' : ''}`}
                >
                  <span>🇫🇷 Français (French)</span>
                  {language === 'fr' && <span className="text-amber-600 font-black">✓</span>}
                </button>
                <button
                  onClick={() => { setLanguage('es'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left p-2 rounded-xl flex items-center justify-between hover:bg-amber-50 ${language === 'es' ? 'bg-amber-50 text-amber-900 font-bold' : ''}`}
                >
                  <span>🇪🇸 Español (Spanish)</span>
                  {language === 'es' && <span className="text-amber-600 font-black">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* USER PROFILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1.5 hover:bg-stone-200/80 text-black rounded-xl transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center border border-amber-300">
                {language === 'ar' ? 'م' : 'M'}
              </div>
              <span className="font-bold text-xs text-black hidden sm:inline">
                {language === 'ar' ? 'محمد' : 'Mohammed'}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {/* PROFILE DROPDOWN MENU */}
            {isProfileOpen && (
              <div className={`absolute right-0 mt-2 w-60 bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs font-semibold ${language === 'ar' ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
                <div className="p-2 border-b border-gray-100">
                  <p className="text-gray-900 font-bold">
                    {language === 'ar' ? 'محمد (مدير النظام)' : 'Mohammed (System Admin)'}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {language === 'ar' ? (currentTenant?.brandNameAr || 'منتوجات زيت وزيتون الجنوب') : (currentTenant?.brandNameEn || 'Southern Olive Oil & Products SARL')}
                  </p>
                </div>

                <button onClick={() => { onSelectScreen('settings'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{language === 'ar' ? 'المؤسسة (Organization)' : 'Organization & License'}</span>
                </button>
                <button onClick={() => { setIsQuickMenuOpen(true); setQuickMenuTab('alerts'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{language === 'ar' ? 'التنبيهات والإشعارات (Alerts)' : 'Alerts & Notifications'}</span>
                </button>
                <button onClick={() => { setLanguage(language === 'en' ? 'ar' : 'en'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{language === 'ar' ? 'اللغة (English)' : 'Language: English'}</span>
                </button>
                <button onClick={() => { onSelectScreen('settings'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{language === 'ar' ? 'حسابي الشخصي' : 'My Profile Account'}</span>
                </button>
                <button onClick={() => { onSelectScreen('hr-orgsetup-permissions'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{language === 'ar' ? 'الأدوَار والصلاحيات' : 'Roles & Permissions'}</span>
                </button>
                <button onClick={() => { onSelectScreen('hr-dir'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <UsersIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{language === 'ar' ? 'المستخدمين الكاشير' : 'Users & Cashiers'}</span>
                </button>
                <button onClick={() => { setIsQuickMenuOpen(true); setQuickMenuTab('updates'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{language === 'ar' ? 'آخر التحديثات' : 'Latest Updates'}</span>
                </button>
                <a href="/support" target="_blank" rel="noreferrer" className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{language === 'ar' ? 'مركز الدعم الفني' : 'Support Center'}</span>
                </a>
                
                <div className="border-t border-gray-100 pt-1">
                  <a href="/login" className="w-full p-2 hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 font-bold">
                    <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* QUICK MENU ICON (9-CUBES) */}
          <button
            onClick={() => setIsQuickMenuOpen(true)}
            title="Quick Menu"
            className="p-2 bg-stone-200/80 hover:bg-amber-500 text-black rounded-xl transition-colors shadow-2xs ml-1"
          >
            <LayoutGrid className="w-4 h-4 text-black" />
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

            {/* TOP TABS HEADER */}
            <div className="flex items-center border-b border-gray-200 bg-gray-50 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setQuickMenuTab('help')}
                className={`p-3 text-center border-b-2 shrink-0 ${quickMenuTab === 'help' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600'}`}
              >
                Help & Support
              </button>
              <button
                onClick={() => setQuickMenuTab('updates')}
                className={`p-3 text-center border-b-2 shrink-0 ${quickMenuTab === 'updates' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600'}`}
              >
                Latest Updates
              </button>
              <button
                onClick={() => setQuickMenuTab('alerts')}
                className={`p-3 text-center border-b-2 shrink-0 ${quickMenuTab === 'alerts' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600'}`}
              >
                Alerts
              </button>
              <button
                onClick={() => setQuickMenuTab('activities')}
                className={`p-3 text-center border-b-2 shrink-0 ${quickMenuTab === 'activities' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600'}`}
              >
                Last Activities
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-bold text-gray-800">
              
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

                  {/* DOWNLOADS LIST (NO OMEGA APPS - VANGUARD APPS ONLY) */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                    <h4 className="font-black text-slate-900 text-sm">
                      {language === 'ar' ? 'تطبيقات برامج Vanguard المباشرة (Downloads)' : 'Downloads'}
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
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('Download Vanguard SuperSonic Driver Mobile App'); }} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-xl hover:text-amber-600">
                        <span>Vanguard Driver Fleet Mobile APK</span>
                        <Download className="w-3.5 h-3.5 text-amber-600" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* UPDATES TAB */}
              {quickMenuTab === 'updates' && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-[10px] text-amber-600 font-bold font-mono">v2026.8.25 Update</span>
                    <h5 className="font-black text-gray-900">{language === 'ar' ? 'تحديث وحدات القياس UOM والحسابات' : 'UOM Units of Measure & Accounting Engine'}</h5>
                    <p className="text-gray-500 font-medium text-[11px] mt-1">{language === 'ar' ? 'تطبيق نظام الـ 18 وحدة قياس معقدة واحتساب أسعار التكلفة تلقائياً.' : 'Automatic 18 unit of measure conversions & cost calculation.'}</p>
                  </div>
                </div>
              )}

              {/* ALERTS TAB */}
              {quickMenuTab === 'alerts' && (
                <div className="space-y-2">
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl">
                    <p className="font-black text-xs">{language === 'ar' ? '⚠️ تنبيه إغلاق الشهر المحاسبي' : '⚠️ End of Month Closing Alert'}</p>
                    <p className="text-[11px] font-medium mt-0.5">{language === 'ar' ? 'يرجى مطابقة قيود JV وحسابات البنوك قبل الإغلاق.' : 'Please reconcile JV entries and bank accounts prior to closure.'}</p>
                  </div>
                </div>
              )}

              {/* LAST ACTIVITIES TAB */}
              {quickMenuTab === 'activities' && (
                <div className="space-y-2 text-[11px]">
                  <p className="p-2 bg-gray-50 rounded-lg text-gray-700">{language === 'ar' ? 'تحديث شعار الشركة لـ منتوجات زيت وزيتون الجنوب SARL' : 'Updated company profile for Southern Olive Oil & Products SARL'}</p>
                  <p className="p-2 bg-gray-50 rounded-lg text-gray-700">{language === 'ar' ? 'إنشاء إرسالية استلام زيت زيتون بكر ممتاز - 16 لتر' : 'Created receipt voucher for Extra Virgin Olive Oil - 16L'}</p>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: INBOX BETWEEN LOCATIONS */}
      {isInboxOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl font-sans dir-rtl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-600" /> البريد المتبادل بين الفروع (Inbox between locations)
              </h3>
              <button onClick={() => setIsInboxOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs font-bold text-gray-700">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between text-amber-900 font-black">
                  <span>فرع صيدا الرئيسي → المعصرة</span>
                  <span className="text-[10px] text-gray-500 font-mono">10:45 AM</span>
                </div>
                <p className="text-gray-600 font-medium text-[11px] mt-1">طلب تجهيز 50 تنكة زيت زيتون بكر ممتاز للشحن اليوم.</p>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsInboxOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-xl text-xs">إغلاق</button>
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
