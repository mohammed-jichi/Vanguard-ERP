'use client';

import React from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import {
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles
} from 'lucide-react';

export interface ModuleMeta {
  key: string;
  num: number;
  en: string;
  ar: string;
  icon: string;
  route: string;
  desc: string;
}

export const ALL_CANONICAL_MODULES: ModuleMeta[] = [
  {
    key: 'sales',
    num: 1,
    en: 'Sales Control & POS',
    ar: 'التحكم بالمبيعات ونقاط البيع',
    icon: '🛒',
    route: '/dashboard/sales',
    desc: 'Invoices, POS terminal, Quotes, Customer orders'
  },
  {
    key: 'operations',
    num: 2,
    en: 'Operations Center (Inventory & Warehouse)',
    ar: 'مركز العمليات والمخزون',
    icon: '📦',
    route: '/backoffice/operations',
    desc: 'Stock catalog, valuation, warehouses, price lists'
  },
  {
    key: 'purchasing',
    num: 3,
    en: 'Purchasing & Procurement',
    ar: 'المشتريات والتوريد',
    icon: '📋',
    route: '/purchases',
    desc: 'Purchase orders, bills, goods receiving (GRN)'
  },
  {
    key: 'customers',
    num: 4,
    en: 'Customer Management (CRM)',
    ar: 'إدارة العملاء والعلاقات',
    icon: '👥',
    route: '/backoffice/customers',
    desc: 'Customer directory, receivables, insights'
  },
  {
    key: 'feedback',
    num: 5,
    en: 'Feedback & Customer Surveys',
    ar: 'الملاحظات واستطلاعات الرأي',
    icon: '💬',
    route: '/backoffice/feedback',
    desc: 'Complaints tracking, NPS, CSAT surveys'
  },
  {
    key: 'loyalty',
    num: 6,
    en: 'Loyalty & Rewards Management',
    ar: 'برنامج الولاء والمكافآت',
    icon: '🎖️',
    route: '/backoffice/loyalty',
    desc: 'Points programs, member tiers, redeem rules'
  },
  {
    key: 'accounting',
    num: 7,
    en: 'Accounting & Financials',
    ar: 'المحاسبة والمالية المتكاملة',
    icon: '📊',
    route: '/backoffice/accounting',
    desc: 'General ledger, journal vouchers, VAT, AR/AP'
  },
  {
    key: 'hr',
    num: 8,
    en: 'Human Resources & Payroll',
    ar: 'الموارد البشرية وكشوف الرواتب',
    icon: '👤',
    route: '/backoffice/hr',
    desc: 'Personnel directory, attendance, payroll processing'
  },
  {
    key: 'fleet',
    num: 9,
    en: 'Supersonic Fleet / V-Driver',
    ar: 'إدارة أسطول النقل السوبرسونيك',
    icon: '🚚',
    route: '/backoffice/fleet',
    desc: 'Vehicle maintenance, dispatch, live GPS tracking'
  },
  {
    key: 'social',
    num: 10,
    en: 'V-Connect (Social CRM & Lead Pipeline)',
    ar: 'إدارة التواصل ومسار العملاء المحتملين',
    icon: '🌐',
    route: '/backoffice/social-crm',
    desc: 'Lead acquisition pipeline, WhatsApp, omnichannel'
  },
  {
    key: 'pressing-mill',
    num: 11,
    en: 'Pressing Mill Engine (Manufacturing)',
    ar: 'محرك معاصر الزيتون والتصنيع',
    icon: '⚙️',
    route: '/pressing-mill/dashboard',
    desc: 'Olive weighbridge, pressing lines, oil tanks matrix'
  },
  {
    key: 'v-store',
    num: 12,
    en: 'V-Store (Online Storefront & Orders)',
    ar: 'المتجر الإلكتروني والطلبات أونلاين',
    icon: '🛍️',
    route: '/backoffice/online-orders',
    desc: 'E-commerce storefront, online order dispatches'
  }
];

interface ModuleNotLicensedScreenProps {
  moduleKey?: string | null;
  moduleName?: string;
  moduleNum?: number;
}

