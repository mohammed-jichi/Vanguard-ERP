'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { TenantProvider, useTenant } from '@/lib/TenantContext';
import { useTenantFacilities, TenantFacility } from '@/lib/tenantFacilities';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import { subscribeToAccountingSync } from '@/lib/accountingPersistenceService';
import { isModuleLicensed } from '@/lib/license';
import { clearAuthSession } from '@/lib/authSession';
import ModuleNotLicensedScreen, { ALL_CANONICAL_MODULES } from '@/components/ModuleNotLicensedScreen';
import SupportCenterModal from '@/components/SupportCenterModal';
import FeedbackModal from '@/components/FeedbackModal';
import LanguageSwitcherModal from '@/components/LanguageSwitcherModal';
import HeaderLanguageDropdown from '@/components/HeaderLanguageDropdown';
import { PINNED_LANGUAGES } from '@/lib/LanguageContext';
import { useActiveUser } from '@/lib/useActiveUser';

function MasterBackofficeLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentOpsSection = searchParams.get('section') || 'dashboard';
  const { currentTenant, switchTenant, registeredCompanies, isModuleEnabled } = useTenant();
  const activeUser = useActiveUser();

  // Sync tenant from URL searchParams if provided
  useEffect(() => {
    const tenantIdParam = searchParams.get('tenantId');
    if (tenantIdParam) {
      const isParamFor1300 = tenantIdParam === '1300' || tenantIdParam === 'southern-olive' || tenantIdParam === '00000000-0000-0000-0000-000000000001';
      const isCurrent1300 = currentTenant.id === '00000000-0000-0000-0000-000000000001' || String(currentTenant.companyId) === '1300';

      if (isParamFor1300 && isCurrent1300) {
        return;
      }

      if (currentTenant.id !== tenantIdParam && String(currentTenant.companyId) !== tenantIdParam) {
        const match = registeredCompanies.find(c => 
          c.id === tenantIdParam || 
          c.slug === tenantIdParam || 
          String(c.companyId) === tenantIdParam || 
          String(c.company_id) === tenantIdParam ||
          (tenantIdParam === '1300' && c.id === '00000000-0000-0000-0000-000000000001')
        );
        if (match) {
          switchTenant(match);
        } else if (typeof window !== 'undefined') {
          const savedRaw = localStorage.getItem('vanguard_active_tenant');
          if (savedRaw) {
            try {
              const saved = JSON.parse(savedRaw);
              if (
                saved.id === tenantIdParam || 
                saved.slug === tenantIdParam || 
                String(saved.companyId) === tenantIdParam ||
                (tenantIdParam === '1300' && saved.id === '00000000-0000-0000-0000-000000000001')
              ) {
                switchTenant(saved);
              }
            } catch (e) {}
          }
        }
      }
    }
  }, [searchParams, currentTenant, registeredCompanies, switchTenant]);

  // Mandatory Login Entry Gate: Strictly redirect unauthenticated users to /login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasAuthToken = document.cookie.split(';').some((c) => {
        const [n, v] = c.trim().split('=');
        if (!v) return false;
        return (
          (n.startsWith('sb-') && (n.endsWith('-auth-token') || n.includes('token') || n.includes('auth'))) ||
          n === 'sb-access-token' ||
          n === 'sb-refresh-token' ||
          n === 'supabase-auth-token'
        );
      });
      if (!hasAuthToken) {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }, []);

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickDrawerOpen, setQuickDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'UPDATES' | 'ALERTS' | 'ACTIVITIES' | 'HELP' | 'DARK'>('UPDATES');
  const [isSuperAdminImpersonating, setIsSuperAdminImpersonating] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const { facilities, activeFacility } = useTenantFacilities();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState<string>(activeFacility.branchName);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if (activeFacility?.branchName) {
      setActiveBranch(activeFacility.branchName);
    }
  }, [activeFacility?.branchName]);

  const { language, dir, setLanguage, t } = useLanguage();
  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);

  // Dynamic system notifications & operations feed state
  const [notificationsData, setNotificationsData] = useState<{
    pendingApprovalsCount: number;
    unreadInboxCount: number;
    alerts: Array<{
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
    }>;
    activities: Array<{
      id: string;
      action_type: string;
      description: string;
      performed_by: string;
      created_at: string;
    }>;
  }>({
    pendingApprovalsCount: 0,
    unreadInboxCount: 0,
    alerts: [],
    activities: []
  });

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

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotificationsData({
          pendingApprovalsCount: data.pendingApprovalsCount || 0,
          unreadInboxCount: data.unreadInboxCount || 0,
          alerts: data.alerts || [],
          activities: data.activities || []
        });
      }
    } catch (e) {
      console.warn('Notice: Failed to fetch live notifications:', e);
    }
  }, []);

  const handleDismissAlert = async (alertId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DISMISS_ALERT', alertId })
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_ALL_READ' })
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const fetchUpdates = useCallback(async () => {
    try {
      setLoadingUpdates(true);
      const res = await fetch('/api/updates?limit=25');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLatestUpdates(data.data);
      }
    } catch (e) {
      console.warn('Notice: Failed to fetch updates:', e);
    } finally {
      setLoadingUpdates(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUpdates();

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('openUpdates') === 'true') {
        setActiveDrawerTab('UPDATES');
        setQuickDrawerOpen(true);
      }
    }

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUpdates();
    }, 15000);
    const unsubscribe = subscribeToAccountingSync(() => {
      fetchNotifications();
      fetchUpdates();
    });
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchNotifications, fetchUpdates]);

  // Keep-alive heartbeat: ping database every 10 minutes to prevent Supabase inactivity pause
  useEffect(() => {
    const pingKeepAlive = async () => {
      try {
        await fetch('/api/cron/keep-alive');
      } catch (e) {
        // silent fail on keep-alive
      }
    };
    pingKeepAlive();
    const keepAliveTimer = setInterval(pingKeepAlive, 10 * 60 * 1000);
    return () => clearInterval(keepAliveTimer);
  }, []);

  const { isSuperAdmin, currentUser } = useTenant();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isImp = localStorage.getItem('vanguard_is_impersonating') === 'true';
      if ((isImp || isSuperAdmin) && currentUser?.role === 'SUPER_ADMIN') {
        setIsSuperAdminImpersonating(true);
      } else {
        setIsSuperAdminImpersonating(false);
      }
    }
  }, [isSuperAdmin, currentUser]);

  // Determine if the current route belongs to a specific module (out of 12 canonical modules)
  const getRouteModuleKey = (path: string, section?: string | null): string | null => {
    if (!path) return null;

    // 3. Purchasing & Procurement
    if (
      path.startsWith('/purchases') ||
      path.startsWith('/purchase-orders') ||
      path.startsWith('/purchase-order') ||
      path.startsWith('/receiving-of-goods') ||
      path.startsWith('/PurchaseOrder') ||
      (path.startsWith('/backoffice/operations') && (section === 'reorder_guide' || section === 'suppliers'))
    ) {
      return 'purchasing';
    }

    // 12. V-Store (Online Storefront & Orders)
    if (path.startsWith('/backoffice/online-orders') || path.startsWith('/v-store')) {
      return 'v-store';
    }

    // 11. Pressing Mill Engine
    if (path.startsWith('/pressing-mill')) {
      return 'pressing-mill';
    }

    // 10. V-Connect (Social CRM & Lead Pipeline)
    if (path.startsWith('/backoffice/social-crm') || path.startsWith('/connect')) {
      return 'social';
    }

    // 9. Supersonic Fleet / V-Driver
    if (path.startsWith('/backoffice/fleet') || path.startsWith('/vtrack')) {
      return 'fleet';
    }

    // 8. Human Resources & Payroll
    if (path.startsWith('/backoffice/hr')) {
      return 'hr';
    }

    // 7. Accounting & Financials
    if (path.startsWith('/backoffice/accounting') || path.startsWith('/accounting')) {
      return 'accounting';
    }

    // 6. Loyalty Management
    if (path.startsWith('/backoffice/loyalty')) {
      return 'loyalty';
    }

    // 5. Feedback & Surveys
    if (path.startsWith('/backoffice/feedback')) {
      return 'feedback';
    }

    // 4. Customer Management (CRM)
    if (path.startsWith('/backoffice/customers') || path.startsWith('/customer-insights')) {
      return 'customers';
    }

    // 2. Operations Center (Inventory & Warehouse)
    if (path.startsWith('/backoffice/operations')) {
      return 'operations';
    }

    // 1. Sales Control & POS
    if (
      path.startsWith('/backoffice/end-of-day') ||
      path.startsWith('/backoffice/screens') ||
      path.startsWith('/backoffice/payment-types') ||
      path.startsWith('/backoffice/coupons') ||
      path.startsWith('/backoffice/discounts') ||
      path.startsWith('/backoffice/price-modes') ||
      path.startsWith('/backoffice/workstations-printers') ||
      path.startsWith('/backoffice/void-reasons') ||
      path.startsWith('/backoffice/vat-exemptions') ||
      path.startsWith('/backoffice/invoice-messages') ||
      path.startsWith('/backoffice/zone-setup') ||
      path.startsWith('/backoffice/currency-setup') ||
      path.startsWith('/backoffice/dashboard/sales') ||
      path.startsWith('/backoffice/sales') ||
      path.startsWith('/dashboard/sales')
    ) {
      return 'sales';
    }

    return null; // Core pages like /backoffice, /backoffice/dashboard, /backoffice/license, /backoffice/inbox are unrestricted
  };

  const currentModuleKey = getRouteModuleKey(pathname, currentOpsSection);

  // Check if current module is enabled for currentTenant
  const isCurrentModuleEnabled = (): boolean => {
    if (!currentModuleKey) return true;
    return isModuleEnabled(currentModuleKey);
  };

  const moduleNamesMap: Record<string, { ar: string; en: string; num: number }> = {
    sales: { ar: 'التحكم بالمبيعات ونقاط البيع', en: 'Sales Control & POS', num: 1 },
    operations: { ar: 'مركز العمليات والمخزون', en: 'Operations Center & Inventory', num: 2 },
    purchasing: { ar: 'المشتريات والتوريد', en: 'Purchasing & Procurement', num: 3 },
    customers: { ar: 'إدارة العملاء والعلاقات (CRM)', en: 'Customer Management (CRM)', num: 4 },
    feedback: { ar: 'الملاحظات واستطلاعات الرأي', en: 'Feedback & Customer Surveys', num: 5 },
    loyalty: { ar: 'برنامج الولاء والمكافآت', en: 'Loyalty & Rewards Program', num: 6 },
    accounting: { ar: 'المحاسبة والمالية المتكاملة', en: 'Accounting & Financials', num: 7 },
    hr: { ar: 'الموارد البشرية وكشوف الرواتب', en: 'Human Resources & Payroll', num: 8 },
    fleet: { ar: 'إدارة أسطول النقل السوبرسونيك', en: 'Supersonic Fleet Logistics', num: 9 },
    social: { ar: 'إدارة التواصل ومسار العملاء المحتملين', en: 'V-Connect (Social CRM & Lead Pipeline)', num: 10 },
    'pressing-mill': { ar: 'محرك معاصر الزيتون والتصنيع', en: 'Pressing Mill Engine', num: 11 },
    pressing: { ar: 'محرك معاصر الزيتون والتصنيع', en: 'Pressing Mill Engine', num: 11 },
    'v-store': { ar: 'المتجر الإلكتروني والطلبات أونلاين', en: 'V-Store & Online Storefront', num: 12 }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background font-sans text-slate-800 text-left select-none relative print:bg-white print:m-0 print:p-0">

      {/* 0. SUPER ADMIN TENANT PREVIEW & IMPERSONATION BANNER */}
      {isSuperAdminImpersonating && (
        <div dir="rtl" className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b-2 border-amber-500 gap-2 shrink-0 z-50 shadow-md">
          <div className="flex items-center gap-2 font-bold flex-wrap">
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
              👑 Workspace Preview (Owner Mode)
            </span>
            <span className="text-amber-300 font-extrabold">
              Active Workspace: {currentTenant?.name}
            </span>
            <span className="text-slate-400 font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded">
              Company ID: #{currentTenant?.companyId || '1300'}
            </span>
            <span className="text-amber-400 font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded">
              Plan: {currentTenant?.subscriptionTier || 'PRO'}
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full text-[10px] font-mono">
              {ALL_CANONICAL_MODULES.filter(m => isModuleEnabled(m.key)).length} / 12 Modules Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-lg text-xs font-black shadow transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Return to Admin Console (/admin) ↩</span>
            </Link>
          </div>
        </div>
      )}

      {/* 1. MASTER TOP GLOBAL HEADER */}
      <header className="h-[68px] bg-white border-b-2 border-border px-5 flex items-center justify-between print:hidden shrink-0 text-slate-800 z-40 relative shadow-xs">

        {/* Left Side: Toggle + Vanguard Logo & Title */}
        <div className="flex items-center gap-3.5 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-300 shadow-2xs"
            title={t('toggle_sidebar', 'Toggle Sidebar')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/backoffice" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-primary shadow-md bg-black shrink-0 group-hover:scale-105 transition-all duration-300">
              <img
                src="/vanguard-logo.jpg"
                alt="Vanguard ERP Circular Emblem"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('Vanguard (Login Page and Header).jpg')) {
                    target.src = '/Vanguard (Login Page and Header).jpg';
                  } else if (!target.src.includes('vanguard-emblem.jpg')) {
                    target.src = '/vanguard-emblem.jpg';
                  }
                }}
                className="w-full h-full object-cover scale-105"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-[18px] tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                Vanguard ERP
              </span>
              <span className="text-[10px] font-mono text-muted-foreground -mt-0.5 tracking-wider uppercase font-semibold">
                {t('enterprise_operations_system', 'Enterprise Operations System')}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Designated Slots for Enterprise Brand Context & Active Facility Switcher */}
        <div className="flex-1 flex flex-wrap justify-center items-center gap-2.5 px-3">
          {/* Slot 1: Enterprise Brand Context */}
          <Link
            href="/admin"
            title={t('switch_workspace_admin', 'Switch Workspace / Admin Hub')}
            className="flex items-center px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-2xs hover:border-primary transition-all group shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-xs animate-pulse"></span>
            <span className="text-xs font-black tracking-wide text-slate-900">
              {currentTenant ? `${currentTenant.brandNameAr || currentTenant.name}` : 'Southern Olive and Oil Products S.A.R.L.'}
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full mx-1.5">
              #{currentTenant?.companyId || '1300'}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 group-hover:text-emerald-800 transition-colors">
              {t('switch', '(Switch)')}
            </span>
          </Link>

          {/* Slot 2: Facility / Branch Switcher */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100/80 border border-amber-300/80 text-amber-950 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              title="Active Facility & Branch Switcher"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
              <span className="truncate max-w-[220px] font-bold">{activeBranch}</span>
              <span className="text-[10px] text-amber-700 ml-0.5">▾</span>
            </button>

            {branchDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setBranchDropdownOpen(false)}
                />
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-72 bg-white border border-slate-300 rounded-2xl shadow-2xl py-1.5 text-xs text-slate-800 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Active Facility
                  </div>
                  {facilities.map((br: TenantFacility) => (
                    <button
                      key={br.id}
                      type="button"
                      onClick={() => {
                        setActiveBranch(br.branchName);
                        setBranchDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                        activeBranch === br.branchName ? 'bg-amber-50/70 font-bold text-amber-950' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="font-bold text-slate-900 truncate">{br.branchName}</span>
                        <span className="text-[10px] text-slate-500 font-mono truncate">{br.facilityCode} &bull; {br.address}</span>
                      </div>
                      {activeBranch === br.branchName && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded shrink-0">
                          ACTIVE
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Action Icons -> QUICK MENU FIRST -> USER PROFILE */}
        <div className="flex items-center gap-3 shrink-0">

          <div className="flex items-center gap-1.5 text-slate-600">
            {/* 1. Home */}
            <Link
              href="/backoffice"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200"
              title={t('enterprise_main_hub', 'Enterprise Main Hub')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </Link>

            {/* 2. OPERATIONAL INBOX */}
            <Link
              href="/backoffice/inbox"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 relative"
              title={t('operations_inbox', 'Operations & Approvals Inbox')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {notificationsData.pendingApprovalsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                  {notificationsData.pendingApprovalsCount}
                </span>
              )}
            </Link>

            {/* 3. Alerts */}
            <button
              type="button"
              onClick={() => { setActiveDrawerTab('ALERTS'); setQuickDrawerOpen(true); }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 relative"
              title={t('alerts_notifications', 'Alerts & Notifications')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              {notificationsData.alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* 4. Help */}
            <button
              type="button"
              onClick={() => { setActiveDrawerTab('HELP'); setQuickDrawerOpen(true); }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200"
              title={t('help_support', 'Help & Support')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>

            {/* 5. Header Language Selector Dropdown (Hybrid: Native 5 Languages + Google Translate) */}
            <HeaderLanguageDropdown />

            {/* 6. QUICK MENU GRID BUTTON */}
            <button
              type="button"
              onClick={() => setQuickDrawerOpen(!quickDrawerOpen)}
              className="p-2 rounded-xl bg-primary hover:bg-primary/90 text-white transition-colors shadow-2xs cursor-pointer"
              title={t('open_quick_drawer', 'Open Quick Menu Drawer')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* 7. USER PROFILE DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-primary text-white font-bold flex items-center justify-center text-[11px] shadow-xs">
                {activeUser.avatarLetter || 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-900">{activeUser.name || 'Authorized User'}</span>
              <span className="text-[11px] text-primary">▾</span>
            </button>

            {/* 10-Item Authentic Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute end-0 mt-2 w-64 bg-white border border-slate-300 rounded-2xl shadow-2xl py-2 text-xs text-slate-800 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-card">
                    <div className="font-bold text-slate-900 text-sm">{activeUser.name || 'Authorized User'}</div>
                    <div className="text-[10.5px] text-primary font-mono font-semibold">{activeUser.role || t('general_operations_manager', 'General Operations Manager')}</div>
                    <div className="text-[9.5px] text-slate-400 font-mono truncate mt-0.5">
                      {currentTenant?.name || 'Southern Olive Oil Products S.A.R.L'}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href={`/${orgId}/settings/organization`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-start px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                    >
                      <span className="text-sm">🏢</span> <span>{t('organization', 'Organization')}</span>
                    </Link>

                    <Link
                      href={`/${orgId}/settings/notifications`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-start px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                    >
                      <span className="text-sm">🔔</span> <span>{t('alerts_notifications_title', 'Alerts & Notifications')}</span>
                    </Link>

                    <Link
                      href="/backoffice/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-start px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                    >
                      <span className="text-sm">👤</span> <span>{t('my_account', 'My Account')}</span>
                    </Link>

                    <Link
                      href={`/${orgId}/settings/roles`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-start px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                    >
                      <span className="text-sm">🔑</span> <span>{t('roles', 'Roles & Permissions')}</span>
                    </Link>

                    <Link
                      href={`/${orgId}/settings/users`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-start px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                    >
                      <span className="text-sm">👥</span> <span>{t('users', 'Users')}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => { setActiveDrawerTab('UPDATES'); setQuickDrawerOpen(true); setUserDropdownOpen(false); }}
                      className="w-full text-start px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                    >
                      <span className="text-sm">📰</span> <span>{t('latest_updates', 'Latest Updates')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setIsSupportModalOpen(true); setUserDropdownOpen(false); }}
                      className="w-full text-start px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                    >
                      <span className="text-sm">❓</span> <span>{t('support_center', 'Support Center')}</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => clearAuthSession()}
                      className="w-full text-start px-4 py-2 text-red-600 hover:bg-red-50 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="text-sm">🚪</span> <span>{t('logout', 'Logout')}</span>
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>

        </div>

        <div
          style={{
            background: 'linear-gradient(90deg, #c5a059 0%, #1e3a2b 50%, #c5a059 100%)',
          }}
          className="absolute bottom-0 left-0 right-0 h-[2.5px] print:hidden"
        />
      </header>

      {/* 2. BODY WORKSPACE */}
      <div className="flex-1 flex overflow-hidden print:overflow-visible print:m-0 print:p-0">

        {/* Master Left Sidebar (Unified with Product Insights & Customer Insights) */}
        {!(activeUser?.role === 'OIL_OPERATOR' || activeUser?.role === 'r_oil_op') && (
          <Sidebar
            activeScreen={pathname}
            isOpen={sidebarVisible}
            onToggleOpen={(open) => setSidebarVisible(open)}
            className="h-[calc(100vh-68px)]"
          />
        )}

        {/* Main Canvas Viewport */}
        <main className={`flex-1 min-w-0 overflow-y-auto h-[calc(100vh-68px)] bg-background ${
          (pathname === '/backoffice/operations' && (currentOpsSection === 'dashboard' || currentOpsSection === 'reports')) ||
          pathname === '/backoffice/operations/dashboard' ||
          pathname.startsWith('/backoffice/oil-production')
            ? 'p-0'
            : 'p-4 md:p-6'
        } custom-scrollbar print:overflow-visible print:m-0 print:p-0 print:bg-white`}>
          {isCurrentModuleEnabled() ? (
            children
          ) : (
            <ModuleNotLicensedScreen moduleKey={currentModuleKey} />
          )}
        </main>

        {/* 3. SLIDING QUICK MENU DRAWER */}
        {quickDrawerOpen && (
          <aside className="w-[360px] bg-white border-l border-slate-300 shadow-2xl flex flex-col h-[calc(100vh-68px)] z-50 shrink-0 print:hidden animate-slideLeft">

            <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50 text-center text-xs">
              <button
                type="button"
                onClick={() => setActiveDrawerTab('UPDATES')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'UPDATES' ? 'bg-white text-primary font-bold border-b-2 border-b-primary' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">📰</span>
                <span className="text-[10px] leading-tight">{t('latest_updates', 'Latest Updates')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('ALERTS')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'ALERTS' ? 'bg-white text-primary font-bold border-b-2 border-b-primary' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">🔔</span>
                <span className="text-[10px] leading-tight">{t('alerts', 'Alerts')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('ACTIVITIES')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'ACTIVITIES' ? 'bg-white text-primary font-bold border-b-2 border-b-primary' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">🕒</span>
                <span className="text-[10px] leading-tight">{t('last_activities', 'Last Activities')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('HELP')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'HELP' ? 'bg-white text-primary font-bold border-b-2 border-b-primary' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">❓</span>
                <span className="text-[10px] leading-tight">{t('help', 'Help')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('DARK')}
                className={`py-3 px-1 flex flex-col items-center gap-1 transition-colors ${activeDrawerTab === 'DARK' ? 'bg-white text-primary font-bold border-b-2 border-b-primary' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">🌙</span>
                <span className="text-[10px] leading-tight">{t('theme', 'Theme')}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 text-xs">
              {activeDrawerTab === 'UPDATES' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🚀</span>
                      <h3 className="font-black text-slate-900 text-sm">{t('latest_updates', 'Latest Updates')}</h3>
                      {latestUpdates[0]?.version && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 font-mono shadow-2xs">
                          {latestUpdates[0].version}
                        </span>
                      )}
                    </div>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300/70 rounded-2xl shadow-2xs">
                    <span className="text-[10px] text-amber-900 font-black uppercase tracking-wider block">
                      {t('published_platform_release_notes', 'Verified Platform Deployments')}
                    </span>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-relaxed">
                      {t('official_platformwide_version_releases', 'Production releases, bug fixes, and feature changelogs.')}
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

                  {/* Filter & Search Controls */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={updatesSearchQuery}
                      onChange={(e) => setUpdatesSearchQuery(e.target.value)}
                      placeholder={t('search_updates', 'Search release notes or modules...')}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />

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

                  {/* Releases list */}
                  {loadingUpdates ? (
                    <div className="p-6 text-center text-slate-400 space-y-1">
                      <span className="text-xl animate-spin block">⏳</span>
                      <p className="text-xs">{t('loading_updates', 'Loading deployment records...')}</p>
                    </div>
                  ) : latestUpdates.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                      <span className="text-2xl block">📰</span>
                      <p className="font-bold text-slate-600 text-xs">{t('no_updates_found', 'No updates recorded yet.')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
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
                          const catStyles: Record<string, string> = {
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
                              className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-amber-300 space-y-1.5 transition-all shadow-2xs group"
                            >
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider border ${catStyles[update.category] || catStyles.feature}`}>
                                    {update.category}
                                  </span>
                                  <span className="text-[9.5px] font-black font-mono bg-slate-200/80 text-slate-800 px-1.5 py-0.2 rounded">
                                    {update.version}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">
                                    #{update.short_hash}
                                  </span>
                                </div>
                                <span className="text-[9.5px] text-slate-400 font-mono shrink-0">
                                  {new Date(update.deployed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>

                              <h4 className="font-bold text-slate-900 text-xs leading-snug group-hover:text-amber-700 transition-colors">
                                {update.title}
                              </h4>

                              {update.description && update.description !== update.title && (
                                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                  {update.description}
                                </p>
                              )}

                              {update.bullet_points && update.bullet_points.length > 0 && (
                                <ul className="space-y-1 pt-1 border-t border-slate-200/60 text-[10.5px] text-slate-600">
                                  {update.bullet_points.slice(0, 3).map((bp, bidx) => (
                                    <li key={bidx} className="flex items-start gap-1.5">
                                      <span className="text-amber-500 shrink-0">•</span>
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
                    onClick={fetchUpdates}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors text-center border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🔄 {t('refresh_updates', 'Refresh Releases')}</span>
                  </button>
                </div>
              )}

              {activeDrawerTab === 'ALERTS' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{t('system_alerts', 'System Alerts')}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-600">
                        {notificationsData.alerts.length} {t('active', 'Active')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {notificationsData.alerts.length > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
                        >
                          {t('mark_all_read', 'Mark all read')}
                        </button>
                      )}
                      <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                    </div>
                  </div>

                  {notificationsData.alerts.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-medium space-y-2">
                      <span className="text-2xl block">🔔</span>
                      <span>{t('no_active_alerts', 'No active alerts right now. System nominal.')}</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {notificationsData.alerts.map((alt) => (
                        <div
                          key={alt.id}
                          className={`p-3 rounded-xl border space-y-1.5 transition-all shadow-2xs ${
                            alt.severity === 'CRITICAL'
                              ? 'bg-red-50/80 border-red-200 text-red-950'
                              : alt.severity === 'WARNING'
                              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                              : 'bg-blue-50/80 border-blue-200 text-blue-950'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${
                              alt.severity === 'CRITICAL'
                                ? 'bg-red-600 text-white'
                                : alt.severity === 'WARNING'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-blue-600 text-white'
                            }`}>
                              {alt.severity}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono opacity-70">{alt.timestamp}</span>
                              <button
                                type="button"
                                onClick={() => handleDismissAlert(alt.id)}
                                title={t('dismiss_alert', 'Dismiss alert')}
                                className="text-slate-400 hover:text-slate-700 text-xs px-1 rounded hover:bg-black/5 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <h4 className="font-bold text-xs leading-snug">{t(alt.title, alt.title)}</h4>
                          <p className="text-[11px] leading-relaxed opacity-85">{t(alt.message, alt.message)}</p>

                          <div className="pt-1 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleDismissAlert(alt.id)}
                              className="text-[10px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                            >
                              {t('dismiss', 'Dismiss')}
                            </button>
                            {alt.actionLink && (
                              alt.source_type === 'RELEASE' || alt.type === 'SYSTEM_RELEASE' ? (
                                <button
                                  type="button"
                                  onClick={() => setActiveDrawerTab('UPDATES')}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10.5px] font-black rounded-lg border border-amber-400 shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <span>{alt.actionLabel ? t(alt.actionLabel, alt.actionLabel) : t('view_release_notes', 'View Release Notes')}</span>
                                  <span>🚀</span>
                                </button>
                              ) : (
                                <Link
                                  href={alt.actionLink}
                                  onClick={() => setQuickDrawerOpen(false)}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 text-[10.5px] font-bold rounded-lg border border-slate-300 shadow-2xs flex items-center gap-1 transition-colors"
                                >
                                  <span>{alt.actionLabel ? t(alt.actionLabel, alt.actionLabel) : t('action', 'Action')}</span>
                                  <span>↗</span>
                                </Link>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeDrawerTab === 'ACTIVITIES' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{t('operations_feed', 'Operations Feed')}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] font-mono font-bold text-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                        {t('live', 'LIVE')}
                      </span>
                    </div>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  {notificationsData.activities.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-medium space-y-2">
                      <span className="text-2xl block">🕒</span>
                      <span>{t('no_activities_recorded', 'No activities recorded yet.')}</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {notificationsData.activities.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 hover:bg-slate-100/70 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[9.5px] font-mono font-bold border border-slate-300">
                              {t(act.action_type, act.action_type)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-[11.5px] text-slate-800 font-medium leading-snug">
                            {t(act.description, act.description)}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono">
                            <span>{t('by', 'By')}: <strong className="text-slate-700">{act.performed_by}</strong></span>
                            <span>{new Date(act.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeDrawerTab === 'HELP' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{t('help_support', 'Help & Support')}</h3>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">?</span>
                      <div>
                        <h4 className="font-bold text-slate-900">{t('support_center', 'Support Center')}</h4>
                        <p className="text-[10.5px] text-slate-500">{t('support_center_desc', 'Open the main support page for guides and videos.')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSupportModalOpen(true)}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold text-xs text-slate-800 transition-colors cursor-pointer"
                    >
                      {t('open_support', 'Open Support')}
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">💬</span>
                      <div>
                        <h4 className="font-bold text-slate-900">{t('feedback', 'Feedback')}</h4>
                        <p className="text-[10.5px] text-slate-500">{t('feedback_desc', 'Open the feedback form and send your direct comments.')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFeedbackModalOpen(true)}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold text-xs text-slate-800 transition-colors cursor-pointer"
                    >
                      {t('open_feedback', 'Open Feedback')}
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">ℹ️ {t('quick_tips', 'Quick Tips')}</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="p-2 bg-white rounded border border-slate-200 flex gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[9px] shrink-0">1</span>
                        <span>{t('tip_1', 'Use the left catalog to swap between all 93 reports.')}</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 flex gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[9px] shrink-0">2</span>
                        <span>{t('tip_2', 'Use the ribbon toolbar to filter by live rolling EOD dates.')}</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 flex gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[9px] shrink-0">3</span>
                        <span>{t('tip_3', 'Export directly to PDF, Excel, and CSV with Arabic UTF-8.')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'DARK' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{t('theme_settings', 'Theme Settings')}</h3>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                    <span className="text-2xl block">☀️</span>
                    <span className="font-bold text-slate-800 block">{t('active_mode_light', 'Active Mode: Warm Light Mode')}</span>
                    <p className="text-[11px] text-slate-500">{t('active_mode_desc', 'High-Contrast Light Theme is active and locked for optimal eye comfort.')}</p>
                  </div>
                </div>
              )}

            </div>
          </aside>
        )}

        {/* Support Center, Feedback, and Language Switcher Modals */}
        <SupportCenterModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
        />
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
        <LanguageSwitcherModal
          isOpen={isLangModalOpen}
          onClose={() => setIsLangModalOpen(false)}
        />

      </div>

    </div>
  );
}

import SupabaseKeepAliveProvider from '@/components/SupabaseKeepAliveProvider';
import { DeepLinkFallbackProvider } from '@/components/DeepLinkFallbackProvider';

export default function MasterBackofficeLayout({ children }: { children: React.ReactNode }) {
  const [forceLoaded, setForceLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      console.warn('[Vanguard Loader] Forced UI unlock after timeout');
      setForceLoaded(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TenantProvider>
      <SupabaseKeepAliveProvider>
        <DeepLinkFallbackProvider>
          {forceLoaded ? (
            <MasterBackofficeLayoutContent>{children}</MasterBackofficeLayoutContent>
          ) : (
            <Suspense fallback={<div className="flex flex-col w-full min-h-screen bg-background p-4 text-xs text-slate-500">Loading Vanguard Backoffice...</div>}>
              <MasterBackofficeLayoutContent>{children}</MasterBackofficeLayoutContent>
            </Suspense>
          )}
        </DeepLinkFallbackProvider>
      </SupabaseKeepAliveProvider>
    </TenantProvider>
  );
}
