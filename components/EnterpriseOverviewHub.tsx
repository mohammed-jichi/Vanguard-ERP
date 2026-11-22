'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShoppingCart,
  Boxes,
  Users,
  HeartHandshake,
  Award,
  BookOpen,
  UserCheck,
  Truck,
  Share2,
  ArrowUpRight,
  Clock,
  DollarSign,
  Search,
  FileText,
  ShieldCheck,
  MapPin,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Inbox,
  Factory,
  Smartphone,
  Store,
  LayoutGrid,
  List
} from 'lucide-react';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';

type ModuleCategory = 'all' | 'core' | 'crm' | 'fleet_hr';

export default function EnterpriseOverviewHub() {
  const { currentTenant } = useTenant();
  const { language, dir, t } = useLanguage();
  const isAr = language === 'ar';

  const isModuleActive = (moduleId: string): boolean => {
    const modules = currentTenant?.enabledModules || (currentTenant as any)?.enabled_modules;
    if (!modules || !Array.isArray(modules) || modules.length === 0) return true;
    const aliases: Record<string, string[]> = {
      sales: ['sales', 'pos', 'v-pos', 'vpos', 'sales_control', 'sales-control'],
      operations: ['operations', 'op', 'inventory', 'warehouse', 'operations_center', 'operations-center'],
      customers: ['customers', 'cust', 'crm', 'customer_management', 'customer-management'],
      feedback: ['feedback', 'surveys', 'feedback_surveys', 'feedback-surveys'],
      loyalty: ['loyalty', 'loyalty_management', 'loyalty-management', 'rewards'],
      accounting: ['accounting', 'acc', 'finance', 'financials'],
      hr: ['hr', 'human_resources', 'human-resources', 'payroll', 'personnel'],
      fleet: ['fleet', 'supersonic', 'logistics', 'vtrack'],
      social: ['social', 'social_crm', 'social-crm', 'support', 'omnichannel', 'connect', 'v-connect', 'vconnect'],
      'pressing-mill': ['pressing-mill', 'pressing_mill', 'mill', 'olive_mill', 'pressing'],
      'v-driver': ['v-driver', 'v_driver', 'driver', 'driver_app', 'vdriver'],
      'v-store': ['v-store', 'v_store', 'store', 'storefront', 'b2b_portal', 'vstore']
    };
    const targets = aliases[moduleId] || [moduleId];
    return modules.some((m: string) => targets.includes(m.toLowerCase()));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ModuleCategory>('all');
  const [compactMode, setCompactMode] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);

  const [stats, setStats] = useState({
    pendingApprovals: 0,
    unreadInbox: 0,
    criticalAlerts: 0,
    recentActivities: [] as Array<{
      id: string;
      action_type: string;
      description: string;
      performed_by: string;
      created_at: string;
    }>
  });

  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.success) {
          setStats({
            pendingApprovals: data.pendingApprovalsCount || 0,
            unreadInbox: data.unreadInboxCount || 0,
            criticalAlerts: (data.alerts || []).filter((a: any) => a.severity === 'CRITICAL').length,
            recentActivities: data.activities?.slice(0, 5) || []
          });
        }
      } catch (err) {
        console.error('Failed to load dynamic notification feed for Enterprise Hub:', err);
      }
    };
    loadDynamicData();
  }, []);

  const modulesList = useMemo(() => [
    {
      id: 'sales',
      category: 'core' as ModuleCategory,
      titleEn: 'V-POS & Counter Sales',
      titleAr: 'نقاط البيع والمبيعات (V-POS)',
      descriptionEn: 'Retail & wholesale checkout, barcode scanning, and daily Z-reports.',
      descriptionAr: 'محطات الكاشير، فواتير التجزئة والجملة، وتقارير الإغلاق اليومي.',
      icon: ShoppingCart,
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
      primaryRoute: '/dashboard/sales',
      subLinks: [
        { labelEn: 'Sales Dashboard', labelAr: 'لوحة المبيعات', href: '/dashboard/sales' },
        { labelEn: 'Cashier Reports', labelAr: 'تقارير الصندوق', href: '/backoffice/reportview' },
        { labelEn: 'Online Orders', labelAr: 'الطلبات الإلكترونية', href: '/backoffice/online-orders' },
        { labelEn: 'End of Day', labelAr: 'إغلاق اليوم', href: '/backoffice/end-of-day' },
      ],
    },
    {
      id: 'operations',
      category: 'core' as ModuleCategory,
      titleEn: 'Operations & Inventory',
      titleAr: 'مركز العمليات والمستودعات',
      descriptionEn: 'Multi-location stock, warehouse transfers, BOM assembly, and procurement.',
      descriptionAr: 'إدارة المستودعات، أرصدة المخزون، تحويلات الخزانات والمشتريات.',
      icon: Boxes,
      accent: 'text-amber-700 bg-amber-50 border-amber-200/80',
      primaryRoute: '/backoffice/operations',
      subLinks: [
        { labelEn: 'Operations Hub', labelAr: 'لوحة العمليات', href: '/backoffice/operations' },
        { labelEn: 'Products Master', labelAr: 'دليل المنتجات', href: '/backoffice/products' },
        { labelEn: 'Adjustments', labelAr: 'تعديلات المخزون', href: '/adjustments' },
        { labelEn: 'Goods Receipts', labelAr: 'استلام البضائع', href: '/receiving-of-goods' },
      ],
    },
    {
      id: 'accounting',
      category: 'core' as ModuleCategory,
      titleEn: 'Accounting & Financials',
      titleAr: 'المحاسبة والشؤون المالية',
      descriptionEn: 'Multi-currency General Ledger, Trial Balance, vouchers, AP/AR, and bank reconciliation.',
      descriptionAr: 'دفتر الأستاذ العام، ميزان المراجعة، السندات، الذمم، والتسويات البنكية.',
      icon: BookOpen,
      accent: 'text-indigo-700 bg-indigo-50 border-indigo-200/80',
      primaryRoute: '/backoffice/accounting',
      subLinks: [
        { labelEn: 'Accounting Hub', labelAr: 'لوحة المحاسبة', href: '/backoffice/accounting' },
        { labelEn: 'Journal Vouchers', labelAr: 'سندات القيد (JV)', href: '/backoffice/accounting?tab=jv' },
        { labelEn: 'Ledger & Trial Balance', labelAr: 'ميزان المراجعة', href: '/backoffice/accounting?tab=reports' },
        { labelEn: 'Reconciliation', labelAr: 'المطابقات البنكية', href: '/backoffice/accounting?tab=reconciliation' },
      ],
    },
    {
      id: 'pressing-mill',
      category: 'core' as ModuleCategory,
      titleEn: 'Pressing Mill & Oil Plant',
      titleAr: 'معصرة الزيتون ومصنع الزيت',
      descriptionEn: 'Weighbridge intake, pressing batches, 50-tank storage matrix, and oil handover.',
      descriptionAr: 'استلام الزيتون، قبان الوزن، خطوط العصر، ومصفوفة الخزانات.',
      icon: Factory,
      accent: 'text-amber-800 bg-amber-50/90 border-amber-200/80',
      primaryRoute: '/pressing-mill',
      subLinks: [
        { labelEn: 'Mill Dashboard', labelAr: 'لوحة المعصرة', href: '/pressing-mill/dashboard' },
        { labelEn: 'Weighbridge', labelAr: 'قبان الاستلام', href: '/pressing-mill/intake' },
        { labelEn: 'Pressing Batches', labelAr: 'دفعات العصر', href: '/pressing-mill/batches' },
        { labelEn: 'Tanks Matrix', labelAr: 'مصفوفة الخزانات', href: '/pressing-mill/tanks' },
      ],
    },
    {
      id: 'customers',
      category: 'crm' as ModuleCategory,
      titleEn: 'Customer Management (CRM)',
      titleAr: 'إدارة علاقات العملاء (CRM)',
      descriptionEn: 'Client accounts directory, aged receivables, LTV analytics, and receipts.',
      descriptionAr: 'دليل حسابات الزبائن، أعمار الديون المدينة، وتحليلات العملاء.',
      icon: Users,
      accent: 'text-blue-700 bg-blue-50 border-blue-200/80',
      primaryRoute: '/backoffice/customers',
      subLinks: [
        { labelEn: 'Directory', labelAr: 'دليل العملاء', href: '/backoffice/customers' },
        { labelEn: 'Aged Debtors', labelAr: 'أعمار الذمم', href: '/backoffice/customers?tab=aged' },
        { labelEn: 'LTV Insights', labelAr: 'تحليلات LTV', href: '/backoffice/customers?tab=insights' },
        { labelEn: 'Receipts', labelAr: 'إيصالات القبض', href: '/backoffice/customers?tab=receipts' },
      ],
    },
    {
      id: 'social',
      category: 'crm' as ModuleCategory,
      titleEn: 'V-Connect (Social CRM)',
      titleAr: 'منظومة V-Connect (التواصل وواتساب)',
      descriptionEn: 'Unified WhatsApp & Meta inbox, chat-to-order conversion, and distributor care.',
      descriptionAr: 'الصندوق الموحد لرسائل واتساب وإنستغرام وتوليد الطلبات.',
      icon: Share2,
      accent: 'text-cyan-700 bg-cyan-50 border-cyan-200/80',
      primaryRoute: '/connect',
      subLinks: [
        { labelEn: 'V-Connect Hub', labelAr: 'بوابة V-Connect', href: '/connect' },
        { labelEn: 'Unified Inbox', labelAr: 'صندوق المحادثات', href: '/backoffice/social-crm' },
        { labelEn: 'Platform Orders', labelAr: 'طلبات المنصات', href: '/backoffice/social-crm?tab=orders' },
        { labelEn: 'Distributors', labelAr: 'دليل الموزعين', href: '/backoffice/social-crm?tab=distributors' },
      ],
    },
    {
      id: 'v-store',
      category: 'crm' as ModuleCategory,
      titleEn: 'V-Store (B2B & Storefront)',
      titleAr: 'المتجر الإلكتروني وبوابة B2B',
      descriptionEn: 'Wholesale B2B ordering portal, retail web storefront, and catalog showcase.',
      descriptionAr: 'بوابة طلبات الجملة والتجزئة الإلكترونية وكتالوج المنتجات.',
      icon: Store,
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
      primaryRoute: '/v-store',
      subLinks: [
        { labelEn: 'Web Storefront', labelAr: 'واجهة المتجر', href: '/v-store' },
        { labelEn: 'Online Orders', labelAr: 'طلبات الويب', href: '/backoffice/online-orders' },
        { labelEn: 'Catalog', labelAr: 'كتالوج المنتجات', href: '/backoffice/products' },
        { labelEn: 'Client Pricing', labelAr: 'أسعار العملاء', href: '/backoffice/customers' },
      ],
    },
    {
      id: 'loyalty',
      category: 'crm' as ModuleCategory,
      titleEn: 'Loyalty & Rewards',
      titleAr: 'برنامج الولاء ونقاط المكافآت',
      descriptionEn: 'Tiered memberships (Silver, Gold, VIP), points rules, and targeted offers.',
      descriptionAr: 'مستويات العضوية، احتساب النقاط، والحملات الترويجية.',
      icon: Award,
      accent: 'text-purple-700 bg-purple-50 border-purple-200/80',
      primaryRoute: '/backoffice/loyalty',
      subLinks: [
        { labelEn: 'Loyalty Hub', labelAr: 'لوحة الولاء', href: '/backoffice/loyalty' },
        { labelEn: 'Members', labelAr: 'سجل الأعضاء', href: '/backoffice/loyalty?tab=members' },
        { labelEn: 'VIP Tiers', labelAr: 'المستويات', href: '/backoffice/loyalty?tab=levels' },
        { labelEn: 'Campaigns', labelAr: 'الرسائل التسويقية', href: '/backoffice/loyalty?tab=messages' },
      ],
    },
    {
      id: 'feedback',
      category: 'crm' as ModuleCategory,
      titleEn: 'Feedback & CSAT Surveys',
      titleAr: 'الشكاوى واستطلاعات الرأي',
      descriptionEn: 'Complaint resolution lifecycle, customer satisfaction surveys, and QA tracking.',
      descriptionAr: 'إدارة الشكاوى، استطلاعات الرضا، وإجراءات المعالجة.',
      icon: HeartHandshake,
      accent: 'text-rose-700 bg-rose-50 border-rose-200/80',
      primaryRoute: '/backoffice/feedback',
      subLinks: [
        { labelEn: 'Feedback Hub', labelAr: 'لوحة الشكاوى', href: '/backoffice/feedback' },
        { labelEn: 'Complaints', labelAr: 'إدارة الشكاوى', href: '/backoffice/feedback?tab=manage' },
        { labelEn: 'CSAT Surveys', labelAr: 'الاستطلاعات', href: '/backoffice/feedback?tab=surveys' },
        { labelEn: 'Resolutions', labelAr: 'الإجراءات والحلول', href: '/backoffice/feedback?tab=actions' },
      ],
    },
    {
      id: 'fleet',
      category: 'fleet_hr' as ModuleCategory,
      titleEn: 'SuperSonic Fleet Logistics',
      titleAr: 'أسطول النقل واللوجستيات (SuperSonic)',
      descriptionEn: 'Live GPS vehicle tracking, geographic delivery corridors, and fuel audits.',
      descriptionAr: 'تتبع الشاحنات عبر GPS، تفويج الممرات، والرقابة على الوقود.',
      icon: Truck,
      accent: 'text-blue-700 bg-blue-50 border-blue-200/80',
      primaryRoute: '/backoffice/fleet',
      subLinks: [
        { labelEn: 'Dispatch Radar', labelAr: 'رادار الشاحنات', href: '/backoffice/fleet' },
        { labelEn: 'Corridors', labelAr: 'ممرات التوصيل', href: '/backoffice/fleet?tab=corridors' },
        { labelEn: 'Maintenance', labelAr: 'الوقود والصيانة', href: '/backoffice/fleet?tab=maintenance' },
        { labelEn: 'Trip Reports', labelAr: 'تقارير الرحلات', href: '/backoffice/fleet/reports' },
      ],
    },
    {
      id: 'v-driver',
      category: 'fleet_hr' as ModuleCategory,
      titleEn: 'V-Driver (Field Driver App)',
      titleAr: 'تطبيق السائقين الميداني (V-Driver)',
      descriptionEn: 'Mobile PWA for delivery drivers, digital POD signatures, and cash collection.',
      descriptionAr: 'تطبيق السائقين لتوجيه المسارات وإثبات التسليم الإلكتروني.',
      icon: Smartphone,
      accent: 'text-slate-700 bg-slate-100 border-slate-200/80',
      primaryRoute: '/v-driver',
      subLinks: [
        { labelEn: 'Driver PWA', labelAr: 'شاشة السائق', href: '/v-driver' },
        { labelEn: 'Route Dispatch', labelAr: 'تفويج الممرات', href: '/backoffice/fleet?tab=corridors' },
        { labelEn: 'Live GPS', labelAr: 'تتبع السائقين', href: '/backoffice/fleet' },
        { labelEn: 'POD Receipts', labelAr: 'إثباتات التسليم', href: '/delivery-of-goods' },
      ],
    },
    {
      id: 'hr',
      category: 'fleet_hr' as ModuleCategory,
      titleEn: 'Human Resources & Payroll',
      titleAr: 'الموارد البشرية ومسير الرواتب',
      descriptionEn: 'Employee directory, biometric attendance, shift schedules, and net payslips.',
      descriptionAr: 'سجل الموظفين، الحضور والانصراف، المناوبات وقسائم الرواتب.',
      icon: UserCheck,
      accent: 'text-teal-700 bg-teal-50 border-teal-200/80',
      primaryRoute: '/backoffice/hr',
      subLinks: [
        { labelEn: 'HR Overview', labelAr: 'لوحة الموارد البشرية', href: '/backoffice/hr' },
        { labelEn: 'Employees', labelAr: 'دليل الموظفين', href: '/backoffice/hr?tab=personnel' },
        { labelEn: 'Attendance', labelAr: 'سجل الدوام', href: '/backoffice/hr?tab=attendance' },
        { labelEn: 'Payroll', labelAr: 'مسير الرواتب', href: '/backoffice/hr?tab=payroll' },
      ],
    },
  ], []);

  const categories: Array<{ id: ModuleCategory; labelEn: string; labelAr: string; count: number }> = useMemo(() => [
    { id: 'all', labelEn: 'All Modules', labelAr: 'جميع الوحدات', count: modulesList.length },
    { id: 'core', labelEn: 'Core & Operations', labelAr: 'العمليات والمالية', count: modulesList.filter(m => m.category === 'core').length },
    { id: 'crm', labelEn: 'Sales, CRM & Commerce', labelAr: 'المبيعات والعملاء', count: modulesList.filter(m => m.category === 'crm').length },
    { id: 'fleet_hr', labelEn: 'Fleet & Workforce', labelAr: 'الأسطول والموارد البشرية', count: modulesList.filter(m => m.category === 'fleet_hr').length },
  ], [modulesList]);

  const filteredModules = useMemo(() => {
    return modulesList.filter(m => {
      if (activeCategory !== 'all' && m.category !== activeCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        m.titleEn.toLowerCase().includes(q) ||
        m.titleAr.includes(q) ||
        m.descriptionEn.toLowerCase().includes(q) ||
        m.descriptionAr.includes(q) ||
        m.subLinks.some(s => s.labelEn.toLowerCase().includes(q) || s.labelAr.includes(q))
      );
    });
  }, [modulesList, activeCategory, searchQuery]);

  const tierLabel = useMemo(() => {
    const raw = (currentTenant?.subscriptionTier || 'ENTERPRISE').toUpperCase();
    return raw.includes('ENTERPRISE') ? 'ENTERPRISE' : raw;
  }, [currentTenant?.subscriptionTier]);

  return (
    <div dir={dir} className="max-w-7xl mx-auto space-y-5 pb-10">

      {/* 1. CLEAN WORKSPACE HEADER & QUICK COMMAND BAR */}
      <section className="bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 truncate">
                {currentTenant?.name || 'Southern Olive and Oil Products S.A.R.L'}
              </h1>
              <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                #{currentTenant?.companyId || '1300'}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {tierLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {isAr ? 'البوابة المركزية: الشويفات وصيدا ومعصرة صور' : 'Choueifat Logistics & Tyre Pressing Mill'}
              </span>
            </p>
          </div>
        </div>

        {/* Streamlined Primary Actions & External Suite Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            prefetch={false}
            href="/dashboard/sales"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isAr ? 'نقطة البيع (POS)' : 'Open POS & Sales'}</span>
          </Link>

          <Link
            prefetch={false}
            href="/backoffice/accounting?action=new-jv"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/90 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>{isAr ? 'سند قيد جديد' : 'New Voucher'}</span>
          </Link>

          <Link
            prefetch={false}
            href="/backoffice/reportview"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/90 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>{isAr ? 'التقارير' : 'Reports'}</span>
          </Link>

          <Link
            prefetch={false}
            href="/backoffice/inbox"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/90 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Inbox className="w-3.5 h-3.5 text-slate-600" />
            <span>{isAr ? 'الموافقات' : 'Inbox'}</span>
            {stats.pendingApprovals > 0 && (
              <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold">
                {stats.pendingApprovals}
              </span>
            )}
          </Link>

          <div className="hidden sm:block h-5 w-px bg-slate-200 mx-0.5" />

          {/* Compact External Web Apps Pill Group */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-xl p-1">
            {[
              { label: 'V-Connect', href: '/connect' },
              { label: 'V-Driver', href: '/v-driver' },
              { label: 'V-POS', href: '/pos' },
              { label: 'V-Store', href: '/v-store' },
            ].map((app) => (
              <a
                key={app.href}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`Launch ${app.label} in new tab`}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs transition-all flex items-center gap-1"
              >
                <span>{app.label}</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 2. COMPACT 4-COLUMN KPI SUMMARY STRIP */}
      <section aria-label="Key Performance Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link
          prefetch={false}
          href="/dashboard/sales"
          className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl px-4 py-3.5 shadow-2xs flex items-center justify-between gap-3 transition-colors group"
        >
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500">
              {isAr ? 'إجمالي نشاط اليوم' : "Today's Gross Activity"}
            </div>
            <div className="text-xl font-black text-slate-900 mt-0.5">$12,480.00</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5 truncate">
              1,116,960,000 LBP • {isAr ? 'نشط ومطابق' : 'Drawers Balanced'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
            <DollarSign className="w-4 h-4" />
          </div>
        </Link>

        <Link
          prefetch={false}
          href="/backoffice/inbox"
          className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl px-4 py-3.5 shadow-2xs flex items-center justify-between gap-3 transition-colors group"
        >
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500">
              {isAr ? 'سندات بانتظار الاعتماد' : 'Pending Dual-Signoff'}
            </div>
            <div className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{stats.pendingApprovals}</span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md">
                {stats.pendingApprovals === 0
                  ? (isAr ? 'مكتمل' : 'All Clear')
                  : (isAr ? 'بانتظار التوقيع' : 'Action Needed')}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              {isAr ? 'صندوق الموافقات والسندات' : 'Voucher & Expense Approvals'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </Link>

        <Link
          prefetch={false}
          href="/backoffice/fleet"
          className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl px-4 py-3.5 shadow-2xs flex items-center justify-between gap-3 transition-colors group"
        >
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500">
              {isAr ? 'أسطول الشاحنات الحي' : 'Live Fleet Logistics'}
            </div>
            <div className="text-xl font-black text-slate-900 mt-0.5">12 / 14</div>
            <div className="text-[11px] text-blue-700 font-medium mt-0.5 truncate">
              {isAr ? 'مركبات نشطة على 4 ممرات' : 'Active across 4 route corridors'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Truck className="w-4 h-4" />
          </div>
        </Link>

        <Link
          prefetch={false}
          href="/backoffice/operations"
          className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl px-4 py-3.5 shadow-2xs flex items-center justify-between gap-3 transition-colors group"
        >
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500">
              {isAr ? 'المعصرة والخزانات' : 'Mill & Tank Storage'}
            </div>
            <div className="text-xl font-black text-slate-900 mt-0.5">42,500 L</div>
            <div className="text-[11px] text-purple-700 font-medium mt-0.5 truncate">
              {isAr ? 'مخزون زيت الزيتون البكر الممتاز' : 'Extra Virgin Olive Oil Inventory'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
            <Boxes className="w-4 h-4" />
          </div>
        </Link>
      </section>

      {/* 3. ORGANIZED ENTERPRISE MODULES WORKSPACE */}
      <section className="space-y-3.5">
        {/* Category Filter Tabs + Search + View Density Toggle */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Category Tabs */}
          <div role="tablist" aria-label="Module Categories" className="flex flex-wrap items-center gap-1">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Compact Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder={isAr ? 'بحث في الوحدات والشاشات...' : 'Search modules or screens...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 pl-8 text-slate-800 focus:bg-white focus:outline-none focus:border-slate-400 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setCompactMode(false)}
                title={isAr ? 'عرض تفصيلي' : 'Standard View'}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  !compactMode ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCompactMode(true)}
                title={isAr ? 'عرض مدمج' : 'Compact View'}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  compactMode ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div
          className={`grid gap-3.5 ${
            compactMode
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredModules.map((module) => {
            const Icon = module.icon;
            const enabled = isModuleActive(module.id);

            return (
              <article
                key={module.id}
                className={`bg-white border rounded-2xl p-4 shadow-2xs flex flex-col justify-between transition-all ${
                  enabled
                    ? 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                    : 'border-slate-200 opacity-55'
                }`}
              >
                <div>
                  {/* Card Header: Icon + Direct Module Link */}
                  <header className="flex items-start justify-between gap-2.5">
                    <Link
                      prefetch={false}
                      href={module.primaryRoute}
                      className="flex items-center gap-3 group min-w-0 flex-1"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${module.accent}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                          {isAr ? module.titleAr : module.titleEn}
                        </h3>
                        {!compactMode && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {isAr ? module.descriptionAr : module.descriptionEn}
                          </p>
                        )}
                      </div>
                    </Link>

                    <Link
                      prefetch={false}
                      href={module.primaryRoute}
                      aria-label={`Open ${isAr ? module.titleAr : module.titleEn}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </header>

                  {/* Sub-screen Pill Shortcuts */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {module.subLinks.map((sub, i) => (
                      <Link
                        prefetch={false}
                        key={i}
                        href={sub.href}
                        className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 px-2.5 py-1 rounded-lg transition-colors truncate max-w-full"
                      >
                        {isAr ? sub.labelAr : sub.labelEn}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. COLLAPSIBLE RECENT OPERATIONS & AUDIT BAR */}
      {stats.recentActivities.length > 0 && (
        <section className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setShowActivityFeed(!showActivityFeed)}
              className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer group"
            >
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider shrink-0">
                {isAr ? 'آخر العمليات' : 'Recent Activity'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600 truncate">
                {stats.recentActivities[0]?.description}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                  showActivityFeed ? 'rotate-180' : ''
                }`}
              />
            </button>

            <Link
              prefetch={false}
              href="/backoffice/inbox"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 shrink-0 flex items-center gap-1"
            >
              <span>{isAr ? 'سجل العمليات' : 'Full Log'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {showActivityFeed && (
            <div className="px-4 pb-3 pt-1 border-t border-slate-100 divide-y divide-slate-100 text-xs">
              {stats.recentActivities.map((act) => (
                <div key={act.id} className="py-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{act.description}</span>
                    <span className="text-slate-400 shrink-0">•</span>
                    <span className="text-slate-500 shrink-0">{act.performed_by}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
