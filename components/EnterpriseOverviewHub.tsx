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
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  Search, 
  FileText, 
  ShieldCheck, 
  PlusCircle, 
  MapPin, 
  Layers, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  Inbox,
  Factory,
  Smartphone,
  Store,
  MessageSquare
} from 'lucide-react';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function EnterpriseOverviewHub() {
  const { currentTenant } = useTenant();
  const { language, dir } = useLanguage();
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
  const [currentTime, setCurrentTime] = useState('');
  
  // Real dynamic notifications & pending approvals count
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
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString(isAr ? 'ar-LB' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [isAr]);

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

  // 12 Enterprise Modules Configuration
  const modulesList = [
    {
      id: 'sales',
      number: '01',
      titleEn: 'V-POS & Counter Sales',
      titleAr: 'نقاط البيع والمبيعات (V-POS)',
      descriptionEn: 'Cashier touchstations, retail & wholesale checkout, barcode scanning, price modes, and daily Z-reports.',
      descriptionAr: 'محطات الكاشير، فواتير التجزئة والجملة، أنماط الأسعار، الخصومات وتقارير الإغلاق اليومي.',
      icon: ShoppingCart,
      color: 'emerald',
      primaryRoute: '/dashboard/sales',
      subLinks: [
        { labelEn: 'Sales Dashboard', labelAr: 'لوحة المبيعات', href: '/dashboard/sales' },
        { labelEn: 'Cashier Reports', labelAr: 'تقارير الصندوق', href: '/backoffice/reportview' },
        { labelEn: 'Online Orders', labelAr: 'الطلبات الإلكترونية', href: '/backoffice/online-orders' },
        { labelEn: 'End of Day (Z-Report)', labelAr: 'إغلاق اليوم', href: '/backoffice/end-of-day' },
      ],
      badge: 'V-POS'
    },
    {
      id: 'operations',
      number: '02',
      titleEn: 'Operations Center & Inventory',
      titleAr: 'مركز العمليات والمستودعات',
      descriptionEn: 'Warehouse logistics, multi-location stock, tank inventory transfers, multi-decimal BOM, and procurement.',
      descriptionAr: 'إدارة المستودعات، أرصدة المخزون، تحويلات الخزانات، التجميع والتصنيع والمشتريات التشغيلية.',
      icon: Boxes,
      color: 'amber',
      primaryRoute: '/backoffice/operations',
      subLinks: [
        { labelEn: 'Operations Dashboard', labelAr: 'لوحة العمليات', href: '/backoffice/operations' },
        { labelEn: 'Products Master', labelAr: 'دليل المنتجات', href: '/backoffice/products' },
        { labelEn: 'Stock Adjustments', labelAr: 'تعديلات المخزون', href: '/adjustments' },
        { labelEn: 'Goods Receipts', labelAr: 'استلام البضائع', href: '/receiving-of-goods' },
      ],
      badge: 'CORE'
    },
    {
      id: 'customers',
      number: '03',
      titleEn: 'Customer Management (CRM)',
      titleAr: 'إدارة علاقات العملاء (CRM)',
      descriptionEn: 'Customer accounts directory, aged debtor tracking, LTV insights, appointments, and pipeline.',
      descriptionAr: 'دليل حسابات الزبائن، أعمار الديون المدينة، تحليلات القيمة الممتدة، والمواعيد والمهام.',
      icon: Users,
      color: 'blue',
      primaryRoute: '/backoffice/customers',
      subLinks: [
        { labelEn: 'Customers Directory', labelAr: 'دليل العملاء', href: '/backoffice/customers' },
        { labelEn: 'Aged Debtors', labelAr: 'أعمار الذمم', href: '/backoffice/customers?tab=aged' },
        { labelEn: 'Customer Insights & LTV', labelAr: 'تحليلات LTV', href: '/backoffice/customers?tab=insights' },
        { labelEn: 'Customer Receipts', labelAr: 'إيصالات القبض', href: '/backoffice/customers?tab=receipts' },
      ],
      badge: 'GROWTH'
    },
    {
      id: 'feedback',
      number: '04',
      titleEn: 'Feedback & Customer Surveys',
      titleAr: 'الشكاوى واستطلاعات الرأي',
      descriptionEn: 'Omnichannel customer complaint lifecycle, CSAT surveys, root-cause categorization, and care.',
      descriptionAr: 'إدارة دورة حياة الشكاوى، استطلاعات الرضا، تصنيف الأسباب الجذرية وبرامج العناية.',
      icon: HeartHandshake,
      color: 'rose',
      primaryRoute: '/backoffice/feedback',
      subLinks: [
        { labelEn: 'Feedback Dashboard', labelAr: 'لوحة الشكاوى', href: '/backoffice/feedback' },
        { labelEn: 'Manage Complaints', labelAr: 'إدارة الشكاوى', href: '/backoffice/feedback?tab=manage' },
        { labelEn: 'Customer Surveys', labelAr: 'الاستطلاعات والتقييم', href: '/backoffice/feedback?tab=surveys' },
        { labelEn: 'Resolution Actions', labelAr: 'الإجراءات والحلول', href: '/backoffice/feedback?tab=actions' },
      ],
      badge: 'QUALITY'
    },
    {
      id: 'loyalty',
      number: '05',
      titleEn: 'Loyalty & Rewards Program',
      titleAr: 'برنامج الولاء ونقاط المكافآت',
      descriptionEn: 'Tiered loyalty membership (Silver, Gold, VIP), point earning rules, and SMS/WhatsApp offers.',
      descriptionAr: 'مستويات العضوية (فضي، ذهبي، بلاتيني)، احتساب النقاط، والحملات الترويجية الموجهة.',
      icon: Award,
      color: 'purple',
      primaryRoute: '/backoffice/loyalty',
      subLinks: [
        { labelEn: 'Loyalty Dashboard', labelAr: 'لوحة الولاء', href: '/backoffice/loyalty' },
        { labelEn: 'Members Directory', labelAr: 'سجل الأعضاء', href: '/backoffice/loyalty?tab=members' },
        { labelEn: 'Tiers & Levels', labelAr: 'المستويات والمراحل', href: '/backoffice/loyalty?tab=levels' },
        { labelEn: 'Promotional Messages', labelAr: 'الرسائل التسويقية', href: '/backoffice/loyalty?tab=messages' },
      ],
      badge: 'REWARDS'
    },
    {
      id: 'accounting',
      number: '06',
      titleEn: 'Accounting & Financials',
      titleAr: 'المحاسبة والشؤون المالية',
      descriptionEn: 'Multi-currency General Ledger, Trial Balance, dual-signoff vouchers, AP/AR, and bank reconciliations.',
      descriptionAr: 'دفتر الأستاذ العام، ميزان المراجعة، السندات ذات التوقيع المزدوج، الذمم، والتسويات البنكية.',
      icon: BookOpen,
      color: 'indigo',
      primaryRoute: '/backoffice/accounting',
      subLinks: [
        { labelEn: 'Accounting Dashboard', labelAr: 'لوحة المحاسبة', href: '/backoffice/accounting' },
        { labelEn: 'Journal Vouchers (JV)', labelAr: 'سندات القيد (JV)', href: '/backoffice/accounting?tab=jv' },
        { labelEn: 'General Ledger & Trial Balance', labelAr: 'ميزان المراجعة وGL', href: '/backoffice/accounting?tab=reports' },
        { labelEn: 'Bank Reconciliation', labelAr: 'المطابقات البنكية', href: '/backoffice/accounting?tab=reconciliation' },
      ],
      badge: 'ERP GL'
    },
    {
      id: 'hr',
      number: '07',
      titleEn: 'Human Resources & Payroll',
      titleAr: 'الموارد البشرية ومسير الرواتب',
      descriptionEn: 'Personnel records, biometric attendance logging, work shifts, leave requests, and net payslips.',
      descriptionAr: 'سجل الموظفين، بصمة الحضور والانصراف، المناوبات، طلبات الإجازات وقسائم الرواتب.',
      icon: UserCheck,
      color: 'teal',
      primaryRoute: '/backoffice/hr',
      subLinks: [
        { labelEn: 'HR Overview', labelAr: 'لوحة الموارد البشرية', href: '/backoffice/hr' },
        { labelEn: 'Personnel Directory', labelAr: 'دليل الكادر الوظيفي', href: '/backoffice/hr?tab=personnel' },
        { labelEn: 'Attendance Log', labelAr: 'سجل الدوام والبصمة', href: '/backoffice/hr?tab=attendance' },
        { labelEn: 'Net Payslips', labelAr: 'احتساب الرواتب', href: '/backoffice/hr?tab=payroll' },
      ],
      badge: 'PAYROLL'
    },
    {
      id: 'fleet',
      number: '08',
      titleEn: 'SuperSonic Fleet Logistics',
      titleAr: 'أسطول النقل واللوجستيات (SuperSonic)',
      descriptionEn: 'Real-time GPS vehicle tracking, corridor order dispatch, live mileage, and fuel audits.',
      descriptionAr: 'تتبع الشاحنات الحي عبر GPS، تفويج طلبيات الممرات الجغرافية، والرقابة على الوقود.',
      icon: Truck,
      color: 'amber',
      primaryRoute: '/backoffice/fleet',
      subLinks: [
        { labelEn: 'Fleet Dispatch Radar', labelAr: 'رادار تتبع الشاحنات', href: '/backoffice/fleet' },
        { labelEn: 'Route Corridors', labelAr: 'ممرات التوصيل', href: '/backoffice/fleet?tab=corridors' },
        { labelEn: 'Fuel & Maintenance', labelAr: 'الوقود والصيانة', href: '/backoffice/fleet?tab=maintenance' },
        { labelEn: 'Fleet GPS Reports', labelAr: 'تقارير الرحلات', href: '/backoffice/fleet/reports' },
      ],
      badge: 'GPS LIVE'
    },
    {
      id: 'social',
      number: '09',
      titleEn: 'V-Connect (Social CRM & Support)',
      titleAr: 'منظومة V-Connect (التواصل الاجتماعي وواتساب)',
      descriptionEn: 'Unified multichannel inbox, WhatsApp & Meta customer conversations, chat orders, and ticket support.',
      descriptionAr: 'الصندوق الموحد لرسائل واتساب وإنستغرام، محادثات العملاء، توليد الطلبات، وإدارة الدعم.',
      icon: Share2,
      color: 'cyan',
      primaryRoute: '/connect',
      subLinks: [
        { labelEn: 'V-Connect Hub', labelAr: 'بوابة V-Connect', href: '/connect' },
        { labelEn: 'Omnichannel Inbox', labelAr: 'صندوق المحادثات', href: '/backoffice/social-crm' },
        { labelEn: 'Platform Orders', labelAr: 'طلبات المنصات', href: '/backoffice/social-crm?tab=orders' },
        { labelEn: 'Distributor Directory', labelAr: 'دليل الموزعين', href: '/backoffice/social-crm?tab=distributors' },
      ],
      badge: 'V-CONNECT'
    },
    {
      id: 'pressing-mill',
      number: '10',
      titleEn: 'Pressing Mill & Oil Plant',
      titleAr: 'معصرة الزيتون ومصنع الزيت',
      descriptionEn: 'Olive intake weighbridge scale, pressing batches, 50-tank storage matrix, milling fees, and oil handover.',
      descriptionAr: 'استلام ثمار الزيتون، قبان الوزن، خطوط العصر، مصفوفة الخزانات الـ 50، ومحاسبة الأجور والرد.',
      icon: Factory,
      color: 'amber',
      primaryRoute: '/pressing-mill',
      subLinks: [
        { labelEn: 'Mill Dashboard', labelAr: 'لوحة المعصرة', href: '/pressing-mill/dashboard' },
        { labelEn: 'Intake Weighbridge', labelAr: 'قبان الاستلام', href: '/pressing-mill/intake' },
        { labelEn: 'Pressing Batches', labelAr: 'دفعات العصر', href: '/pressing-mill/batches' },
        { labelEn: 'Tanks Matrix (1-50)', labelAr: 'مصفوفة الخزانات', href: '/pressing-mill/tanks' },
      ],
      badge: 'AGRI-MILL'
    },
    {
      id: 'v-driver',
      number: '11',
      titleEn: 'V-Driver (Driver & Fleet App)',
      titleAr: 'تطبيق السائقين الميداني (V-Driver)',
      descriptionEn: 'Standalone mobile PWA for delivery drivers, turn-by-turn route corridors, proof of delivery, and offline sync.',
      descriptionAr: 'تطبيق ويب تقدمي (PWA) للسائقين، توجيه المسارات والممرات، إثبات التسليم والمزامنة دون اتصال.',
      icon: Smartphone,
      color: 'blue',
      primaryRoute: '/v-driver',
      subLinks: [
        { labelEn: 'Driver App Console', labelAr: 'شاشة السائق', href: '/v-driver' },
        { labelEn: 'Corridors Dispatch', labelAr: 'تفويج الممرات', href: '/backoffice/fleet?tab=corridors' },
        { labelEn: 'Live GPS Tracking', labelAr: 'تتبع السائقين', href: '/backoffice/fleet' },
        { labelEn: 'Delivery Receipts', labelAr: 'إثباتات التسليم', href: '/delivery-of-goods' },
      ],
      badge: 'V-DRIVER'
    },
    {
      id: 'v-store',
      number: '12',
      titleEn: 'V-Store (Storefront & B2B Portal)',
      titleAr: 'المتجر الإلكتروني وبوابة B2B (V-Store)',
      descriptionEn: 'High-conversion B2B wholesale portal and retail storefront, online order routing, and catalog showcase.',
      descriptionAr: 'بوابة طلبات الجملة والتجزئة الإلكترونية، ربط الطلبات الفوري بالمخازن، وكتالوج المنتجات.',
      icon: Store,
      color: 'emerald',
      primaryRoute: '/v-store',
      subLinks: [
        { labelEn: 'Storefront Portal', labelAr: 'واجهة المتجر', href: '/v-store' },
        { labelEn: 'Online Orders', labelAr: 'طلبات الويب', href: '/backoffice/online-orders' },
        { labelEn: 'Product Catalog', labelAr: 'كتالوج المنتجات', href: '/backoffice/products' },
        { labelEn: 'Customer Pricing', labelAr: 'أسعار العملاء', href: '/backoffice/customers' },
      ],
      badge: 'V-STORE'
    }
  ];

  // Search filter
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modulesList;
    const q = searchQuery.toLowerCase().trim();
    return modulesList.filter(m => 
      m.titleEn.toLowerCase().includes(q) ||
      m.titleAr.includes(q) ||
      m.descriptionEn.toLowerCase().includes(q) ||
      m.descriptionAr.includes(q) ||
      m.subLinks.some(s => s.labelEn.toLowerCase().includes(q) || s.labelAr.includes(q))
    );
  }, [modulesList, searchQuery]);

  return (
    <div dir={dir} className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* 1. EXECUTIVE ENTERPRISE BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentTenant?.name || 'Southern Olive Oil Products S.A.R.L'}
                </h1>
                <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  #{currentTenant?.companyId || '1300'}
                </span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {currentTenant?.subscriptionTier || 'PRO'} Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {isAr ? 'البوابة المركزية: الشويفات وصيدا ومعصرة صور' : 'Gateway: Choueifat Logistics & Tyre Pressing Mill'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-mono text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {currentTime || '12:00:00 PM'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/backoffice/inbox"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-300 relative cursor-pointer"
            >
              <Inbox className="w-4 h-4 text-slate-700" />
              <span>{isAr ? 'صندوق الموافقات' : 'Approval Inbox'}</span>
              {stats.pendingApprovals > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-extrabold animate-pulse">
                  {stats.pendingApprovals}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/sales"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isAr ? 'نقطة البيع (POS)' : 'Open POS & Sales'}</span>
            </Link>

            <Link
              href="/admin"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isAr ? 'إدارة المؤسسة ↩' : 'Admin Hub ↩'}</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 2. REAL-TIME ENTERPRISE KPI HIGHLIGHTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sales & Cashflow Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'إجمالي نشاط اليوم' : "Today's Gross Activity"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">$12,480.00</div>
            <div className="text-[11px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>1,116,960,000 LBP @ 89,500</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{isAr ? 'صندوق الكاشير' : 'Cashier Drawers'}</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {isAr ? 'نشط ومطابق' : 'Balanced & Active'}
            </span>
          </div>
        </div>

        {/* Dual-Signoff & Pending Approvals */}
        <Link 
          href="/backoffice/inbox" 
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-amber-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'سندات بانتظار الاعتماد' : 'Pending Dual-Signoff'}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              stats.pendingApprovals > 0 ? 'bg-amber-50 text-amber-600 animate-bounce' : 'bg-slate-50 text-slate-500'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>{stats.pendingApprovals}</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                {isAr ? 'يتطلب توقيع' : 'Requires Signoff'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {isAr ? 'سندات تفوق سقف الصلاحية' : 'Limit-exceeding vouchers in inbox'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-700 font-bold group-hover:text-amber-800">
            <span>{isAr ? 'فتح صندوق الموافقات' : 'Review in Approval Inbox'}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* SuperSonic Fleet Status */}
        <Link 
          href="/backoffice/fleet" 
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'أسطول الشاحنات الحي' : 'Live Fleet Logistics'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">12 / 14</div>
            <div className="text-[11px] text-blue-700 font-bold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>{isAr ? 'مركبات في الخدمة على 4 ممرات' : 'Active On 4 Corridors'}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-700 font-bold group-hover:text-blue-800">
            <span>{isAr ? 'خريطة التتبع الفوري' : 'Live Corridor Radar'}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Olive Pressing & Storage */}
        <Link 
          href="/backoffice/operations" 
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-purple-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'المعصرة والخزانات' : 'Mill & Tank Storage'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">42,500 L</div>
            <div className="text-[11px] text-purple-700 font-bold mt-0.5">
              {isAr ? 'زيت زيتون بكر ممتاز مخزن' : 'Extra Virgin Olive Oil Tanks'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-purple-700 font-bold group-hover:text-purple-800">
            <span>{isAr ? 'سجل التشغيل والعصر' : 'View Operations Hub'}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

      </div>

      {/* 3. FAST ACTION LAUNCHPAD */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {isAr ? 'منصة الإجراءات السريعة' : 'Enterprise Quick Action Launchpad'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {isAr ? 'اختصارات العمليات اليومية' : 'Frequently executed enterprise workflows'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <Link
            href="/backoffice/accounting?action=new-jv"
            className="p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
              {isAr ? 'سند قيد (JV)' : 'New Voucher'}
            </span>
          </Link>

          <Link
            href="/dashboard/sales"
            className="p-3 bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">
              {isAr ? 'فاتورة بيع' : 'Sales / POS'}
            </span>
          </Link>

          <Link
            href="/backoffice/fleet"
            className="p-3 bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600">
              {isAr ? 'خريطة الأسطول' : 'Fleet Map'}
            </span>
          </Link>

          <Link
            href="/backoffice/inbox"
            className="p-3 bg-white border border-slate-200 hover:border-red-400 hover:shadow-xs rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-red-600">
              {isAr ? 'الموافقات' : 'Approvals'}
            </span>
          </Link>

          <Link
            href="/backoffice/customers"
            className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
              {isAr ? 'العملاء' : 'Customers'}
            </span>
          </Link>

          <Link
            href="/backoffice/reportview"
            className="p-3 bg-white border border-slate-200 hover:border-teal-400 hover:shadow-xs rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-teal-600">
              {isAr ? 'التقارير' : 'Reports Hub'}
            </span>
          </Link>
        </div>

        {/* Standalone Apps Suite (V-Suite) External Quick Launch */}
        <div className="mt-3 pt-3 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAr ? 'منظومة التطبيقات المستقلة (V-Suite — فتح في نافذة مستقلة)' : 'Standalone Apps Suite (V-Suite — Launch in New Tab)'}</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.2 rounded-full">
              4 EXTERNAL APPS
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              href="/connect"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-cyan-50/70 hover:bg-cyan-100/70 border border-cyan-200 rounded-xl flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-xs">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 group-hover:text-cyan-900 leading-tight">V-Connect</div>
                  <div className="text-[10px] text-slate-500 font-medium">Social CRM & WhatsApp</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href="/v-driver"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-xl flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 group-hover:text-blue-900 leading-tight">V-Driver</div>
                  <div className="text-[10px] text-slate-500 font-medium">Driver & Fleet PWA</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href="/pos"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-900 leading-tight">V-POS</div>
                  <div className="text-[10px] text-slate-500 font-medium">Touch Counter Sales</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href="/v-store"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 rounded-xl flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 group-hover:text-amber-900 leading-tight">V-Store</div>
                  <div className="text-[10px] text-slate-500 font-medium">Storefront / B2B Web</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* 4. SEARCH & ALL 12 ENTERPRISE MODULES DIRECTORY */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'منظومة الوحدات المؤسسية (12 وحدة فعّالة)' : 'Enterprise Modules Portal (12 Active Modules)'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'اختر الوحدة المطلوبة للوصول إلى لوحات التحكم والشاشات التشغيلية' : 'Select a primary module to access dedicated operations and analytics'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder={isAr ? 'بحث في الوحدات والشاشات...' : 'Filter modules & screens...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl py-2 px-3 pl-8 text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            const enabled = isModuleActive(module.id);

            return (
              <div
                key={module.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 ${
                  enabled 
                    ? 'border-slate-200 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5' 
                    : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                        module.color === 'emerald' ? 'bg-emerald-600' :
                        module.color === 'amber' ? 'bg-amber-600' :
                        module.color === 'blue' ? 'bg-blue-600' :
                        module.color === 'rose' ? 'bg-rose-600' :
                        module.color === 'purple' ? 'bg-purple-600' :
                        module.color === 'indigo' ? 'bg-indigo-600' :
                        module.color === 'teal' ? 'bg-teal-600' :
                        'bg-cyan-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          MODULE {module.number}
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {isAr ? module.titleAr : module.titleEn}
                        </h3>
                      </div>
                    </div>

                    <span className="text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {module.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium line-clamp-2">
                    {isAr ? module.descriptionAr : module.descriptionEn}
                  </p>

                  {/* Sub-links quick access */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[11px]">
                    {module.subLinks.map((sub, i) => (
                      <Link
                        key={i}
                        href={sub.href}
                        className="truncate text-slate-600 hover:text-amber-700 hover:bg-amber-50/60 px-1.5 py-1 rounded transition-colors"
                      >
                        • {isAr ? sub.labelAr : sub.labelEn}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isAr ? 'مفعّل في باقتك' : 'Licensed & Active'}
                  </span>

                  <Link
                    href={module.primaryRoute}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-amber-700 group cursor-pointer"
                  >
                    <span>{isAr ? 'دخول الوحدة' : 'Open Module'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RECENT ENTERPRISE OPERATIONS AUDIT FEED */}
      {stats.recentActivities.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{isAr ? 'سجل العمليات والتدقيق الأخير' : 'Recent Enterprise Operations & Audit Feed'}</span>
            </h3>
            <Link
              href="/backoffice/inbox"
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              {isAr ? 'عرض الكل في صندوق العمليات ←' : 'View Full Feed in Operations Inbox ←'}
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats.recentActivities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">{act.description}</span>
                    <span className="text-slate-400 mx-2">•</span>
                    <span className="text-slate-500 font-medium">{act.performed_by}</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
