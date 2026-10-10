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
  ChevronRight,
  Truck,
  Map,
  ShieldCheck,
  Award,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage, LanguageCode } from '@/context/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import { subscribeToAccountingSync } from '@/lib/accountingPersistenceService';
import { clearAuthSession } from '@/lib/authSession';
import LanguageSwitcherModal from '@/components/LanguageSwitcherModal';
import HeaderLanguageDropdown from '@/components/HeaderLanguageDropdown';
import { useActiveUser } from '@/lib/useActiveUser';

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
  const activeUser = useActiveUser();
  const { language, dir, setLanguage, t } = useLanguage();
  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);

  // Language Switcher Dropdown State
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);

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
  const [quickMenuTab, setQuickMenuTab] = useState<'apps' | 'updates' | 'alerts' | 'activities' | 'help' | 'theme'>('apps');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showMoreUpdates, setShowMoreUpdates] = useState<boolean>(false);
  const [showMoreActivities, setShowMoreActivities] = useState<boolean>(false);

  // Alerts & Activities state dynamically populated from database audit logs
  const [dynamicAlerts, setDynamicAlerts] = useState<Array<{
    id: string;
    type: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    message: string;
    timestamp: string;
    actionLink?: string;
    actionLabel?: string;
    source_type?: string;
    source_ref?: string;
  }>>([]);
  const [latestUpdates, setLatestUpdates] = useState<Array<{
    id: string;
    commit_hash: string;
    short_hash: string;
    version: string;
    title: string;
    category: 'feature' | 'fix' | 'security' | 'performance' | 'refactor' | 'maintenance';
    description: string;
    bullet_points: string[];
    affected_modules: string[];
    author_name: string;
    is_critical?: boolean;
    deployed_at: string;
  }>>([]);
  const [loadingUpdates, setLoadingUpdates] = useState<boolean>(false);
  const [updatesCategoryFilter, setUpdatesCategoryFilter] = useState<string>('all');
  const [updatesSearchQuery, setUpdatesSearchQuery] = useState<string>('');
  const [dynamicActivities, setDynamicActivities] = useState<Array<{
    id: string;
    action_type: string;
    description: string;
    performed_by: string;
    created_at: string;
  }>>([]);
  const [inboxMessages, setInboxMessages] = useState<Array<{
    id: string;
    category: string;
    subject: string;
    sender: string;
    branch: string;
    time: string;
    date: string;
    status: string;
    isRead: boolean;
    priority: string;
    content: string;
    details?: any;
  }>>([]);
  
  // Dialog Modals
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
  const [isTutorialsOpen, setIsTutorialsOpen] = useState<boolean>(false);
  const [includeResolvedAlerts, setIncludeResolvedAlerts] = useState<boolean>(false);

  // Dynamic Header Feeds & Database Audit Sync
  const loadHeaderFeeds = React.useCallback(async (includeResolved: boolean = false) => {
    try {
      const url = `/api/notifications${includeResolved ? '?includeResolved=true' : ''}`;
      const notifRes = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (!notifRes.ok) return; // Silent bail
      const notifData = await notifRes.json();
      if (notifData.success) {
        setDynamicAlerts(notifData.alerts || []);
        setDynamicActivities(notifData.activities || []);
        const activeCount = (notifData.alerts || []).filter((a: any) => a.status === 'PENDING' && !a.is_read).length;
        setAlertCount(activeCount);
        setHasUnread(Boolean(notifData.unreadInboxCount && notifData.unreadInboxCount > 0));
      }

      const inboxRes = await fetch('/api/inbox', { signal: AbortSignal.timeout(1500) });
      if (!inboxRes.ok) return; // Silent bail
      const inboxData = await inboxRes.json();
      if (inboxData.success && Array.isArray(inboxData.data)) {
        setInboxMessages(inboxData.data);
      }

      // Fetch dynamic platform updates & deployment logs
      try {
        setLoadingUpdates(true);
        const upRes = await fetch('/api/updates?limit=25', { signal: AbortSignal.timeout(1500) });
        if (!upRes.ok) return; // Silent bail
        const upData = await upRes.json();
        if (upData.success && Array.isArray(upData.data)) {
          setLatestUpdates(upData.data);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.warn('Notice: Header updates fetch:', err);
      } finally {
        setLoadingUpdates(false);
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.warn('Notice: Header notification fetch:', e);
    }
  }, []);

  const handleDismissAlert = async (alertId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setDynamicAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setAlertCount((prev) => Math.max(0, prev - 1));
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DISMISS_ALERT', alertId })
      });
    } catch (err) {
      console.warn('Notice: Dismiss alert failed:', err);
    }
  };

  useEffect(() => {
    // Initial fetch only, no background polling
    loadHeaderFeeds(includeResolvedAlerts);
    
    // Local event subscription (no background polling)
    const unsubscribe = subscribeToAccountingSync(() => {
      loadHeaderFeeds(includeResolvedAlerts);
    });
    
    return () => {
      unsubscribe();
    };
  }, [loadHeaderFeeds, includeResolvedAlerts]);

  // Track recently visited routes dynamically
  useEffect(() => {
    if (!activeScreen || activeScreen === 'grid-dash') return;

    const screenTitles: Record<string, string> = {
      'oil-pressing': 'Oil Pressing & Production',
      'sales-pos': 'POS Cashier Terminal',
      'sales-dash': 'Sales Dashboard',
      'inventory': 'Inventory & Tanks',
      'acc-jv': 'Journal Vouchers JV',
      'acc-dash': 'Accounting Dashboard',
      'cust-dir': 'Customer Directory',
      'hr-payroll-dash': 'Payroll Management',
      'supersonic-fleet': 'Fleet Logistics',
      'delivery-goods': 'Delivery of Goods'
    };

    const title = screenTitles[activeScreen] || activeScreen;

    setRecentlyVisited(prev => {
      const filtered = prev.filter(item => item.key !== activeScreen);
      return [{ key: activeScreen, titleAr: title }, ...filtered].slice(0, 5);
    });
  }, [activeScreen]);

  // Check read-only state for frozen tenants
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  useEffect(() => {
    setIsReadOnly(localStorage.getItem('vanguard_is_read_only') === 'true');
  }, []);

  return (
    <div className="w-full flex flex-col font-sans dir-ltr select-none">
      
      {/* GLOBAL READ-ONLY BANNER FOR FROZEN TENANTS */}
      {isReadOnly && (
        <div className="w-full bg-amber-400 text-amber-950 px-4 py-2 flex items-center justify-center gap-2 font-bold text-sm shadow-sm z-50 shrink-0">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Account Frozen (15-Day Grace Period): Read-Only mode active. Settle outstanding fees to unlock creation and editing.</span>
        </div>
      )}

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
              {t('vanguard_erp', 'VANGUARD ERP')}
            </span>
          </a>
        </div>

        {/* CENTER: TENANT ENTERPRISE AND FACILITY SLOTS */}
        <div className="hidden lg:flex items-center gap-2.5">
          <a
            href="/backoffice/license"
            title={t('vanguard_erp_authorized_enterprise', 'Vanguard ERP Authorized Enterprise License - View Certificate')}
            className="flex items-center gap-2 bg-[#252538] hover:bg-[#2d2d44] border border-[#373752] hover:border-amber-500/50 px-3.5 py-1.5 rounded-full text-xs shadow-inner transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-white font-black text-xs" style={{ color: '#ffffff' }}>#1300</span>
            <span className="text-white font-bold" style={{ color: '#ffffff' }}>-</span>
            <span className="font-semibold text-white tracking-wide truncate max-w-[220px]" style={{ color: '#ffffff' }}>{t('southern_olive_oil_products_sarl', 'Southern Olive and Oil Products S.A.R.L.')}</span>
            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {t('licensed_unlocked', 'LICENSED')}
            </span>
          </a>

          {/* FACILITY CONTEXT SLOT */}
          <div className="flex items-center gap-1.5 bg-[#252538] border border-[#373752] px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 shadow-inner">
            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-[240px]">#1300 Southern Olive and Oil Products - Main (SO-HQ-MAIN-01)</span>
          </div>
        </div>

        {/* RIGHT ICONS ACTION BAR (PREMIUM GOLD THEME - text-amber-400 / text-amber-500) */}
        <div className="flex items-center gap-1.5 md:gap-2">

          {/* HOME ICON */}
          <button
            onClick={() => onSelectScreen('grid-dash')}
            title={t('home_dashboard', 'Home Dashboard')}
            className="p-2 hover:bg-[#252538] text-amber-400 hover:text-amber-300 rounded-xl transition-colors"
          >
            <Home className="w-4.5 h-4.5 text-amber-400" />
          </button>

          {/* OPERATIONAL ALERTS BELL ICON */}
          <button
            onClick={() => {
              setIsQuickMenuOpen(true);
              setQuickMenuTab('alerts');
            }}
            title={t('internal_operational_notifications', 'Internal Operational Notifications')}
            className="p-2 hover:bg-[#252538] text-amber-400 hover:text-amber-300 rounded-xl transition-colors relative"
          >
            <Bell className="w-4.5 h-4.5 text-amber-400" />
            {dynamicAlerts.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#12121e]">
                {dynamicAlerts.length > 9 ? '9+' : dynamicAlerts.length}
              </span>
            )}
          </button>

          {/* SYSTEM SETTINGS GEAR ICON */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title={t('system_settings', 'System Settings')}
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
                      <h3 className="font-extrabold text-sm text-slate-900">{t('system_settings', 'System Settings')}</h3>
                      <p className="text-[11px] text-slate-600 font-medium">{t('enterprise_core_configuration', 'Enterprise core configuration, accounting parameters, and sales control rules')}</p>
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
                        {t('general', 'General')}
                      </h4>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { onSelectScreen('settings'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors flex items-center justify-between"
                        >
                          <span>{t('company_information', 'Company Information')}</span>
                        </button>
                        <a
                          href="/backoffice/license"
                          onClick={() => setIsSettingsOpen(false)}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>{t('license_activation_certificate', 'License & Activation Certificate')}</span>
                          </span>
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {t('active', 'ACTIVE')}
                          </span>
                        </a>
                        <button
                          onClick={() => { setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors flex items-center justify-between"
                        >
                          <span>{t('email_templates', 'Email Templates')}</span>
                        </button>
                      </div>
                    </div>

                    {/* ACCOUNTING */}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                        {t('accounting', 'Accounting')}
                      </h4>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { onSelectScreen('acc-coa'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('company_configuration', 'Company Configuration')}
                        </button>
                        <button
                          onClick={() => { setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('recalculate_accounts_balances', 'Recalculate Accounts Balances')}
                        </button>
                        <button
                          onClick={() => { onSelectScreen('acc-aux-rates'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('difference_of_exchange', 'Difference of Exchange')}
                        </button>
                        <button
                          onClick={() => { onSelectScreen('acc-vat'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('end_of_year', 'End of Year')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: SALES CONTROL & ACCOUNTING INTERFACE */}
                  <div className="space-y-5">
                    {/* SALES CONTROL */}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                        {t('sales_control', 'Sales Control')}
                      </h4>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { onSelectScreen('sales-setup-screen'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('general_configuration', 'General Configuration')}
                        </button>
                        <button
                          onClick={() => { onSelectScreen('hr-orgsetup-permissions'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('employee_configuration', 'Employee Configuration')}
                        </button>
                        <button
                          onClick={() => { onSelectScreen('hr-attendancelog'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('employee_attendance', 'Employee Attendance')}
                        </button>
                      </div>
                    </div>

                    {/* ACCOUNTING INTERFACE */}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                        {t('accounting_interface', 'Accounting Interface')}
                      </h4>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('accounting_link', 'Accounting Link')}
                        </button>
                        <button
                          onClick={() => { setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('transfer_to_accounting', 'Transfer to Accounting')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 3: INVENTORY */}
                  <div className="space-y-5">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">
                        {t('inventory', 'Inventory')}
                      </h4>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => { onSelectScreen('inventory'); setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('general_configuration', 'General Configuration')}
                        </button>
                        <button
                          onClick={() => { setIsSettingsOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 rounded-xl transition-colors"
                        >
                          {t('recalculate', 'Recalculate')}
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
            title={t('help_support', 'Help & Support')}
            className="p-2 hover:bg-[#252538] text-amber-400 hover:text-amber-300 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4.5 h-4.5 text-amber-400" />
          </a>

          {/* HEADER LANGUAGE SELECTOR DROPDOWN */}
          <HeaderLanguageDropdown />

          {/* USER PROFILE DROPDOWN (DYNAMIC USER RESOLUTION) */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1.5 hover:bg-[#252538] text-white rounded-xl transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center border border-amber-300 shadow-xs">
                {activeUser.avatarLetter || 'U'}
              </div>
              <span className="font-bold text-xs text-white hidden sm:inline">
                {activeUser.name || t('user', 'User')}
              </span>
              <ChevronDown className="w-3 h-3 text-amber-400" />
            </button>

            {/* PROFILE DROPDOWN MENU */}
            {isProfileOpen && (
              <div className={`absolute right-0 mt-2 w-60 bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs font-semibold ${language === 'ar' ? 'dir-ltr text-right' : 'dir-ltr text-left'}`}>
                <div className="p-2 border-b border-gray-100">
                  <p className="text-gray-900 font-bold">
                    {activeUser.name || t('user', 'User')}
                  </p>
                  <p className="text-[11px] text-amber-600 font-semibold">
                    {activeUser.role || 'Manager'}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium truncate">
                    {currentTenant?.name || t('southern_olive_oil_products_sarl', 'Southern Olive Oil Products S.A.R.L')}
                  </p>
                </div>

                <Link
                  href={`/${orgId}/settings/organization`}
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t('organization', 'Organization')}</span>
                </Link>
                <button onClick={() => { setIsQuickMenuOpen(true); setQuickMenuTab('alerts'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t('alerts_notifications', 'Alerts & Notifications')}</span>
                </button>
                <div className="p-2 border-b border-gray-100 bg-emerald-50/70 rounded-xl mb-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      {t('vtrack_cloud', 'V-Track Cloud')}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {t('active', 'ACTIVE')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium mt-0.5">{t('vtrack_status_desc', 'Real-time mobile & geographics tracking active')}</p>
                </div>
                <a href="/vtrack" target="_blank" rel="noopener noreferrer" className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Map className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{t('vtrack_geographics', 'V-Track Geographics')}</span>
                  </div>
                  <span className="text-[9.5px] font-mono text-emerald-600 font-black">{t('live', 'LIVE')}</span>
                </a>
                <Link
                  href="/backoffice/account"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2 text-slate-700"
                >
                  <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t('my_account', 'My Account')}</span>
                </Link>
                <Link
                  href={`/${orgId}/settings/roles`}
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2 text-slate-700"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t('roles', 'Roles & Permissions')}</span>
                </Link>
                <Link
                  href={`/${orgId}/settings/users`}
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2 text-slate-700"
                >
                  <UsersIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t('users', 'Users')}</span>
                </Link>
                <button onClick={() => { setIsQuickMenuOpen(true); setQuickMenuTab('updates'); setIsProfileOpen(false); }} className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t('latest_updates', 'Latest Updates')}</span>
                </button>
                <a href="/support" target="_blank" rel="noreferrer" className="w-full p-2 hover:bg-amber-50 hover:text-amber-900 rounded-xl flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t('support_center', 'Support Center')}</span>
                </a>
                
                <div className="border-t border-gray-100 pt-1">
                  <button
                    type="button"
                    onClick={() => clearAuthSession()}
                    className="w-full p-2 hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 font-bold cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{t('logout', 'Logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* QUICK MENU TOGGLE ICON (9-CUBES - GOLD THEME) */}
          <button
            onClick={() => setIsQuickMenuOpen(true)}
            title={t('open_quick_drawer', 'Quick Menu')}
            className="p-2 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/40 rounded-xl transition-colors shadow-2xs ml-1"
          >
            <LayoutGrid className="w-4.5 h-4.5 text-amber-400 hover:text-slate-950" />
          </button>

        </div>
      </header>

      {/* 3. QUICK MENU RIGHT-DRAWER (FROM 9-CUBES ICON) */}
      {isQuickMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col dir-ltr font-sans animate-in slide-in-from-right duration-200">
            
            {/* DRAWER HEADER */}
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">{t('vanguard_quick_menu', 'Vanguard Quick Menu')}</h3>
              </div>
              <button onClick={() => setIsQuickMenuOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TOP TABS HEADER (WITH DARK MODE TOGGLE BUTTON) */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 text-xs font-bold px-1">
              <div className="flex items-center overflow-x-auto">
                <button
                  onClick={() => setQuickMenuTab('apps')}
                  className={`p-3 text-center border-b-2 shrink-0 transition-colors ${quickMenuTab === 'apps' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  Apps Suite (4)
                </button>
                <button
                  onClick={() => setQuickMenuTab('updates')}
                  className={`p-3 text-center border-b-2 shrink-0 transition-colors ${quickMenuTab === 'updates' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  {t('latest_updates', 'Latest Updates')}
                </button>
                <button
                  onClick={() => setQuickMenuTab('alerts')}
                  className={`p-3 text-center border-b-2 shrink-0 transition-colors ${quickMenuTab === 'alerts' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  Alerts {dynamicAlerts && dynamicAlerts.length > 0 && `(${dynamicAlerts.length})`}
                </button>
                <button
                  onClick={() => setQuickMenuTab('activities')}
                  className={`p-3 text-center border-b-2 shrink-0 transition-colors ${quickMenuTab === 'activities' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  {t('last_activities', 'Last Activities')}
                </button>
                <button
                  onClick={() => setQuickMenuTab('help')}
                  className={`p-3 text-center border-b-2 shrink-0 transition-colors ${quickMenuTab === 'help' ? 'border-amber-500 text-amber-700 bg-white font-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  {t('help', 'Help')}
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

              {/* STANDALONE APPS (V-SUITE) TAB */}
              {quickMenuTab === 'apps' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl">
                    <span className="text-[10px] text-amber-800 font-black uppercase tracking-wider block">
                      {t('vanguard_standalone_apps_suite', 'Vanguard Standalone Apps Suite')}
                    </span>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-relaxed">
                      {t('launch_dedicated_clientfacing_portals', 'Launch dedicated client-facing portals and driver PWAs in standalone external windows.')}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        name: 'V-Connect',
                        tag: 'Social CRM, WhatsApp & Support',
                        desc: 'Omnichannel inbox, WhatsApp automation & customer ticketing',
                        href: '/connect',
                        icon: '🌐',
                        badge: 'OMNICHANNEL'
                      },
                      {
                        name: 'V-Driver',
                        tag: 'SuperSonic Driver & Fleet App',
                        desc: 'Live trip manifests, driver GPS dispatch & e-signatures',
                        href: '/v-driver',
                        icon: '🚚',
                        badge: 'MOBILE PWA'
                      },
                      {
                        name: 'V-POS',
                        tag: 'Fast Touch Counter Sales',
                        desc: 'Rapid cashier POS terminal with dual-currency cash drawer',
                        href: '/pos',
                        icon: '🛒',
                        badge: 'TOUCH POS'
                      },
                      {
                        name: 'V-Store',
                        tag: 'Storefront / B2B Web Portal',
                        desc: 'Customer self-service portal, online catalog & wholesale orders',
                        href: '/v-store',
                        icon: '🏬',
                        badge: 'WEB STORE'
                      }
                    ].map(app => (
                      <a
                        key={app.name}
                        href={app.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-slate-50 hover:bg-white border border-slate-200 hover:border-amber-400 rounded-xl flex items-start justify-between gap-3 transition-all group shadow-2xs hover:shadow-sm cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl p-1.5 bg-white border border-slate-200 rounded-lg shrink-0">{app.icon}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-extrabold text-xs text-slate-900 group-hover:text-amber-600 transition-colors">
                                {app.name}
                              </h5>
                              <span className="text-[9px] font-black text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-200">
                                {app.badge}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-700 mt-0.5">{app.tag}</p>
                            <p className="text-[10px] text-slate-500">{app.desc}</p>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 shrink-0 mt-1 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* LATEST UPDATES TAB (DYNAMIC PLATFORM DEPLOYMENT LOGS) */}
              {quickMenuTab === 'updates' && (
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300/70 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px] text-amber-900 font-black uppercase tracking-wider block">
                          {t('published_platform_release_notes', 'Platform Release Notes & Deployment Log')}
                        </span>
                      </div>
                      {latestUpdates[0]?.version && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 font-mono shadow-2xs">
                          {latestUpdates[0].version}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                      {t('official_platformwide_version_releases', 'Automated CI/CD deployment logs, verified production releases, and engine updates.')}
                    </p>
                    {latestUpdates[0]?.deployed_at && (
                      <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{t('latest_deployed', 'Last Deployed')}:</span>
                        <span className="font-bold text-slate-700">
                          {new Date(latestUpdates[0].deployed_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SEARCH & CATEGORY FILTER */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={updatesSearchQuery}
                        onChange={(e) => setUpdatesSearchQuery(e.target.value)}
                        placeholder={t('search_updates', 'Search release notes or modules...')}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold">
                      {['all', 'feature', 'fix', 'security', 'performance', 'refactor'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setUpdatesCategoryFilter(cat)}
                          className={`px-2 py-0.5 rounded-lg shrink-0 transition-colors uppercase cursor-pointer ${
                            updatesCategoryFilter === cat
                              ? 'bg-amber-600 text-white font-black shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* UPDATES STREAM */}
                  {loadingUpdates ? (
                    <div className="p-6 text-center text-slate-400 space-y-2">
                      <RefreshCw className="w-5 h-5 mx-auto animate-spin text-amber-500" />
                      <p className="text-xs">{t('loading_updates', 'Loading deployment records...')}</p>
                    </div>
                  ) : latestUpdates.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                      <Sparkles className="w-5 h-5 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-600 text-xs">{t('no_updates_found', 'No updates recorded yet.')}</p>
                      <p className="text-[10px] text-slate-400">{t('updates_auto_populate', 'Releases will populate automatically upon deployment.')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {latestUpdates
                        .filter((u) => {
                          const matchesCat = updatesCategoryFilter === 'all' || u.category === updatesCategoryFilter;
                          const matchesSearch =
                            !updatesSearchQuery.trim() ||
                            u.title.toLowerCase().includes(updatesSearchQuery.toLowerCase()) ||
                            u.description.toLowerCase().includes(updatesSearchQuery.toLowerCase()) ||
                            (u.affected_modules && u.affected_modules.some((m) => m.toLowerCase().includes(updatesSearchQuery.toLowerCase())));
                          return matchesCat && matchesSearch;
                        })
                        .map((update) => {
                          const catBadgeStyles: Record<string, string> = {
                            feature: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                            fix: 'bg-amber-100 text-amber-800 border-amber-300',
                            security: 'bg-rose-100 text-rose-800 border-rose-300',
                            performance: 'bg-sky-100 text-sky-800 border-sky-300',
                            refactor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                            maintenance: 'bg-slate-100 text-slate-800 border-slate-300'
                          };

                          return (
                            <div
                              key={update.commit_hash || update.id}
                              className="p-3.5 bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-amber-300 rounded-2xl space-y-2 transition-all shadow-2xs group"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider border ${catBadgeStyles[update.category] || catBadgeStyles.feature}`}>
                                    {update.category}
                                  </span>
                                  <span className="text-[9.5px] font-black font-mono bg-slate-200/80 text-slate-800 px-1.5 py-0.2 rounded">
                                    {update.version}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">
                                    #{update.short_hash}
                                  </span>
                                </div>
                                <span className="text-[9.5px] font-mono text-slate-400 shrink-0">
                                  {new Date(update.deployed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>

                              <h5 className="font-black text-slate-900 text-xs leading-snug group-hover:text-amber-700 transition-colors">
                                {update.title}
                              </h5>

                              {update.description && update.description !== update.title && (
                                <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
                                  {update.description}
                                </p>
                              )}

                              {update.bullet_points && update.bullet_points.length > 0 && (
                                <ul className="space-y-1 pt-1 border-t border-slate-200/60 text-[10.5px] text-slate-600 font-medium">
                                  {update.bullet_points.slice(0, 3).map((bp, bidx) => (
                                    <li key={bidx} className="flex items-start gap-1.5">
                                      <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                                      <span className="leading-tight">{bp}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {update.affected_modules && update.affected_modules.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap pt-1">
                                  {update.affected_modules.map((mod, midx) => (
                                    <span key={midx} className="text-[8.5px] font-bold bg-slate-200/60 text-slate-700 px-1.5 py-0.2 rounded">
                                      {mod}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => loadHeaderFeeds(includeResolvedAlerts)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors text-center border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                    <span>{t('refresh_updates', 'Refresh Releases')}</span>
                  </button>
                </div>
              )}

              {/* ALERTS TAB (DYNAMIC DATABASE ALERTS & WORKFLOWS) */}
              {quickMenuTab === 'alerts' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl">
                    <span className="text-[10px] text-blue-800 font-black uppercase tracking-wider block">
                      {t('internal_tenant_operational', 'Internal Tenant Operational Notifications')}
                    </span>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-relaxed">
                      Active operational notifications, unposted reconciliations, and workflow exceptions for {currentTenant?.name || 'Active Tenant'}.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 px-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {includeResolvedAlerts ? 'All Historical Alerts' : 'Active Live Feed'}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeResolvedAlerts}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setIncludeResolvedAlerts(next);
                          loadHeaderFeeds(next);
                        }}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                      />
                      <span className="text-[10px] font-semibold text-gray-500">{t('include_archived', 'Include Archived')}</span>
                    </label>
                  </div>

                  {dynamicAlerts.length === 0 ? (
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-2">
                      <Bell className="w-6 h-6 text-gray-400 mx-auto" />
                      <p className="font-semibold text-gray-600 text-xs">{t('no_active_alerts_right_now', 'No active alerts right now.')}</p>
                      <p className="text-[10px] text-gray-400">{t('all_vouchers_reconciliations_and', 'All vouchers, reconciliations, and workflows are in balance.')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {dynamicAlerts.map((alt: any) => (
                        <div
                          key={alt.id}
                          className={`p-3 rounded-2xl space-y-1.5 border transition-all ${
                            alt.status === 'RESOLVED' || alt.status === 'ARCHIVED'
                              ? 'bg-slate-50/80 border-slate-200 text-slate-600 opacity-75'
                              : alt.severity === 'CRITICAL'
                              ? 'bg-rose-50/90 border-rose-200 text-rose-950 shadow-xs'
                              : alt.severity === 'WARNING'
                              ? 'bg-amber-50/90 border-amber-200 text-amber-950 shadow-xs'
                              : 'bg-blue-50/90 border-blue-200 text-blue-950 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {alt.status === 'RESOLVED' || alt.status === 'ARCHIVED' ? (
                                <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  {alt.status}
                                </span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse shrink-0" />
                              )}
                              <p className="font-black text-xs leading-snug">{alt.title}</p>
                            </div>
                            <span className="text-[10px] font-mono opacity-70 shrink-0">{alt.timestamp}</span>
                          </div>
                          <p className="text-[11px] font-medium opacity-90 leading-relaxed">{alt.message}</p>
                          <div className="pt-1.5 flex items-center justify-between border-t border-black/5 mt-1">
                            {alt.actionLink ? (
                              alt.source_type === 'RELEASE' || alt.type === 'SYSTEM_RELEASE' ? (
                                <button
                                  type="button"
                                  onClick={() => setQuickMenuTab('updates')}
                                  className="text-[11px] font-extrabold text-amber-800 hover:text-amber-950 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{alt.actionLabel || 'View Release Notes'}</span> →
                                </button>
                              ) : (
                                <a
                                  href={alt.actionLink}
                                  onClick={() => setIsQuickMenuOpen(false)}
                                  className="text-[11px] font-extrabold text-amber-800 hover:text-amber-950 hover:underline inline-flex items-center gap-1"
                                >
                                  <span>{alt.actionLabel || 'Inspect'}</span> →
                                </a>
                              )
                            ) : <span />}
                            {alt.status !== 'RESOLVED' && alt.status !== 'ARCHIVED' && (
                              <button
                                type="button"
                                onClick={(e) => handleDismissAlert(alt.id, e)}
                                className="text-[10px] font-semibold text-gray-400 hover:text-gray-700 hover:underline px-1.5 py-0.5 cursor-pointer"
                              >
                                {t('dismiss', 'Dismiss')}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LAST ACTIVITIES TAB (DYNAMIC DATABASE AUDIT TRAIL) */}
              {quickMenuTab === 'activities' && (
                <div className="space-y-3 text-[11px]">
                  {dynamicActivities.length === 0 ? (
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-1 text-gray-500">
                      <p className="font-semibold text-xs">{t('no_recent_operational_activities', 'No recent operational activities recorded.')}</p>
                      <p className="text-[10px] text-gray-400">{t('database_audit_trail_will_appear_here', 'Database audit trail will appear here as vouchers are saved and posted.')}</p>
                    </div>
                  ) : (
                    (showMoreActivities ? dynamicActivities : dynamicActivities.slice(0, 4)).map((act) => (
                      <div key={act.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1 hover:border-amber-400 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 border border-amber-200 px-1.5 py-0.5 rounded">
                            {act.action_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="font-bold text-gray-800 leading-snug">{act.description}</p>
                        <p className="text-[10px] text-gray-500 font-medium">By: {act.performed_by}</p>
                      </div>
                    ))
                  )}

                  {dynamicActivities.length > 4 && (
                    <button
                      onClick={() => setShowMoreActivities(!showMoreActivities)}
                      className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors text-center border border-gray-200"
                    >
                      {showMoreActivities ? 'Show Less Activities' : `Show More Activities (${dynamicActivities.length - 4})`}
                    </button>
                  )}
                </div>
              )}

              {/* HELP TAB CONTENT */}
              {quickMenuTab === 'help' && (
                <div className="space-y-4">
                  {/* SUPPORT CENTER */}
                  <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl space-y-2">
                    <h4 className="font-black text-amber-900 text-sm">
                      'Support Center'
                    </h4>
                    <p className="text-gray-600 font-medium text-[11px]">
                      'Open the main support page for guides, videos, and product help.'
                    </p>
                    <a
                      href="/support"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> {t('go_to_support_center', 'Go to Support Center')}
                    </a>
                  </div>

                  {/* LIVE CHAT */}
                  <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl space-y-2">
                    <h4 className="font-black text-emerald-900 text-sm">
                      'Live WhatsApp Chat'
                    </h4>
                    <p className="text-gray-600 font-medium text-[11px]">
                      'Connect directly with the Vanguard Support team via WhatsApp.'
                    </p>
                    <a
                      href="https://wa.me/96170000000"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> {t('open_whatsapp_chat', 'Open WhatsApp Chat')}
                    </a>
                  </div>

                  {/* PHONE CALL */}
                  <div className="bg-sky-50/60 border border-sky-200 p-4 rounded-2xl space-y-2">
                    <h4 className="font-black text-sky-900 text-sm">
                      'Phone Support'
                    </h4>
                    <p className="text-gray-600 font-medium text-[11px]">
                      'Direct telephone hotline for urgent Vanguard support.'
                    </p>
                    <a
                      href="tel:+96170000000"
                      className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-black px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Vanguard (+961 70 000 000)
                    </a>
                  </div>

                  {/* QUICK TIPS & DOWNLOADS */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                    <h4 className="font-black text-slate-900 text-sm">
                      {t('quick_tips_downloads', 'Quick Tips & Downloads')}
                    </h4>
                    <div className="space-y-1.5 pt-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {}}
                        className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-xl hover:text-amber-600 cursor-pointer"
                      >
                        <span>{t('vanguard_pos_desktop_terminal_v42', 'Vanguard POS Desktop Terminal v4.2')}</span>
                        <Download className="w-3.5 h-3.5 text-amber-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {}}
                        className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-xl hover:text-amber-600 cursor-pointer"
                      >
                        <span>{t('vanguard_thermal_invoice_print_agent', 'Vanguard Thermal Invoice Print Agent')}</span>
                        <Download className="w-3.5 h-3.5 text-amber-600" />
                      </button>
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
                <span>{t('inbox', 'Inbox')}</span>
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
                  <span>{t('all', 'All')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => {}}
                  title={t('refresh_inbox', 'Refresh Inbox')}
                  className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-200 bg-white shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <span>{t('more', 'More')}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* CENTER TOOLBAR: SEARCH INPUT FIELD */}
              <div className="flex-1 max-w-sm relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('search_message', 'Search Message..')}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors font-medium shadow-2xs"
                />
              </div>

              {/* RIGHT TOOLBAR: PAGINATION ARROWS < > */}
              <div className="flex items-center gap-1">
                <button
                  disabled
                  title={t('previous_page', 'Previous Page')}
                  className="p-1.5 text-slate-300 bg-white border border-slate-200 rounded-lg cursor-not-allowed shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled
                  title={t('next_page', 'Next Page')}
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
                        <span>{t('title', 'Title')}</span>
                        <span className="text-slate-400 text-[10px]">▲▼</span>
                      </div>
                    </th>
                    <th className="py-3 px-6 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>{t('message', 'Message')}</span>
                        <span className="text-slate-400 text-[10px]">▲▼</span>
                      </div>
                    </th>
                    <th className="py-3 px-6 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>{t('status', 'Status')}</span>
                        <span className="text-slate-400 text-[10px]">▲▼</span>
                      </div>
                    </th>
                    <th className="py-3 px-6 cursor-pointer select-none">
                      <div className="flex items-center gap-1">
                        <span>{t('time', 'Time')}</span>
                        <span className="text-slate-400 text-[10px]">▲▼</span>
                      </div>
                    </th>
                    <th className="py-3 px-6 text-right select-none">
                      <span>{t('action', 'Action')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inboxMessages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-400 font-semibold text-sm">
                        <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        {t('no_messages_in_inbox', 'No Messages in Inbox')}
                      </td>
                    </tr>
                  ) : (
                    inboxMessages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3 px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${msg.isRead ? 'bg-slate-300' : 'bg-amber-500'}`} />
                            <span className="truncate max-w-xs">{msg.subject}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 ml-4">
                            {msg.sender} {msg.branch ? `• ${msg.branch}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-6 text-slate-600 max-w-sm truncate font-medium">
                          {msg.content}
                        </td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            msg.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : msg.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {msg.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {msg.time || msg.date}
                        </td>
                        <td className="py-3 px-6 text-right">
                          <a
                            href="/backoffice/inbox"
                            onClick={() => setIsInboxOpen(false)}
                            className="text-xs font-black text-amber-700 hover:text-amber-900 hover:underline inline-flex items-center gap-1"
                          >
                            <span>{t('review', 'Review')}</span> →
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* FOOTER BAR */}
              <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
                <a
                  href="/backoffice/inbox"
                  onClick={() => setIsInboxOpen(false)}
                  className="text-xs font-black text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('open_full_operations_approval_inbox', 'Open Full Operations & Approval Inbox Console →')}</span>
                </a>
                <button
                  onClick={() => setIsInboxOpen(false)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
                >
                  {t('close', 'Close')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CHECKLIST UI */}
      {isChecklistOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl font-sans dir-ltr">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" /> {t('shift_tasks_checklist', 'Shift Tasks Checklist')}
              </h3>
              <button onClick={() => setIsChecklistOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs font-bold text-gray-700">
              <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <input type="checkbox" defaultChecked className="rounded text-amber-600" />
                <span>{t('reconcile_cash_drawer_balance_with', 'Reconcile cash drawer balance with daily Z-Report')}</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <input type="checkbox" defaultChecked className="rounded text-amber-600" />
                <span>{t('test_acidity_ratio_for_olive_oil', 'Test acidity ratio for olive oil holding tanks')}</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <input type="checkbox" className="rounded text-amber-600" />
                <span>{t('send_dispatch_notifications_to', 'Send dispatch notifications to SuperSonic drivers')}</span>
              </label>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsChecklistOpen(false)} className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs">{t('save_close', 'Save & Close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: WATCH TUTORIALS POPUP */}
      {isTutorialsOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl font-sans dir-ltr">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-600" /> {t('vanguard_erp_video_tutorials', 'Vanguard ERP Video Tutorials')}
              </h3>
              <button onClick={() => setIsTutorialsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center text-white relative">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
                title={t('vanguard_erp_tutorials', 'Vanguard ERP Tutorials')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="pt-2 flex justify-between items-center text-xs font-bold text-gray-500">
              <span>{t('watch_tutorials_for_olive_press_and', 'Watch tutorials for olive press and live POS cashier')}</span>
              <button onClick={() => setIsTutorialsOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-xl text-xs">{t('close_video', 'Close Video')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: WORLD LANGUAGE SWITCHER */}
      <LanguageSwitcherModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />

    </div>
  );
}
