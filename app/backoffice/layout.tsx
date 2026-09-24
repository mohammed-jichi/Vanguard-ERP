'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { TenantProvider, useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import { subscribeToAccountingSync } from '@/lib/accountingPersistenceService';
import { isModuleLicensed } from '@/lib/license';
import { clearAuthSession } from '@/lib/authSession';
import ModuleNotLicensedScreen, { ALL_CANONICAL_MODULES } from '@/components/ModuleNotLicensedScreen';
import SupportCenterModal from '@/components/SupportCenterModal';
import FeedbackModal from '@/components/FeedbackModal';
import LanguageSwitcherModal from '@/components/LanguageSwitcherModal';
import { PINNED_LANGUAGES } from '@/lib/LanguageContext';

function MasterBackofficeLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentOpsSection = searchParams.get('section') || 'dashboard';
  const { currentTenant, switchTenant, registeredCompanies, isModuleEnabled } = useTenant();

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

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickDrawerOpen, setQuickDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'UPDATES' | 'ALERTS' | 'ACTIVITIES' | 'HELP' | 'DARK'>('UPDATES');
  const [isSuperAdminImpersonating, setIsSuperAdminImpersonating] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

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

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    const unsubscribe = subscribeToAccountingSync(() => {
      fetchNotifications();
    });
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchNotifications]);

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

  const { isSuperAdmin } = useTenant();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('vanguard_user_role');
      const isImp = localStorage.getItem('vanguard_is_impersonating') === 'true';
      if (role === 'SUPER_ADMIN' || isImp || isSuperAdmin) {
        setIsSuperAdminImpersonating(true);
      }
    }
  }, [isSuperAdmin]);

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
    if (path.startsWith('/pressing-mill') || path.startsWith('/pressing')) {
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
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('vanguard_user_role', 'SUPER_ADMIN');
                  localStorage.setItem('vanguard_is_super_admin', 'true');
                  document.cookie = 'vanguard_user_role=SUPER_ADMIN; path=/; SameSite=Lax';
                  document.cookie = 'vanguard_is_super_admin=true; path=/; SameSite=Lax';
                  document.cookie = 'so_authenticated=true; path=/; SameSite=Lax';
                }
              }}
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
            title="Toggle Sidebar"
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
                Enterprise Operations System
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Tenant Badge with Dynamic Company ID */}
        <div className="flex-1 flex justify-center items-center px-4">
          <Link
            href="/admin"
            title="Switch Workspace / Admin Hub"
            className="flex items-center px-5 py-2 rounded-full bg-muted hover:bg-muted/80 border border-border shadow-xs hover:border-primary transition-all group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary mr-3 shadow-xs animate-pulse"></span>
            <span className="text-[13px] font-bold tracking-wide text-foreground">
              {currentTenant ? `${currentTenant.brandNameAr || currentTenant.name}` : 'Southern Olive Oil Products S.A.R.L'}
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mr-2">
              #{currentTenant?.companyId || '1300'}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mr-1 group-hover:text-emerald-800 transition-colors">
              (Switch)
            </span>
          </Link>
        </div>

        {/* Right Side: Action Icons -> QUICK MENU FIRST -> JICHI MOHAMMED */}
        <div className="flex items-center gap-3 shrink-0">

          <div className="flex items-center gap-1.5 text-slate-600">
            {/* 1. Home */}
            <Link
              href="/backoffice"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200"
              title="Enterprise Main Hub"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </Link>

            {/* 2. OPERATIONAL INBOX */}
            <Link
              href="/backoffice/inbox"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 relative"
              title="Operations & Approvals Inbox"
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
              title="Alerts & Notifications"
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
              title="Help & Support"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>

            {/* 5. Language Switcher (Primary 5 + Extended "More" Selector) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
                title={t('language', 'Language')}
              >
                <span className="text-xs">
                  {PINNED_LANGUAGES.find(l => l.code === language)?.flag || '🌐'}
                </span>
                <span className="font-mono text-[11px] uppercase font-bold">
                  {language}
                </span>
                <span className="text-[10px] text-slate-400">▾</span>
              </button>

              {isLangDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLangDropdownOpen(false)}
                  />
                  <div className="absolute end-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 text-xs text-slate-800 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>{t('language', 'Language')}</span>
                      <span className="font-mono text-[9px] text-primary">{dir.toUpperCase()}</span>
                    </div>

                    <div className="py-1 space-y-0.5 px-1.5">
                      {PINNED_LANGUAGES.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setLanguage(item.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                            language === item.code
                              ? 'bg-primary text-white shadow-2xs'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{item.flag}</span>
                            <span>{item.nativeName}</span>
                          </span>
                          <span className="text-[10px] font-mono opacity-80 uppercase">
                            {item.code}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-1 mt-1 border-t border-slate-100 px-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsLangDropdownOpen(false);
                          setIsLangModalOpen(true);
                        }}
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-900 text-slate-700 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>🌐</span>
                          <span>{language === 'ar' ? 'المزيد من اللغات...' : 'More Languages...'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">20+</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 6. QUICK MENU GRID BUTTON */}
            <button
              type="button"
              onClick={() => setQuickDrawerOpen(!quickDrawerOpen)}
              className="p-2 rounded-xl bg-primary hover:bg-primary/90 text-white transition-colors shadow-2xs cursor-pointer"
              title="Open Quick Menu Drawer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* 7. JICHI MOHAMMED PROFILE */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-primary text-white font-bold flex items-center justify-center text-[11px] shadow-xs">
                M
              </div>
              <span className="text-xs font-semibold text-slate-900">Jichi Mohammed</span>
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
                    <div className="font-bold text-slate-900 text-sm">Jichi Mohammed</div>
                    <div className="text-[10.5px] text-primary font-mono font-semibold">General Operations Manager</div>
                    <div className="text-[9.5px] text-slate-400 font-mono truncate mt-0.5">
                      Southern Olive Oil Products S.A.R.L
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

                    <button
                      type="button"
                      onClick={() => { setActiveDrawerTab('ALERTS'); setQuickDrawerOpen(true); setUserDropdownOpen(false); }}
                      className="w-full text-start px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                    >
                      <span className="text-sm">🔔</span> <span>{t('alerts', 'Alerts')}</span>
                    </button>

                    <Link
                      href="/backoffice/inbox"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-start px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                    >
                      <span className="text-sm">💬</span> <span>{t('notifications_inbox', 'Notifications & Inbox')}</span>
                    </Link>

                    {/* Dynamic Multi-Language Switcher (Top 5 + More) */}
                    <div className="px-3 py-2 border-y border-slate-100 bg-slate-50/60 my-1 space-y-1.5">
                      <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <span>🌐</span> <span>{t('language', 'Language')}</span>
                        </span>
                        <span className="font-mono text-[10px] text-primary font-bold">
                          {dir.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {PINNED_LANGUAGES.map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => {
                              setLanguage(item.code);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              language === item.code
                                ? 'bg-primary text-white shadow-2xs font-extrabold'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{item.flag}</span>
                              <span>{item.nativeName}</span>
                            </span>
                            <span className="text-[10px] font-mono uppercase opacity-75">
                              {item.code}
                            </span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsLangModalOpen(true);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-900 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>🌍</span>
                          <span>{language === 'ar' ? 'المزيد من اللغات العالمية...' : 'More Languages...'}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">20+</span>
                      </button>
                    </div>

                    <Link
                      href={`/${orgId}/settings/account`}
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
        <Sidebar
          activeScreen={pathname}
          isOpen={sidebarVisible}
          onToggleOpen={(open) => setSidebarVisible(open)}
          className="h-[calc(100vh-68px)]"
        />

        {/* Main Canvas Viewport */}
        <main className={`flex-1 min-w-0 overflow-y-auto h-[calc(100vh-68px)] bg-background ${
          (pathname === '/backoffice/operations' && (currentOpsSection === 'dashboard' || currentOpsSection === 'reports')) || pathname === '/backoffice/operations/dashboard'
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
                <span className="text-[10px] leading-tight">Latest<br />Updates</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('ALERTS')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'ALERTS' ? 'bg-white text-primary font-bold border-b-2 border-b-primary' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">🔔</span>
                <span className="text-[10px] leading-tight">Alerts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('ACTIVITIES')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'ACTIVITIES' ? 'bg-white text-primary font-bold border-b-2 border-b-primary' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">🕒</span>
                <span className="text-[10px] leading-tight">Last<br />Activities</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('HELP')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'HELP' ? 'bg-white text-primary font-bold border-b-2 border-b-primary' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">❓</span>
                <span className="text-[10px] leading-tight">Help</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('DARK')}
                className={`py-3 px-1 flex flex-col items-center gap-1 transition-colors ${activeDrawerTab === 'DARK' ? 'bg-white text-primary font-bold border-b-2 border-b-primary' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">🌙</span>
                <span className="text-[10px] leading-tight">Theme</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 text-xs">
              {activeDrawerTab === 'UPDATES' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Latest Updates</h3>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Sales Control</span>
                      <span className="text-[10px] text-slate-400 font-mono">31 Aug 2026</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      High-contrast matrix reporting engine with multi-format exports (PDF, Excel, CSV) now live for Southern Olive Oil Products S.A.R.L.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Operations Center</span>
                      <span className="text-[10px] text-slate-400 font-mono">26 Aug 2026</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      A new role access has been configured under Operations Center: Purchase Order - Hide Cost option.
                    </p>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'ALERTS' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">System Alerts</h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-600">
                        {notificationsData.alerts.length} Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {notificationsData.alerts.length > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                    </div>
                  </div>

                  {notificationsData.alerts.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-medium space-y-2">
                      <span className="text-2xl block">🔔</span>
                      <span>No active alerts right now. System nominal.</span>
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
                                title="Dismiss alert"
                                className="text-slate-400 hover:text-slate-700 text-xs px-1 rounded hover:bg-black/5 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <h4 className="font-bold text-xs leading-snug">{alt.title}</h4>
                          <p className="text-[11px] leading-relaxed opacity-85">{alt.message}</p>

                          <div className="pt-1 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleDismissAlert(alt.id)}
                              className="text-[10px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                            >
                              Dismiss
                            </button>
                            {alt.actionLink && (
                              <Link
                                href={alt.actionLink}
                                onClick={() => setQuickDrawerOpen(false)}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 text-[10.5px] font-bold rounded-lg border border-slate-300 shadow-2xs flex items-center gap-1 transition-colors"
                              >
                                <span>{alt.actionLabel || 'Action'}</span>
                                <span>↗</span>
                              </Link>
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
                      <h3 className="font-bold text-slate-900 text-sm">Operations Feed</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] font-mono font-bold text-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                        LIVE
                      </span>
                    </div>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  {notificationsData.activities.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-medium space-y-2">
                      <span className="text-2xl block">🕒</span>
                      <span>No activities recorded yet.</span>
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
                              {act.action_type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-[11.5px] text-slate-800 font-medium leading-snug">
                            {act.description}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono">
                            <span>By: <strong className="text-slate-700">{act.performed_by}</strong></span>
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
                    <h3 className="font-bold text-slate-900 text-sm">Help & Support</h3>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">?</span>
                      <div>
                        <h4 className="font-bold text-slate-900">Support Center</h4>
                        <p className="text-[10.5px] text-slate-500">Open the main support page for guides and videos.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSupportModalOpen(true)}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold text-xs text-slate-800 transition-colors cursor-pointer"
                    >
                      Open Support
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">💬</span>
                      <div>
                        <h4 className="font-bold text-slate-900">Feedback</h4>
                        <p className="text-[10.5px] text-slate-500">Open the feedback form and send your direct comments.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFeedbackModalOpen(true)}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold text-xs text-slate-800 transition-colors cursor-pointer"
                    >
                      Open Feedback
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">ℹ️ Quick Tips</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="p-2 bg-white rounded border border-slate-200 flex gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[9px] shrink-0">1</span>
                        <span>Use the left catalog to swap between all 93 reports.</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 flex gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[9px] shrink-0">2</span>
                        <span>Use the ribbon toolbar to filter by live rolling EOD dates.</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 flex gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[9px] shrink-0">3</span>
                        <span>Export directly to PDF, Excel, and CSV with Arabic UTF-8.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'DARK' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Theme Settings</h3>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                    <span className="text-2xl block">☀️</span>
                    <span className="font-bold text-slate-800 block">Active Mode: Warm Light Mode</span>
                    <p className="text-[11px] text-slate-500">High-Contrast Light Theme is active and locked for optimal eye comfort.</p>
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
  return (
    <TenantProvider>
      <SupabaseKeepAliveProvider>
        <DeepLinkFallbackProvider>
          <Suspense fallback={<div className="flex flex-col w-full min-h-screen bg-background p-4 text-xs text-slate-500">Loading Vanguard Backoffice...</div>}>
            <MasterBackofficeLayoutContent>{children}</MasterBackofficeLayoutContent>
          </Suspense>
        </DeepLinkFallbackProvider>
      </SupabaseKeepAliveProvider>
    </TenantProvider>
  );
}