export default function ModuleNotLicensedScreen({
  moduleKey,
  moduleName,
  moduleNum
}: ModuleNotLicensedScreenProps) {
  const { currentTenant, isModuleEnabled } = useTenant();
  const { t, language } = useLanguage();

  // Find target module info if key provided
  const targetModule = ALL_CANONICAL_MODULES.find(m => m.key === moduleKey);
  const displayName = moduleName ? t(moduleName, moduleName) : (targetModule ? (language === 'ar' ? targetModule.ar : t(targetModule.en, targetModule.en)) : t('requested_module', 'Requested Module'));
  const displayNum = moduleNum || targetModule?.num;

  // Determine enabled and disabled modules for current workspace
  const enabledModules = ALL_CANONICAL_MODULES.filter(m => isModuleEnabled(m.key));
  const activeCount = enabledModules.length;
  const totalCount = ALL_CANONICAL_MODULES.length;

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* CARD CONTAINER */}
      <div className="bg-white border-2 border-amber-400/50 shadow-2xl rounded-3xl overflow-hidden">
        {/* TOP STATUS BAR */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-6 py-3 text-white flex items-center justify-between text-xs font-bold shadow-inner">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-white animate-pulse" />
            <span className="uppercase tracking-widest text-[11px] font-black">
              {t('enterprise_access_control', 'Enterprise Access Control')} &bull; {t('module_entitlement_guard', 'Module Entitlement Guard')}
            </span>
          </div>
          <span className="bg-black/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
            {t('http_403_not_licensed', 'HTTP 403 • Not Licensed')}
          </span>
        </div>

        {/* HERO SECTION */}
        <div className="p-8 sm:p-12 text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-tr from-amber-100 to-amber-50 border-2 border-amber-300 rounded-3xl mx-auto flex items-center justify-center shadow-lg text-4xl">
              {targetModule?.icon || '🔒'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white p-1.5 rounded-xl shadow-md border-2 border-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{t('module_not_active_in_subscription', 'Module Not Active In Current Subscription')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {displayNum ? `${t('module', 'Module')} ${displayNum}: ` : ''}{displayName}
            </h1>

            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {t('module_disabled_desc_1', 'This module is currently toggled')} <span className="font-bold text-rose-600">{t('off_state', 'OFF')}</span> {t('module_disabled_desc_2', 'or not licensed for the workspace')}{' '}
              <strong className="text-slate-900 font-bold">{currentTenant?.name || t('current_workspace', 'Current Workspace')}</strong> ({t('company_id', 'Company ID')}: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">#{currentTenant?.companyId || '1300'}</code>).
            </p>
          </div>

          {/* WORKSPACE SNAPSHOT PILL BOX */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-3xl mx-auto text-left text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="block text-[11px] text-slate-500 font-semibold mb-0.5">{t('active_workspace', 'Active Workspace')}</span>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                <span className="font-bold text-slate-900 truncate">
                  {currentTenant?.name || 'Southern Olive Oil'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="block text-[11px] text-slate-500 font-semibold mb-0.5">{t('subscription_tier', 'Subscription Tier')}</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-extrabold text-amber-700 font-mono text-sm uppercase">
                  {currentTenant?.subscriptionTier || 'PRO'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="block text-[11px] text-slate-500 font-semibold mb-0.5">{t('licensed_modules', 'Licensed Modules')}</span>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-extrabold text-emerald-700 font-mono text-sm">
                  {activeCount} / {totalCount} {t('active', 'Active')}
                </span>
              </div>
            </div>
          </div>

          {/* ACTIVE MODULE RECOVERY OPTIONS */}
          <div className="pt-4 border-t border-slate-200 text-left max-w-3xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('active_modules_in_workspace', 'Active Modules in Your Workspace (Click to Open):')}</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                {activeCount} {t('available', 'Available')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {enabledModules.map((mod) => (
                <Link
                  key={mod.key}
                  href={mod.route}
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary hover:shadow-md transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">
                      {mod.icon}
                    </span>
                    <div className="truncate">
                      <p className="font-bold text-slate-800 group-hover:text-primary truncate">
                        {mod.num}. {language === 'ar' ? mod.ar : t(mod.en, mod.en)}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{language === 'ar' ? mod.en : mod.ar}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </Link>
              ))}
            </div>
          </div>

          {/* ACTIONS: UPGRADE & RETURN BUTTONS */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/admin"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>⚙️ {t('manage_workspace_modules_admin', 'Manage Workspace Modules in Admin Console (Tab 3)')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/backoffice"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{t('return_to_main_hub', '← Return to Enterprise Main Hub')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
